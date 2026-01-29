import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await connectDB();
    
    const { prescriptionId, status, pharmacistId } = await request.json();
    
    if (!prescriptionId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get prescription details first
    const prescription = await mongoose.connection.db.collection('dr_prescriptions').findOne(
      { _id: new mongoose.Types.ObjectId(prescriptionId) }
    );

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Update prescription with availability status
    const result = await mongoose.connection.db.collection('dr_prescriptions').updateOne(
      { _id: new mongoose.Types.ObjectId(prescriptionId) },
      { 
        $set: {
          availability: status,
          pharmacistId,
          availabilityUpdatedAt: new Date()
        }
      }
    );

    // Store notification for patient
    global.userPrescriptionUpdates = global.userPrescriptionUpdates || {};
    global.userPrescriptionUpdates[prescription.patientId] = {
      hasAvailabilityUpdate: true,
      prescriptionId: prescriptionId,
      availability: status,
      timestamp: new Date()
    };

    return NextResponse.json({
      success: true,
      message: `Prescription marked as ${status}`
    });

  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}