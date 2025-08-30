const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().description('MongoDB URL'),
    WEATHER_API_KEY: Joi.string().description('Weather API key'),
    POLLUTION_API_KEY: Joi.string().description('Air pollution API key'),
    JWT_SECRET: Joi.string().description('JWT secret key'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET || 'citysense-super-secret-jwt-key-2024-development-only',
    expiresIn: '7d', // Token expires in 7 days
  },
  apis: {
    weather: {
      key: envVars.WEATHER_API_KEY,
      baseUrl: 'https://api.weatherapi.com/v1',
    },
    pollution: {
      key: envVars.WEATHER_API_KEY, // WeatherAPI.com includes air quality
      baseUrl: 'https://api.weatherapi.com/v1',
    },
  },
  sydney: {
    location: 'Kirrawee', // WeatherAPI.com uses location names or lat,lon
  },
};


