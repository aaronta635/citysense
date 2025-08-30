const axios = require('axios');
const config = require('../config/config');

const getCurrentPollution = async (location = "Sydney") => {
  try {
    const response = await axios.get(`${config.apis.pollution.baseUrl}/current.json`, {
      params: {
        key: config.apis.pollution.key,
        q: location,
        aqi: 'yes',
      },
    });

    const airQuality = response.data.current.air_quality;
    
    return {
      no2: airQuality.no2,
      o3: airQuality.o3,
      pm2_5: airQuality.pm2_5,
      pm10: airQuality.pm10,
      timestamp: new Date(),
      location: `${response.data.location.name}, ${response.data.location.region}, ${response.data.location.country}`,
    };
  } catch (error) {
    throw new Error(`Failed to fetch pollution data: ${error.message}`);
  }
};

module.exports = {
  getCurrentPollution,
};