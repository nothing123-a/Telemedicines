import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch escalations from escalate endpoint
    const escalationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/escalate`);
    const escalationData = await escalationResponse.json();
    
    return NextResponse.json({
      pendingRequests: escalationData.escalations || [],
      totalRequests: escalationData.totalRequests || 0,
      availableDoctors: [
        { id: 1, name: 'Dr. Smith', specialty: 'Crisis Intervention', status: 'available' },
        { id: 2, name: 'Dr. Johnson', specialty: 'Emergency Psychiatry', status: 'available' },
        { id: 3, name: 'Dr. Brown', specialty: 'Mental Health Crisis', status: 'available' }
      ]
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ 
      pendingRequests: [],
      totalRequests: 0,
      availableDoctors: [
        { id: 1, name: 'Dr. Smith', specialty: 'Crisis Intervention', status: 'available' }
      ]
    }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const { action, requestId } = await request.json();
    
    if (action === 'accept') {
      return NextResponse.json({
        success: true,
        message: 'Request accepted, connecting to patient...',
        redirectTo: '/chat-room/' + requestId
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}