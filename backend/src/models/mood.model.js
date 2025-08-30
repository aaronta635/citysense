const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqlite');

const Mood = sequelize.define('Mood', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  suburb: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_mood: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Happy', 'Neutral', 'Stressed', 'Angry', 'Sad']]
    }
  },
  explaination: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Mood;