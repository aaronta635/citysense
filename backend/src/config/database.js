const sequelize = require('./sqlite');

const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('SQLite database connected successfully');
    
    // Import models after sequelize is initialized
    const Weather = require('../models/weather.model');
    const Pollution = require('../models/pollution.model');
    const Mood = require('../models/mood.model');
    const User = require('../models/user.model');
    const AIAnalysis = require('../models/aiAnalysis.model');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database tables synchronized');
    
    return true;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    return false;
  }
};

module.exports = {
  initializeDatabase,
  sequelize
};