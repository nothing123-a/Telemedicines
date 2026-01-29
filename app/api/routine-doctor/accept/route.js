import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RoutineDoctorRequest from "@/models/RoutineDoctorRequest";
import Room from "@/models/Room";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    await dbConnect();
    
    const { requestId, doctorId, doctorName } = await request.json();
    
    if (!requestId || !doctorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const routineRequest = await RoutineDoctorRequest.findById(requestId);
    
    if (!routineRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    if (routineRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Request already processed" },
        { status: 400 }
      );
    }

    const roomId = uuidv4();
    
    const room = new Room({
      roomId,
      userId: routineRequest.userId,
      doctorId: doctorId,
      type: routineRequest.connectionType,
      status: "active"
    });

    await room.save();

    routineRequest.status = "accepted";
    routineRequest.doctorId = doctorId;
    routineRequest.doctorName = doctorName;
    routineRequest.roomId = roomId;
    routineRequest.acceptedAt = new Date();
    
    await routineRequest.save();
    
    console.log("Request accepted and saved:", {
      requestId: routineRequest._id,
      userId: routineRequest.userId,
      status: routineRequest.status,
      roomId: routineRequest.roomId,
      connectionType: routineRequest.connectionType
    });

    return NextResponse.json({
      success: true,
      roomId,
      connectionType: routineRequest.connectionType,
      message: "Request accepted successfully"
    });

  } catch (error) {
    console.error("Error accepting routine doctor request:", error);
    return NextResponse.json(
      { error: "Failed to accept request" },
      { status: 500 }
    );
  }
}