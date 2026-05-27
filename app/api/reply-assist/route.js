import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

function readLeads() {
  const fullPath = path.resolve("./data/leads.json");
  if (!fs.existsSync(fullPath)) return [];
  return JSON.parse(fs.readFileSync(fullPath, "utf8") || "[]");
}

export async function POST(request) {
  const { leadId, replyText } = await request.json();
  const leads = readLeads();
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  try {
    // Dynamic import for server-side modules
    const { analyzeReply, suggestReply } = require("../../../modules/reply-assistant");
    const analysis = await analyzeReply(replyText);
    const suggestedReply = await suggestReply(lead, replyText, analysis);

    return NextResponse.json({
      analysis,
      suggestedReply,
    });
  } catch (error) {
    // Fallback if AI is not configured
    return NextResponse.json({
      analysis: {
        intent: "unclear",
        confidence: 0.5,
        suggestedAction: "book_meeting",
        summary: "Reply received",
      },
      suggestedReply: `Thanks for getting back to me! Would you be open to a quick 15-minute call to discuss some ideas for ${lead.name}?`,
    });
  }
}
