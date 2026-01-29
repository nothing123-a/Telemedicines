import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Room from "@/models/Room";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { roomId } = await params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { roomId } = await params;
    const { senderId, senderType, message } = await req.json();

    const room = await Room.findOne({ roomId });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const newMessage = await Message.create({
      roomId,
      senderId,
      senderType,
      message,
    });

    // Emit message to room participants
    if (global._io) {
      global._io.to(roomId).emit("new-message", {
        messageId: newMessage._id,
        senderId,
        senderType,
        message,
        timestamp: newMessage.timestamp,
      });
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}