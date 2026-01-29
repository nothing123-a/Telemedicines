// app/api/doctor/register/route.js

import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();
  const { name, email, password, specialty } = await req.json();

  // Check if doctor already exists
  const existing = await Doctor.findOne({ email });
  if (existing) {
    return Response.json({ message: "Doctor with this email already exists" }, { status: 400 });
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 12);

  // Create new doctor
  const newDoctor = new Doctor({
    name,
    email,
    password: hashed,
    specialty,
    isOnline: false,
  });

  await newDoctor.save();

  return Response.json({ message: "Doctor registered successfully" }, { status: 201 });
}