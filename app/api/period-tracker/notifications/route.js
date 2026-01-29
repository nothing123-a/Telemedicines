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
      return NextResponse.json({ notifications: [] });
    }

    const notifications = generateNotifications(tracker);
    
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function generateNotifications(tracker) {
  const notifications = [];
  const today = new Date();
  const cycles = tracker.cycles || [];
  const settings = tracker.settings || {};

  if (cycles.length === 0) {
    return notifications;
  }

  const lastCycle = cycles[cycles.length - 1];
  const avgCycleLength = settings.cycleLength || 28;
  const periodLength = settings.periodLength || 5;
  const discreetMode = settings.discreetMode || false;

  // Calculate next period date
  const nextPeriodDate = new Date(lastCycle.startDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

  // Calculate days until next period
  const daysUntilPeriod = Math.ceil((nextPeriodDate - today) / (1000 * 60 * 60 * 24));

  // Period reminder notifications
  if (settings.reminderSettings?.periodReminder) {
    if (daysUntilPeriod === 3) {
      notifications.push({
        type: "period_reminder",
        title: discreetMode ? "Health Reminder" : "Period Coming Soon",
        message: discreetMode 
          ? "Take care of yourself this week ❤️"
          : "Your period is expected in 3 days. Time to prepare!",
        priority: "medium",
        date: today
      });
    } else if (daysUntilPeriod === 1) {
      notifications.push({
        type: "period_reminder",
        title: discreetMode ? "Self-Care Reminder" : "Period Tomorrow",
        message: discreetMode
          ? "Remember to stay hydrated and rest well 💙"
          : "Your period is expected tomorrow. Make sure you're prepared!",
        priority: "high",
        date: today
      });
    } else if (daysUntilPeriod === 0) {
      notifications.push({
        type: "period_start",
        title: discreetMode ? "Wellness Check" : "Period Day",
        message: discreetMode
          ? "Take extra care of yourself today 🌸"
          : "Your period is expected today. Track your flow and symptoms!",
        priority: "high",
        date: today
      });
    }
  }

  // Fertility window notifications
  if (settings.reminderSettings?.fertilityReminder) {
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    
    const fertileStartDate = new Date(ovulationDate);
    fertileStartDate.setDate(fertileStartDate.getDate() - 5);
    
    const daysUntilFertile = Math.ceil((fertileStartDate - today) / (1000 * 60 * 60 * 24));
    const daysUntilOvulation = Math.ceil((ovulationDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilFertile === 1) {
      notifications.push({
        type: "fertility_window",
        title: discreetMode ? "Health Tracking" : "Fertile Window Starting",
        message: discreetMode
          ? "Important tracking period begins tomorrow 📊"
          : "Your fertile window starts tomorrow. Track accordingly!",
        priority: "medium",
        date: today
      });
    } else if (daysUntilOvulation === 0) {
      notifications.push({
        type: "ovulation",
        title: discreetMode ? "Peak Health Day" : "Ovulation Day",
        message: discreetMode
          ? "Today is an important day for your health cycle 🌟"
          : "Today is your predicted ovulation day!",
        priority: "medium",
        date: today
      });
    }
  }

  // Late period notification
  if (daysUntilPeriod < -3) {
    notifications.push({
      type: "late_period",
      title: discreetMode ? "Health Check Reminder" : "Period is Late",
      message: discreetMode
        ? "Consider checking in with your health routine 🩺"
        : `Your period is ${Math.abs(daysUntilPeriod)} days late. Consider taking a test or consulting a doctor.`,
      priority: "high",
      date: today
    });
  }

  return notifications;
}