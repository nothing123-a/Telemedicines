import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { contact, sosData, message } = await request.json();
    
    // Mock notification service - in real app, integrate with SMS/Email service
    const notification = {
      id: Date.now(),
      to: contact.phone,
      contactName: contact.name,
      message: message,
      sosId: sosData.timestamp,
      location: sosData.locationText,
      coordinates: sosData.location,
      patientInfo: sosData.patientProfile,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    // Log notification (in real app, send via SMS/Email API)
    console.log('Emergency Notification:', notification);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      message: `Notification sent to ${contact.name} (${contact.phone})`
    });

  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}