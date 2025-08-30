const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqlite');

const Pollution = sequelize.define('Pollution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  suburb: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  no2: DataTypes.FLOAT,
  o3: DataTypes.FLOAT,
  pm2_5: DataTypes.FLOAT,
  pm10: DataTypes.FLOAT,
  co: DataTypes.FLOAT,
  location: DataTypes.STRING,
  fetchedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Pollution;