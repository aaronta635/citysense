const express = require('express');
const citysenseController = require('../../controllers/citysense.controller');

const router = express.Router();

/**
 * @swagger
 * /citysense/weather:
 * 
 *   get:
 *     summary: Get current weather for any suburbs
 *     parameters:
 *         - in: query
 *           name: suburb
 *           schema:
 *              type: string
 *              default: Sydney
 *           description: Suburb name (e.g., Bondi, Manly, Parramatta)
 *           example: Bondi
 *     responses:
 *       200:
 *         description: Weather data
 *         content:
 *              application/json:
 *                  schema: 
 *                      type: object
 *                      properties:
 *                          success: 
 *                              type: Boolean
 *                          data:
 *                              type: object
 */
router.get('/weather', citysenseController.getWeather);

/**
 * @swagger
 * /citysense/pollution:
 *   get:
 *     summary: Get current pollution data for any suburb
 *     parameters:
 *       - in: query
 *         name: suburb
 *         schema:
 *           type: string
 *           default: Sydney
 *         description: Suburb name
 *         example: Manly
 *     responses:
 *       200:
 *         description: Pollution data
 */
router.get('/pollution', citysenseController.getPollution);

/**
 * @swagger
 * /citysense/mood/daily:
 *   post:
 *     summary: Submit daily mood
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               suburb:
 *                 type: string
 *               user_mood:
 *                 type: string
 *                 enum: [Happy, Neutral, Stressed, Angry, Sad]
 *               explanation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mood submitted successfully
 */
router.post('/mood/daily', citysenseController.submitDailyMood);


module.exports = router;