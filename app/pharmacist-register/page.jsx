"use client";

import { useState } from "react";
import { Mail, Lock, User, Phone, UserPlus, ShieldCheck, Pill, Building } from "lucide-react";

export default function PharmacistRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    licenseNumber: "",
    pharmacyName: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/pharmacist/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isPharmacist: true }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Pharmacist registration successful! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-emerald-100/20"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative w-full max-w-lg mx-4">
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 relative overflow-hidden border border-white/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400"></div>
          
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
                <Pill className="text-white w-6 h-6" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-green-800 mb-1">
              Join as <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Pharmacist</span>
            </h1>
            <p className="text-green-600/70 text-sm font-medium mb-3">
              Register your pharmacy with Clarity Care
            </p>
            
            <div className="flex items-center justify-center gap-3 text-xs text-green-600/60">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Licensed</span>
              </div>
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-green-700 mb-1 text-sm font-medium">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-green-400 w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-green-200 rounded-xl text-green-800 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-green-700 mb-1 text-sm font-medium">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-green-400 w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@pharmacy.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-green-200 rounded-xl text-green-800 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-green-700 mb-1 text-sm font-medium">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="text-green-400 w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-green-200 rounded-xl text-green-800 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-green-700 mb-1 text-sm font-medium">License Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="text-green-400 w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="Pharmacy License #"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-green-200 rounded-xl text-green-800 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-green-700 mb-1 text-sm font-medium">Pharmacy Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="text-green-400 w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="pharmacyName"
                  placeholder="Your pharmacy name"
                  value={formData.pharmacyName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-green-200 rounded-xl text-green-800 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-green-700 mb-1 text-sm font-medium">Address</label>
              <textarea
                name="address"
                placeholder="Pharmacy address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="2"
                className="w-full px-4 py-2.5 bg-white/60 border border-green-200 rounded-xl text-green-800 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="group">
              <label className="block text-green-700 mb-1 text-sm font-medium">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-green-400 w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-green-200 rounded-xl text-green-800 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center gap-2 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-5"
            >
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Registering...
                  </div>
                ) : (
                  "Register as Pharmacist"
                )}
              </span>
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="text-center mt-6 pt-4 border-t border-green-100">
            <p className="text-green-600/70 text-sm">
              Already registered?{" "}
              <a
                href="/auth/login"
                className="text-green-700 font-semibold hover:text-green-800 transition-colors duration-200 hover:underline"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}