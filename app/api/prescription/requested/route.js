import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    
    // Get from global storage (new prescriptions)
    global.pharmacyRequests = global.pharmacyRequests || [];
    
    // Get prescriptions with pharmacy requests from database
    const dbPrescriptions = await mongoose.connection.db.collection('dr_prescriptions')
      .find({ pharmacyRequested: true })
      .sort({ requestedAt: -1 })
      .toArray();
    
    // Combine global requests with database prescriptions
    const allPrescriptions = [
      ...global.pharmacyRequests.map(req => ({
        _id: req.prescriptionId,
        patientName: req.patientName,
        doctorName: req.doctorName,
        medicines: req.medicines,
        instructions: req.instructions,
        requestedAt: req.requestedAt,
        createdAt: req.requestedAt,
        pharmacyRequested: true
      })),
      ...dbPrescriptions
    ];

    return NextResponse.json({
      success: true,
      prescriptions: allPrescriptions
    });

  } catch (error) {
    console.error("Error fetching requested medicines:", error);
    return NextResponse.json(
      { error: "Failed to fetch requested medicines" },
      { status: 500 }
    );
  }
}