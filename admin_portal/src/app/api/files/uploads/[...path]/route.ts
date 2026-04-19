import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {

  console.log('🔥 proxy route hit');
  console.log('raw params:', params);
  const filePath = params.path.join('/');
  // filePath = "uploads/ef980b04.../file.jpeg"
  // backend route is /uploads/[...path] so we forward the full path as-is
  const backendUrl = `${process.env.BACKEND_URL}/${filePath}`;
  // results in: http://localhost:3001/uploads/ef980b04.../file.jpeg ✅
  console.log(backendUrl)

  const response = await fetch(backendUrl);

  if (!response.ok) {
    return new NextResponse('File not found', { status: 404 });
  }

  const contentType = response.headers.get('Content-Type') ?? 'application/octet-stream';
  const fileBuffer = await response.arrayBuffer();

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}