import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import EscalationRequest from "@/models/EscalationRequest";
import Room from "@/models/Room";

export async function POST(req) {
  try {
    await dbConnect();

    const { requestId } = await req.json();

    const escalationRequest = await EscalationRequest.findById(requestId)
      .populate('userId')
      .populate('doctorId');

    if (!escalationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Make doctor available again after accepting
    await Doctor.updateOne(
      { _id: escalationRequest.doctorId._id }, 
      { $set: { isOnline: true } }
    );
    console.log(`Doctor ${escalationRequest.doctorId._id} set back to online after accepting`);

    // Update request status
    escalationRequest.status = "accepted";
    escalationRequest.respondedAt = new Date();
    await escalationRequest.save();

    // Notify user that doctor accepted
    if (global._io) {
      const eventData = {
        requestId: escalationRequest._id,
        doctorName: escalationRequest.doctorId.name,
        doctorId: escalationRequest.doctorId._id
      };
      
      // Try both MongoDB ID and Google ID for user room
      const mongoUserRoom = `user_${escalationRequest.userId._id.toString()}`;
      const googleUserRoom = escalationRequest.userId.googleId ? `user_${escalationRequest.userId.googleId}` : null;
      
      console.log(`📡 Emitting doctor-accepted to rooms:`);
      console.log(`  - MongoDB room: ${mongoUserRoom}`);
      if (googleUserRoom) console.log(`  - Google room: ${googleUserRoom}`);
      console.log(`📡 Event data:`, eventData);
      
      // Emit to MongoDB ID room
      global._io.to(mongoUserRoom).emit("doctor-accepted", eventData);
      
      // Emit to Google ID room if exists
      if (googleUserRoom) {
        global._io.to(googleUserRoom).emit("doctor-accepted", eventData);
      }
      
      // Fallback: emit to all sockets and let client filter
      global._io.emit("doctor-accepted-broadcast", {
        ...eventData,
        targetUserId: escalationRequest.userId._id.toString(),
        targetGoogleId: escalationRequest.userId.googleId
      });
    }

    console.log(`✅ Doctor ${escalationRequest.doctorId.name} accepted escalation request: ${escalationRequest._id} for user: ${escalationRequest.userId._id}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}