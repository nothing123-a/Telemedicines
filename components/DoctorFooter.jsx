"use client";
import { Brain, Shield, Heart, Activity } from "lucide-react";

export default function DoctorFooter() {
  return (
    <footer className="relative bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100/50">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
      <div className="relative max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-md">
              <Brain className="text-white w-4 h-4" />
            </div>
            <div>
              <p className="text-emerald-800 font-semibold text-sm">
                Minds Professional
              </p>
              <p className="text-emerald-600/70 text-xs">
                Mental Health Care Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-emerald-600/60 text-xs">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>Patient First</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>24/7 Support</span>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-emerald-700 font-medium">
              © {new Date().getFullYear()} Minds Professional
            </p>
            <p className="text-xs text-emerald-600/70">
              All rights reserved · Empowering Mental Wellness
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-emerald-100">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full opacity-60"></div>
        </div>
      </div>
    </footer>
  );
}