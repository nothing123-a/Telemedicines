"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Brain, Heart, Shield, Phone, Mail, Clock, Star, CheckCircle, ArrowRight, Sparkles, Users, Globe, MessageCircle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const ctaButtonsRef = useRef(null);

  useEffect(() => {
    // Simple animation using CSS transitions and setTimeout
    const animateOnLoad = () => {
      setTimeout(() => {
        if (heroTitleRef.current) {
          heroTitleRef.current.style.opacity = '1';
          heroTitleRef.current.style.transform = 'translateY(0)';
        }
      }, 300);

      setTimeout(() => {
        if (heroSubtitleRef.current) {
          heroSubtitleRef.current.style.opacity = '1';
          heroSubtitleRef.current.style.transform = 'translateY(0)';
        }
      }, 600);

      setTimeout(() => {
        if (ctaButtonsRef.current) {
          ctaButtonsRef.current.style.opacity = '1';
          ctaButtonsRef.current.style.transform = 'translateY(0)';
        }
      }, 900);
    };

    animateOnLoad();

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const observeElements = document.querySelectorAll('.animate-on-scroll');
    observeElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-emerald-900 overflow-hidden relative">
      <style jsx>{`
        .floating-shape {
          animation: float 20s ease-in-out infinite;
        }
        .floating-shape:nth-child(2) {
          animation-delay: -5s;
          animation-duration: 25s;
        }
        .floating-shape:nth-child(3) {
          animation-delay: -10s;
          animation-duration: 15s;
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -30px) rotate(90deg); }
          50% { transform: translate(-20px, 20px) rotate(180deg); }
          75% { transform: translate(20px, -10px) rotate(270deg); }
        }
        
        .animate-fade-in {
          opacity: 0;
          transform: translateY(50px);
          transition: all 1s ease-out;
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(50px);
          transition: all 1s ease-out;
        }
        
        .btn-hover:hover {
          transform: translateY(-3px);
        }
        
        .card-hover:hover {
          transform: translateY(-10px);
        }
      `}</style>

      {/* Floating background shapes */}
      <div className="floating-shape absolute w-72 h-72 bg-emerald-200 rounded-full filter blur-3xl opacity-20 top-20 left-20" />
      <div className="floating-shape absolute w-64 h-64 bg-teal-200 rounded-full filter blur-3xl opacity-15 bottom-20 right-20" />
      <div className="floating-shape absolute w-48 h-48 bg-cyan-200 rounded-full filter blur-3xl opacity-20 bottom-32 left-10" />

      {/* Header */}
      <header className="sticky-navbar fixed top-0 w-full px-8 py-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg z-50 border-b border-emerald-100/50 dark:border-gray-700">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg">
              <Brain className="text-white w-5 h-5" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              Clarity Care
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors">Home</a>
              <a href="#services" className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors">Services</a>
              <a href="#about" className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors">About</a>
              <a href="#contact" className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors">Contact</a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="flex items-center justify-center min-h-screen px-8 text-center relative z-10 pt-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-xl">
              <Brain className="text-white w-10 h-10" />
            </div>
          </div>
          
          <h1 
            ref={heroTitleRef}
            className="animate-fade-in text-5xl md:text-7xl font-extrabold mb-8 leading-tight"
          >
            Your Safe Space for
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Mental Wellness
            </span>
          </h1>
          
          <p 
            ref={heroSubtitleRef}
            className="animate-fade-in text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-emerald-700/80 leading-relaxed font-medium"
          >
            Connect with compassionate AI mental health support, licensed professionals, and comprehensive wellness tools. 
            Take the first step towards better mental health today.
          </p>
          
          <div 
            ref={ctaButtonsRef}
            className="animate-fade-in flex flex-col md:flex-row gap-6 justify-center items-center"
          >
            <Link href="/signup">
              <button className="btn-hover px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform text-lg flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            
            <Link href="/auth/login">
              <button className="btn-hover px-10 py-4 bg-white/90 text-emerald-700 font-bold rounded-full border-2 border-emerald-200 backdrop-blur-sm hover:bg-white transition-all duration-300 transform text-lg flex items-center gap-3">
                <Users className="w-5 h-5" />
                Sign In
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-emerald-600/70 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Evidence-Based Care</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 px-8 bg-white/90 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="animate-on-scroll text-4xl md:text-5xl font-bold text-emerald-800 mb-6">
              Comprehensive Mental Health Support
            </h2>
            <p className="animate-on-scroll text-xl text-emerald-700/80 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with human expertise to provide personalized mental health care
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI Mental Companion",
                description: "Get immediate emotional support and guidance with our empathetic AI that understands your unique needs and provides personalized coping strategies.",
                gradient: "from-emerald-400 to-teal-500"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Licensed Therapists",
                description: "Connect with certified mental health professionals for deeper therapeutic support, counseling sessions, and professional treatment plans.",
                gradient: "from-teal-400 to-cyan-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Complete Privacy",
                description: "Your conversations are completely confidential and secure. We prioritize your privacy with end-to-end encryption and HIPAA compliance.",
                gradient: "from-cyan-400 to-blue-500"
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "Crisis Intervention",
                description: "Immediate crisis detection with real-time connection to emergency mental health professionals and local emergency services.",
                gradient: "from-red-400 to-pink-500"
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Mood-Based Therapy",
                description: "Personalized music therapy, mindfulness exercises, and mood tracking to support your emotional well-being throughout the day.",
                gradient: "from-purple-400 to-pink-500"
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Personal Growth",
                description: "Develop coping strategies, build resilience, and work towards your mental wellness goals with guided exercises and progress tracking.",
                gradient: "from-green-400 to-emerald-500"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="animate-on-scroll card-hover bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20 text-center transition-all duration-300 group"
              >
                <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-4">{feature.title}</h3>
                <p className="text-emerald-700/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-xl border border-white/20">
            <h2 className="animate-on-scroll text-3xl md:text-4xl font-bold text-center text-emerald-800 mb-12">
              Trusted by Thousands
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center animate-on-scroll">
                <div className="text-3xl md:text-4xl font-bold text-emerald-700 mb-2">15K+</div>
                <div className="text-emerald-600/70 text-sm font-medium">Lives Supported</div>
              </div>
              <div className="text-center animate-on-scroll">
                <div className="text-3xl md:text-4xl font-bold text-emerald-700 mb-2">100+</div>
                <div className="text-emerald-600/70 text-sm font-medium">Licensed Therapists</div>
              </div>
              <div className="text-center animate-on-scroll">
                <div className="text-3xl md:text-4xl font-bold text-emerald-700 mb-2">99.9%</div>
                <div className="text-emerald-600/70 text-sm font-medium">Uptime Guarantee</div>
              </div>
              <div className="text-center animate-on-scroll">
                <div className="flex items-center justify-center gap-1 text-3xl md:text-4xl font-bold text-emerald-700 mb-2">
                  4.9
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div className="text-emerald-600/70 text-sm font-medium">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-8 bg-white/90 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-6">
                Why Choose Clarity Care?
              </h2>
              <p className="text-xl text-emerald-700/80 mb-8 leading-relaxed">
                We believe mental health care should be accessible, personalized, and effective. Our platform combines the latest in AI technology with human expertise to provide comprehensive support.
              </p>
              
              <div className="space-y-4">
                {[
                  "Immediate AI support available 24/7",
                  "Licensed mental health professionals",
                  "Personalized treatment recommendations",
                  "Crisis intervention and emergency support",
                  "Secure, private, and HIPAA compliant"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-emerald-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="animate-on-scroll">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 shadow-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-xl mb-6 mx-auto">
                    <Heart className="text-white w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-800 mb-4">
                    Your Mental Health Matters
                  </h3>
                  <p className="text-emerald-700/80 leading-relaxed">
                    Join thousands who have found support, healing, and growth through our comprehensive mental wellness platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-16 px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center shadow-lg animate-on-scroll">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500 rounded-full shadow-lg mb-6 mx-auto">
              <Phone className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-red-700 mb-4">
              Mental Health Emergency?
            </h3>
            <p className="text-red-600 mb-6 text-lg">
              If you're having thoughts of self-harm or are in crisis, please reach out immediately:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-4 border border-red-200">
                <p className="text-red-700 font-bold text-lg">988</p>
                <p className="text-red-600 text-sm">Suicide & Crisis Lifeline</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-red-200">
                <p className="text-red-700 font-bold text-lg">911</p>
                <p className="text-red-600 text-sm">Emergency Services</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-12 shadow-2xl text-white">
            <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="animate-on-scroll text-4xl md:text-5xl font-bold mb-6">
              Ready to Begin Your Healing Journey?
            </h2>
            <p className="animate-on-scroll text-xl mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto">
              Take the first step towards better mental health. You don't have to face your challenges alone - we're here to support you every step of the way.
            </p>
            <Link href="/signup">
              <button className="animate-on-scroll btn-hover px-12 py-5 bg-white text-emerald-700 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform text-lg flex items-center gap-3 mx-auto">
                <Brain className="w-5 h-5" />
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-t border-emerald-100/50 pt-16 pb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
        
        <div className="relative max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg">
                  <Brain className="text-white w-5 h-5" />
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  Clarity Care
                </div>
              </div>
              <p className="text-emerald-700/70 text-sm leading-relaxed">
                Empowering mental wellness through compassionate AI support and professional care.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold text-emerald-800 mb-4">Contact Us</h4>
              <div className="space-y-2 text-emerald-700/70 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-MIND</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>support@claritycare.health</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Crisis Support Available</span>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold text-emerald-800 mb-4">Legal & Privacy</h4>
              <div className="space-y-2">
                <a href="/privacy" className="block text-emerald-700/70 hover:text-emerald-800 text-sm transition-colors">Privacy Policy</a>
                <a href="/terms" className="block text-emerald-700/70 hover:text-emerald-800 text-sm transition-colors">Terms of Service</a>
                <a href="/hipaa" className="block text-emerald-700/70 hover:text-emerald-800 text-sm transition-colors">HIPAA Notice</a>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-100 pt-8 text-center">
            <p className="text-emerald-600/70 text-sm">
              © {new Date().getFullYear()} Clarity Care Healthcare Platform. Your health matters. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}