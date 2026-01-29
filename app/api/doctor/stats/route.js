import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EscalationRequest from "@/models/EscalationRequest";

export async function GET(req) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    
    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID required" }, { status: 400 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total accepted requests (all time)
    const totalAccepted = await EscalationRequest.countDocuments({
      doctorId,
      status: "accepted"
    });

    // Accepted today
    const acceptedToday = await EscalationRequest.countDocuments({
      doctorId,
      status: "accepted",
      respondedAt: { $gte: today, $lt: tomorrow }
    });

    // Active chats (connection status accepted)
    const activeChats = await EscalationRequest.countDocuments({
      doctorId,
      connectionStatus: "accepted"
    });

    // Calculate hours today (mock calculation - you can implement actual time tracking)
    const hoursToday = acceptedToday * 0.5; // Assume 30 min per session

    // Mock rating (you can implement actual rating system)
    const avgRating = 4.8;

    return NextResponse.json({
      totalAccepted,
      acceptedToday,
      activeChats,
      avgRating,
      hoursToday: Math.round(hoursToday * 10) / 10
    });

  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}