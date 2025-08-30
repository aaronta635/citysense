const catchAsync = require('../utils/catchAsync');
const weatherService = require('../services/weather.service');
const pollutionService = require('../services/pollution.service');
const UserMood = require('../models/userMood.model');
const aiService = require('../services/citysenseAI.service');

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

const submitDailyMood = catchAsync(async (req, res) => {
  const { suburb, user_mood, explanation } = req.body;
  const moodEntry = { suburb, user_mood, explanation };
  res.status(201).json({
    success: true,
    message: 'Mood submitted successfully.',
    data: moodEntry,
  });
});

const analyzeCity = catchAsync(async (req, res) => {
  const suburb = req.query.suburb || 'Sydney';

  const weather = await weatherService.getCurrentWeather(suburb);
  const pollution = await pollutionService.getCurrentPollution(suburb);

  const moods = [
    { district: suburb, message: 'Trains are delayed again 😡', timestamp: new Date().toISOString() },
  ];

  const results = await aiService.runPythonAI(weather, pollution, moods);

  res.json({
    success: true,
    suburb,
    weather,
    pollution,
    analysis: results,
  });
});

module.exports = {
  getWeather,
  getPollution,
  submitDailyMood,
  analyzeCity,
};
