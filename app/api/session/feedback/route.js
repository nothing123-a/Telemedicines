import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Feedback from "@/models/Feedback";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await dbConnect();
    
    const { sessionId, satisfied, rating, userEmail, feedback } = await request.json();
    
    // Handle feedback with minimal required fields
    const feedbackData = {
      userId: new mongoose.Types.ObjectId(), // Generate dummy ObjectId
      doctorId: new mongoose.Types.ObjectId(), // Generate dummy ObjectId  
      sessionId: sessionId ? new mongoose.Types.ObjectId(sessionId) : new mongoose.Types.ObjectId(),
      satisfied: satisfied || false,
      rating: rating || 1,
      comment: feedback || 'Genie interaction feedback',
      sessionType: 'chat'
    };

    const newFeedback = new Feedback(feedbackData);

    await newFeedback.save();

    return NextResponse.json({
      success: true,
      message: "Feedback saved successfully",
      feedbackId: newFeedback._id
    });

  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}