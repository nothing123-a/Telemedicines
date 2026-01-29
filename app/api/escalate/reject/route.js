import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import EscalationRequest from "@/models/EscalationRequest";

export async function POST(req) {
  try {
    await dbConnect();

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const escalationRequest = await EscalationRequest.findById(requestId)
      .populate('userId')
      .populate('doctorId');

    if (!escalationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (escalationRequest.status !== 'pending') {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    // Get list of doctors who have already been tried for this request
    const triedDoctors = escalationRequest.triedDoctors || [];
    triedDoctors.push(escalationRequest.doctorId._id);

    // Update current request as rejected
    escalationRequest.status = "rejected";
    escalationRequest.respondedAt = new Date();
    escalationRequest.triedDoctors = triedDoctors;
    await escalationRequest.save();

    // Make current doctor available again
    await Doctor.updateOne(
      { _id: escalationRequest.doctorId._id }, 
      { $set: { isOnline: true } }
    );
    console.log(`Doctor ${escalationRequest.doctorId._id} set back to online after rejection`);

    // Check total available doctors first
    const totalOnlineDoctors = await Doctor.countDocuments({ isOnline: true });
    
    if (totalOnlineDoctors === 0) {
      // No doctors online at all
      if (global._io) {
        global._io.to(escalationRequest.userId._id.toString()).emit("no-doctors-available", {
          message: "No doctors are currently online. Please try again later or contact emergency services if this is urgent."
        });
      }
      return NextResponse.json({ 
        success: true, 
        message: "No doctors are currently online" 
      });
    }

    if (triedDoctors.length >= totalOnlineDoctors) {
      // All available doctors have been tried
      if (global._io) {
        global._io.to(escalationRequest.userId._id.toString()).emit("no-doctors-available", {
          message: `All ${totalOnlineDoctors} available doctor(s) have been contacted. Please try again later or contact emergency services if this is urgent.`
        });
      }
      return NextResponse.json({ 
        success: true, 
        message: `All ${totalOnlineDoctors} available doctor(s) have been contacted` 
      });
    }

    // Find next available doctor (excluding already tried ones)
    const nextDoctor = await Doctor.findOne({ 
      isOnline: true,
      _id: { $nin: triedDoctors }
    });

    if (!nextDoctor) {
      // This shouldn't happen given our checks above, but handle it anyway
      if (global._io) {
        global._io.to(escalationRequest.userId._id.toString()).emit("no-doctors-available", {
          message: "No more doctors are available. Please try again later or contact emergency services if this is urgent."
        });
      }
      return NextResponse.json({ 
        success: true, 
        message: "No more doctors are available" 
      });
    }

    // Create new escalation request with tried doctors list
    const newRequest = await EscalationRequest.create({
      userId: escalationRequest.userId._id,
      doctorId: nextDoctor._id,
      triedDoctors: triedDoctors,
      originalMessage: escalationRequest.originalMessage || "Emergency request"
    });

    // Mark next doctor busy and notify them
    await Doctor.updateOne(
      { _id: nextDoctor._id }, 
      { $set: { isOnline: false } }
    );

    // Notify next doctor via socket
    if (global._io) {
      const doctorRoom = `doctor_${nextDoctor._id.toString()}`;
      global._io.to(doctorRoom).emit("escalation-request", {
        requestId: newRequest._id,
        doctorId: nextDoctor._id,
        userId: escalationRequest.userId._id,
        userName: escalationRequest.userId.name,
        userEmail: escalationRequest.userId.email,
        attemptNumber: triedDoctors.length + 1,
        totalDoctors: totalOnlineDoctors
      });
    }

    console.log(`Request passed to doctor ${nextDoctor._id} (attempt ${triedDoctors.length + 1}/${totalOnlineDoctors})`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Request sent to another doctor (${triedDoctors.length + 1}/${totalOnlineDoctors})` 
    });

  } catch (err) {
    console.error("Reject/Pass error:", err);
    return NextResponse.json({ error: "Failed to pass request" }, { status: 500 });
  }
}