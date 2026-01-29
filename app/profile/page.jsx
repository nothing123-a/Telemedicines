"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  User,
  Phone,
  Calendar,
  Users,
  Globe,
  Shield,
  Save,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    middleName: "",
    phoneNumber: "",
    emergencyNumber: "",
    birthdate: "",
    gender: "",
    language: "en",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  if (status === "loading") return;

  if (!session?.user) {
    router.push("/auth/login");
  } else {
    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setFormData({
              name: data.user.name || "",
              surname: data.user.surname || "",
              middleName: data.user.middleName || "",
              phoneNumber: data.user.phoneNumber || "",
              emergencyNumber: data.user.emergencyNumber || "",
              birthdate: data.user.birthdate
                ? data.user.birthdate.split("T")[0]
                : "",
              gender: data.user.gender || "",
              language: data.user.language || "en",
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }
}, [session, status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-teal-100/20"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg">
                  <User className="text-white w-8 h-8" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-emerald-800 mb-2">
                Complete Your Profile
              </h1>
              <p className="text-emerald-600/70 text-sm font-medium mb-4">
                Help us personalize your healthcare journey
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-emerald-600/60">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                  <User className="w-5 h-5" /> Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                    icon={<User className="w-4 h-4" />}
                  />
                  <FormField
                    label="Last Name"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    icon={<User className="w-4 h-4" />}
                  />
                </div>

                <FormField
                  label="Middle Name (Optional)"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Enter your middle name"
                  icon={<User className="w-4 h-4" />}
                />
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                  <Phone className="w-5 h-5" /> Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    type="tel"
                    required
                    icon={<Phone className="w-4 h-4" />}
                  />
                  <FormField
                    label="Emergency Contact"
                    name="emergencyNumber"
                    value={formData.emergencyNumber}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    type="tel"
                    required
                    icon={<Phone className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Personal Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Date of Birth"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    type="date"
                    required
                    icon={<Calendar className="w-4 h-4" />}
                  />
                  <SelectField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    icon={<Users className="w-4 h-4" />}
                    options={[
                      { value: "", label: "Select gender" },
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </div>


              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center gap-3 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium text-lg"
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? "Saving Profile..." : "Save Profile & Continue"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-emerald-500/60">
              Your information is encrypted and securely stored in compliance
              with healthcare privacy standards.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function FormField({ label, name, value, onChange, placeholder, type = "text", required = false, icon }) {
  return (
    <div className="group">
      <label className="block text-emerald-700 mb-2 text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="text-emerald-400 group-focus-within:text-emerald-600 transition-colors">
            {icon}
          </div>
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-4 py-3 bg-white/60 border border-emerald-200 rounded-xl text-emerald-800 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-300"
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, required = false, icon, options }) {
  return (
    <div className="group">
      <label className="block text-emerald-700 mb-2 text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <div className="text-emerald-400 group-focus-within:text-emerald-600 transition-colors">
            {icon}
          </div>
        </div>
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full pl-10 pr-4 py-3 bg-white/60 border border-emerald-200 rounded-xl text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-300 appearance-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}