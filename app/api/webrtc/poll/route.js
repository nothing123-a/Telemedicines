import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId');

    if (!roomId || !userId) {
      return NextResponse.json({ signals: [] });
    }

    global.signalingData = global.signalingData || new Map();
    const roomSignals = global.signalingData.get(roomId) || [];
    
    // Return signals not from this user
    const relevantSignals = roomSignals.filter(signal => signal.userId !== userId);
    
    // Clear returned signals
    global.signalingData.set(roomId, roomSignals.filter(signal => signal.userId === userId));

    return NextResponse.json({ signals: relevantSignals });
  } catch (error) {
    return NextResponse.json({ signals: [] });
  }
}