const catchAsync = require('../utils/catchAsync');
const weatherService = require('../services/weather.service');
const pollutionService = require('../services/pollution.service');
const UserMood = require('../models/userMood.model');
const aiService = require('../services/citysenseAI.service');

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

const analyzeCity = catchAsync(async (req, res) => {
  const suburb = req.query.suburb || 'Sydney';

  const weather = await weatherService.getCurrentWeather(suburb);
  const pollution = await pollutionService.getCurrentPollution(suburb);

  const moods = [
    { district: "Sydney CBD", message: "Trains are delayed again 😡", timestamp: "2025-08-30 08:15" },
    { district: "Bondi", message: "Air feels fresh after the rain", timestamp: "2025-08-30 12:00" },
    { district: "Chatswood", message: "So happy with the new bike lanes 🚲", timestamp: "2025-08-30 09:45" }
  ];

  const results = await aiService.runPythonAI(weather, pollution, moods);

  res.json({
    success: true,
    suburb,
    weather,
    pollution,
    analysis: results
  });
});

const { spawn } = require('child_process');

const testPython = catchAsync(async (req, res) => {
  const payload = {
    weather: { temperature: 22, is_rain: false },
    air: { pm25: 35, pm25_category: "moderate" },
    moods: [
      { district: "Sydney CBD", message: "Trains are delayed again 😡", timestamp: "2025-08-30 08:15" },
      { district: "Bondi", message: "Air feels fresh after the rain", timestamp: "2025-08-30 12:00" }
    ]
  };

  const py = spawn('python3', ['ai/api_runner.py']);    
  py.stdin.write(JSON.stringify(payload));
  py.stdin.end();

  let data = '';
  py.stdout.on('data', chunk => data += chunk.toString());
  py.stderr.on('data', err => console.error('Python error:', err.toString()));

  py.on('close', () => {
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: 'Python output parse error', details: data });
    }
  });
});

module.exports = {
  getWeather,
  getPollution,
  submitDailyMood,
  analyzeCity,
  testPython
};