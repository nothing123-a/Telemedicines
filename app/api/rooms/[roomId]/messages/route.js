import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Room from "@/models/Room";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { roomId } = await params;

    console.log('GET /api/rooms/[roomId]/messages for room:', roomId);

    const room = await Room.findOne({ roomId });
    if (!room) {
      console.log('Room not found:', roomId);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    console.log('Room found:', room);

    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    console.log('Messages found:', messages.length);
    
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

    console.log('POST /api/rooms/[roomId]/messages:', {
      roomId,
      senderId,
      senderType,
      message
    });

    const room = await Room.findOne({ roomId });
    if (!room) {
      console.log('Room not found:', roomId);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    console.log('Room found:', room);

    const newMessage = await Message.create({
      roomId,
      senderId,
      senderType,
      message,
    });

    console.log('Message created:', newMessage);

    // Emit message to room participants
    if (global._io) {
      console.log('Emitting message to room:', roomId);
      global._io.to(roomId).emit("new-message", {
        messageId: newMessage._id,
        senderId,
        senderType,
        message,
        timestamp: newMessage.timestamp,
      });
    } else {
      console.log('global._io not available');
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}