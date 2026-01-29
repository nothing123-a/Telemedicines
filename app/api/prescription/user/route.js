import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DrPrescription from "@/models/DrPrescription";

export const dynamic = 'force-dynamic';

// Simple cache to reduce database calls
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `prescriptions_${userId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        prescriptions: cached.data,
        cached: true
      });
    }

    await dbConnect();
    
    const prescriptions = await DrPrescription.find({ 
      patientId: userId 
    }).sort({ createdAt: -1 });
    
    // Cache the result
    cache.set(cacheKey, {
      data: prescriptions,
      timestamp: Date.now()
    });

    return NextResponse.json({
      success: true,
      prescriptions
    });

  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}