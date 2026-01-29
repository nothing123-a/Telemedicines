import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DrPrescription from "@/models/DrPrescription";

export async function POST(request) {
  try {
    await dbConnect();
    
    const { patientId, doctorId, sessionId, medicines, instructions, patientName, doctorName } = await request.json();
    
    console.log('Creating prescription with patientId:', patientId);
    console.log('Doctor ID:', doctorId);
    console.log('Medicines:', medicines);
    
    const prescription = new DrPrescription({
      patientId,
      patientName: patientName || 'Patient',
      doctorId,
      doctorName: doctorName || 'Doctor',
      sessionId,
      medicines,
      instructions
    });

    await prescription.save();

    // Store notification for real-time updates
    global.userPrescriptionUpdates = global.userPrescriptionUpdates || {};
    global.userPrescriptionUpdates[patientId] = {
      hasNewPrescription: true,
      prescriptionId: prescription._id,
      timestamp: new Date()
    };

    // Notify pharmacy about new prescription
    global.pharmacyRequests = global.pharmacyRequests || [];
    global.pharmacyRequests.push({
      prescriptionId: prescription._id,
      patientId,
      patientName: patientName || 'Patient',
      doctorId,
      doctorName: doctorName || 'Doctor',
      medicines,
      instructions,
      requestedAt: new Date(),
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      prescriptionId: prescription._id,
      message: "Prescription created successfully"
    });

  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      { error: "Failed to create prescription" },
      { status: 500 }
    );
  }
}