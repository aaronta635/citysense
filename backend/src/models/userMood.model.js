// Simple in-memory storage for mood data
// This replaces MongoDB for now - you can switch back to MongoDB later

// In-memory storage
let moodData = [];

// Simple UserMood object constructor
class UserMood {
    constructor(data) {
        this.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.suburb = data.suburb;
        this.user_mood = data.user_mood;
        this.explaination = data.explaination || "";
        this.timestamp = data.timestamp || new Date();
        this.date = data.date || new Date();
    }

    // Static method to create and save a mood entry
    static create(data) {
        const newMood = new UserMood(data);
        moodData.push(newMood);
        console.log('Mood entry saved:', newMood);
        return Promise.resolve(newMood);
    }

    // Static method to find all mood entries
    static find(query = {}) {
        let results = [...moodData];
        
        // Simple filtering if query is provided
        if (query.suburb) {
            results = results.filter(mood => mood.suburb === query.suburb);
        }
        
        return Promise.resolve(results);
    }

    // Static method for aggregation (simplified)
    static aggregate(pipeline) {
        // Simple aggregation for mood stats
        const stats = {
            totalSubmissions: moodData.length,
            happy: moodData.filter(m => m.user_mood === 'Happy').length,
            neutral: moodData.filter(m => m.user_mood === 'Neutral').length,
            stressed: moodData.filter(m => m.user_mood === 'Stressed').length,
            angry: moodData.filter(m => m.user_mood === 'Angry').length,
            sad: moodData.filter(m => m.user_mood === 'Sad').length,
            lastUpdated: moodData.length > 0 ? Math.max(...moodData.map(m => new Date(m.timestamp))) : new Date()
        };

        return Promise.resolve([{
            suburb: 'All',
            totalSubmissions: stats.totalSubmissions,
            moodBreakdown: {
                happy: stats.happy,
                neutral: stats.neutral,
                stressed: stats.stressed,
                angry: stats.angry,
                sad: stats.sad
            },
            lastUpdated: stats.lastUpdated
        }]);
    }

    // Get the _id property for compatibility
    get _id() {
        return this.id;
    }
}

module.exports = UserMood;
// const mongoose = require('mongoose');

// const userMoodSchema = mongoose.Schema({
//     suburbs: {
//         type: String,
//         required: true
//     },

//     user_mood: {
//         type: String, 
//         enum: ['Happy', 'Neutral', 'Stressed', 'Angry', 'Sad'],
//         required: true
//     },

//     explaination: {
//         type: String, 
//         maxLength: 500
//     },

//     date: {
//         type: Date,
//         default: Date.now
//     },

//     timestamp: {
//         type: Date,
//         default: Date.now
//     }

// }, {
//     timestamps: true
// })

// module.exports = mongoose.model('UserMood', userMoodSchema)
