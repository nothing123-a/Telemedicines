"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Stethoscope, 
  Pill, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Activity,
  MessageSquare,
  Calendar,
  FileText,
  Settings
} from 'lucide-react';

export default function DoctorSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: 'Doctor Dashboard',
      items: [
        { href: '/doctor', label: 'Dashboard', icon: Activity, description: 'Doctor Overview' },
        { href: '/doctor/patients', label: 'Patients', icon: Users, description: 'Patient Management' },
        { href: '/doctor/appointments', label: 'Appointments', icon: Calendar, description: 'Schedule Management' },
        { href: '/doctor/consultations', label: 'Consultations', icon: MessageSquare, description: 'Chat & Video Calls' },
        { href: '/doctor/reports', label: 'Reports', icon: FileText, description: 'Medical Reports' },
        { href: '/doctor/settings', label: 'Settings', icon: Settings, description: 'Doctor Settings' }
      ]
    },
    {
      title: 'Pharmacist Dashboard',
      items: [
        { href: '/pharmacist', label: 'Pharmacy Dashboard', icon: Pill, description: 'Pharmacy Overview' },
        { href: '/pharmacist/inventory', label: 'Inventory', icon: FileText, description: 'Stock Management' },
        { href: '/pharmacist/orders', label: 'Orders', icon: Users, description: 'Order Management' },
        { href: '/pharmacist/offline-checker', label: 'Medicine Checker', icon: Activity, description: 'Availability Updates' }
      ]
    }
  ];

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col fixed left-0 top-0 z-40`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </button>

      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl">
            <Stethoscope className="text-white w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                Clarity Care
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Professional Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
            )}
            
            <div className="space-y-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex-1">
                        <p className="font-medium">{item.label}</p>
                        <p className={`text-xs ${isActive ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {item.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}