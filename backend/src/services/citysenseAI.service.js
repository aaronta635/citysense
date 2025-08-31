const Mood = require('../models/mood.model');
const Weather = require('../models/weather.model');
const Pollution = require('../models/pollution.model');
const AIAnalysis = require('../models/aiAnalysis.model');

let sentimentPipeline;

async function initPipeline() {
  if (!sentimentPipeline) {
    const { pipeline } = await import('@xenova/transformers');
    sentimentPipeline = await pipeline(
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    );
  }
  return sentimentPipeline;
}

async function runNodeAI(weather, pollution, moods) {
  const pipe = await initPipeline();

  const results = { complaints: {}, positives: {}, newsfeed: [] };

  for (const m of moods) {
    const out = await pipe(m.message);
    const label = out[0].label; // POSITIVE / NEGATIVE
    const sentiment = label === 'NEGATIVE' ? 'complaints' : 'positives';
    const topic = 'Weather';

    if (!results[sentiment][topic]) results[sentiment][topic] = 0;
    results[sentiment][topic]++;

    const prefix = label === 'NEGATIVE' ? '📰' : '🌟';
    results.newsfeed.push(`${prefix} [${label}][${m.district}][${topic}] ${m.message}`);
  }

  return results;
}

async function storeAnalysisResults(suburb, results, weather, pollution, analysisType) {
  try {
    await AIAnalysis.create({
      suburb,
      complaints: JSON.stringify(results.complaints),
      positives: JSON.stringify(results.positives),
      newsfeed: JSON.stringify(results.newsfeed),
      weather: JSON.stringify(weather),
      pollution: JSON.stringify(pollution),
      analysisType,
    });
    console.log(`Analysis results stored for ${suburb}`);
  } catch (error) {
    console.error(`Error storing analysis for ${suburb}:`, error);
  }
}

async function getLatestAnalysis(suburb, analysisType = 'city') {
  try {
    const analysis = await AIAnalysis.findOne({
      where: { suburb, analysisType },
      order: [['createdAt', 'DESC']],
    });
    return analysis;
  } catch (error) {
    console.error(`Error getting analysis for ${suburb}:`, error);
    return null;
  }
}

module.exports = { runNodeAI, storeAnalysisResults, getLatestAnalysis };