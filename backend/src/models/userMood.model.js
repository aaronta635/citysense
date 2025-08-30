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