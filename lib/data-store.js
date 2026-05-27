/**
 * Simple JSON file-based data store
 * Used as local CRM before syncing to Google Sheets
 */
const fs = require("fs");
const path = require("path");
const config = require("./config");

// Ensure data directory exists
const dataDir = path.resolve("./data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readJSON(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, "[]", "utf8");
    return [];
  }
  const raw = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(raw || "[]");
}

function writeJSON(filePath, data) {
  const fullPath = path.resolve(filePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}

// --- Leads ---
function getLeads() {
  return readJSON(config.paths.leads);
}

function addLead(lead) {
  const leads = getLeads();
  // Avoid duplicates by email or website
  const exists = leads.find(
    (l) => l.email === lead.email || l.website === lead.website
  );
  if (exists) return null;
  leads.push(lead);
  writeJSON(config.paths.leads, leads);
  return lead;
}

function updateLead(id, updates) {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  leads[idx] = { ...leads[idx], ...updates };
  writeJSON(config.paths.leads, leads);
  return leads[idx];
}

function getLeadsByStatus(status) {
  return getLeads().filter((l) => l.status === status);
}

// --- Outreach Log ---
function getOutreachLog() {
  return readJSON(config.paths.outreachLog);
}

function addOutreachEntry(entry) {
  const log = getOutreachLog();
  log.push(entry);
  writeJSON(config.paths.outreachLog, log);
  return entry;
}

// --- Follow-up Queue ---
function getFollowupQueue() {
  return readJSON(config.paths.followupQueue);
}

function addToFollowupQueue(entry) {
  const queue = getFollowupQueue();
  queue.push(entry);
  writeJSON(config.paths.followupQueue, queue);
  return entry;
}

function removeFromFollowupQueue(leadId) {
  const queue = getFollowupQueue();
  const filtered = queue.filter((q) => q.leadId !== leadId);
  writeJSON(config.paths.followupQueue, filtered);
}

// --- Stats ---
function getStats() {
  const leads = getLeads();
  const log = getOutreachLog();

  return {
    totalLeads: leads.length,
    outreachSent: log.length,
    replies: leads.filter((l) => l.status === "replied").length,
    interested: leads.filter((l) => l.status === "interested").length,
    meetingsBooked: leads.filter((l) => l.status === "meeting_booked").length,
    closed: leads.filter((l) => l.status === "closed").length,
    pending: leads.filter((l) => l.status === "outreach_sent").length,
  };
}

module.exports = {
  getLeads,
  addLead,
  updateLead,
  getLeadsByStatus,
  getOutreachLog,
  addOutreachEntry,
  getFollowupQueue,
  addToFollowupQueue,
  removeFromFollowupQueue,
  getStats,
};
