#!/usr/bin/env node
/**
 * SCRIPT: Follow Up
 * Sends scheduled follow-ups to leads who haven't replied
 *
 * Usage: node scripts/follow-up.js
 */
require("dotenv").config({ path: ".env.local" });
const { processFollowups } = require("../modules/followup-engine");
const { log } = require("../lib/utils");

async function main() {
  log("Script", `=== FOLLOW-UP ENGINE ===`);
  const results = await processFollowups();
  log("Script", `=== DONE: ${results.sent} follow-ups sent, ${results.skipped} skipped ===`);
}

main().catch((e) => {
  log("Script", `Fatal error: ${e.message}`);
  process.exit(1);
});
