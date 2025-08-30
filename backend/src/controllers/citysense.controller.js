const catchAsync = require('../utils/catchAsync');
const weatherService = require('../services/weather.service');
const pollutionService = require('../services/pollution.service');
const Mood = require('../models/mood.model');
const aiService = require('../services/citysenseAI.service');   
const { summarizeAnalysis } = require('../utils/analysisSummary');
const { generateNewsHeadline } = require('../utils/newsfeedAI.js');

const getWeather = catchAsync(async (req, res) => {
  const suburb = req.query.suburb || 'Sydney';
  const weather = await weatherService.getCurrentWeather(suburb);
  res.json({ success: true, data: weather });
});

const getPollution = catchAsync(async (req, res) => {
  const suburb = req.query.suburb || 'Sydney';
  const pollution = await pollutionService.getCurrentPollution(suburb);
  res.json({ success: true, data: pollution });
});

const submitMoodForm = catchAsync(async (req, res) => {
  const { selectedMood, reasonText, selectedSuburb } = req.body;

  if (!selectedMood || !selectedSuburb) {
    return res.status(400).json({
      success: false,
      message: "Mood and suburb are required."
    });
  }

  const moodEntry = await Mood.create({
    suburb: selectedSuburb,
    user_mood: selectedMood,
    explaination: reasonText
  });

  res.status(201).json({
    success: true,
    message: 'Mood feedback submitted successfully!',
    data: moodEntry
  });
});

const getSuburbMoodStats = catchAsync(async (req, res) => {
  const allMoods = await Mood.findAll();

  const stats = {};
  allMoods.forEach(m => {
    if (!stats[m.suburb]) {
      stats[m.suburb] = { total: 0, Happy: 0, Neutral: 0, Stressed: 0, Angry: 0, Sad: 0 };
    }
    stats[m.suburb].total += 1;
    stats[m.suburb][m.user_mood] += 1;
  });

  res.json({ success: true, data: stats });
});

const analyzeCity = catchAsync(async (req, res) => {
  const suburb = req.query.suburb || 'Sydney';

  const weather = await weatherService.getCurrentWeather(suburb);
  const pollution = await pollutionService.getCurrentPollution(suburb);

  const moods = await Mood.findAll({
    where: { suburb },
    order: [['createdAt', 'DESC']],
    limit: 50
  });

  const formattedMoods = moods.map(m => ({
    district: m.suburb,
    message: m.explaination || m.user_mood,
    timestamp: m.createdAt
  }));

  if (formattedMoods.length === 0) {
    return res.json({
      success: true,
      suburb,
      weather,
      pollution,
      analysis: {
        complaints: {},
        positives: {},
        newsfeed: ["⚠️ No mood submissions yet for this suburb."]
      }
    });
  }

  // chạy AI Python
  const aiResult = await aiService.runPythonAI(weather, pollution, formattedMoods);

  // làm sạch + generate headline
  const enhancedNewsfeed = [];
  for (const line of aiResult.newsfeed) {
    const sentiment = line.includes("[NEGATIVE]") ? "NEGATIVE" : "POSITIVE";
    const cleanLine = line.replace(/^[🌟📰]\s*\[[^\]]+\]\s*/, ""); // bỏ prefix
    const headline = await generateNewsHeadline(cleanLine, weather, pollution, sentiment);
    enhancedNewsfeed.push(headline);
  }
  aiResult.newsfeed = enhancedNewsfeed;

  res.json({
    success: true,
    suburb,
    weather,
    pollution,
    analysis: aiResult
  });
});

const analyzeAll = catchAsync(async (req, res) => {
  const suburbs = await Mood.findAll({
    attributes: ['suburb'],
    group: ['suburb']
  });

  const suburbList = suburbs.map(s => s.suburb);
  const resultsBySuburb = {};

  for (const suburb of suburbList) {
    const weather = await weatherService.getCurrentWeather(suburb);
    const pollution = await pollutionService.getCurrentPollution(suburb);

    const moods = await Mood.findAll({
      where: { suburb },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const formattedMoods = moods.map(m => ({
      district: m.suburb,
      message: m.explaination || m.user_mood,
      timestamp: m.createdAt
    }));

    if (formattedMoods.length === 0) {
      resultsBySuburb[suburb] = {
        complaints: {},
        positives: {},
        newsfeed: ["⚠️ No mood submissions yet for this suburb."]
      };
    } else {
      const aiResult = await aiService.runPythonAI(weather, pollution, formattedMoods);

      // làm sạch + generate headline
      const enhancedNewsfeed = [];
      for (const line of aiResult.newsfeed) {
        const sentiment = line.includes("[NEGATIVE]") ? "NEGATIVE" : "POSITIVE";
        const cleanLine = line.replace(/^[🌟📰]\s*\[[^\]]+\]\s*/, "");
        const headline = await generateNewsHeadline(cleanLine, weather, pollution, sentiment);
        enhancedNewsfeed.push(headline);
      }
      aiResult.newsfeed = enhancedNewsfeed;

      resultsBySuburb[suburb] = aiResult;
    }
  }

  const summary = summarizeAnalysis(resultsBySuburb);

  res.json({
    success: true,
    analysis: resultsBySuburb,
    summary
  });
});

module.exports = {
  getWeather,
  getPollution,
  submitMoodForm,
  getSuburbMoodStats,
  analyzeCity,
  analyzeAll
};
