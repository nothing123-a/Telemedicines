import { NextResponse } from "next/server";
import escalationService from "@/lib/escalationService";

export async function POST(req) {
  try {
    const { userId, message } = await req.json();
    
    console.log('🧪 Testing escalation for userId:', userId);
    console.log('🧪 Test message:', message);
    
    const riskAnalysis = {
      risk_level: "Suicidal",
      confidence: 0.95,
      method: "test"
    };
    
    const result = await escalationService.triggerEscalation(userId, riskAnalysis, message);
    
    return NextResponse.json({ 
      success: true, 
      escalationId: result._id,
      message: "Test escalation triggered successfully"
    });
    
  } catch (error) {
    console.error('Test escalation failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}