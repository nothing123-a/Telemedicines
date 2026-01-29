import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.json();
    const { age, gender, skinType, concern, duration, lifestyle, medication, recommendationType } = formData;
    
    let searchQuery = '';
    
    if (recommendationType === 'home') {
      searchQuery = `${concern} home remedy natural treatment DIY ${skinType} skin age ${age}`;
    } else if (recommendationType === 'dermatologist') {
      searchQuery = `${concern} dermatologist recommended treatment OTC cream medicine ${skinType} skin`;
    } else if (recommendationType === 'ayurvedic') {
      searchQuery = `${concern} ayurvedic herbal treatment ${skinType} skin Patanjali Himalaya organic products`;
    }
    
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": "b15321aee5370f5e506e764fb6141b8fa80c4d0f",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: searchQuery,
        num: 8,
        gl: "in"
      })
    });

    const data = await response.json();
    return NextResponse.json({
      recommendations: data.organic || [],
      formData: formData
    });
  } catch (error) {
    console.error('Skin care API error:', error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}