import { NextResponse } from 'next/server';

let bloodRequests = [
  {
    id: 1,
    patientName: "Patient A",
    bloodGroup: "O+",
    unitsNeeded: 2,
    requiredDate: "2024-12-25",
    hospital: "City Hospital",
    contact: "+91 9876543210",
    status: "Pending"
  }
];

export async function GET() {
  try {
    return NextResponse.json({ requests: bloodRequests });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { patientName, bloodGroup, unitsNeeded, requiredDate, hospital, contact, notes } = await request.json();
    
    const newRequest = {
      id: Date.now(),
      patientName,
      bloodGroup,
      unitsNeeded: parseInt(unitsNeeded),
      requiredDate,
      hospital,
      contact,
      notes,
      status: "Pending"
    };

    bloodRequests.push(newRequest);
    
    return NextResponse.json({ 
      success: true,
      request: newRequest,
      message: 'Blood request submitted successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit blood request' }, { status: 500 });
  }
}