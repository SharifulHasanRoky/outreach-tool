#!/usr/bin/env node
/**
 * SETUP SCRIPT
 * Initializes the AI Outreach Tool - creates directories, sample data, checks config
 *
 * Usage: node scripts/setup.js
 */
const fs = require("fs");
const path = require("path");

console.log("\n========================================");
console.log("  AI OUTREACH TOOL - SETUP");
console.log("========================================\n");

// 1. Create data directory
const dataDir = path.resolve(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("[OK] Created data/ directory");
} else {
  console.log("[OK] data/ directory exists");
}

// 2. Initialize data files if missing
const dataFiles = {
  "leads.json": "[]",
  "outreach-log.json": "[]",
  "followup-queue.json": "[]",
};

for (const [file, defaultContent] of Object.entries(dataFiles)) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, "utf8");
    console.log(`[OK] Created data/${file}`);
  } else {
    console.log(`[OK] data/${file} exists`);
  }
}

// 3. Check .env.local
const envPath = path.resolve(__dirname, "../.env.local");
const envExamplePath = path.resolve(__dirname, "../.env.example");
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("[OK] Created .env.local from .env.example");
    console.log("     >> EDIT .env.local with your API keys!");
  } else {
    console.log("[WARN] No .env.example found, cannot create .env.local");
  }
} else {
  console.log("[OK] .env.local exists");
}

// 4. Check required env vars
console.log("\n--- Checking Configuration ---");
require("dotenv").config({ path: envPath });

const checks = [
  { key: "GROQ_API_KEY", label: "Groq AI (free)", required: true },
  { key: "GMAIL_USER", label: "Gmail email", required: true },
  { key: "GMAIL_APP_PASSWORD", label: "Gmail app password", required: true },
  { key: "PAGESPEED_API_KEY", label: "PageSpeed API", required: false },
  { key: "GOOGLE_SHEETS_ID", label: "Google Sheets CRM", required: false },
];

let allGood = true;
for (const check of checks) {
  const val = process.env[check.key];
  if (val && val !== `your_${check.key.toLowerCase()}_here` && !val.includes("your_")) {
    console.log(`[OK] ${check.label} - configured`);
  } else if (check.required) {
    console.log(`[!!] ${check.label} - NOT SET (required)`);
    allGood = false;
  } else {
    console.log(`[--] ${check.label} - not set (optional)`);
  }
}

// 5. Summary
console.log("\n========================================");
if (allGood) {
  console.log("  SETUP COMPLETE - Ready to go!");
  console.log("========================================");
  console.log("\nNext steps:");
  console.log("  1. npm run dev          → Start dashboard");
  console.log("  2. npm run lead:find    → Find leads");
  console.log("  3. npm run lead:audit   → Audit websites");
  console.log("  4. npm run lead:outreach → Send outreach");
  console.log("  5. npm run lead:daily   → Run full pipeline");
} else {
  console.log("  SETUP INCOMPLETE - Fix the issues above");
  console.log("========================================");
  console.log("\nEdit .env.local and add your API keys:");
  console.log("  - Groq (free): https://console.groq.com");
  console.log("  - Gmail App Password: https://myaccount.google.com/apppasswords");
}
console.log("");
