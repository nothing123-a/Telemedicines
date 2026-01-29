"use client";

import { useState } from "react";
import { Mail, Lock, User, Phone, UserPlus, ShieldCheck, Heart, Brain } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Registration successful! You can now sign in.");
        // Optionally redirect to /signin
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden px-4 py-6">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-teal-100/20"></div>
      <div className="absolute top-10 sm:top-20 left-4 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-20 w-20 h-20 sm:w-40 sm:h-40 bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-2 sm:left-10 w-12 h-12 sm:w-24 sm:h-24 bg-cyan-200/30 rounded-full blur-2xl animate-pulse delay-500"></div>

      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/20">
          {/* Subtle Accent Lines */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
          
          {/* Header Section */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg">
                <Brain className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-1">
              Join <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Clarity Care</span>
            </h1>
            <p className="text-emerald-600/70 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
              Your journey to better health starts here
            </p>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs text-emerald-600/60">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[10px] sm:text-xs">Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span className="text-[10px] sm:text-xs">Professional</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
            {/* Name Field */}
            <div className="group">
              <label className="block text-emerald-700 mb-1 text-xs sm:text-sm font-medium">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-emerald-400 w-3.5 h-3.5 sm:w-4 sm:h-4 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white/60 border border-emerald-200 rounded-xl text-emerald-800 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="block text-emerald-700 mb-1 text-sm font-medium">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-emerald-400 w-4 h-4 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-emerald-200 rounded-xl text-emerald-800 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="group">
              <label className="block text-emerald-700 mb-1 text-sm font-medium">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="text-emerald-400 w-4 h-4 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-emerald-200 rounded-xl text-emerald-800 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-emerald-700 mb-1 text-sm font-medium">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-emerald-400 w-4 h-4 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-emerald-200 rounded-xl text-emerald-800 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-300"
                />
              </div>
              <p className="text-xs text-emerald-600/60 mt-1">
                Use 8+ characters with letters, numbers & symbols
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium mt-4 sm:mt-5 text-sm sm:text-base"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              <span>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm">Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </span>
            </button>
          </form>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium ${
              message.includes('✅') 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-emerald-100">
            <p className="text-emerald-600/70 text-sm">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-emerald-700 font-semibold hover:text-emerald-800 transition-colors duration-200 hover:underline"
              >
                Sign In
              </a>
            </p>
          </div>

          {/* Privacy Note */}
          <div className="mt-3 text-center">
            <p className="text-xs text-emerald-500/60">
              By creating an account, you agree to our privacy practices
            </p>
          </div>
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-4 text-emerald-600/50 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}