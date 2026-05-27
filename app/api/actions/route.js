import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.resolve("./data");
const LEADS_PATH = path.join(DATA_DIR, "leads.json");
const LOG_PATH = path.join(DATA_DIR, "outreach-log.json");
const QUEUE_PATH = path.join(DATA_DIR, "followup-queue.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
}

function writeJSON(filePath, data) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

/**
 * POST /api/actions
 * Handles all dashboard actions: add_lead, audit_lead, send_outreach, delete_lead
 */
export async function POST(request) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case "add_lead":
      return handleAddLead(body);
    case "audit_lead":
      return handleAuditLead(body);
    case "send_outreach":
      return handleSendOutreach(body);
    case "delete_lead":
      return handleDeleteLead(body);
    case "bulk_find":
      return handleBulkFind(body);
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}

// --- ADD LEAD MANUALLY ---
function handleAddLead({ name, website, email, phone, source }) {
  const leads = readJSON(LEADS_PATH);

  // Check duplicate
  if (email && leads.find((l) => l.email === email)) {
    return NextResponse.json({ error: "Lead with this email already exists" }, { status: 409 });
  }

  const newLead = {
    id: `lead-${uuidv4().slice(0, 8)}`,
    name: name || "Unknown Business",
    website: website || "",
    email: email || "",
    phone: phone || "",
    source: source || "manual",
    query: "",
    location: "",
    status: "new",
    createdAt: new Date().toISOString(),
    outreachSent: false,
    outreachDate: null,
    followupCount: 0,
    audit: null,
  };

  leads.push(newLead);
  writeJSON(LEADS_PATH, leads);

  return NextResponse.json({ success: true, lead: newLead });
}

// --- AUDIT A LEAD (simulated without Playwright for dashboard) ---
function handleAuditLead({ leadId }) {
  const leads = readJSON(LEADS_PATH);
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const lead = leads[idx];
  if (!lead.website) {
    return NextResponse.json({ error: "Lead has no website to audit" }, { status: 400 });
  }

  // Generate a realistic audit result
  const possibleIssues = [
    "Website is slow (performance score below 50)",
    "No clear Call-to-Action (CTA) found",
    "No lead capture form found",
    "Missing trust signals (testimonials, reviews, badges)",
    "No Meta Pixel or Google Analytics detected",
    "Not mobile-friendly",
    "SEO score is weak",
    "No social media links found",
    "Largest Contentful Paint is too slow (>4s)",
  ];

  // Pick 2-5 random issues
  const numIssues = 2 + Math.floor(Math.random() * 4);
  const shuffled = possibleIssues.sort(() => 0.5 - Math.random());
  const issues = shuffled.slice(0, numIssues);

  const score = Math.max(15, Math.min(75, Math.floor(Math.random() * 60) + 15));

  const summaries = [
    `Website has multiple issues including ${issues[0].toLowerCase()} and ${issues[1].toLowerCase()}.`,
    `Found ${issues.length} problems. Main concern: ${issues[0].toLowerCase()}.`,
    `Site needs improvement. ${issues[0]} ${issues.length > 2 ? "and " + (issues.length - 1) + " other issues." : "."}`,
  ];

  const audit = {
    score,
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    issues,
    timestamp: new Date().toISOString(),
  };

  leads[idx].audit = audit;
  writeJSON(LEADS_PATH, leads);

  return NextResponse.json({ success: true, lead: leads[idx], audit });
}

// --- SEND OUTREACH (log it) ---
function handleSendOutreach({ leadId }) {
  const leads = readJSON(LEADS_PATH);
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const lead = leads[idx];
  if (!lead.email) {
    return NextResponse.json({ error: "Lead has no email" }, { status: 400 });
  }
  if (lead.outreachSent) {
    return NextResponse.json({ error: "Outreach already sent to this lead" }, { status: 400 });
  }
  if (!lead.audit) {
    return NextResponse.json({ error: "Audit the website first before sending outreach" }, { status: 400 });
  }

  // Generate outreach message
  const issue = lead.audit.issues[0] || "some areas that could improve";
  const subjects = [
    `Quick idea for ${lead.name}`,
    `Noticed something about ${lead.name}'s website`,
    `Thought about ${lead.name}`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const message = `Hey, I was looking at ${lead.name}'s website and noticed ${issue.toLowerCase()}. I had a couple of ideas that might help improve conversions. Would you be open to a quick chat?`;

  // Update lead
  leads[idx].outreachSent = true;
  leads[idx].outreachDate = new Date().toISOString().split("T")[0];
  leads[idx].status = "outreach_sent";
  writeJSON(LEADS_PATH, leads);

  // Add to outreach log
  const log = readJSON(LOG_PATH);
  const entry = {
    id: `out-${uuidv4().slice(0, 8)}`,
    leadId: lead.id,
    leadName: lead.name,
    email: lead.email,
    subject,
    message,
    status: "sent",
    sentAt: new Date().toISOString(),
    followupNumber: 0,
  };
  log.push(entry);
  writeJSON(LOG_PATH, log);

  // Add to follow-up queue
  const queue = readJSON(QUEUE_PATH);
  queue.push({
    leadId: lead.id,
    leadName: lead.name,
    email: lead.email,
    outreachDate: leads[idx].outreachDate,
    followupCount: 0,
    nextFollowup: addDays(leads[idx].outreachDate, 2),
  });
  writeJSON(QUEUE_PATH, queue);

  return NextResponse.json({ success: true, lead: leads[idx], outreach: entry });
}

// --- DELETE LEAD ---
function handleDeleteLead({ leadId }) {
  let leads = readJSON(LEADS_PATH);
  const before = leads.length;
  leads = leads.filter((l) => l.id !== leadId);
  if (leads.length === before) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  writeJSON(LEADS_PATH, leads);

  // Also remove from follow-up queue
  let queue = readJSON(QUEUE_PATH);
  queue = queue.filter((q) => q.leadId !== leadId);
  writeJSON(QUEUE_PATH, queue);

  return NextResponse.json({ success: true });
}

// --- BULK FIND (add multiple demo leads) ---
function handleBulkFind({ query, location, count }) {
  const num = Math.min(count || 5, 10);
  const leads = readJSON(LEADS_PATH);

  const businessTypes = [
    "Bright Smile Dental", "Quick Cuts Barber", "Fresh Start Fitness",
    "Pixel Perfect Design", "Green Thumb Landscaping", "Swift Plumbing",
    "Cloud Nine Spa", "Golden Wok Restaurant", "Blue Sky Roofing",
    "Prime Real Estate", "Clean Sweep Cleaning", "Peak Performance PT",
    "Artisan Coffee House", "Rapid Auto Service", "Sweet Treats Bakery",
    "Harmony Yoga Studio", "Shield Security Systems", "Bright Ideas Electric",
  ];

  const added = [];
  for (let i = 0; i < num; i++) {
    const nameBase = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    const name = leads.find((l) => l.name === nameBase)
      ? `${nameBase} ${Math.floor(Math.random() * 99)}`
      : nameBase;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newLead = {
      id: `lead-${uuidv4().slice(0, 8)}`,
      name,
      website: `https://${slug}.example.com`,
      email: `info@${slug.slice(0, 15)}.example.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000).slice(0, 4)}-${String(Math.floor(Math.random() * 9000) + 1000).slice(0, 4)}`,
      source: "google_maps",
      query: query || "local business",
      location: location || "Local",
      status: "new",
      createdAt: new Date().toISOString(),
      outreachSent: false,
      outreachDate: null,
      followupCount: 0,
      audit: null,
    };

    if (!leads.find((l) => l.email === newLead.email)) {
      leads.push(newLead);
      added.push(newLead);
    }
  }

  writeJSON(LEADS_PATH, leads);
  return NextResponse.json({ success: true, added: added.length, leads: added });
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
