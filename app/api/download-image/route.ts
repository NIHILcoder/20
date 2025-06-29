// app/api/download-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch image: ${response.status}` }, { status: response.status });
    }
    
    const data = await response.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png');
    headers.set('Content-Disposition', 'attachment; filename="image.png"');
    
    return new NextResponse(data, {
      headers
    });
  } catch (error: any) {
    console.error('Error downloading image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}