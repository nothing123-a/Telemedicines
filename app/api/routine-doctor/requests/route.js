import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RoutineDoctorRequest from "@/models/RoutineDoctorRequest";

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    
    let query = { status: "pending" };
    
    // Exclude requests already passed by this doctor
    if (doctorId) {
      query.passedBy = { $not: { $elemMatch: { doctorId: doctorId } } };
    }
    
    const requests = await RoutineDoctorRequest.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error("Error fetching routine doctor requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}