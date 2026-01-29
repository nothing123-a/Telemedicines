"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Heart, LogOut, User } from "lucide-react";

export default function UserNavbar() {
  const { data: session } = useSession();
  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-3 text-2xl font-bold text-blue-900 hover:text-blue-700 transition-colors duration-300"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Heart className="text-white w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Clarity Care 3.0
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-3 text-blue-700">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-semibold">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{session.user.name || 'User'}</p>
                    <p className="text-blue-500 text-xs">{session.user.email}</p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link href="/auth/login">
                  <button className="flex items-center gap-2 px-4 py-2 text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-all duration-300">
                    <User className="w-4 h-4" />
                    Login
                  </button>
                </Link>
                
                {/* Signup Button */}
                <Link href="/auth/register">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <Heart className="w-4 h-4" />
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}