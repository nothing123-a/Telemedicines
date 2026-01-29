"use client";

import { useState, useEffect } from "react";
import { Calendar, Heart, Droplets, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function PeriodStatusWidget() {
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const fetchTrackerData = async () => {
    try {
      const res = await fetch("/api/period-tracker");
      if (res.status === 403) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTracker(data.tracker);
      setHasAccess(true);
    } catch (error) {
      console.error("Error fetching tracker data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNextPeriodDate = () => {
    if (!tracker?.cycles?.length) return null;
    const lastCycle = tracker.cycles[tracker.cycles.length - 1];
    const avgCycleLength = tracker.settings?.cycleLength || 28;
    const nextDate = new Date(lastCycle.startDate);
    nextDate.setDate(nextDate.getDate() + avgCycleLength);
    return nextDate;
  };

  const getCurrentPhase = () => {
    const nextPeriod = getNextPeriodDate();
    if (!nextPeriod) return "Unknown";
    
    const today = new Date();
    const daysUntilPeriod = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilPeriod <= 0) return "Period";
    if (daysUntilPeriod <= 7) return "Pre-menstrual";
    if (daysUntilPeriod >= 10 && daysUntilPeriod <= 16) return "Ovulation";
    return "Follicular";
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case "Period": return "text-red-600 bg-red-50";
      case "Pre-menstrual": return "text-orange-600 bg-orange-50";
      case "Ovulation": return "text-green-600 bg-green-50";
      case "Follicular": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const nextPeriod = getNextPeriodDate();
  const currentPhase = getCurrentPhase();
  const daysUntilPeriod = nextPeriod 
    ? Math.ceil((nextPeriod - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Link href="/dashboard/mental-counselor/period-tracker">
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-pink-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Period Tracker</h3>
          <Calendar className="w-6 h-6 text-pink-500" />
        </div>
        
        <div className="space-y-3">
          {/* Current Phase */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Phase</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPhaseColor(currentPhase)}`}>
              {currentPhase}
            </span>
          </div>
          
          {/* Next Period */}
          {nextPeriod && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Next Period</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">
                  {daysUntilPeriod > 0 ? `${daysUntilPeriod} days` : "Today"}
                </div>
                <div className="text-xs text-gray-500">
                  {nextPeriod.toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{tracker?.cycles?.length || 0} cycles</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{tracker?.symptoms?.length || 0} logs</span>
              </div>
            </div>
            <span className="text-xs text-pink-600 font-medium">View Details →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}