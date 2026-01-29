"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Stethoscope,
  UserPlus,
  Heart,
  Brain,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen
} from "lucide-react";

export default function DoctorRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // Animate elements on mount
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.style.opacity = '1';
        titleRef.current.style.transform = 'translateY(0)';
      }
    }, 200);
    
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.style.opacity = '1';
        formRef.current.style.transform = 'translateY(0)';
      }
    }, 400);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/doctor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/auth/login");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(2deg); }
          50% { transform: translateY(-8px) rotate(-2deg); }
          75% { transform: translateY(-12px) rotate(1deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.2); }
          50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.4); }
        }
        
        .floating-shape {
          animation: float 7s ease-in-out infinite;
        }
        
        .floating-shape:nth-child(2) {
          animation-delay: -2s;
          animation-duration: 9s;
        }
        
        .floating-shape:nth-child(3) {
          animation-delay: -4s;
          animation-duration: 8s;
        }
        
        .floating-shape:nth-child(4) {
          animation-delay: -1s;
          animation-duration: 10s;
        }
        
        .sparkle-animation {
          animation: sparkle 3s ease-in-out infinite;
        }
        
        .sparkle-animation:nth-child(2) {
          animation-delay: 1s;
        }
        
        .sparkle-animation:nth-child(3) {
          animation-delay: 2s;
        }
        
        .gradient-bg {
          background: linear-gradient(-45deg, #10b981, #059669, #0d9488, #0f766e);
          background-size: 400% 400%;
          animation: gradient-shift 12s ease infinite;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .animate-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .input-focus:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
        }
        
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.3);
        }
        
        .medical-icon {
          color: #059669;
          filter: drop-shadow(0 0 8px rgba(5, 150, 105, 0.3));
        }
        
        .specialty-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        
        @media (max-width: 640px) {
          .specialty-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <main className="min-h-screen flex items-center justify-center gradient-bg relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="floating-shape absolute top-16 left-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full blur-sm"></div>
        <div className="floating-shape absolute top-32 right-8 w-12 h-12 sm:w-16 sm:h-16 bg-green-300/20 rounded-full blur-sm"></div>
        <div className="floating-shape absolute bottom-24 left-8 w-20 h-20 sm:w-24 sm:h-24 bg-teal-300/15 rounded-full blur-sm"></div>
        <div className="floating-shape absolute bottom-16 right-4 w-14 h-14 sm:w-18 sm:h-18 bg-emerald-300/20 rounded-full blur-sm"></div>

        {/* Sparkle Effects */}
        <div className="absolute top-1/4 left-1/4">
          <Sparkles className="sparkle-animation w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
        </div>
        <div className="absolute top-1/3 right-1/3">
          <Sparkles className="sparkle-animation w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-200/70" />
        </div>
        <div className="absolute bottom-1/3 left-1/3">
          <Sparkles className="sparkle-animation w-4 h-4 sm:w-5 sm:h-5 text-teal-200/60" />
        </div>

        {/* Main Registration Container */}
        <div className="glass-effect rounded-xl p-3 sm:p-4 md:p-6 w-full max-w-[300px] sm:max-w-[350px] md:max-w-md mx-3 relative z-10 shadow-xl">
          {/* Header */}
          <div 
            ref={titleRef}
            className="animate-in text-center mb-3 sm:mb-4"
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="relative">
                <Stethoscope className="medical-icon w-5 h-5 sm:w-6 sm:h-6" />
                <ShieldCheck className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                MindCare
              </h1>
            </div>
            <p className="text-gray-600 text-xs leading-tight mb-1">
              Join as a Mental Health Professional
            </p>
            <div className="flex items-center justify-center gap-1 text-[10px] text-green-600">
              <Award className="w-3 h-3" />
              <span>Verified Doctor Registration</span>
            </div>
          </div>

          <div 
            ref={formRef}
            className="animate-in"
          >
            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">
                  Full Name
                </label>
                <div className="input-focus relative border-2 border-gray-200 rounded-lg px-2.5 py-2.5 sm:py-3 focus-within:border-green-400 transition-all duration-300">
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Dr. John Smith"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-7 sm:pl-8 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">
                  Email
                </label>
                <div className="input-focus relative border-2 border-gray-200 rounded-lg px-2.5 py-2.5 sm:py-3 focus-within:border-green-400 transition-all duration-300">
                  <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <input
                    name="email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-7 sm:pl-8 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">
                  Password
                </label>
                <div className="input-focus relative border-2 border-gray-200 rounded-lg px-2.5 py-2.5 sm:py-3 focus-within:border-green-400 transition-all duration-300">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <input
                    name="password"
                    type="password"
                    placeholder="Create secure password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-7 sm:pl-8 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">
                  Specialty <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="input-focus relative border-2 border-gray-200 rounded-lg px-2.5 py-2.5 sm:py-3 focus-within:border-green-400 transition-all duration-300">
                  <BookOpen className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <input
                    name="specialty"
                    type="text"
                    placeholder="e.g. Psychiatry, Psychology"
                    value={form.specialty}
                    onChange={handleChange}
                    className="w-full pl-7 sm:pl-8 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-600 text-xs text-center animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-hover w-full bg-gradient-to-r from-green-600 to-teal-600 text-white flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-lg shadow-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                {loading ? (
                  <div className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                {loading ? "Creating Account..." : "Register as Doctor"}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-gray-600 mt-3 sm:mt-4 text-[10px] sm:text-xs">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-green-600 font-semibold hover:text-green-800 transition-colors duration-200 hover:underline"
              >
                Sign in here
              </a>
            </p>

            {/* Professional Verification Notice */}
            <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ShieldCheck className="w-3 h-3 text-green-600" />
                <span className="text-[10px] sm:text-xs font-semibold text-green-700">Professional Verification</span>
              </div>
              <p className="text-center text-[9px] sm:text-[10px] text-gray-600 leading-tight">
                Your credentials will be verified before account activation. This ensures patient safety and maintains our quality standards.
              </p>
            </div>

            {/* Mental Health Message */}
            <div className="mt-2 sm:mt-3 p-2 sm:p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <p className="text-center text-[10px] sm:text-xs text-gray-600 leading-tight">
                <Heart className="inline w-3 h-3 text-pink-500 mr-0.5" />
                Join us in making mental healthcare accessible to everyone.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 to-transparent"></div>
      </main>
    </>
  );
}