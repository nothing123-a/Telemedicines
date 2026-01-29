import { NextResponse } from 'next/server';

// Simple in-memory storage (use Redis in production)
global.signalingData = global.signalingData || new Map();

export async function POST(request) {
  try {
    const { type, roomId, data, userId } = await request.json();
    
    if (!roomId || !type || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!global.signalingData.has(roomId)) {
      global.signalingData.set(roomId, []);
    }

    const roomSignals = global.signalingData.get(roomId);
    roomSignals.push({
      type,
      data,
      userId,
      timestamp: Date.now()
    });

    // Keep only recent signals
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    global.signalingData.set(roomId, roomSignals.filter(signal => signal.timestamp > fiveMinutesAgo));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}