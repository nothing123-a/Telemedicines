import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pharmacist from "@/models/Pharmacist";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    await connectDB();
    
    const pharmacist = await Pharmacist.findById(id);
    
    if (!pharmacist) {
      return NextResponse.json({ message: "Pharmacist not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      name: pharmacist.name,
      phoneNumber: pharmacist.phoneNumber,
      address: pharmacist.address,
      pharmacyName: pharmacist.pharmacyName
    }, { status: 200 });
  } catch (error) {
    console.error("Get pharmacist error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}