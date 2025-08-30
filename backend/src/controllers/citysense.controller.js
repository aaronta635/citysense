const catchAsync = require('../utils/catchAsync');
const weatherService = require('../services/weather.service');
const pollutionService = require('../services/pollution.service');
const Mood = require('../models/mood.model');
const aiService = require('../services/citysenseAI.service');   
const { summarizeAnalysis } = require('../utils/analysisSummary');
const { generateNewsHeadline } = require('../utils/newsfeedAI.js');
const { Op, fn, col, literal } = require('sequelize');

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

  const aiResult = await aiService.runPythonAI(weather, pollution, formattedMoods);

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

const getTrends = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days || "3"); 
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - (days - 1));

  const moods = await Mood.findAll({
    where: {
      createdAt: { [Op.gte]: startDate },
    },
    raw: true,
  });

  const grouped = {};
  for (const m of moods) {
    const suburb = m.suburb;
    const mood = m.user_mood;
    const dateKey = new Date(m.createdAt).toLocaleDateString("en-CA"); // YYYY-MM-DD local

    if (!grouped[suburb]) grouped[suburb] = {};
    if (!grouped[suburb][mood]) grouped[suburb][mood] = {};
    if (!grouped[suburb][mood][dateKey]) grouped[suburb][mood][dateKey] = 0;

    grouped[suburb][mood][dateKey] += 1;
  }

  const trends = {};
  const todayKey = today.toLocaleDateString("en-CA");

  for (const suburb of Object.keys(grouped)) {
    trends[suburb] = {};
    for (const mood of Object.keys(grouped[suburb])) {
      const counts = grouped[suburb][mood];
      const todayCount = counts[todayKey] || 0;

      let prevSum = 0;
      let prevCount = 0;
      for (let i = 1; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toLocaleDateString("en-CA");
        prevSum += counts[key] || 0;
        prevCount++;
      }
      const avgPrev = prevCount > 0 ? prevSum / prevCount : 0;

      let change = "0%";
      if (avgPrev > 0) {
        change = (((todayCount - avgPrev) / avgPrev) * 100).toFixed(1) + "%";
      } else if (todayCount > 0) {
        change = "+∞";
      }

      trends[suburb][mood] = {
        today: todayCount,
        avgPrev: Number(avgPrev.toFixed(1)),
        change,
      };
    }
  }

  res.json({ success: true, trends });
});

module.exports = {
  getWeather,
  getPollution,
  submitMoodForm,
  getSuburbMoodStats,
  analyzeCity,
  analyzeAll,
  getTrends
};
