import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { lat, lng, radius = 5000 } = await request.json();
    
    if (!lat || !lng) {
      return NextResponse.json({ error: 'Location coordinates required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        pharmacies: getMockPharmacies(lat, lng, radius) 
      });
    }

    // Search for all types of medical facilities
    const searchQueries = [
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=pharmacy&key=${apiKey}`,
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=MEDICAL+STORE&key=${apiKey}`,
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=WELLNESS+STORE&key=${apiKey}`,
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=CHEMIST&key=${apiKey}`,
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=DRUGSTORE&key=${apiKey}`
    ];
    
    const responses = await Promise.all(searchQueries.map(url => fetch(url)));
    const results = await Promise.all(responses.map(res => res.json()));
    
    let allPharmacies = [];
    results.forEach(data => {
      if (data.status === 'OK') {
        allPharmacies = [...allPharmacies, ...data.results];
      }
    });
    
    // Remove duplicates based on place_id
    const uniquePharmacies = allPharmacies.filter((pharmacy, index, self) => 
      index === self.findIndex(p => p.place_id === pharmacy.place_id)
    );
    
    if (uniquePharmacies.length > 0) {
      return NextResponse.json({ pharmacies: uniquePharmacies });
    } else {
      return NextResponse.json({ 
        pharmacies: getMockPharmacies(lat, lng, radius) 
      });
    }
    
  } catch (error) {
    console.error('Error finding nearby pharmacies:', error);
    return NextResponse.json({ 
      pharmacies: getMockPharmacies() 
    });
  }
}

function getMockPharmacies(lat = 28.6139, lng = 77.2090, radius = 5000) {
  const radiusInDegrees = radius / 111000; // Approximate conversion
  const pharmacies = [
    {
      name: "APOLLO PHARMACY",
      vicinity: "Connaught Place, New Delhi",
      rating: 4.2,
      geometry: {
        location: { lat: lat + 0.001, lng: lng + 0.001 }
      },
      opening_hours: { open_now: true },
      formatted_phone_number: "+91-11-23456789"
    },
    {
      name: "MEDPLUS PHARMACY",
      vicinity: "Karol Bagh, New Delhi",
      rating: 4.0,
      geometry: {
        location: { lat: lat - 0.002, lng: lng + 0.002 }
      },
      opening_hours: { open_now: true },
      formatted_phone_number: "+91-11-23456790"
    },
    {
      name: "GUARDIAN MEDICAL STORE",
      vicinity: "Lajpat Nagar, New Delhi",
      rating: 4.3,
      geometry: {
        location: { lat: lat + 0.003, lng: lng - 0.001 }
      },
      opening_hours: { open_now: false },
      formatted_phone_number: "+91-11-23456791"
    },
    {
      name: "WELLNESS FOREVER",
      vicinity: "Rajouri Garden, New Delhi",
      rating: 4.1,
      geometry: {
        location: { lat: lat - 0.001, lng: lng - 0.002 }
      },
      opening_hours: { open_now: true },
      formatted_phone_number: "+91-11-23456792"
    },
    {
      name: "HEALTHKART PHARMACY",
      vicinity: "Nehru Place, New Delhi",
      rating: 4.4,
      geometry: {
        location: { lat: lat + 0.005, lng: lng + 0.003 }
      },
      opening_hours: { open_now: true },
      formatted_phone_number: "+91-11-23456793"
    },
    {
      name: "CITY MEDICAL STORE",
      vicinity: "Khan Market, New Delhi",
      rating: 3.9,
      geometry: {
        location: { lat: lat - 0.004, lng: lng - 0.003 }
      },
      opening_hours: { open_now: true },
      formatted_phone_number: "+91-11-23456794"
    },
    {
      name: "MAX HEALTHCARE PHARMACY",
      vicinity: "Saket, New Delhi",
      rating: 4.5,
      geometry: {
        location: { lat: lat + 0.008, lng: lng - 0.005 }
      },
      opening_hours: { open_now: false },
      formatted_phone_number: "+91-11-23456795"
    },
    {
      name: "FORTIS MEDICAL STORE",
      vicinity: "Vasant Kunj, New Delhi",
      rating: 4.2,
      geometry: {
        location: { lat: lat - 0.007, lng: lng + 0.006 }
      },
      opening_hours: { open_now: true },
      formatted_phone_number: "+91-11-23456796"
    },
    {
      name: "WELLNESS STORE",
      vicinity: "Greater Kailash, New Delhi",
      rating: 4.0,
      geometry: {
        location: { lat: lat + 0.006, lng: lng + 0.004 }
      },
      opening_hours: { open_now: true },
      formatted_phone_number: "+91-11-23456797"
    },
    {
      name: "CHEMIST SHOP",
      vicinity: "Janakpuri, New Delhi",
      rating: 3.8,
      geometry: {
        location: { lat: lat - 0.005, lng: lng - 0.004 }
      },
      opening_hours: { open_now: true },
      formatted_phone_number: "+91-11-23456798"
    }
  ];
  
  // Filter based on radius
  return pharmacies.filter(pharmacy => {
    const distance = Math.sqrt(
      Math.pow(pharmacy.geometry.location.lat - lat, 2) + 
      Math.pow(pharmacy.geometry.location.lng - lng, 2)
    ) * 111000; // Convert to meters
    return distance <= radius;
  });
}