// app/api/notifications/mark-read/route.ts
// Called when user opens the panel — saves timestamp client-side (no DB column needed)
// This route is optional — only needed if you want server-side read tracking in future

import { NextRequest, NextResponse } from "next/server";

// For now, read state is managed client-side via localStorage (lastSeenAt timestamp).
// If you later want DB-level read tracking, add a UserNotificationRead model and handle here.

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Read state is managed client-side via lastSeenAt timestamp.",
  });
}