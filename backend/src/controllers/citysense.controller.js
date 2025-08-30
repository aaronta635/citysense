const catchAsync = require('../utils/catchAsync');
const weatherService = require('../services/weather.service');
const pollutionService = require('../services/pollution.service');
const UserMood = require('../models/userMood.model');
// const { get } = require('mongoose');

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
    console.log('selectedMood:', selectedMood);
    console.log('selectedSuburb:', selectedSuburb);

    if(!selectedMood || !selectedSuburb ) {
        return res.status(400).json({
            success: false,
            message: "Mood and suburb is required."
        })
    }

    const moodEntry = await UserMood.create({
        suburb: selectedSuburb,
        user_mood: selectedMood,
        explaination: reasonText || "",
        timestamp: new Date()
    });

    res.status(201).json({
        success: true,
        message: 'Mood feedback submitted successfully!',
        data: {
            id: moodEntry.id,
            suburb: moodEntry.suburb,
            mood: moodEntry.user_mood,
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



module.exports = {
    getWeather,
    getPollution,
    submitMoodForm,
    getSuburbMoodStats
};