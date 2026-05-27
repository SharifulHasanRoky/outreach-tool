/**
 * Central configuration for the AI Outreach Tool
 * Reads from environment variables with sensible defaults
 */
require("dotenv").config({ path: ".env.local" });

const config = {
  // AI Provider
  ai: {
    provider: process.env.AI_PROVIDER || "groq", // "groq" | "openai"
    groqApiKey: process.env.GROQ_API_KEY || "",
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.AI_MODEL || "llama-3.1-70b-versatile",
  },

  // Email
  email: {
    user: process.env.GMAIL_USER || "",
    pass: process.env.GMAIL_APP_PASSWORD || "",
  },

  // Google Sheets CRM
  sheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_ID || "",
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  },

  // PageSpeed
  pagespeed: {
    apiKey: process.env.PAGESPEED_API_KEY || "",
  },

  // Outreach Settings
  outreach: {
    dailyLeadLimit: parseInt(process.env.DAILY_LEAD_LIMIT || "10"),
    delayMinMs: parseInt(process.env.OUTREACH_DELAY_MIN_MS || "30000"),
    delayMaxMs: parseInt(process.env.OUTREACH_DELAY_MAX_MS || "90000"),
  },

  // Follow-up Schedule (days after initial outreach)
  followup: {
    day2: parseInt(process.env.FOLLOWUP_DAY_2 || "2"),
    day5: parseInt(process.env.FOLLOWUP_DAY_5 || "5"),
    day10: parseInt(process.env.FOLLOWUP_DAY_10 || "10"),
  },

  // Data paths
  paths: {
    leads: "./data/leads.json",
    outreachLog: "./data/outreach-log.json",
    followupQueue: "./data/followup-queue.json",
  },
};

module.exports = config;
