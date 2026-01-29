import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { lat, lng, radius = 5000 } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: "Location coordinates required" }, { status: 400 });
    }

    // Simulate live ambulance data (in real implementation, this would connect to ambulance dispatch system)
    const simulatedAmbulances = generateLiveAmbulances(lat, lng, radius);

    return NextResponse.json({
      ambulances: simulatedAmbulances,
      timestamp: new Date().toISOString(),
      tracking: true
    });

  } catch (error) {
    console.error('Ambulance tracker API error:', error);
    return NextResponse.json(
      { error: "Failed to track ambulances", details: error.message },
      { status: 500 }
    );
  }
}

function generateLiveAmbulances(centerLat, centerLng, radius) {
  const ambulances = [];
  const ambulanceCount = Math.floor(Math.random() * 5) + 2; // 2-6 ambulances
  
  for (let i = 0; i < ambulanceCount; i++) {
    // Generate random position within radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * (radius / 111000); // Convert meters to degrees
    
    const lat = centerLat + (distance * Math.cos(angle));
    const lng = centerLng + (distance * Math.sin(angle));
    
    // Calculate distance from user
    const distanceFromUser = Math.floor(
      Math.sqrt(Math.pow((lat - centerLat) * 111000, 2) + Math.pow((lng - centerLng) * 111000, 2))
    );
    
    const statuses = ['Available', 'En Route', 'At Hospital', 'Emergency Call'];
    const ambulanceTypes = ['Basic Life Support', 'Advanced Life Support', 'Critical Care', 'Emergency Response'];
    
    ambulances.push({
      id: `AMB-${String(i + 1).padStart(3, '0')}`,
      location: { lat, lng },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      type: ambulanceTypes[Math.floor(Math.random() * ambulanceTypes.length)],
      speed: Math.floor(Math.random() * 80) + 20, // 20-100 km/h
      heading: Math.floor(Math.random() * 360), // 0-359 degrees
      distance: distanceFromUser,
      phone: '+91-108', // Emergency ambulance number
      crew: Math.floor(Math.random() * 3) + 2, // 2-4 crew members
      equipment: ['Defibrillator', 'Oxygen', 'Stretcher', 'First Aid'],
      eta: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
      lastUpdate: new Date().toISOString()
    });
  }
  
  // Sort by distance
  return ambulances.sort((a, b) => a.distance - b.distance);
}