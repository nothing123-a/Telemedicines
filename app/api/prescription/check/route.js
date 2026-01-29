import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ hasNewPrescription: false });
    }

    // Check for notifications for this user
    const notifications = global.prescriptionNotifications || [];
    const userNotification = notifications.find(n => n.userId === userId);
    
    if (userNotification) {
      // Remove notification after checking (so it only speaks once)
      global.prescriptionNotifications = notifications.filter(n => n.userId !== userId);
      
      return NextResponse.json({
        hasNewPrescription: true,
        prescriptionId: userNotification.prescriptionId,
        message: userNotification.message
      });
    }

    return NextResponse.json({ hasNewPrescription: false });

  } catch (error) {
    console.error("Error checking prescriptions:", error);
    return NextResponse.json({ hasNewPrescription: false });
  }
}