const catchAsync = require('../utils/catchAsync');
const weatherService = require('../services/weather.service');
const pollutionService = require('../services/pollution.service');
const UserMood = require('../models/userMood.model');

const getWeather = catchAsync(async (req, res) => {
    const suburb = req.query.suburb || 'Sydney';

    const weather = await weatherService.getCurrentWeather(suburb);
    res.json({
        success: true,
        data: weather
    });
});

const getPollution = catchAsync(async (req, res) => {
    const suburb = req.query.suburb || 'Sydney';
    const pollution = await pollutionService.getCurrentPollution(suburb);
    res.json({
        success: true,
        data: pollution
    });
});

const submitDailyMood = catchAsync(async (req, res) => {
    const { suburbs, user_mood, explaination } = req.body;

    const moodEntry = await UserMood.create({
        suburbs, 
        user_mood,
        explaination
    });

    res.status(201).json({
        success: true,
        message: "Mood submitted successfully.",
        data: moodEntry
    });
});

module.exports = {
  getWeather,
  getPollution,
  submitDailyMood
};