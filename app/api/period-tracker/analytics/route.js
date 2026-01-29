import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import PeriodTracker from "@/models/PeriodTracker";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.gender !== "female") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const tracker = await PeriodTracker.findOne({ userId: user._id });
    if (!tracker) {
      return NextResponse.json({ analytics: null });
    }

    // Calculate analytics
    const analytics = calculateAnalytics(tracker);
    
    return NextResponse.json({ analytics });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function calculateAnalytics(tracker) {
  const cycles = tracker.cycles || [];
  const symptoms = tracker.symptoms || [];
  
  if (cycles.length === 0) {
    return {
      averageCycleLength: null,
      cycleVariation: null,
      commonSymptoms: [],
      moodPatterns: [],
      predictionAccuracy: null
    };
  }

  // Calculate cycle lengths from start dates
  const cycleLengths = [];
  for (let i = 1; i < cycles.length; i++) {
    const prevStart = new Date(cycles[i-1].startDate);
    const currentStart = new Date(cycles[i].startDate);
    const lengthInDays = Math.round((currentStart - prevStart) / (1000 * 60 * 60 * 24));
    if (lengthInDays > 0 && lengthInDays < 60) { // Valid cycle length
      cycleLengths.push(lengthInDays);
    }
  }
  
  const averageCycleLength = cycleLengths.length > 0 
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : null;

  // Calculate cycle variation
  const cycleVariation = cycleLengths.length > 1
    ? Math.round(Math.sqrt(cycleLengths.reduce((acc, length) => {
        return acc + Math.pow(length - averageCycleLength, 2);
      }, 0) / cycleLengths.length))
    : null;

  // Analyze common symptoms
  const allPhysicalSymptoms = symptoms.flatMap(s => s.physical || []);
  const symptomCounts = allPhysicalSymptoms.reduce((acc, symptom) => {
    acc[symptom] = (acc[symptom] || 0) + 1;
    return acc;
  }, {});
  
  const commonSymptoms = Object.entries(symptomCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([symptom, count]) => ({ symptom, count }));

  // Analyze mood patterns
  const allMoodSymptoms = symptoms.flatMap(s => s.mood || []);
  const moodCounts = allMoodSymptoms.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});
  
  const moodPatterns = Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([mood, count]) => ({ mood, count }));

  return {
    averageCycleLength,
    cycleVariation,
    commonSymptoms,
    moodPatterns,
    totalCycles: cycles.length,
    totalSymptomEntries: symptoms.length
  };
}