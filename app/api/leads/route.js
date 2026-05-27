import { NextResponse } from "next/server";

// Leads are now managed client-side via localStorage
// This route is kept for backward compatibility
export async function GET() {
  return NextResponse.json([]);
}

export async function PATCH(request) {
  return NextResponse.json({ message: "Lead updates are handled client-side" });
}
