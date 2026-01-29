import { Brain, Heart, Shield, Phone, Mail, MapPin, Clock, Star, CheckCircle, Globe } from "lucide-react";

export default function MentalCounselorFooter() {
  return (
    <footer className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-t border-emerald-100/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg">
                <Brain className="text-white w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  Minds
                </h3>
              </div>
            </div>
            
            <p className="text-emerald-700/80 text-xs leading-relaxed mb-3">
              AI-powered mental wellness platform
            </p>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs text-emerald-600/70">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>HIPAA</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Licensed</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>24/7</span>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">Services</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <a href="/dashboard/mental-counselor" className="text-emerald-700/70 hover:text-emerald-800 transition-colors">AI Counselor</a>
              <a href="/dashboard/reports-analyzer" className="text-emerald-700/70 hover:text-emerald-800 transition-colors">Report Analysis</a>
              <a href="/dashboard/pharmacy" className="text-emerald-700/70 hover:text-emerald-800 transition-colors">Pharmacy</a>
              <a href="/dashboard/emergency-sos" className="text-emerald-700/70 hover:text-emerald-800 transition-colors">Emergency</a>
            </div>
          </div>

          {/* Contact & Emergency Section */}
          <div>
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">Emergency Support</h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-xs font-medium mb-1">🚨 Crisis Support</p>
              <div className="text-xs text-red-600">
                <p>• 988 - Crisis Lifeline</p>
                <p>• 911 - Emergency</p>
              </div>
            </div>
            <div className="mt-2 space-y-1 text-xs text-emerald-700/70">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>+1 (555) 123-MIND</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span>support@minds.care</span>
              </div>
            </div>
          </div>
        </div>



        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-emerald-100 space-y-2 md:space-y-0">
          <div className="text-emerald-600/70 text-xs">
            © {new Date().getFullYear()} Minds. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-emerald-600/70">
            <a href="/privacy" className="hover:text-emerald-800">Privacy</a>
            <a href="/terms" className="hover:text-emerald-800">Terms</a>
            <a href="/help" className="hover:text-emerald-800">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
}