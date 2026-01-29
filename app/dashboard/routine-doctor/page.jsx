"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageSquare, Video, FileText, Clock, Users, Shield, ArrowRight } from "lucide-react";

export default function RoutineDoctorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const connectionOptions = [
    {
      id: "chat",
      title: "Chat Consultation",
      description: "Connect with a doctor via secure text messaging",
      icon: MessageSquare,
      color: "blue",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      id: "video",
      title: "Video Call",
      description: "Face-to-face consultation with a qualified doctor",
      icon: Video,
      color: "green",
      gradient: "from-green-400 to-green-600"
    }
  ];

  const handleSubmitRequest = async () => {
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/routine-doctor/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          userName: session?.user?.name,
          userEmail: session?.user?.email,
          connectionType: selectedOption,
          note: note.trim(),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        router.push("/dashboard/routine-doctor/waiting");
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white border-b border-orange-200 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-full sm:max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Routine Doctor Consultation</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Connect with qualified doctors for your healthcare needs</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">Doctors Available 24/7</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium">Average Response: &lt; 5 minutes</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 font-medium">HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Choose Your Consultation Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {connectionOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`cursor-pointer p-4 sm:p-6 rounded-2xl border-2 transition-all duration-200 ${
                  selectedOption === option.id
                    ? "border-orange-400 bg-orange-50 shadow-lg sm:scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${option.gradient} rounded-xl flex items-center justify-center`}>
                    <option.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{option.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{option.description}</p>
                  </div>
                </div>
                
                {selectedOption === option.id && (
                  <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                    <p className="text-orange-700 text-sm font-medium flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Selected for consultation
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Additional Notes (Optional)</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-900">Describe your concern</h3>
                <p className="text-xs sm:text-sm text-gray-600">Help the doctor understand your needs better</p>
              </div>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe your symptoms, concerns, or questions for the doctor..."
              className="w-full h-24 sm:h-32 p-3 sm:p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">This information will be shared with the doctor</p>
              <p className="text-xs text-gray-500">{note.length}/500</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Ready to Connect?</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {selectedOption 
                  ? `You'll be connected via ${connectionOptions.find(opt => opt.id === selectedOption)?.title.toLowerCase()}`
                  : "Please select a consultation method above"
                }
              </p>
            </div>
            <button
              onClick={handleSubmitRequest}
              disabled={!selectedOption || isSubmitting}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                selectedOption && !isSubmitting
                  ? "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Connect with Doctor
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}