const axios = require('axios');
const logger = require('../utils/logger');

const baseURL = process.env.ML_API_URL || 'http://localhost:8000';
const apiKey = process.env.ML_API_KEY;

const client = axios.create({
  baseURL,
  timeout: 10000,
  headers: apiKey ? { 'X-API-Key': apiKey } : {},
});

async function safeCall(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    logger.warn('ML service call failed:', err.message);
    return fallback;
  }
}

exports.recommend = ({ userId, productId, k = 8 }) =>
  safeCall(
    async () => (await client.post('/recommend', { user_id: userId, product_id: productId, k })).data,
    { items: [] }
  );

exports.predictDemand = ({ productId, horizonDays = 7 }) =>
  safeCall(
    async () =>
      (await client.post('/predict-demand', { product_id: productId, horizon_days: horizonDays }))
        .data,
    { forecast: [] }
  );

exports.detectReview = ({ text }) =>
  safeCall(async () => (await client.post('/detect-review', { text })).data, {
    fake_score: 0,
    is_fake: false,
  });

exports.imageSearch = (formData, headers) =>
  safeCall(
    async () => (await client.post('/image-search', formData, { headers })).data,
    { items: [] }
  );

exports.metrics = () => safeCall(async () => (await client.get('/metrics')).data, {});
