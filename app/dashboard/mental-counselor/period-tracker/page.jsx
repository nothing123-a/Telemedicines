"use client";

import { useState, useEffect } from "react";
import { Calendar, Heart, Droplets, Brain, Settings, TrendingUp, Bell, Shield, Download, AlertTriangle, Activity, Moon } from "lucide-react";
import PeriodTrackerAI from "@/components/PeriodTrackerAI";

export default function PeriodTracker() {
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const addCycle = async (cycleData) => {
    try {
      const res = await fetch("/api/period-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_cycle", data: cycleData })
      });
      const data = await res.json();
      setTracker(data.tracker);
    } catch (error) {
      console.error("Error adding cycle:", error);
    }
  };

  const addSymptom = async (symptomData) => {
    try {
      const res = await fetch("/api/period-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_symptom", data: symptomData })
      });
      const data = await res.json();
      setTracker(data.tracker);
    } catch (error) {
      console.error("Error adding symptom:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            The Period Tracker feature is exclusively available for female users. Please update your profile if this is incorrect.
          </p>
          <button 
            onClick={() => window.location.href = "/profile"}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Update Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Period Tracker</h1>
          <p className="text-gray-600">Track your cycle, symptoms, and wellness journey</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 mb-8 shadow-sm">
          {[
            { id: "dashboard", label: "Dashboard", icon: TrendingUp },
            { id: "cycle", label: "Cycle", icon: Calendar },
            { id: "symptoms", label: "Symptoms", icon: Heart },
            { id: "insights", label: "Insights", icon: Brain },
            { id: "settings", label: "Settings", icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === id
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <DashboardTab tracker={tracker} />}
        {activeTab === "cycle" && <CycleTab tracker={tracker} addCycle={addCycle} />}
        {activeTab === "symptoms" && <SymptomsTab tracker={tracker} addSymptom={addSymptom} />}
        {activeTab === "insights" && <InsightsTab tracker={tracker} />}
        {activeTab === "settings" && <SettingsTab tracker={tracker} setTracker={setTracker} />}
        
        {/* AI Assistant */}
        <PeriodTrackerAI tracker={tracker} />
      </div>
    </div>
  );
}

function DashboardTab({ tracker }) {
  const getNextPeriodDate = () => {
    if (!tracker?.cycles?.length) return null;
    const lastCycle = tracker.cycles[tracker.cycles.length - 1];
    const avgCycleLength = tracker.settings?.cycleLength || 28;
    const nextDate = new Date(lastCycle.startDate);
    nextDate.setDate(nextDate.getDate() + avgCycleLength);
    return nextDate;
  };

  const getFertileWindow = () => {
    const nextPeriod = getNextPeriodDate();
    if (!nextPeriod) return null;
    const ovulation = new Date(nextPeriod);
    ovulation.setDate(ovulation.getDate() - 14);
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    return { start: fertileStart, end: fertileEnd, ovulation };
  };

  const nextPeriod = getNextPeriodDate();
  const fertileWindow = getFertileWindow();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Next Period Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Next Period</h3>
        </div>
        {nextPeriod ? (
          <div>
            <p className="text-2xl font-bold text-emerald-600 mb-2">
              {nextPeriod.toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              {Math.ceil((nextPeriod - new Date()) / (1000 * 60 * 60 * 24))} days to go
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Add your first cycle to see predictions</p>
        )}
      </div>

      {/* Fertile Window Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Fertile Window</h3>
        </div>
        {fertileWindow ? (
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {fertileWindow.start.toLocaleDateString()} - {fertileWindow.end.toLocaleDateString()}
            </p>
            <p className="text-sm font-medium text-green-600">
              Ovulation: {fertileWindow.ovulation.toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Track cycles to see fertile window</p>
        )}
      </div>

      {/* Cycle Stats Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Cycle Stats</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Average Cycle</span>
            <span className="text-sm font-medium">{tracker?.settings?.cycleLength || 28} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Period Length</span>
            <span className="text-sm font-medium">{tracker?.settings?.periodLength || 5} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Cycles Tracked</span>
            <span className="text-sm font-medium">{tracker?.cycles?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CycleTab({ tracker, addCycle }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flowIntensity, setFlowIntensity] = useState("medium");

  const handleAddCycle = () => {
    if (!startDate) return;
    
    const cycleData = {
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      flowIntensity: [{ date: new Date(startDate), intensity: flowIntensity }]
    };
    
    addCycle(cycleData);
    setStartDate("");
    setEndDate("");
    setFlowIntensity("medium");
  };

  return (
    <div className="space-y-6">
      {/* Add New Cycle */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Log New Cycle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flow Intensity</label>
            <select
              value={flowIntensity}
              onChange={(e) => setFlowIntensity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="spotting">Spotting</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleAddCycle}
          className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Add Cycle
        </button>
      </div>

      {/* Cycle History */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cycle History</h3>
        {tracker?.cycles?.length > 0 ? (
          <div className="space-y-3">
            {tracker.cycles.slice(-5).reverse().map((cycle, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    {new Date(cycle.startDate).toLocaleDateString()}
                    {cycle.endDate && ` - ${new Date(cycle.endDate).toLocaleDateString()}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {cycle.cycleLength ? `${cycle.cycleLength} days` : "Ongoing"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-gray-600 capitalize">
                    {cycle.flowIntensity?.[0]?.intensity || "Medium"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No cycles tracked yet</p>
        )}
      </div>
    </div>
  );
}

function SymptomsTab({ tracker, addSymptom }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [physical, setPhysical] = useState([]);
  const [mood, setMood] = useState([]);
  const [notes, setNotes] = useState("");

  const physicalSymptoms = ["cramps", "headaches", "bloating", "acne", "breast_tenderness", "fatigue", "back_pain", "nausea"];
  const moodSymptoms = ["irritability", "sadness", "anxiety", "happiness", "mood_swings", "depression", "energy_high", "energy_low"];

  const handleSymptomToggle = (symptom, type) => {
    if (type === "physical") {
      setPhysical(prev => 
        prev.includes(symptom) 
          ? prev.filter(s => s !== symptom)
          : [...prev, symptom]
      );
    } else {
      setMood(prev => 
        prev.includes(symptom) 
          ? prev.filter(s => s !== symptom)
          : [...prev, symptom]
      );
    }
  };

  const handleAddSymptom = () => {
    const symptomData = {
      date: new Date(selectedDate),
      physical,
      mood,
      notes
    };
    
    addSymptom(symptomData);
    setPhysical([]);
    setMood([]);
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Log Symptoms */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Log Symptoms</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Physical Symptoms</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {physicalSymptoms.map(symptom => (
              <button
                key={symptom}
                onClick={() => handleSymptomToggle(symptom, "physical")}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  physical.includes(symptom)
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {symptom.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Mood & Energy</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {moodSymptoms.map(symptom => (
              <button
                key={symptom}
                onClick={() => handleSymptomToggle(symptom, "mood")}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  mood.includes(symptom)
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {symptom.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            rows="3"
          />
        </div>

        <button
          onClick={handleAddSymptom}
          className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Log Symptoms
        </button>
      </div>
    </div>
  );
}

function InsightsTab({ tracker }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/period-tracker/analytics");
      const data = await res.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const res = await fetch("/api/period-tracker/export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `period-tracker-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportData}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export for Doctor
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Cycle Analysis</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cycles Tracked</span>
              <span className="text-sm font-medium">{analytics?.totalCycles || 0}</span>
            </div>
            {analytics?.averageCycleLength ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Length</span>
                  <span className="text-sm font-medium">{analytics.averageCycleLength} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Variation</span>
                  <span className="text-sm font-medium">±{analytics.cycleVariation || 0} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Regularity</span>
                  <span className={`text-sm font-medium ${
                    (analytics.cycleVariation || 0) <= 3 ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {(analytics.cycleVariation || 0) <= 3 ? "Regular" : "Irregular"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-500 mt-2">
                {analytics?.totalCycles === 0 ? "Start tracking cycles" : "Need 2+ cycles for analysis"}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Common Symptoms</h3>
          </div>
          {analytics?.commonSymptoms?.length > 0 ? (
            <div className="space-y-2">
              {analytics.commonSymptoms.slice(0, 3).map((symptom, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {symptom.symptom.replace("_", " ")}
                  </span>
                  <span className="text-sm font-medium">{symptom.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Start logging symptoms to see patterns</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
              <Moon className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Mood Patterns</h3>
          </div>
          {analytics?.moodPatterns?.length > 0 ? (
            <div className="space-y-2">
              {analytics.moodPatterns.slice(0, 3).map((mood, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {mood.mood.replace("_", " ")}
                  </span>
                  <span className="text-sm font-medium">{mood.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Track mood to identify patterns</p>
          )}
        </div>
      </div>

      {/* Health Tips */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personalized Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">🥗 Nutrition</h4>
            <p className="text-sm text-green-700">
              Iron-rich foods like spinach and lean meats can help combat fatigue during your period.
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">🧘 Wellness</h4>
            <p className="text-sm text-blue-700">
              Light exercise and yoga can help reduce cramps and improve mood during your cycle.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">😴 Sleep</h4>
            <p className="text-sm text-purple-700">
              Aim for 7-9 hours of sleep, especially during your period when your body needs extra rest.
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <h4 className="font-medium text-emerald-800 mb-2">💧 Hydration</h4>
            <p className="text-sm text-emerald-700">
              Stay hydrated to reduce bloating and help your body function optimally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ tracker, setTracker }) {
  const [settings, setSettings] = useState(tracker?.settings || {});

  const updateSettings = async (newSettings) => {
    try {
      const res = await fetch("/api/period-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_settings", data: newSettings })
      });
      const data = await res.json();
      setTracker(data.tracker);
      setSettings(data.tracker.settings);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cycle Settings */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cycle Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Average Cycle Length</label>
            <input
              type="number"
              value={settings.cycleLength || 28}
              onChange={(e) => setSettings({...settings, cycleLength: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period Length</label>
            <input
              type="number"
              value={settings.periodLength || 5}
              onChange={(e) => setSettings({...settings, periodLength: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reminder Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700">Period reminders</span>
              <p className="text-xs text-gray-500">Get notified before your period starts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.reminderSettings?.periodReminder || false}
              onChange={(e) => setSettings({
                ...settings,
                reminderSettings: {...settings.reminderSettings, periodReminder: e.target.checked}
              })}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700">Fertility window reminders</span>
              <p className="text-xs text-gray-500">Track your fertile days</p>
            </div>
            <input
              type="checkbox"
              checked={settings.reminderSettings?.fertilityReminder || false}
              onChange={(e) => setSettings({
                ...settings,
                reminderSettings: {...settings.reminderSettings, fertilityReminder: e.target.checked}
              })}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700">Discreet mode</span>
              <p className="text-xs text-gray-500">Neutral notifications for privacy</p>
            </div>
            <input
              type="checkbox"
              checked={settings.discreetMode || false}
              onChange={(e) => setSettings({...settings, discreetMode: e.target.checked})}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
        <p className="text-sm text-gray-600 mb-4">For severe symptoms or emergencies</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
            <input
              type="text"
              value={settings.emergencyContact?.name || ""}
              onChange={(e) => setSettings({
                ...settings,
                emergencyContact: {...settings.emergencyContact, name: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.emergencyContact?.phone || ""}
              onChange={(e) => setSettings({
                ...settings,
                emergencyContact: {...settings.emergencyContact, phone: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Health Conditions */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Conditions</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.healthConditions?.hasPCOS || false}
              onChange={(e) => setSettings({
                ...settings,
                healthConditions: {...settings.healthConditions, hasPCOS: e.target.checked}
              })}
              className="mr-3 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">PCOS/PCOD</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.healthConditions?.irregularCycles || false}
              onChange={(e) => setSettings({
                ...settings,
                healthConditions: {...settings.healthConditions, irregularCycles: e.target.checked}
              })}
              className="mr-3 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Irregular cycles</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.healthConditions?.onBirthControl || false}
              onChange={(e) => setSettings({
                ...settings,
                healthConditions: {...settings.healthConditions, onBirthControl: e.target.checked}
              })}
              className="mr-3 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">On birth control</span>
          </label>
        </div>
      </div>

      <button
        onClick={() => updateSettings(settings)}
        className="w-full bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
      >
        Save All Settings
      </button>
    </div>
  );
}