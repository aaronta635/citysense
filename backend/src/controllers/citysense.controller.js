const catchAsync = require('../utils/catchAsync');
const weatherService = require('../services/weather.service');
const pollutionService = require('../services/pollution.service');
const Mood = require('../models/mood.model');
const aiService = require('../services/citysenseAI.service');
const { mapMoodToAIFormat } = require('../utils/moodMapper');

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

  console.log('Received data:', req.body);

  if (!selectedMood || !selectedSuburb) {
    return res.status(400).json({
      success: false,
      message: "Mood and suburb are required."
    });
  }

  const moodEntry = await Mood.create({
    suburb: selectedSuburb,
    user_mood: selectedMood,
    explaination: reasonText,
    timestamp: new Date()
  });

  console.log('Mood data saved to SQLite:', moodEntry.dataValues);

  const weather = await weatherService.getCurrentWeather(selectedSuburb);
  const pollution = await pollutionService.getCurrentPollution(selectedSuburb);

  const moodsForAI = [
    {
      district: moodEntry.suburb,
      message: moodEntry.explaination || moodEntry.user_mood,
      timestamp: moodEntry.timestamp
    }
  ];

  const aiResults = await aiService.runPythonAI(weather, pollution, moodsForAI);

  res.status(201).json({
    success: true,
    message: 'Mood feedback submitted & analyzed successfully!',
    data: {
      mood: {
        id: moodEntry.id,
        suburb: moodEntry.suburb,
        mood: moodEntry.user_mood,
        explaination: moodEntry.explaination,
        timestamp: moodEntry.timestamp
      },
      aiAnalysis: aiResults
    }
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
    order: [['timestamp', 'DESC']],
    limit: 50
  });

  const formattedMoods = moods.map(m => ({
    district: m.suburb,
    message: m.explaination || m.user_mood,
    timestamp: m.timestamp
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

  const results = await aiService.runPythonAI(weather, pollution, formattedMoods);

  res.json({
    success: true,
    suburb,
    weather,
    pollution,
    analysis: results
  });
});


module.exports = {
    getWeather,
    getPollution,
    submitMoodForm,
    getSuburbMoodStats,
    analyzeCity
};
