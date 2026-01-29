import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const bloodBanks = [
      {
        name: "City Blood Bank",
        address: "123 Main St, Pune, Maharashtra",
        phone: "+91 9876543210",
        hours: "24/7 Emergency",
        distance: "2.5 km"
      },
      {
        name: "Red Cross Blood Center",
        address: "456 Hospital Rd, Pune, Maharashtra", 
        phone: "+91 9876543211",
        hours: "8:00 AM - 8:00 PM",
        distance: "3.2 km"
      },
      {
        name: "Government Blood Bank",
        address: "789 Civil Lines, Pune, Maharashtra",
        phone: "+91 9876543212", 
        hours: "9:00 AM - 6:00 PM",
        distance: "4.1 km"
      },
      {
        name: "Apollo Blood Bank",
        address: "321 Medical Complex, Pune, Maharashtra",
        phone: "+91 9876543213",
        hours: "24/7 Emergency",
        distance: "5.0 km"
      }
    ];

    return NextResponse.json({ bloodBanks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch nearby blood banks' }, { status: 500 });
  }
}