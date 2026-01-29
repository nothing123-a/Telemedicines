import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ hasNewPrescription: false });
    }

    // Check for real-time updates
    const updates = global.userPrescriptionUpdates || {};
    const userUpdate = updates[userId];
    
    if (userUpdate && userUpdate.hasNewPrescription) {
      // Clear the notification after reading
      delete updates[userId];
      
      return NextResponse.json({
        hasNewPrescription: true,
        prescriptionId: userUpdate.prescriptionId,
        message: "New prescription received from doctor"
      });
    }

    return NextResponse.json({ hasNewPrescription: false });

  } catch (error) {
    console.error("Error checking real-time prescriptions:", error);
    return NextResponse.json({ hasNewPrescription: false });
  }
}