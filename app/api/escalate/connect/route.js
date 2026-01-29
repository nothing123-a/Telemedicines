import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Room from "@/models/Room";
import EscalationRequest from "@/models/EscalationRequest";

export async function POST(req) {
  try {
    await dbConnect();

    const { requestId, connectionType } = await req.json();

    if (!["chat", "video"].includes(connectionType)) {
      return NextResponse.json({ error: "Invalid connection type" }, { status: 400 });
    }

    const escalationRequest = await EscalationRequest.findById(requestId)
      .populate('userId')
      .populate('doctorId');

    if (!escalationRequest || escalationRequest.status !== "accepted") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Update connection request
    escalationRequest.connectionType = connectionType;
    escalationRequest.connectionStatus = "pending";
    await escalationRequest.save();
    
    console.log('Connect - Updated request:', {
      id: escalationRequest._id,
      connectionType: escalationRequest.connectionType,
      connectionStatus: escalationRequest.connectionStatus
    });
    
    console.log('Connect - Input data:', { requestId, connectionType });

    // Notify doctor about connection request
    if (global._io) {
      const doctorId = escalationRequest.doctorId._id.toString();
      const doctorRoom = `doctor_${doctorId}`;
      console.log(`🔔 Sending ${connectionType} request to doctor room ${doctorRoom}`);
      global._io.to(doctorRoom).emit("connection-request", {
        requestId: escalationRequest._id,
        connectionType,
        patientName: escalationRequest.userId.name,
        patientId: escalationRequest.userId._id,
      });
    }

    return NextResponse.json({ success: true, message: "Connection request sent to doctor" });



  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}