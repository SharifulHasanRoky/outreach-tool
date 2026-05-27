#!/usr/bin/env node
/**
 * SCRIPT: Daily Pipeline
 * Runs the full daily automation pipeline:
 * 1. Find new leads
 * 2. Audit their websites
 * 3. Send outreach to audited leads
 * 4. Follow up with previous leads
 * 5. Sync to Google Sheets
 *
 * Usage: node scripts/daily-pipeline.js [query] [location]
 * Example: node scripts/daily-pipeline.js "dentist" "Chicago"
 */
require("dotenv").config({ path: ".env.local" });
const { searchGoogleMaps, enrichLeads, saveLeads } = require("../modules/lead-finder");
const { auditWebsite } = require("../modules/website-auditor");
const { generateOutreach } = require("../modules/outreach-generator");
const { sendBatchOutreach } = require("../modules/auto-outreach");
const { processFollowups } = require("../modules/followup-engine");
const { syncToSheets } = require("../modules/crm-sheets");
const { getLeads, updateLead } = require("../lib/data-store");
const { log } = require("../lib/utils");
const config = require("../lib/config");

async function main() {
  const query = process.argv[2] || "small business";
  const location = process.argv[3] || "local";

  log("Pipeline", "========================================");
  log("Pipeline", "  AI OUTREACH - DAILY PIPELINE");
  log("Pipeline", "========================================");

  // STEP 1: Find Leads
  log("Pipeline", "\n--- STEP 1: FINDING LEADS ---");
  let newLeads = [];
  try {
    newLeads = await searchGoogleMaps({
      query,
      location,
      maxResults: config.outreach.dailyLeadLimit,
    });
    newLeads = await enrichLeads(newLeads);
    const saved = saveLeads(newLeads);
    log("Pipeline", `Found ${newLeads.length} leads, saved ${saved} new`);
  } catch (e) {
    log("Pipeline", `Lead finding error: ${e.message}`);
  }

  // STEP 2: Audit Websites
  log("Pipeline", "\n--- STEP 2: AUDITING WEBSITES ---");
  const unaudited = getLeads().filter((l) => !l.audit && l.website);
  let auditCount = 0;
  for (const lead of unaudited.slice(0, config.outreach.dailyLeadLimit)) {
    try {
      const audit = await auditWebsite(lead.website);
      updateLead(lead.id, { audit });
      auditCount++;
      await new Promise((r) => setTimeout(r, 3000));
    } catch (e) {
      log("Pipeline", `Audit failed for ${lead.website}: ${e.message}`);
    }
  }
  log("Pipeline", `Audited ${auditCount} websites`);

  // STEP 3: Send Outreach
  log("Pipeline", "\n--- STEP 3: SENDING OUTREACH ---");
  const ready = getLeads().filter(
    (l) => l.audit && !l.outreachSent && l.status === "new" && l.email
  );
  const batch = ready.slice(0, config.outreach.dailyLeadLimit);
  const leadsWithMessages = [];
  for (const lead of batch) {
    try {
      const message = await generateOutreach(lead);
      leadsWithMessages.push({ lead, message });
    } catch (e) {
      log("Pipeline", `Message gen failed for ${lead.name}`);
    }
  }
  if (leadsWithMessages.length > 0) {
    const results = await sendBatchOutreach(leadsWithMessages);
    log("Pipeline", `Sent ${results.sent} outreach messages`);
  }

  // STEP 4: Follow-ups
  log("Pipeline", "\n--- STEP 4: FOLLOW-UPS ---");
  try {
    const followResults = await processFollowups();
    log("Pipeline", `Sent ${followResults.sent} follow-ups`);
  } catch (e) {
    log("Pipeline", `Follow-up error: ${e.message}`);
  }

  // STEP 5: Sync CRM
  log("Pipeline", "\n--- STEP 5: SYNCING CRM ---");
  try {
    await syncToSheets();
    log("Pipeline", "CRM sync complete");
  } catch (e) {
    log("Pipeline", `CRM sync skipped: ${e.message}`);
  }

  log("Pipeline", "\n========================================");
  log("Pipeline", "  DAILY PIPELINE COMPLETE");
  log("Pipeline", "========================================");
}

main().catch((e) => {
  log("Pipeline", `Fatal error: ${e.message}`);
  process.exit(1);
});
