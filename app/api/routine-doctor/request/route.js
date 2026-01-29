import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RoutineDoctorRequest from "@/models/RoutineDoctorRequest";

export async function POST(request) {
  try {
    await dbConnect();
    
    const { userId, userName, userEmail, connectionType, note, timestamp } = await request.json();
    
    if (!userId || !connectionType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const routineRequest = new RoutineDoctorRequest({
      userId,
      userName,
      userEmail,
      connectionType,
      note: note || "",
      status: "pending",
      timestamp: new Date(timestamp),
      createdAt: new Date()
    });

    await routineRequest.save();

    return NextResponse.json({
      success: true,
      requestId: routineRequest._id,
      message: "Request submitted successfully"
    });

  } catch (error) {
    console.error("Error creating routine doctor request:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}