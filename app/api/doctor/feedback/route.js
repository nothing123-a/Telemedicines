import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Feedback from "@/models/Feedback";

export async function GET(req) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    
    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID required" }, { status: 400 });
    }

    const feedbacks = await Feedback.find({ doctorId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Doctor feedback fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}