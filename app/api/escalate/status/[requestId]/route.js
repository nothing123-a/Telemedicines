import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EscalationRequest from "@/models/EscalationRequest";
import Room from "@/models/Room";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { requestId } = await params;

    const escalationRequest = await EscalationRequest.findById(requestId)
      .populate('doctorId', 'name');
    
    if (!escalationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    
    // If connection is accepted, find the room
    let roomId = null;
    if (escalationRequest.connectionStatus === "accepted") {
      const room = await Room.findOne({
        userId: escalationRequest.userId.toString(),
        doctorId: escalationRequest.doctorId._id.toString()
      }).sort({ createdAt: -1 });
      roomId = room?.roomId;
    }
    
    return NextResponse.json({
      status: escalationRequest.status,
      doctorId: escalationRequest.doctorId?._id,
      doctorName: escalationRequest.doctorId?.name,
      respondedAt: escalationRequest.respondedAt,
      connectionType: escalationRequest.connectionType,
      connectionStatus: escalationRequest.connectionStatus,
      roomId
    });
    
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}