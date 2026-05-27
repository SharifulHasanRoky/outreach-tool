import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

function readJSON(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) return [];
  return JSON.parse(fs.readFileSync(fullPath, "utf8") || "[]");
}

export async function GET() {
  const leads = readJSON("./data/leads.json");
  const log = readJSON("./data/outreach-log.json");

  const stats = {
    totalLeads: leads.length,
    outreachSent: log.length,
    replies: leads.filter((l) => l.status === "replied").length,
    interested: leads.filter((l) => l.status === "interested").length,
    meetingsBooked: leads.filter((l) => l.status === "meeting_booked").length,
    closed: leads.filter((l) => l.status === "closed").length,
    pending: leads.filter((l) => l.status === "outreach_sent").length,
  };

  return NextResponse.json(stats);
}
