import { NextResponse } from "next/server";

// Reply assistant now works client-side
// This endpoint is kept for future AI API integration
export async function POST(request) {
  const { leadId, replyText } = await request.json();

  return NextResponse.json({
    analysis: {
      intent: "unclear",
      confidence: 0.5,
      suggestedAction: "book_meeting",
      summary: "Reply analysis is handled client-side",
    },
    suggestedReply: "Reply suggestions are generated client-side for instant response.",
  });
}
