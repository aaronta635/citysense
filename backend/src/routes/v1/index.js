const express = require('express');
const citysenseRoute = require('./citysense.route');
const docsRoute = require('./docs.route');
const authRoute = require('./auth.route');

const router = express.Router();

// Simple health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CitySense API is running' });
});

// Auth routes
router.use('/auth', authRoute);

// CitySense routes
router.use('/citysense', citysenseRoute);

// API docs
router.use('/docs', docsRoute);


module.exports = router;
