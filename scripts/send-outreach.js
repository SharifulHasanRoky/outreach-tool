#!/usr/bin/env node
/**
 * SCRIPT: Send Outreach
 * Generates and sends outreach to audited leads
 *
 * Usage: node scripts/send-outreach.js
 */
require("dotenv").config({ path: ".env.local" });
const { generateOutreach } = require("../modules/outreach-generator");
const { sendBatchOutreach } = require("../modules/auto-outreach");
const { getLeads } = require("../lib/data-store");
const { log } = require("../lib/utils");
const config = require("../lib/config");

async function main() {
  log("Script", `=== OUTREACH SENDER ===`);

  // Get leads that have been audited but not yet contacted
  const leads = getLeads().filter(
    (l) => l.audit && !l.outreachSent && l.status === "new" && l.email
  );

  const batch = leads.slice(0, config.outreach.dailyLeadLimit);
  log("Script", `${leads.length} leads ready | Sending to ${batch.length} today`);

  if (batch.length === 0) {
    log("Script", "No leads to contact. Run find-leads and audit-websites first.");
    return;
  }

  // Generate personalized messages
  const leadsWithMessages = [];
  for (const lead of batch) {
    try {
      const message = await generateOutreach(lead);
      leadsWithMessages.push({ lead, message });
      log("Script", `Generated message for: ${lead.name}`);
    } catch (e) {
      log("Script", `Failed to generate message for ${lead.name}: ${e.message}`);
    }
  }

  // Send batch
  if (leadsWithMessages.length > 0) {
    const results = await sendBatchOutreach(leadsWithMessages);
    log("Script", `=== DONE: ${results.sent} sent, ${results.failed} failed ===`);
  }
}

main().catch((e) => {
  log("Script", `Fatal error: ${e.message}`);
  process.exit(1);
});
