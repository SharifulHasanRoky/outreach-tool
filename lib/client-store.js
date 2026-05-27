"use client";

import { INITIAL_LEADS, INITIAL_LOGS } from "./initial-data";

const STORAGE_KEYS = {
  leads: "outreach_leads",
  logs: "outreach_logs",
  queue: "outreach_queue",
};

/**
 * Client-side data store using localStorage
 * Works perfectly on Vercel (no server filesystem needed)
 */

function isClient() {
  return typeof window !== "undefined";
}

function getItem(key, defaultValue = []) {
  if (!isClient()) return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null; // null means not initialized
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem(key, value) {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Initialize with demo data on first load ---
export function initializeStore() {
  if (!isClient()) return;
  // Only seed if never initialized
  if (localStorage.getItem(STORAGE_KEYS.leads) === null) {
    setItem(STORAGE_KEYS.leads, INITIAL_LEADS);
    setItem(STORAGE_KEYS.logs, INITIAL_LOGS);
    setItem(STORAGE_KEYS.queue, []);
  }
}

// --- LEADS ---
export function getLeads() {
  return getItem(STORAGE_KEYS.leads) || [];
}

export function setLeads(leads) {
  setItem(STORAGE_KEYS.leads, leads);
}

export function addLead(lead) {
  const leads = getLeads();
  if (lead.email && leads.find((l) => l.email === lead.email)) return null;
  leads.push(lead);
  setLeads(leads);
  return lead;
}

export function updateLead(id, updates) {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  leads[idx] = { ...leads[idx], ...updates };
  setLeads(leads);
  return leads[idx];
}

export function deleteLead(id) {
  const leads = getLeads().filter((l) => l.id !== id);
  setLeads(leads);
  // Also remove from queue
  const queue = getQueue().filter((q) => q.leadId !== id);
  setItem(STORAGE_KEYS.queue, queue);
  return true;
}

// --- OUTREACH LOG ---
export function getLogs() {
  return getItem(STORAGE_KEYS.logs) || [];
}

export function addLog(entry) {
  const logs = getLogs();
  logs.push(entry);
  setItem(STORAGE_KEYS.logs, logs);
  return entry;
}

// --- FOLLOW-UP QUEUE ---
export function getQueue() {
  return getItem(STORAGE_KEYS.queue) || [];
}

export function addToQueue(entry) {
  const queue = getQueue();
  queue.push(entry);
  setItem(STORAGE_KEYS.queue, queue);
}

// --- STATS ---
export function getStats() {
  const leads = getLeads();
  const logs = getLogs();
  return {
    totalLeads: leads.length,
    outreachSent: logs.length,
    replies: leads.filter((l) => l.status === "replied").length,
    interested: leads.filter((l) => l.status === "interested").length,
    meetingsBooked: leads.filter((l) => l.status === "meeting_booked").length,
    closed: leads.filter((l) => l.status === "closed").length,
    pending: leads.filter((l) => l.status === "outreach_sent").length,
  };
}

// --- ACTIONS ---
export function auditLead(leadId) {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) return { error: "Lead not found" };
  if (!leads[idx].website) return { error: "Lead has no website to audit" };

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

  const numIssues = 2 + Math.floor(Math.random() * 4);
  const shuffled = [...possibleIssues].sort(() => 0.5 - Math.random());
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
  setLeads(leads);
  return { success: true, lead: leads[idx], audit };
}

export function sendOutreach(leadId) {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) return { error: "Lead not found" };

  const lead = leads[idx];
  if (!lead.email) return { error: "Lead has no email" };
  if (lead.outreachSent) return { error: "Outreach already sent" };
  if (!lead.audit) return { error: "Audit website first" };

  const issue = lead.audit.issues[0] || "some areas that could improve";
  const subjects = [
    `Quick idea for ${lead.name}`,
    `Noticed something about ${lead.name}'s website`,
    `Thought about ${lead.name}`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const message = `Hey, I was looking at ${lead.name}'s website and noticed ${issue.toLowerCase()}. I had a couple of ideas that might help improve conversions. Would you be open to a quick chat?`;

  leads[idx].outreachSent = true;
  leads[idx].outreachDate = new Date().toISOString().split("T")[0];
  leads[idx].status = "outreach_sent";
  setLeads(leads);

  const entry = {
    id: `out-${Date.now().toString(36)}`,
    leadId: lead.id,
    leadName: lead.name,
    email: lead.email,
    subject,
    message,
    status: "sent",
    sentAt: new Date().toISOString(),
    followupNumber: 0,
  };
  addLog(entry);

  addToQueue({
    leadId: lead.id,
    leadName: lead.name,
    email: lead.email,
    outreachDate: leads[idx].outreachDate,
    followupCount: 0,
    nextFollowup: addDays(leads[idx].outreachDate, 2),
  });

  return { success: true, lead: leads[idx], outreach: entry };
}

export function bulkFind({ query, location, count }) {
  const num = Math.min(count || 5, 10);
  const leads = getLeads();

  const businessTypes = [
    "Bright Smile Dental", "Quick Cuts Barber", "Fresh Start Fitness",
    "Pixel Perfect Design", "Green Thumb Landscaping", "Swift Plumbing",
    "Cloud Nine Spa", "Golden Wok Restaurant", "Blue Sky Roofing",
    "Prime Real Estate", "Clean Sweep Cleaning", "Peak Performance PT",
    "Artisan Coffee House", "Rapid Auto Service", "Sweet Treats Bakery",
    "Harmony Yoga Studio", "Shield Security Systems", "Bright Ideas Electric",
    "Urban Cuts Salon", "Mountain View Dental", "Sunset Yoga", "Flash Photo Studio",
    "Royal Dry Cleaners", "Metro Plumbing Co", "City Lights Bar", "Happy Paws Vet",
  ];

  const added = [];
  const usedNames = new Set(leads.map((l) => l.name));

  for (let i = 0; i < num; i++) {
    let name = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    if (usedNames.has(name)) {
      name = `${name} ${Math.floor(Math.random() * 99) + 1}`;
    }
    usedNames.add(name);

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    const newLead = {
      id: `lead-${Date.now().toString(36)}-${i}`,
      name,
      website: `https://${slug}.example.com`,
      email: `info@${slug}.example.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
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

    leads.push(newLead);
    added.push(newLead);
  }

  setLeads(leads);
  return { success: true, added: added.length, leads: added };
}

export function addManualLead({ name, website, email, phone }) {
  const leads = getLeads();
  if (email && leads.find((l) => l.email === email)) {
    return { error: "Lead with this email already exists" };
  }

  const newLead = {
    id: `lead-${Date.now().toString(36)}`,
    name: name || "Unknown Business",
    website: website || "",
    email: email || "",
    phone: phone || "",
    source: "manual",
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
  setLeads(leads);
  return { success: true, lead: newLead };
}

// --- RESET ---
export function resetAllData() {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEYS.leads);
  localStorage.removeItem(STORAGE_KEYS.logs);
  localStorage.removeItem(STORAGE_KEYS.queue);
  initializeStore();
}

// Helper
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
