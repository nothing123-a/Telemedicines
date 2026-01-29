import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pharmacist from "@/models/Pharmacist";

export async function GET() {
  try {
    await connectDB();
    
    const pharmacist = await Pharmacist.findOne().sort({ createdAt: -1 });
    
    if (!pharmacist) {
      return NextResponse.json({ message: "No pharmacist found" }, { status: 404 });
    }
    
    return NextResponse.json({
      name: pharmacist.name,
      phoneNumber: pharmacist.phoneNumber,
      address: pharmacist.address,
      pharmacyName: pharmacist.pharmacyName
    }, { status: 200 });
  } catch (error) {
    console.error("Get temp pharmacist error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}