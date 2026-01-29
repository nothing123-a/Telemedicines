import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";

export async function POST(req) {
  try {
    await dbConnect();
    const { doctorId, isOnline } = await req.json();

    const result = await Doctor.updateOne(
      { _id: doctorId },
      { $set: { isOnline } }
    );
    
    console.log(`Doctor ${doctorId} status updated to ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    
    // Verify the update
    const doctor = await Doctor.findById(doctorId);
    console.log(`Verified doctor ${doctorId} status: ${doctor?.isOnline}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Doctor online status error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}