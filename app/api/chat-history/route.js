import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ChatHistory from "@/models/ChatHistory";

export async function GET(req) {
  try {
    await dbConnect();
    
    const sessions = await ChatHistory.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    const { userId, messages } = await req.json();
    
    if (!userId || !messages) {
      return NextResponse.json({ error: "User ID and messages required" }, { status: 400 });
    }

    const chatHistory = await ChatHistory.create({
      userId,
      messages
    });

    return NextResponse.json({ success: true, chatHistory });
  } catch (error) {
    console.error("Chat history save error:", error);
    return NextResponse.json({ error: "Failed to save chat history" }, { status: 500 });
  }
}