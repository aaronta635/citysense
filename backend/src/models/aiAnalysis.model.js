const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqlite');

const AIAnalysis = sequelize.define('AIAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  suburb: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  complaints: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  positives: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  newsfeed: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  weather: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  pollution: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  analysisType: {
    type: DataTypes.ENUM('city', 'all'),
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = AIAnalysis;
