import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'disease' or 'medicine'
    
    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    let searchQuery = '';
    
    if (type === 'disease') {
      searchQuery = `${query} ayurvedic treatment OR ${query} herbal remedy OR ${query} yoga therapy OR ${query} homeopathy treatment OR ${query} natural cure`;
    } else if (type === 'medicine') {
      searchQuery = `${query} ayurvedic alternative OR ${query} herbal substitute OR ${query} natural remedy OR ${query} AYUSH medicine`;
    }
    
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": "b15321aee5370f5e506e764fb6141b8fa80c4d0f",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: searchQuery,
        num: 10,
        gl: "in"
      })
    });

    const data = await response.json();
    return NextResponse.json(data.organic || []);
  } catch (error) {
    console.error('Ayurveda API error:', error);
    return NextResponse.json({ error: "Failed to fetch ayurvedic information" }, { status: 500 });
  }
}