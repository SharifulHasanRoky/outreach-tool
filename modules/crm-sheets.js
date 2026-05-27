/**
 * CRM - GOOGLE SHEETS INTEGRATION
 * Syncs local lead data to Google Sheets for easy viewing
 */
const { google } = require("googleapis");
const config = require("../lib/config");
const { getLeads, getStats } = require("../lib/data-store");
const { log } = require("../lib/utils");

/**
 * Get authenticated Google Sheets client
 */
function getAuth() {
  if (!config.sheets.serviceAccountEmail || !config.sheets.privateKey) {
    return null;
  }

  return new google.auth.JWT(
    config.sheets.serviceAccountEmail,
    null,
    config.sheets.privateKey,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
}

/**
 * Sync all leads to Google Sheets
 */
async function syncToSheets() {
  const auth = getAuth();
  if (!auth) {
    log("CRM", "Google Sheets not configured, skipping sync");
    return false;
  }

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = config.sheets.spreadsheetId;
  const leads = getLeads();

  log("CRM", `Syncing ${leads.length} leads to Google Sheets`);

  try {
    // Clear existing data (keep headers)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: "Leads!A2:Z1000",
    });

    // Prepare rows
    const rows = leads.map((lead) => [
      lead.id,
      lead.name,
      lead.website,
      lead.email,
      lead.phone || "",
      lead.source,
      lead.status,
      lead.audit?.score || "",
      lead.audit?.summary || "",
      lead.outreachSent ? "Yes" : "No",
      lead.followupCount || 0,
      lead.createdAt,
      lead.outreachDate || "",
    ]);

    // Write data
    if (rows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Leads!A2",
        valueInputOption: "RAW",
        requestBody: { values: rows },
      });
    }

    // Update stats sheet
    const stats = getStats();
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Stats!A2",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            stats.totalLeads,
            stats.outreachSent,
            stats.replies,
            stats.interested,
            stats.meetingsBooked,
            stats.closed,
            new Date().toISOString(),
          ],
        ],
      },
    });

    log("CRM", "Sync complete");
    return true;
  } catch (error) {
    log("CRM", `Sync error: ${error.message}`);
    return false;
  }
}

/**
 * Initialize sheet headers (run once)
 */
async function initializeSheet() {
  const auth = getAuth();
  if (!auth) return false;

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = config.sheets.spreadsheetId;

  try {
    // Set Leads headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Leads!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "ID", "Name", "Website", "Email", "Phone",
            "Source", "Status", "Audit Score", "Audit Summary",
            "Outreach Sent", "Follow-ups", "Created", "Outreach Date",
          ],
        ],
      },
    });

    // Set Stats headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Stats!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "Total Leads", "Outreach Sent", "Replies",
            "Interested", "Meetings Booked", "Closed", "Last Updated",
          ],
        ],
      },
    });

    log("CRM", "Sheet headers initialized");
    return true;
  } catch (error) {
    log("CRM", `Init error: ${error.message}`);
    return false;
  }
}

module.exports = { syncToSheets, initializeSheet };
