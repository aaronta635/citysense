const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database in project root
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../citysense.db'),
  logging: console.log, // Set to false in production
});

module.exports = sequelize;