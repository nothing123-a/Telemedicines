import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { patientId, prescriptionId, doctorId, medicines, instructions } = await request.json();
    
    // Store prescription notification globally for real-time access
    global.prescriptionNotifications = global.prescriptionNotifications || {};
    global.prescriptionNotifications[patientId] = {
      prescriptionId,
      doctorId,
      medicines,
      instructions,
      timestamp: new Date().toISOString(),
      delivered: false
    };

    // Also store for Genie notifications
    global.userPrescriptionUpdates = global.userPrescriptionUpdates || {};
    global.userPrescriptionUpdates[patientId] = {
      hasNewPrescription: true,
      prescriptionId,
      timestamp: new Date()
    };

    console.log(`📋 Prescription notification stored for patient: ${patientId}`);

    return NextResponse.json({
      success: true,
      message: "Prescription notification sent via WebSocket"
    });

  } catch (error) {
    console.error("Error sending WebSocket prescription notification:", error);
    return NextResponse.json(
      { error: "Failed to send prescription notification" },
      { status: 500 }
    );
  }
}