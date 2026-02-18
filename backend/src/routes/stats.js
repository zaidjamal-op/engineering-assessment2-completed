const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { mean } = require('../utils/stats');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;
let cachedMtimeMs = null;
let inFlightComputation = null;

async function computeStats() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const items = JSON.parse(raw);
  const prices = items.map((item) => item.price);

  return {
    total: items.length,
    averagePrice: mean(prices)
  };
}

async function getStatsFromCache() {
  const fileInfo = await fs.stat(DATA_PATH);

  if (cachedStats && cachedMtimeMs === fileInfo.mtimeMs) {
    return cachedStats;
  }

  if (!inFlightComputation) {
    inFlightComputation = computeStats()
      .then((stats) => {
        cachedStats = stats;
        cachedMtimeMs = fileInfo.mtimeMs;
        return stats;
      })
      .finally(() => {
        inFlightComputation = null;
      });
  }

  return inFlightComputation;
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const stats = await getStatsFromCache();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
