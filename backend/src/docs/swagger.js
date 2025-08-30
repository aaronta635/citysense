const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CitySense API',
    version: '1.0.0',
    description: 'Weather, pollution and mood analysis for Sydney',
  },
  servers: [
    {
      url: 'http://localhost:3000/v1',
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/v1/*.js'], // Path to API routes
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;