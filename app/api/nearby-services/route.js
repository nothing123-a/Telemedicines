import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { lat, lng, radius = 5000, type = 'hospital' } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: "Location coordinates required" }, { status: 400 });
    }

    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyCftzu45fiNKClUtg3I0LTmn1JHLMd_5wQ';
    
    // Map service types to Google Places types
    const placeTypes = {
      hospital: 'hospital',
      cemetery: 'cemetery',
      clinic: 'doctor'
    };

    const placeType = placeTypes[type] || 'hospital';
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${placeType}&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const services = data.results || [];

    return NextResponse.json({
      services: services.map(service => ({
        place_id: service.place_id,
        name: service.name,
        vicinity: service.vicinity,
        rating: service.rating,
        user_ratings_total: service.user_ratings_total,
        geometry: service.geometry,
        opening_hours: service.opening_hours,
        photos: service.photos,
        price_level: service.price_level,
        types: service.types,
        formatted_phone_number: service.formatted_phone_number
      })),
      status: data.status,
      type: type
    });

  } catch (error) {
    console.error('Nearby services API error:', error);
    return NextResponse.json(
      { error: "Failed to fetch nearby services", details: error.message },
      { status: 500 }
    );
  }
}