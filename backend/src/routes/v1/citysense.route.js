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
 * /citysense/mood/form:
 *   post:
 *     summary: Submit mood form with suburb and reason
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedMood:
 *                 type: string
 *                 enum: [Happy, Neutral, Stressed, Angry, Sad]
 *               reasonText:
 *                 type: string
 *               selectedSuburb:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mood submitted successfully
 */
router.post('/mood/form', citysenseController.submitMoodForm);

/**
 * @swagger
 * /citysense/suburbs/stats:
 *   get:
 *     summary: Get aggregated mood statistics for all suburbs
 *     responses:
 *       200:
 *         description: Suburb mood statistics
 */
router.get('/suburbs/stats', citysenseController.getSuburbMoodStats);

/**
 * @swagger
 * /citysense/analyze:
 *   get:
 *     summary: Run AI analysis (weather + pollution + moods) and generate newsfeed
 *     parameters:
 *       - in: query
 *         name: suburb
 *         schema:
 *           type: string
 *           default: Sydney
 *     responses:
 *       200:
 *         description: AI analysis results
 */
router.get('/analyze', citysenseController.analyzeCity);

/**
 * @swagger
 * /citysense/analyze/all:
 *   get:
 *     summary: Run AI analysis for all suburbs (weather + pollution + moods)
 *     responses:
 *       200:
 *         description: AI analysis results for all suburbs
 */
router.get('/analyze/all', citysenseController.analyzeAll);

module.exports = router;