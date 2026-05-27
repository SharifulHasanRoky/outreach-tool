import { NextResponse } from "next/server";

// Logs are now managed client-side via localStorage
export async function GET() {
  return NextResponse.json([]);
}
