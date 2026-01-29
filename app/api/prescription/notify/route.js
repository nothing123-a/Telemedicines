import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { patientId, prescriptionId, doctorId, doctorName, medicines, instructions } = await request.json();
    
    // Store notification for pharmacy dashboard
    global.pharmacyRequests = global.pharmacyRequests || [];
    global.pharmacyRequests.push({
      prescriptionId,
      patientId,
      patientName: 'Patient', // You can get this from user data
      doctorId,
      doctorName,
      medicines,
      instructions,
      requestedAt: new Date(),
      status: 'pending'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending pharmacy notification:", error);
    return NextResponse.json({ error: "Failed to notify pharmacy" }, { status: 500 });
  }
}