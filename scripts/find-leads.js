#!/usr/bin/env node
/**
 * SCRIPT: Find Leads
 * Searches for potential clients and saves them
 *
 * Usage: node scripts/find-leads.js [query] [location]
 * Example: node scripts/find-leads.js "restaurant" "New York"
 */
require("dotenv").config({ path: ".env.local" });
const { searchGoogleMaps, searchGoogle, enrichLeads, saveLeads } = require("../modules/lead-finder");
const { log } = require("../lib/utils");
const config = require("../lib/config");

async function main() {
  const query = process.argv[2] || "small business";
  const location = process.argv[3] || "local";
  const maxResults = config.outreach.dailyLeadLimit;

  log("Script", `=== LEAD FINDER ===`);
  log("Script", `Query: "${query}" | Location: "${location}" | Max: ${maxResults}`);

  let leads = [];

  // Try Google Maps first
  try {
    const mapsLeads = await searchGoogleMaps({ query, location, maxResults });
    leads = leads.concat(mapsLeads);
  } catch (e) {
    log("Script", `Google Maps search failed: ${e.message}`);
  }

  // Supplement with Google Search if needed
  if (leads.length < maxResults) {
    try {
      const googleLeads = await searchGoogle({
        query: `${query} ${location} website`,
        maxResults: maxResults - leads.length,
      });
      leads = leads.concat(googleLeads);
    } catch (e) {
      log("Script", `Google Search failed: ${e.message}`);
    }
  }

  // Enrich with emails
  if (leads.length > 0) {
    leads = await enrichLeads(leads);
  }

  // Save to data store
  const saved = saveLeads(leads);
  log("Script", `=== DONE: ${saved} new leads saved ===`);
}

main().catch((e) => {
  log("Script", `Fatal error: ${e.message}`);
  process.exit(1);
});
