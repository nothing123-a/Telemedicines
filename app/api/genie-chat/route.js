import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import FeatureSuggestionEngine from '../../../lib/featureSuggestionEngine.js';
import rateLimiter from '../../../lib/rateLimiter.js';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const suggestionEngine = new FeatureSuggestionEngine();

export async function POST(request) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message is required' 
      }, { status: 400 });
    }

    // Rate limiting for Genie
    if (userId && !rateLimiter.isAllowed(userId)) {
      return NextResponse.json({
        success: false,
        error: 'Too many requests. Please wait a moment.',
        fallbackResponse: 'I need a moment to process. Please try again shortly.'
      }, { status: 429 });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 200,
      },
    });

    // Detect language of the message
    const isHindi = /[\u0900-\u097F]/.test(message);
    const isMarathi = /[\u0900-\u097F]/.test(message) && (message.includes('आहे') || message.includes('का') || message.includes('ते'));
    
    let responseLanguage = 'English';
    let detectedLang = 'en';
    if (isHindi) {
      responseLanguage = 'Hindi';
      detectedLang = 'hi';
    }
    if (isMarathi) {
      responseLanguage = 'Marathi';
      detectedLang = 'mr';
    }
    
    // Check if user wants to connect to doctor
    const doctorConnectionKeywords = [
      'connect to doc', 'connect to doctor', 'talk to doctor', 'see doctor',
      'doctor consultation', 'medical help', 'need doctor', 'consult doctor',
      'routine checkup', 'routine doctor', 'medical advice'
    ];
    
    const wantsDoctorConnection = doctorConnectionKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    // Check if user is responding with connection type
    const connectionTypeResponse = message.toLowerCase().includes('chat') || message.toLowerCase().includes('video');
    
    if (connectionTypeResponse && (message.toLowerCase().includes('chat') || message.toLowerCase().includes('video'))) {
      const connectionType = message.toLowerCase().includes('video') ? 'video' : 'chat';
      return NextResponse.json({
        success: true,
        response: `Perfect! I'm connecting you to a doctor via ${connectionType}. Sending your request now...`,
        language: responseLanguage,
        action: 'CONNECT_TO_DOCTOR',
        doctorConnection: {
          type: 'routine',
          connectionType: connectionType,
          message: `Genie automated ${connectionType} connection request`
        },
        timestamp: new Date().toISOString()
      });
    }

    if (wantsDoctorConnection) {
      // Ask only chat or video preference
      return NextResponse.json({
        success: true,
        response: "Would you like a chat or video call with the doctor?",
        language: responseLanguage,
        action: 'ASK_CONNECTION_TYPE',
        timestamp: new Date().toISOString()
      });
    }

    // Get intelligent feature suggestions
    const featureSuggestions = await suggestionEngine.processUserInput(message);
    const topFeature = featureSuggestions.suggestions[0];
    
    // Complete Minds platform training
    const prompt = `You are Genie, the official AI assistant for MINDS website. You help users by AUTOMATICALLY doing tasks they would normally do manually.

    User said: "${message}"
    
    YOUR ROLE:
    - You are the website's AI assistant who automates user tasks
    - When users need something, you do it FOR them automatically
    - You don't just suggest features - you ACTIVATE them for users
    - You handle all the manual work users would normally do
    
    RESPONSE STYLE:
    1. Acknowledge what they need
    2. Tell them you're doing it automatically: "Let me handle that for you" or "I'll take care of that right away"
    3. Explain what you're doing: "I'm connecting you to..." or "I'm setting up..."
    
    WEBSITE FEATURES YOU CAN ACTIVATE:
    - Doctor Connection: "I'm connecting you to our doctors right now"
    - Health Analysis: "Let me analyze your health data for you"
    - Medicine Orders: "I'll help you order medicines from our pharmacy"
    - Emergency Help: "I'm activating emergency services for you"
    - Report Analysis: "I'm analyzing your medical reports now"
    
    EXAMPLES:
    User: "Connect me with doctor"
    Response: "I'll connect you to our doctors right away! Let me send your request to available doctors now."
    
    User: "I need medicine"
    Response: "Let me help you with that! I'm connecting you to our pharmacy service to get your medicines."
    
    Always act like you're DOING the task, not just suggesting it. Respond in ${responseLanguage}.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      response: text,
      language: responseLanguage,
      detectedLanguage: detectedLang,
      suggestedFeature: topFeature ? {
        name: topFeature.name,
        route: topFeature.route,
        reason: topFeature.relevanceReason
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Genie Chat Error:', error);
    
    // Handle specific Gemini API errors
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    let fallbackResponse = 'Hello! I am Genie, your AI assistant. How can I help you today?';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API key issue. Please check configuration.';
      fallbackResponse = 'I\'m having trouble connecting. Please try using the voice mode instead.';
    } else if (error.message?.includes('quota') || error.status === 429) {
      errorMessage = 'API quota exceeded. Please try again later.';
      fallbackResponse = 'I\'m experiencing high demand. Please try again in a few minutes or use voice mode.';
    } else if (error.message?.includes('model')) {
      errorMessage = 'Model not available. Using fallback response.';
      fallbackResponse = 'I\'m temporarily unavailable. Please try the voice assistant instead.';
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error.message,
      fallbackResponse
    }, { status: error.status || 500 });
  }
}