import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ hasNewPrescription: false });
    }

    // Check global notifications
    const notifications = global.prescriptionNotifications || {};
    const userNotification = notifications[userId];
    
    if (userNotification && !userNotification.delivered) {
      // Mark as delivered
      userNotification.delivered = true;
      
      return NextResponse.json({
        hasNewPrescription: true,
        prescriptionId: userNotification.prescriptionId,
        timestamp: userNotification.timestamp
      });
    }

    return NextResponse.json({ hasNewPrescription: false });

  } catch (error) {
    console.error("Error checking new prescriptions:", error);
    return NextResponse.json({ hasNewPrescription: false });
  }
}