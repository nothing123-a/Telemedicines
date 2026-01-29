"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  Brain, 
  CalendarHeart, 
  MessageSquare, 
  Lock, 
  Heart, 
  UserCheck,
  Shield,
  FileText,
  Droplets,
  Pill,
  MapPin
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userGender, setUserGender] = useState(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      setUserGender(data.user?.gender);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const menuSections = [
    {
      title: "Mental Health",
      items: [
        { href: "/dashboard/mental-counselor", label: "AI Mental Counselor", icon: Brain },
        { href: "/dashboard/mental-counselor/chat-history", label: "Chat History", icon: MessageSquare },
        { 
          href: "/dashboard/mental-counselor/period-tracker", 
          label: "Period Tracker", 
          icon: CalendarHeart,
          locked: userGender !== "female"
        },
      ]
    },
    {
      title: "Medical Services",
      items: [
        { href: "/dashboard/health-advisor", label: "Health Report Advisor", icon: FileText },
        { href: "/dashboard/blood-bank", label: "Blood Bank Services", icon: Droplets },
        { href: "/dashboard/blood-bank/medicines", label: "My Medicines", icon: Pill },
      ]
    },
    {
      title: "Nearby Services",
      items: [
        { href: "/dashboard/blood-bank", label: "Find Blood Banks", icon: MapPin },
      ]
    },
    {
      title: "Account",
      items: [
        { href: "/profile", label: "Profile Settings", icon: UserCheck },
      ]
    }
  ];

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-blue-200 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-blue-200">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Heart className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map(({ href, label, icon: Icon, locked }) => {
                if (locked) {
                  return (
                    <div
                      key={href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 cursor-not-allowed relative group"
                      title="Available for female users only"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                      <Lock className="w-3 h-3 ml-auto" />
                    </div>
                  );
                }
                
                const isActive = pathname === href || pathname.startsWith(href + '/');
                
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-blue-100 text-blue-800 font-semibold shadow-sm border border-blue-200"
                        : "text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-blue-500'}`} />
                    <span className="text-sm font-medium">{label}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-200 mt-auto">
        <div className="text-xs text-blue-600 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Shield className="w-3 h-3" />
            <span>HIPAA Compliant</span>
          </div>
          <p>Secure Healthcare Platform</p>
        </div>
      </div>
    </aside>
  );
}