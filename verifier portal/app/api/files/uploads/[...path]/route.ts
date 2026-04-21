import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;

  const filePath = path.join("/");

  const backendUrl = `${process.env.BACKEND_URL}/${filePath}`;

  const response = await fetch(backendUrl);

  if (!response.ok) {
    return new NextResponse("File not found", { status: 404 });
  }

  const contentType =
    response.headers.get("Content-Type") ?? "application/octet-stream";

  const fileBuffer = await response.arrayBuffer();

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}