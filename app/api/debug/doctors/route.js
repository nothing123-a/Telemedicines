import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";

export async function GET(req) {
  try {
    await dbConnect();
    
    const doctors = await Doctor.find({});
    
    return NextResponse.json({ 
      doctors: doctors.map(d => ({
        id: d._id,
        name: d.name,
        email: d.email,
        specialty: d.specialty,
        isOnline: d.isOnline
      }))
    });
  } catch (error) {
    console.error("Debug doctors error:", error);
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}