import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import FeatureSuggestionEngine from "../../../lib/featureSuggestionEngine.js";
import User from "../../../models/User.js";
import connectDB from "../../../lib/mongodb.js";

const suggestionEngine = new FeatureSuggestionEngine();

export async function POST(req) {
  try {
    const session = await getServerSession();
    const { message, includeProfile = true } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ 
        error: "Message is required" 
      }, { status: 400 });
    }

    let userProfile = {};
    
    // Get user profile if session exists and requested
    if (session?.user?.email && includeProfile) {
      try {
        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          userProfile = {
            name: user.name,
            gender: user.gender,
            language: user.language,
            age: user.birthdate ? Math.floor((Date.now() - user.birthdate) / (365.25 * 24 * 60 * 60 * 1000)) : null
          };
        }
      } catch (dbError) {
        console.error('Failed to fetch user profile:', dbError);
      }
    }

    // Process user input and generate suggestions
    const result = await suggestionEngine.processUserInput(message, userProfile);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Feature suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to generate feature suggestions" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    // Return available platform features for reference
    const features = suggestionEngine.platformFeatures;
    
    return NextResponse.json({
      success: true,
      features: Object.entries(features).map(([key, feature]) => ({
        id: key,
        ...feature
      }))
    });

  } catch (error) {
    console.error("Feature list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}