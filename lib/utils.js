/**
 * Utility functions
 */
const { v4: uuidv4 } = require("uuid");
const config = require("./config");

/**
 * Generate unique ID
 */
function generateId() {
  return uuidv4();
}

/**
 * Random delay between min and max ms (avoids spam detection)
 */
function randomDelay() {
  const min = config.outreach.delayMinMs;
  const max = config.outreach.delayMaxMs;
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Get current date string
 */
function today() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Calculate days since a date
 */
function daysSince(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

/**
 * Safe log with timestamp
 */
function log(module, message) {
  console.log(`[${new Date().toISOString()}] [${module}] ${message}`);
}

module.exports = { generateId, randomDelay, today, daysSince, log };
