const axios = require('axios');
const config = require('../config/config');
const Weather = require('../models/weather.model');

const getCurrentWeather = async (location = 'Sydney,NSW,Australia') => {
  try {

    let formattedLocation = location;
    if (!location.includes('Australia') && !location.includes(',')) {
      formattedLocation = `${location},NSW,Australia`;
    }

    const response = await axios.get(`${config.apis.weather.baseUrl}/current.json`, {
      params: {
        key: config.apis.weather.key,
        q: location,
        aqi: 'yes',
      },
    });

    const data = response.data;
    
    const weatherData = {
      suburb: location,
      temperature: data.current.temp_c,
      description: data.current.condition.text,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      uv: data.current.uv,
      location: `${data.location.name}, ${data.location.region}, ${data.location.country}`,
      fetchedAt: new Date(),
    };

    // Save to SQLite database
    await Weather.create(weatherData);
    console.log('Weather data saved to SQLite for:', location);

    return weatherData;
  } catch (error) {
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

module.exports = {
  getCurrentWeather,
};