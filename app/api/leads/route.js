import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const LEADS_PATH = "./data/leads.json";

function readLeads() {
  const fullPath = path.resolve(LEADS_PATH);
  if (!fs.existsSync(fullPath)) return [];
  return JSON.parse(fs.readFileSync(fullPath, "utf8") || "[]");
}

function writeLeads(leads) {
  const fullPath = path.resolve(LEADS_PATH);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(leads, null, 2), "utf8");
}

export async function GET() {
  const leads = readLeads();
  return NextResponse.json(leads);
}

export async function PATCH(request) {
  const { id, status } = await request.json();
  const leads = readLeads();
  const idx = leads.findIndex((l) => l.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  leads[idx].status = status;
  writeLeads(leads);

  return NextResponse.json(leads[idx]);
}
