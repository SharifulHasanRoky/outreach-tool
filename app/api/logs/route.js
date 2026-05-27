import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  const fullPath = path.resolve("./data/outreach-log.json");
  if (!fs.existsSync(fullPath)) return NextResponse.json([]);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf8") || "[]");
  return NextResponse.json(data);
}
