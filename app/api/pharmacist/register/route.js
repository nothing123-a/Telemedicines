import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Pharmacist from "@/models/Pharmacist";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received data:", body);
    
    const { name, email, phone, password, licenseNumber, pharmacyName, address } = body;

    if (!name || !email || !password || !licenseNumber || !pharmacyName) {
      console.log("Missing required fields");
      return NextResponse.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected");

    const existingPharmacist = await Pharmacist.findOne({ email });
    if (existingPharmacist) {
      console.log("Pharmacist already exists:", email);
      return NextResponse.json(
        { message: "Pharmacist with this email already exists" },
        { status: 400 }
      );
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("Creating new pharmacist...");
    const newPharmacist = new Pharmacist({
      name,
      email,
      phoneNumber: phone,
      password: hashedPassword,
      licenseNumber,
      pharmacyName,
      address,
      isVerified: false
    });

    console.log("Saving pharmacist to database...");
    await newPharmacist.save();
    console.log("Pharmacist saved successfully");

    return NextResponse.json(
      { message: "Pharmacist registered successfully", pharmacistId: newPharmacist._id, redirect: "/auth/login" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Pharmacist registration error:", error);
    return NextResponse.json(
      { message: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}