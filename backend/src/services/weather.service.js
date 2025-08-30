const axios = require('axios');
const config = require('../config/config');

const getCurrentWeather = async (location = "Sydney") => {
  try {
    const response = await axios.get(`${config.apis.weather.baseUrl}/current.json`, {
      params: {
        key: config.apis.weather.key,
        q: location,
        aqi: 'yes', // Include air quality data
      },
    });

    const data = response.data;
    
    return {
      temperature: data.current.temp_c,
      description: data.current.condition.text,
      main: data.current.condition.text,
      uv: data.current.uv,
      timestamp: new Date(),
      location: `${data.location.name}, ${response.data.location.region}, ${data.location.country}`
    };
  } catch (error) {
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

module.exports = {
  getCurrentWeather,
};