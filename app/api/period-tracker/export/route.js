import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import PeriodTracker from "@/models/PeriodTracker";
import User from "@/models/User";
import jsPDF from "jspdf";

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.gender !== "female") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const tracker = await PeriodTracker.findOne({ userId: user._id });
    if (!tracker) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    // Generate PDF data
    const pdfBuffer = generatePDF(tracker, user);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="period-tracker-${user.name || 'user'}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function generatePDF(tracker, user) {
  const doc = new jsPDF();
  let yPos = 20;
  
  // Header
  doc.setFontSize(20);
  doc.text('Period Tracker Report', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(12);
  doc.text(`Generated for: ${user.name || user.email}`, 20, yPos);
  yPos += 10;
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);
  yPos += 20;
  
  // Cycle History
  doc.setFontSize(16);
  doc.text('Cycle History', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(10);
  tracker.cycles.forEach(cycle => {
    const startDate = new Date(cycle.startDate).toLocaleDateString();
    const endDate = cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : "Ongoing";
    const cycleLength = cycle.cycleLength || "N/A";
    const flowIntensity = cycle.flowIntensity?.[0]?.intensity || "N/A";
    
    doc.text(`${startDate} - ${endDate} | Length: ${cycleLength} days | Flow: ${flowIntensity}`, 20, yPos);
    yPos += 8;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  yPos += 10;
  
  // Symptoms History
  doc.setFontSize(16);
  doc.text('Recent Symptoms', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(10);
  tracker.symptoms.slice(-10).forEach(symptom => {
    const date = new Date(symptom.date).toLocaleDateString();
    const physical = symptom.physical?.join(", ") || "None";
    const mood = symptom.mood?.join(", ") || "None";
    
    doc.text(`${date}:`, 20, yPos);
    yPos += 6;
    doc.text(`Physical: ${physical}`, 25, yPos);
    yPos += 6;
    doc.text(`Mood: ${mood}`, 25, yPos);
    yPos += 10;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Settings Summary
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(16);
  doc.text('Settings Summary', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(10);
  doc.text(`Average Cycle Length: ${tracker.settings?.cycleLength || 28} days`, 20, yPos);
  yPos += 8;
  doc.text(`Period Length: ${tracker.settings?.periodLength || 5} days`, 20, yPos);
  yPos += 8;
  doc.text(`Period Reminders: ${tracker.settings?.reminderSettings?.periodReminder ? 'Enabled' : 'Disabled'}`, 20, yPos);
  yPos += 8;
  doc.text(`Fertility Reminders: ${tracker.settings?.reminderSettings?.fertilityReminder ? 'Enabled' : 'Disabled'}`, 20, yPos);
  
  return Buffer.from(doc.output('arraybuffer'));
}