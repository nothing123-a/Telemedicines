"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import DoctorFooter from "@/components/DoctorFooter";

export default function DoctorLayout({ children }) {
  const [status, setStatus] = useState("offline");
  const [doctorName, setDoctorName] = useState("");
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const doctorEmail = session?.user?.email || "";

  // ✅ Fetch status if email is available
  useEffect(() => {
    if (!doctorEmail) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/doctor/${doctorEmail}`);
        const data = await res.json();
        setStatus(data?.isOnline ? "online" : "offline");
        setDoctorName(data?.name || "Doctor");
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
  }, [doctorEmail]);

  // ✅ Use useEffect for redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!session?.user?.email) {
      router.push("/auth/login");
    }
  }, [session, sessionStatus, router]);

  const handleLogout = async () => {
    try {
      if (doctorEmail) {
        await fetch("/api/doctor/status", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: doctorEmail, status: "offline" }),
        });
      }
      await signOut({ redirect: false });
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ While session is loading, show fallback
  if (sessionStatus === "loading") {
    return <div className="p-6">Loading your session...</div>;
  }

  // ✅ While redirecting, don’t render anything
  if (!session?.user?.email) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <main className="flex-1 w-full">{children}</main>
      <DoctorFooter />
    </div>
  );
}