#!/usr/bin/env node
/**
 * SCRIPT: Audit Websites
 * Runs website audits on all leads that haven't been audited yet
 *
 * Usage: node scripts/audit-websites.js
 */
require("dotenv").config({ path: ".env.local" });
const { auditWebsite } = require("../modules/website-auditor");
const { getLeads, updateLead } = require("../lib/data-store");
const { log } = require("../lib/utils");

async function main() {
  log("Script", `=== WEBSITE AUDITOR ===`);

  const leads = getLeads().filter((l) => !l.audit && l.website);
  log("Script", `Found ${leads.length} leads needing audit`);

  let audited = 0;

  for (const lead of leads) {
    try {
      log("Script", `Auditing: ${lead.website}`);
      const audit = await auditWebsite(lead.website);
      updateLead(lead.id, { audit });
      audited++;
      log("Script", `Score: ${audit.score}/100 | Issues: ${audit.issues.length}`);

      // Delay between audits
      await new Promise((r) => setTimeout(r, 3000));
    } catch (e) {
      log("Script", `Failed to audit ${lead.website}: ${e.message}`);
    }
  }

  log("Script", `=== DONE: ${audited} websites audited ===`);
}

main().catch((e) => {
  log("Script", `Fatal error: ${e.message}`);
  process.exit(1);
});
