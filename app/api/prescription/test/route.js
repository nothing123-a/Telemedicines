import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DrPrescription from "@/models/DrPrescription";

export async function GET() {
  try {
    await dbConnect();
    
    // Get all prescriptions to see what's in database
    const allPrescriptions = await DrPrescription.find({}).sort({ createdAt: -1 });
    
    console.log('All prescriptions in database:', allPrescriptions);
    
    return NextResponse.json({
      success: true,
      count: allPrescriptions.length,
      prescriptions: allPrescriptions
    });

  } catch (error) {
    console.error("Error fetching all prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}