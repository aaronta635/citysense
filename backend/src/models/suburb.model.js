const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqlite');

const Suburb = sequelize.define('Suburb', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postcode: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'suburbs',
  timestamps: false
});

module.exports = Suburb;
