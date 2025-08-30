const catchAsync = require('../utils/catchAsync');
const weatherService = require('../services/weather.service');
const pollutionService = require('../services/pollution.service');
const Mood = require('../models/mood.model');
const Weather = require('../models/weather.model');
const Pollution = require('../models/pollution.model');



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


const submitMoodForm = catchAsync(async (req, res) => {
    const { selectedMood, reasonText, selectedSuburb } = req.body;

    console.log('Received data:', req.body);

    if(!selectedMood || !selectedSuburb ) {
        return res.status(400).json({
            success: false,
            message: "Mood and suburb is required."
        })
    }

    const moodEntry = await Mood.create({
        suburb: selectedSuburb,
        user_mood: selectedMood,
        explaination: reasonText,
        timestamp: new Date()
    });

    console.log('Mood data saved to SQLite:', moodEntry.dataValues);
    console.log('Explaination: ', moodEntry.explaination)
    res.status(201).json({
        success: true,
        message: 'Mood feedback submitted successfully!',
        data: {
            id: moodEntry.id,
            suburb: moodEntry.suburb,
            mood: moodEntry.user_mood,
            explaination: moodEntry.reasonText,
            timestamp: moodEntry.timestamp

        }
    });
});

const getSuburbMoodStats = catchAsync(async (req, res) => {

    const moodStats = await UserMood.aggregate([
        {
            $group: {
                _id: "suburb",
                totalSubmissions: {$sum: 1},
                happy: {
                    $sum: { $cond: [{ $eq: ['$user_mood', 'Happy']}, 1, 0]}
                },

                neutral: {
                    $sum: { $cond: [{ $eq: ['user_mood', 'Neutral']}, 1, 0]}
                },

                stressed: {
                    $sum: { $cond: [{ $eq: ['user_mood', 'Stressed']}, 1, 0]}
                },

                angry: {
                    $sum: { $cond: [{ $eq: ['user_mood', 'Angry']}, 1, 0]}
                },

                sad: {
                    $sum: { $cond: [{ $eq: ['user_mood', 'Sad']}, 1, 0]}
                },

                lastUpdated: { $max: '$timestamp' }
            }
        },

        {
            $project: {
                suburb: '$_id',
                totalSubmissions: 1,
                moodBreakdown: {
                    happy: '$happy',
                    neutral: '$neutral', 
                    stressed: '$stressed',
                    angry: '$angry',
                    sad: '$sad'
                },
                lastUpdated: 1,
                _id: 0   
            }
        }
    ]);

    res.json({
        sucess: true,
        data: {
            suburbs: moodStats,
            totalSuburbs: moodStats.length,
            lastUpdated: new Date()
        }
    });
}); 

// Get all weather data from SQLite
const getAllWeatherData = catchAsync(async (req, res) => {
  const weatherData = await Weather.findAll({
    order: [['fetchedAt', 'DESC']],
    limit: req.query.limit || 50
  });
  
  res.json({
    success: true,
    count: weatherData.length,
    data: weatherData
  });
});

// Get all pollution data from SQLite
const getAllPollutionData = catchAsync(async (req, res) => {
  const pollutionData = await Pollution.findAll({
    order: [['fetchedAt', 'DESC']],
    limit: req.query.limit || 50
  });
  
  res.json({
    success: true,
    count: pollutionData.length,
    data: pollutionData
  });
});

// Get all mood data from SQLite
const getAllMoodData = catchAsync(async (req, res) => {
  const moodData = await Mood.findAll({
    order: [['submittedAt', 'DESC']],
    limit: req.query.limit || 50
  });
  
  res.json({
    success: true,
    count: moodData.length,
    data: moodData
  });
});

// Get combined data for heat map
const getCombinedSuburbData = catchAsync(async (req, res) => {
  const [weatherData, pollutionData, moodData] = await Promise.all([
    Weather.findAll({ order: [['fetchedAt', 'DESC']] }),
    Pollution.findAll({ order: [['fetchedAt', 'DESC']] }),
    Mood.findAll({ order: [['submittedAt', 'DESC']] })
  ]);

  // Group by suburb
  const suburbStats = {};
  
  // Process weather data
  weatherData.forEach(w => {
    if (!suburbStats[w.suburb]) {
      suburbStats[w.suburb] = { suburb: w.suburb };
    }
    suburbStats[w.suburb].weather = {
      temperature: w.temperature,
      description: w.description,
      humidity: w.humidity,
      lastUpdated: w.fetchedAt
    };
  });

  // Process pollution data
  pollutionData.forEach(p => {
    if (!suburbStats[p.suburb]) {
      suburbStats[p.suburb] = { suburb: p.suburb };
    }
    suburbStats[p.suburb].pollution = {
      pm2_5: p.pm2_5,
      pm10: p.pm10,
      no2: p.no2,
      o3: p.o3,
      lastUpdated: p.fetchedAt
    };
  });

  // Process mood data
  const moodStats = {};
  moodData.forEach(m => {
    if (!moodStats[m.suburb]) {
      moodStats[m.suburb] = { happy: 0, neutral: 0, stressed: 0, angry: 0, sad: 0, total: 0 };
    }
    moodStats[m.suburb][m.user_mood.toLowerCase()]++;
    moodStats[m.suburb].total++;
  });

  // Add mood stats to suburb data
  Object.keys(moodStats).forEach(suburb => {
    if (!suburbStats[suburb]) {
      suburbStats[suburb] = { suburb };
    }
    const stats = moodStats[suburb];
    suburbStats[suburb].mood = {
      breakdown: {
        happy: stats.happy,
        neutral: stats.neutral,
        stressed: stats.stressed,
        angry: stats.angry,
        sad: stats.sad,
        totalSubmissions: stats.total
      },
      sentiment: stats.total > 0 ? (stats.happy + stats.neutral * 0.5) / stats.total : 0.5
    };
  });

  res.json({
    success: true,
    data: {
      suburbs: Object.values(suburbStats),
      totalSuburbs: Object.keys(suburbStats).length,
      lastUpdated: new Date()
    }
  });
});

const getMood = catchAsync(async (req, res) => {
    // Simple mood analysis based on weather and pollution
    const suburb = req.query.suburb || 'Sydney';
    
    try {
        const [weather, pollution] = await Promise.all([
            weatherService.getCurrentWeather(suburb),
            pollutionService.getCurrentPollution(suburb)
        ]);

        // Simple mood calculation
        let mood = 'neutral';
        let score = 50;

        // Weather factors
        if (weather.temperature >= 20 && weather.temperature <= 25) score += 20;
        if (weather.humidity < 60) score += 10;
        if (weather.description.includes('sunny') || weather.description.includes('clear')) score += 15;

        // Pollution factors  
        if (pollution.pm2_5 < 12) score += 15;
        if (pollution.no2 < 40) score += 10;

        if (score >= 70) mood = 'happy';
        else if (score <= 40) mood = 'angry';

        res.json({
            success: true,
            data: {
                suburb,
                mood,
                score,
                factors: {
                    weather: weather,
                    pollution: pollution
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error analyzing mood: ' + error.message
        });
    }
});

// Export all functions
module.exports = {
  getWeather,
  getPollution,
  getMood,
  submitMoodForm,
  getAllWeatherData,
  getAllPollutionData, 
  getAllMoodData,
  getCombinedSuburbData,
};
  
