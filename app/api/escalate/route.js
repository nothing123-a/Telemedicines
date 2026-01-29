import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import EscalationRequest from "@/models/EscalationRequest";

let twilioClient;
try {
  if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require("twilio");
    twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log("Twilio not configured:", error.message);
}

export async function POST(req) {
  try {
    await dbConnect();

    const { userEmail } = await req.json();
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check all doctors first
    const allDoctors = await Doctor.find({});
    const onlineDoctors = await Doctor.find({ isOnline: true });
    console.log(`Total doctors: ${allDoctors.length}, Online doctors: ${onlineDoctors.length}`);
    console.log('Online doctors:', onlineDoctors.map(d => ({ id: d._id, name: d.name, isOnline: d.isOnline })));
    
    let doctor = await Doctor.findOne({ isOnline: true, specialty: "psyco" });
    if (!doctor) doctor = await Doctor.findOne({ isOnline: true });
    
    if (!doctor) {
      console.log('No online doctors found for escalation');
      // No doctors available at all
      if (global._io) {
        global._io.to(user._id.toString()).emit("no-doctors-available", {
          message: "No doctors are currently available. Please try again later or contact emergency services if this is urgent."
        });
      }
      return NextResponse.json({ 
        success: false, 
        error: "No doctors are currently available",
        message: "No doctors are currently available. Please try again later or contact emergency services if this is urgent."
      }, { status: 200 });
    }

    // Create escalation request
    const escalationRequest = await EscalationRequest.create({
      userId: user._id,
      doctorId: doctor._id,
    });

    // Keep doctor online but track the request
    console.log('Doctor remains online for other potential requests');

    if (global._io) {
      const doctorRoom = `doctor_${doctor._id.toString()}`;
      console.log(`📡 Sending escalation request to doctor room ${doctorRoom}`);
      global._io.to(doctorRoom).emit("escalation-request", {
        requestId: escalationRequest._id,
        doctorId: doctor._id,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
      });
    } else {
      console.error("⚠️ global._io missing");
    }

    if (user.emergencyNumber && twilioClient) {
      try {
        await twilioClient.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:+91${user.emergencyNumber}`,
          body: `🚨 Emergency: ${user.name} might need urgent help. Please check on them now.`,
        });
      } catch (twilioError) {
        console.log("Twilio message failed:", twilioError.message);
      }
    }

    return NextResponse.json({ 
      success: true, 
      requestId: escalationRequest._id,
      doctor: { name: doctor.name, specialty: doctor.specialty }
    });
  } catch (error) {
    console.error("Escalation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}