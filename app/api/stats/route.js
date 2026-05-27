import { NextResponse } from "next/server";

// Stats are now computed client-side via localStorage
// This route is kept for backward compatibility with scripts
export async function GET() {
  return NextResponse.json({
    totalLeads: 0,
    outreachSent: 0,
    replies: 0,
    interested: 0,
    meetingsBooked: 0,
    closed: 0,
    pending: 0,
    message: "Dashboard stats are handled client-side. This endpoint is for scripts only."
  });
}
