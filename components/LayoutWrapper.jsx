"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/ModernFooter";
import PeriodNotifications from "@/components/PeriodNotifications";
import Sidebar from "@/components/ModernSidebar";
import VapiGenie from "@/components/VapiGenie";
import SimpleVoiceGenie from "@/components/SimpleVoiceGenie";
export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [userGender, setUserGender] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.email && mounted) {
      fetchUserProfile();
    }
  }, [session, mounted]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      setUserGender(data.user?.gender);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  if (!mounted) {
    return <main>{children}</main>;
  }

  const hideLayout =
    !session ||
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/doctor/register" ||
    pathname === "/doctor-register" ||
    pathname === "/pharmacist-register" ||
    pathname.startsWith("/chat-room") ||
    pathname.startsWith("/video-room") ||
    pathname.startsWith("/doctor") ||
    pathname === "/doctor" ||
    pathname.startsWith("/dashboard/pharmacist");

  const showSidebar = !hideLayout;
  


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {!hideLayout && (
        <header className="sticky top-0 z-50">
          <ModernNavbar />
        </header>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
        )}
        
        {/* Main Content */}
        <main className={`flex-1 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50`}>
          {children}
        </main>
      </div>

      {!hideLayout && (
        <footer className="bg-white shadow-inner border-t border-blue-100">
          <Footer />
        </footer>
      )}
      
      {/* Period Notifications for Female Users */}
      {!hideLayout && userGender === "female" && <PeriodNotifications />}
      
      {/* Hey Genie Voice Assistant */}
      {!hideLayout && <VapiGenie />}
      
      {/* Simple Voice Genie (Working Alternative) */}
      {/* {!hideLayout && <SimpleVoiceGenie />} */}
      
      {/* Genie Test Script */}
      {!hideLayout && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.testGenieAPI = async (query = "Hello, how are you?") => {
                console.log('🧪 Testing Genie API...');
                try {
                  const response = await fetch('/api/genie-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: query, userId: 'test-user' })
                  });
                  const data = await response.json();
                  console.log('✅ API Response:', data);
                  if (data.success && data.response) {
                    console.log('🤖 Genie says:', data.response);
                  }
                  return data;
                } catch (error) {
                  console.error('❌ API Error:', error);
                }
              };
              
              console.log('🧞♂️ Genie test function loaded!');
              console.log('Try: testGenieAPI("What are the symptoms of diabetes?")');            `
          }}
        />
      )}
    </div>
  );
}