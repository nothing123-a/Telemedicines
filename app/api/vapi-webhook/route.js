import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Vapi webhook received:', body);
    
    // Handle function call from Vapi
    if (body.message?.type === 'function-call') {
      const userMessage = body.message.functionCall.parameters.message;
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are Genie, a helpful AI mental health assistant. Keep responses brief and conversational for voice interaction. User said: ${userMessage}`;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return NextResponse.json({
        result: response
      });
    }
    
    return NextResponse.json({ result: "Hello! I'm Genie, how can I help you?" });
    
  } catch (error) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json({ 
      result: "I'm here to help. Could you please repeat that?" 
    });
  }
}