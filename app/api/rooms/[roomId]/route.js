import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Room from "@/models/Room";
import DoctorSession from "@/models/DoctorSession";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const { roomId } =await  params;
    
    const room = await Room.findOne({ roomId })
      .populate('userId', 'name email')
      .populate('doctorId', 'name email');
    
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Find associated session
    const session = await DoctorSession.findOne({ roomId });
    
    console.log('Room API - Found room:', roomId, 'Session:', session?._id);
    
    return NextResponse.json({ 
      room: {
        ...room.toObject(),
        sessionId: session?._id
      }
    });
  } catch (error) {
    console.error("Room fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}