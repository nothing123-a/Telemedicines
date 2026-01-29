import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EscalationRequest from "@/models/EscalationRequest";
import Room from "@/models/Room";
import DoctorSession from "@/models/DoctorSession";

export async function POST(req) {
  try {
    await dbConnect();

    const { requestId } = await req.json();

    const escalationRequest = await EscalationRequest.findById(requestId)
      .populate('userId')
      .populate('doctorId');

    console.log('Accept connection - Request found:', {
      id: escalationRequest?._id,
      status: escalationRequest?.status,
      connectionStatus: escalationRequest?.connectionStatus,
      connectionType: escalationRequest?.connectionType
    });

    if (!escalationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 400 });
    }

    if (escalationRequest.status !== "accepted") {
      return NextResponse.json({ error: "Escalation not accepted yet" }, { status: 400 });
    }

    if (!escalationRequest.connectionType) {
      // Fallback: assume chat if no connection type is specified
      escalationRequest.connectionType = "chat";
      await escalationRequest.save();
      console.log('No connection type found, defaulting to chat');
    }

    // Allow if connectionStatus is pending or not set (for backward compatibility)
    if (escalationRequest.connectionStatus && escalationRequest.connectionStatus !== "pending") {
      return NextResponse.json({ error: "Connection already processed" }, { status: 400 });
    }

    // Create room with unique identifier
    const roomId = `session-${Date.now()}-u${escalationRequest.userId._id}-d${escalationRequest.doctorId._id}`;
    
    const room = await Room.create({
      roomId,
      userId: escalationRequest.userId._id,
      doctorId: escalationRequest.doctorId._id,
      type: escalationRequest.connectionType,
    });

    // Create doctor session for tracking
    const session = await DoctorSession.create({
      doctorId: escalationRequest.doctorId._id,
      userId: escalationRequest.userId._id,
      requestId: escalationRequest._id,
      sessionType: escalationRequest.connectionType,
      roomId,
      status: 'active'
    });

    // Mark connection as accepted and escalation as completed
    escalationRequest.connectionStatus = "accepted";
    escalationRequest.status = "completed";
    await escalationRequest.save();

    // Notify patient to redirect to room
    if (global._io) {
      const userRoom = `user_${escalationRequest.userId._id.toString()}`;
      console.log(`📡 Notifying patient room ${userRoom} of connection acceptance`);
      global._io.to(userRoom).emit("connection-accepted", {
        roomId,
        connectionType: escalationRequest.connectionType,
      });
    }

    return NextResponse.json({ 
      success: true, 
      roomId,
      sessionId: session._id,
      redirectUrl: `/${escalationRequest.connectionType}-room/${roomId}`
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to accept connection" }, { status: 500 });
  }
}