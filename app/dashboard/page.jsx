"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ModernDashboard from "@/components/ModernDashboard";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.isPharmacist) {
      router.push("/dashboard/pharmacist");
    }
  }, [session, router]);

  if (session?.user?.isPharmacist) {
    return <div>Redirecting...</div>;
  }

  return <ModernDashboard />;
}