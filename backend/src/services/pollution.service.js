const axios = require('axios');
const config = require('../config/config');
const Pollution = require('../models/pollution.model');

function getPM25Category(pm2_5) {
  if (pm2_5 <= 12) return "Good";
  if (pm2_5 <= 35.4) return "Moderate";
  if (pm2_5 <= 55.4) return "Unhealthy (Sensitive)";
  if (pm2_5 <= 150.4) return "Unhealthy";
  if (pm2_5 <= 250.4) return "Very Unhealthy";
  return "Hazardous";
}

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
      pm25_category: getPM25Category(airQuality.pm2_5), 
    };

    await Pollution.create(pollutionData);
    console.log('Pollution data saved to SQLite for:', location);

    return pollutionData;
  } catch (error) {
    console.error("Pollution API error:", error.response?.data || error.message);
    throw new Error(`Failed to fetch pollution data: ${error.message}`);
  }
};

module.exports = {
  getCurrentPollution,
};
