import { NextResponse } from "next/server";

// All actions are now handled client-side via localStorage
// This route is kept as a placeholder
export async function POST(request) {
  return NextResponse.json({
    message: "Actions are handled client-side. No server-side processing needed.",
  });
}
