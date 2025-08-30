const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqlite');

const Weather = sequelize.define('Weather', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  suburb: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  humidity: DataTypes.FLOAT,
  windSpeed: DataTypes.FLOAT,
  uv: DataTypes.FLOAT,
  location: DataTypes.STRING,
  fetchedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Weather;