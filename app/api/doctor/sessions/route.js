import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DoctorSession from "@/models/DoctorSession";

export async function GET(req) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    
    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID required" }, { status: 400 });
    }

    const sessions = await DoctorSession.find({ doctorId })
      .populate('userId', 'name email')
      .populate('requestId')
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Doctor sessions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    const { doctorId, userId, requestId, sessionType, roomId } = await req.json();
    
    if (!doctorId || !userId || !requestId || !sessionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await DoctorSession.create({
      doctorId,
      userId,
      requestId,
      sessionType,
      roomId
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("Doctor session save error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}