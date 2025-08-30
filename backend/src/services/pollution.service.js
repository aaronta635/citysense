const axios = require('axios');
const config = require('../config/config');
const Pollution = require('../models/pollution.model');

const getCurrentPollution = async (location = 'Sydney') => {
  try {
    const response = await axios.get(`${config.apis.pollution.baseUrl}/current.json`, {
      params: {
        key: config.apis.pollution.key,
        q: location,
        aqi: 'yes',
      },
    });

    const airQuality = response.data.current.air_quality;
    
    const pollutionData = {
      suburb: location,
      no2: airQuality.no2,
      o3: airQuality.o3,
      pm2_5: airQuality.pm2_5,
      pm10: airQuality.pm10,
      co: airQuality.co,
      location: `${response.data.location.name}, ${response.data.location.region}, ${response.data.location.country}`,
      fetchedAt: new Date(),
    };

    // Save to SQLite database
    await Pollution.create(pollutionData);
    console.log('Pollution data saved to SQLite for:', location);

    return pollutionData;
  } catch (error) {
    throw new Error(`Failed to fetch pollution data: ${error.message}`);
  }
};

module.exports = {
  getCurrentPollution,
};