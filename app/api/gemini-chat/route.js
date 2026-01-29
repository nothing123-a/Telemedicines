import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import rateLimiter from "../../../lib/rateLimiter.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages, userId } = await req.json();
    
    // Rate limiting check
    if (userId && !rateLimiter.isAllowed(userId)) {
      return NextResponse.json({
        reply: "Please wait a moment before sending another message.",
        error: "Rate limited"
      }, { status: 429 });
    }

    const userMessage = messages[messages.length - 1]?.content || "";

    // Healthcare-focused system prompt
    const systemPrompt = `You are Genie, a helpful healthcare AI assistant. 
Provide accurate, empathetic healthcare information and guidance.
Keep responses concise, friendly, and medically appropriate.
If asked about serious medical conditions, always recommend consulting a healthcare professional.
Respond in the same language the user is using.`;

    const userInput = messages.map(m => `${m.role}: ${m.content}`).join("\n");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    const result = await model.generateContent(`${systemPrompt}\n\n${userInput}`);
    const reply = result.response.text();

    return NextResponse.json({
      reply,
      success: true
    });

  } catch (err) {
    console.error('Gemini API Error:', err);
    
    // Handle specific errors
    if (err.status === 429) {
      return NextResponse.json({ 
        reply: "I'm experiencing high demand right now. Please try again in a few minutes.",
        error: "Rate limit exceeded"
      }, { status: 429 });
    }
    
    if (err.status === 403) {
      return NextResponse.json({ 
        reply: "There's an API configuration issue. Please try again later.",
        error: "API key issue" 
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      reply: "I'm having technical difficulties. Please try again.",
      error: "Service unavailable"
    }, { status: 500 });
  }
}