"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  Fingerprint,
  User,
  Stethoscope,
  Heart,
  Brain,
  Sparkles,
  Pill,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("patient");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // Set default demo credentials
    setEmail("patient1@demo.com");
    setPassword("demo123");

    // Animate elements on mount
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.style.opacity = "1";
        titleRef.current.style.transform = "translateY(0)";
      }
    }, 200);

    setTimeout(() => {
      if (formRef.current) {
        formRef.current.style.opacity = "1";
        formRef.current.style.transform = "translateY(0)";
      }
    }, 400);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        isDoctor: (userType === "doctor").toString(),
        isPharmacist: (userType === "pharmacist").toString(),
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        if (userType === "doctor") {
          await fetch("/api/doctor/status", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, status: "online" }),
          });
          router.push("/doctor");
        } else if (userType === "pharmacist") {
          router.push("/dashboard/pharmacist");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (userType !== "patient") {
      setError("Only patients can use Google login.");
      return;
    }
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  if (!mounted) return null;

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(3deg);
          }
          50% {
            transform: translateY(-10px) rotate(-3deg);
          }
          75% {
            transform: translateY(-15px) rotate(2deg);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(167, 139, 250, 0.6);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .floating-shape {
          animation: float 6s ease-in-out infinite;
        }

        .floating-shape:nth-child(2) {
          animation-delay: -2s;
          animation-duration: 8s;
        }

        .floating-shape:nth-child(3) {
          animation-delay: -4s;
          animation-duration: 7s;
        }

        .floating-shape:nth-child(4) {
          animation-delay: -1s;
          animation-duration: 9s;
        }

        .sparkle-animation {
          animation: sparkle 2s ease-in-out infinite;
        }

        .sparkle-animation:nth-child(2) {
          animation-delay: 0.5s;
        }

        .sparkle-animation:nth-child(3) {
          animation-delay: 1s;
        }

        .gradient-bg {
          background: linear-gradient(
            -45deg,
            #0ea5e9,
            #06b6d4,
            #10b981,
            #3b82f6
          );
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .animate-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-focus:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .healthcare-icon {
          color: #0ea5e9;
          filter: drop-shadow(0 0 10px rgba(14, 165, 233, 0.3));
        }
      `}</style>

      <main className="min-h-screen flex items-center justify-center gradient-bg relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="floating-shape absolute top-16 left-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 rounded-full blur-sm"></div>
        <div className="floating-shape absolute top-32 right-8 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-teal-300/20 rounded-full blur-sm"></div>
        <div className="floating-shape absolute bottom-24 left-8 w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-emerald-300/15 rounded-full blur-sm"></div>
        <div className="floating-shape absolute bottom-16 right-4 w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 bg-blue-300/20 rounded-full blur-sm"></div>

        {/* Sparkle Effects */}
        <div className="absolute top-1/4 left-1/4">
          <Sparkles className="sparkle-animation w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
        </div>
        <div className="absolute top-1/3 right-1/3">
          <Sparkles className="sparkle-animation w-2 h-2 sm:w-3 sm:h-3 text-teal-200/70" />
        </div>
        <div className="absolute bottom-1/3 left-1/3">
          <Sparkles className="sparkle-animation w-4 h-4 sm:w-5 sm:h-5 text-emerald-200/60" />
        </div>

        {/* Main Login Container */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md mx-4 relative z-10 shadow-xl">
          {/* Header */}
          <div ref={titleRef} className="animate-in text-center mb-3 sm:mb-4">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="relative">
                <Brain className="healthcare-icon w-5 h-5 sm:w-6 sm:h-6" />
                <Heart className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Clarity Care
              </h1>
            </div>
            <p className="text-gray-600 text-xs leading-tight">
              Your comprehensive healthcare platform
            </p>
          </div>

          <div ref={formRef} className="animate-in">
            {/* User Type Toggle - Capsule Format */}
            <div className="bg-gray-100 rounded-full p-1 mb-3 sm:mb-4 flex">
              <button
                type="button"
                onClick={() => {
                  setUserType("patient");
                  setEmail("patient1@demo.com");
                  setPassword("demo123");
                }}
                className={`flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  userType === "patient"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <User className="w-3 h-3" />
                <span className="text-[10px] sm:text-xs">Patient</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType("doctor");
                  setEmail("doctor@demo.com");
                  setPassword("demo123");
                }}
                className={`flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  userType === "doctor"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <Stethoscope className="w-3 h-3" />
                <span className="text-[10px] sm:text-xs">Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType("pharmacist");
                  setEmail("pharmacist@demo.com");
                  setPassword("demo123");
                }}
                className={`flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  userType === "pharmacist"
                    ? "bg-white text-green-600 shadow-md"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                <Pill className="w-3 h-3" />
                <span className="text-[10px] sm:text-xs">Pharmacist</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">
                  Email
                </label>
                <div className="input-focus relative border-2 border-gray-200 rounded-lg px-2.5 py-2.5 sm:py-3 focus-within:border-blue-400 transition-all duration-300">
                  <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-7 sm:pl-8 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">
                  Password
                </label>
                <div className="input-focus relative border-2 border-gray-200 rounded-lg px-2.5 py-2.5 sm:py-3 focus-within:border-blue-400 transition-all duration-300">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                className="btn-hover w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-lg shadow-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                {loading ? (
                  <div className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                {loading
                  ? "Signing In..."
                  : userType === "doctor"
                  ? "Sign In as Doctor"
                  : userType === "pharmacist"
                  ? "Sign In as Pharmacist"
                  : "Sign In"}
              </button>
            </form>



            {/* Sign Up Links */}
            <div className="text-center mt-3 sm:mt-4">
              <p className="text-gray-600 text-[10px] sm:text-xs">
                {userType === "doctor" ? "New doctor?" : userType === "pharmacist" ? "New pharmacist?" : "Don't have an account?"}{" "}
                <a
                  href={userType === "doctor" ? "/doctor-register" : userType === "pharmacist" ? "/pharmacist-register" : "/auth/register"}
                  className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 hover:underline"
                >
                  {userType === "doctor" ? "Register here" : userType === "pharmacist" ? "Register here" : "Create account"}
                </a>
              </p>
            </div>

            {/* Mental Health Message */}
            <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-100">
              <p className="text-center text-[10px] sm:text-xs text-gray-600 leading-tight">
                <Heart className="inline w-3 h-3 text-emerald-500 mr-0.5" />
                Your healthcare journey starts here. We're here to help.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent"></div>
      </main>
    </>
  );
}
