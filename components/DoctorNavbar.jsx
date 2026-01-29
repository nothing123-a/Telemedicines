"use client";
import { LogOut, Activity, Stethoscope } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function DoctorNavbar({ status, doctorName, onLogout, onStatusChange }) {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(status === 'online');

  useEffect(() => {
    setIsOnline(status === 'online');
  }, [status]);

  const toggleStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    
    // Update status in database
    try {
      await fetch('/api/doctor/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: session?.user?.id,
          isOnline: newStatus
        })
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  return (
    <nav className="relative bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 shadow-lg border-b border-emerald-100/50">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg flex-shrink-0">
              <Stethoscope className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent truncate">
                <span className="hidden sm:inline">Clarity Care - Doctor Dashboard</span>
                <span className="sm:hidden">Doctor Portal</span>
              </h1>
              <p className="text-xs text-emerald-600/70 font-medium hidden sm:block">
                Healthcare Professional Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <button
              onClick={toggleStatus}
              className="flex items-center space-x-1 sm:space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1.5 sm:py-2 shadow-md border border-white/20 hover:bg-white/80 transition-all duration-200"
            >
              <div className="relative">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                  isOnline
                    ? "bg-emerald-400 shadow-lg shadow-emerald-400/50"
                    : "bg-red-400 shadow-lg shadow-red-400/50"
                }`}></div>
                {isOnline && (
                  <div className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                )}
              </div>
              <span className={`capitalize text-xs sm:text-sm font-medium hidden sm:inline ${
                isOnline ? "text-emerald-700" : "text-red-700"
              }`}>
                {isOnline ? 'Available' : 'Offline'}
              </span>
              <Activity className={`w-3 h-3 sm:w-4 sm:h-4 ${
                isOnline ? "text-emerald-600" : "text-red-600"
              }`} />
            </button>

            {doctorName && (
              <div className="hidden lg:flex items-center space-x-3 bg-white/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-semibold">Dr</span>
                </div>
                <div className="text-emerald-700">
                  <p className="text-sm font-medium">{doctorName}</p>
                  <p className="text-xs text-emerald-600/70">Licensed Therapist</p>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              className="group relative px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              <span className="flex items-center space-x-1 sm:space-x-2">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="hidden sm:block text-sm">Logout</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}