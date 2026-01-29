"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DoctorConnectionModal from "./DoctorConnectionModal";
import io from "socket.io-client";

export default function EscalationButton() {
  const { data: session } = useSession();
  const [isEscalating, setIsEscalating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const socketInstance = io();
    setSocket(socketInstance);

    // Register user with both formats for compatibility
    socketInstance.emit("register-user", { userId: session.user.id });
    console.log('Registered user for escalation:', session.user.id);

    // Listen for doctor acceptance
    socketInstance.on("doctor-accepted", (data) => {
      setDoctorInfo({ name: data.doctorName });
      setRequestId(data.requestId);
      setShowModal(true);
      setIsEscalating(false);
    });

    // Listen for re-escalation notifications
    socketInstance.on("re-escalation-started", (data) => {
      console.log('Re-escalation notification received:', data);
      // Show a more informative message
      if (data.isDifferentDoctor) {
        alert(`🔄 We're connecting you with a different doctor: Dr. ${data.doctorName}`);
      } else {
        alert(`🔄 ${data.message}`);
      }
      setIsEscalating(true); // Show that we're processing
    });

    // Listen for no doctors available
    socketInstance.on("no-doctors-available", (data) => {
      console.log('No doctors available:', data);
      alert(`⚠️ ${data.message}`);
      setIsEscalating(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  const handleEscalate = async () => {
    if (!session?.user?.email) return;

    setIsEscalating(true);
    try {
      const response = await fetch("/api/escalate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Wait for doctor response
        console.log("Escalation request sent, waiting for doctor...");
      } else {
        // Handle no doctors available case
        console.log('No doctors available for escalation');
        alert('⚠️ No doctors are currently available. Please try again later or contact emergency services if this is urgent.');
        setIsEscalating(false);
      }
    } catch (error) {
      console.error("Escalation error:", error);
      setIsEscalating(false);
    }
  };

  if (!session) return null;

  return (
    <>
      <button
        onClick={handleEscalate}
        disabled={isEscalating}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition duration-200 ${
          isEscalating
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {isEscalating ? "🔄 Finding Doctor..." : "🚨 Escalate to Doctor"}
      </button>

      <DoctorConnectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        doctorName={doctorInfo?.name}
        requestId={requestId}
      />
    </>
  );
}