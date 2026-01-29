// app/api/doctor/status/route.js

import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";

export async function PUT(req) {
  await dbConnect();

  try {
    const { email, status } = await req.json();

    if (!email || !status) {
      return new Response(
        JSON.stringify({ message: "Email and status are required" }),
        { status: 400 }
      );
    }

    if (!["online", "offline"].includes(status)) {
      return new Response(
        JSON.stringify({ message: "Invalid status value" }),
        { status: 400 }
      );
    }

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return new Response(
        JSON.stringify({ message: "Doctor not found" }),
        { status: 404 }
      );
    }

    // ✅ Convert status string to Boolean
    doctor.isOnline = status === "online";

    await doctor.save();

    return new Response(
      JSON.stringify({ message: `Doctor status updated to ${status}` }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      { status: 500 }
    );
  }
}