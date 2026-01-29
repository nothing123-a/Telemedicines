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

    let tracker = await PeriodTracker.findOne({ userId: user._id });
    if (!tracker) {
      tracker = new PeriodTracker({ 
        userId: user._id,
        cycles: [],
        symptoms: [],
        lifestyle: []
      });
      await tracker.save();
    }

    return NextResponse.json({ tracker });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, data } = await req.json();
    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.gender !== "female") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let tracker = await PeriodTracker.findOne({ userId: user._id });
    if (!tracker) {
      tracker = new PeriodTracker({ userId: user._id });
    }

    switch (action) {
      case "add_cycle":
        tracker.cycles.push(data);
        break;
      case "add_symptom":
        tracker.symptoms.push(data);
        break;
      case "add_lifestyle":
        tracker.lifestyle.push(data);
        break;
      case "update_settings":
        tracker.settings = { ...tracker.settings, ...data };
        break;
      case "update_flow":
        const cycle = tracker.cycles.find(c => c._id.toString() === data.cycleId);
        if (cycle) {
          cycle.flowIntensity.push({ date: data.date, intensity: data.intensity });
        }
        break;
    }

    await tracker.save();
    return NextResponse.json({ success: true, tracker });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}