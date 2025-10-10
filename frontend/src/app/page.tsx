'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();

  const handleAdminLogin = () => {
    router.push('/admin/login');
  };

  const handleVendorLogin = () => {
    router.push('/vendor/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100 relative overflow-hidden">

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05)_0%,transparent_50%)] opacity-60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.04)_0%,transparent_50%)] opacity-40"></div>

      {/* Two-Column Asymmetrical Layout */}
      <div className="relative z-10 grid lg:grid-cols-5 min-h-screen">

        {/* Left Column - Hero Text and Login Cards (3 columns) */}
        <div className="lg:col-span-3 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-16 lg:py-24">

          {/* Hero Section */}
          <div className="mb-20">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[0.9] mb-8">
              Vendor Onboarding &
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-600 leading-relaxed font-light max-w-2xl">
              Your centralized platform for seamless vendor relations and streamlined operations
            </p>
          </div>

          {/* Login Cards - Clean Vertical Stack */}
          <div className="space-y-8 max-w-lg">

            {/* Admin Card */}
            <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2 hover:scale-105 transition-all duration-500 group">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-6">
                  <div className="relative w-18 h-18 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-lg scale-110"></div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      Comprehensive vendor management and oversight
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-8">
                <Button
                  onClick={handleAdminLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] group-hover:scale-105"
                >
                  Access Admin Portal
                  <svg className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </CardContent>
            </Card>

            {/* Vendor Card */}
            <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-green-500/20 hover:-translate-y-2 hover:scale-105 transition-all duration-500 group">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-6">
                  <div className="relative w-18 h-18 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-green-500/40 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-400 to-green-600 opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-lg scale-110"></div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Vendor Portal</CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      Manage your business profile and documents
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-8">
                <Button
                  onClick={handleVendorLogin}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-8 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] group-hover:scale-105"
                >
                  Access Vendor Portal
                  <svg className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Right Column - Large Prominent Visual (2 columns) */}
        <div className="lg:col-span-2 flex items-center justify-center p-8 lg:p-16 bg-gradient-to-tl from-blue-50/30 via-transparent to-purple-50/20">
          <div className="relative w-full max-w-2xl aspect-square">

            {/* Main Animated Network Hub */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 800 800"
                className="w-full h-full drop-shadow-2xl"
                xmlns="http://www.w3.org/2000/svg"
              >

                {/* Background Glow Circles */}
                <circle cx="400" cy="400" r="350" fill="url(#outerGlow)" opacity="0.08" className="animate-pulse"/>
                <circle cx="400" cy="400" r="250" fill="url(#middleGlow)" opacity="0.12" className="animate-pulse" style={{animationDelay: '1s'}}/>
                <circle cx="400" cy="400" r="150" fill="url(#innerGlow)" opacity="0.15" className="animate-pulse" style={{animationDelay: '2s'}}/>

                {/* Central Hub - Large Glowing Core */}
                <circle cx="400" cy="400" r="25" fill="url(#centralCore)" className="drop-shadow-2xl">
                  <animate attributeName="r" values="22;28;22" dur="4s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite"/>
                </circle>

                {/* Primary Network Nodes - Large */}
                <g>
                  <circle cx="400" cy="200" r="18" fill="#3B82F6" className="drop-shadow-xl" filter="url(#nodeGlow)">
                    <animate attributeName="r" values="15;21;15" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="600" cy="400" r="18" fill="#10B981" className="drop-shadow-xl" filter="url(#nodeGlow)">
                    <animate attributeName="r" values="15;21;15" dur="3.5s" repeatCount="indefinite" begin="0.7s"/>
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2.8s" repeatCount="indefinite" begin="0.7s"/>
                  </circle>
                  <circle cx="400" cy="600" r="18" fill="#8B5CF6" className="drop-shadow-xl" filter="url(#nodeGlow)">
                    <animate attributeName="r" values="15;21;15" dur="3.2s" repeatCount="indefinite" begin="1.4s"/>
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2.3s" repeatCount="indefinite" begin="1.4s"/>
                  </circle>
                  <circle cx="200" cy="400" r="18" fill="#F59E0B" className="drop-shadow-xl" filter="url(#nodeGlow)">
                    <animate attributeName="r" values="15;21;15" dur="3.8s" repeatCount="indefinite" begin="0.3s"/>
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2.6s" repeatCount="indefinite" begin="0.3s"/>
                  </circle>
                </g>

                {/* Secondary Network Nodes - Medium */}
                <g>
                  <circle cx="530" cy="270" r="14" fill="#6366F1" className="drop-shadow-lg" filter="url(#nodeGlow)">
                    <animate attributeName="r" values="11;17;11" dur="4s" repeatCount="indefinite" begin="0.5s"/>
                  </circle>
                  <circle cx="530" cy="530" r="14" fill="#EF4444" className="drop-shadow-lg" filter="url(#nodeGlow)">
                    <animate attributeName="r" values="11;17;11" dur="4.3s" repeatCount="indefinite" begin="1.2s"/>
                  </circle>
                  <circle cx="270" cy="530" r="14" fill="#06B6D4" className="drop-shadow-lg" filter="url(#nodeGlow)">
                    <animate attributeName="r" values="11;17;11" dur="4.5s" repeatCount="indefinite" begin="0.8s"/>
                  </circle>
                  <circle cx="270" cy="270" r="14" fill="#84CC16" className="drop-shadow-lg" filter="url(#nodeGlow)">
                    <animate attributeName="r" values="11;17;11" dur="4.1s" repeatCount="indefinite" begin="1.8s"/>
                  </circle>
                </g>

                {/* Tertiary Network Nodes - Small */}
                <g>
                  <circle cx="350" cy="250" r="8" fill="#EC4899" className="drop-shadow-md">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" begin="0.2s"/>
                  </circle>
                  <circle cx="550" cy="350" r="8" fill="#14B8A6" className="drop-shadow-md">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="3.4s" repeatCount="indefinite" begin="1s"/>
                  </circle>
                  <circle cx="450" cy="550" r="8" fill="#F97316" className="drop-shadow-md">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="3.1s" repeatCount="indefinite" begin="1.6s"/>
                  </circle>
                  <circle cx="250" cy="450" r="8" fill="#A855F7" className="drop-shadow-md">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="3.7s" repeatCount="indefinite" begin="0.4s"/>
                  </circle>
                </g>

                {/* Connection Lines - Glowing with Animation */}
                <g stroke="url(#connectionGradient)" strokeWidth="3" fill="none" className="drop-shadow-sm">
                  <line x1="400" y1="400" x2="400" y2="200">
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="5s" repeatCount="indefinite"/>
                    <animate attributeName="stroke-width" values="2;4;2" dur="5s" repeatCount="indefinite"/>
                  </line>
                  <line x1="400" y1="400" x2="600" y2="400">
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="5.5s" repeatCount="indefinite" begin="1s"/>
                    <animate attributeName="stroke-width" values="2;4;2" dur="5.5s" repeatCount="indefinite" begin="1s"/>
                  </line>
                  <line x1="400" y1="400" x2="400" y2="600">
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="5.2s" repeatCount="indefinite" begin="2s"/>
                    <animate attributeName="stroke-width" values="2;4;2" dur="5.2s" repeatCount="indefinite" begin="2s"/>
                  </line>
                  <line x1="400" y1="400" x2="200" y2="400">
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="5.8s" repeatCount="indefinite" begin="0.5s"/>
                    <animate attributeName="stroke-width" values="2;4;2" dur="5.8s" repeatCount="indefinite" begin="0.5s"/>
                  </line>

                  {/* Secondary connections */}
                  <line x1="400" y1="400" x2="530" y2="270" opacity="0.4">
                    <animate attributeName="opacity" values="0.2;0.7;0.2" dur="6s" repeatCount="indefinite" begin="1.5s"/>
                  </line>
                  <line x1="400" y1="400" x2="530" y2="530" opacity="0.4">
                    <animate attributeName="opacity" values="0.2;0.7;0.2" dur="6.3s" repeatCount="indefinite" begin="2.2s"/>
                  </line>
                  <line x1="400" y1="400" x2="270" y2="530" opacity="0.4">
                    <animate attributeName="opacity" values="0.2;0.7;0.2" dur="6.1s" repeatCount="indefinite" begin="0.8s"/>
                  </line>
                  <line x1="400" y1="400" x2="270" y2="270" opacity="0.4">
                    <animate attributeName="opacity" values="0.2;0.7;0.2" dur="6.5s" repeatCount="indefinite" begin="3s"/>
                  </line>
                </g>

                {/* Data Flow Particles - Multiple Paths */}
                <g>
                  <circle r="4" fill="#3B82F6" opacity="0.9">
                    <animateMotion dur="8s" repeatCount="indefinite"
                      path="M400,400 L400,200 L600,400 L400,600 L200,400 L400,400"/>
                  </circle>
                  <circle r="3" fill="#10B981" opacity="0.8">
                    <animateMotion dur="10s" repeatCount="indefinite" begin="2s"
                      path="M400,400 L530,270 L600,400 L530,530 L400,600 L270,530 L200,400 L270,270 L400,400"/>
                  </circle>
                  <circle r="2" fill="#8B5CF6" opacity="0.7">
                    <animateMotion dur="12s" repeatCount="indefinite" begin="4s"
                      path="M400,400 L350,250 L550,350 L450,550 L250,450 L400,400"/>
                  </circle>
                </g>

                {/* Gradients and Effects */}
                <defs>
                  <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1"/>
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/>
                  </radialGradient>

                  <radialGradient id="middleGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                  </radialGradient>

                  <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
                  </radialGradient>

                  <radialGradient id="centralCore" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1"/>
                    <stop offset="20%" stopColor="#3B82F6" stopOpacity="0.9"/>
                    <stop offset="60%" stopColor="#1E40AF" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.6"/>
                  </radialGradient>

                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6"/>
                    <stop offset="25%" stopColor="#8B5CF6"/>
                    <stop offset="50%" stopColor="#10B981"/>
                    <stop offset="75%" stopColor="#F59E0B"/>
                    <stop offset="100%" stopColor="#EF4444"/>
                  </linearGradient>

                  {/* Node Glow Filter */}
                  <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

              </svg>
            </div>

            {/* Floating Accent Elements with Enhanced Animation */}
            <div className="absolute top-12 right-12 w-4 h-4 bg-blue-400/60 rounded-full animate-bounce blur-[0.5px]" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
            <div className="absolute top-1/4 left-8 w-3 h-3 bg-purple-400/50 rounded-full animate-bounce blur-[0.5px]" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
            <div className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-green-400/70 rounded-full animate-bounce blur-[0.5px]" style={{animationDelay: '3s', animationDuration: '4.5s'}}></div>
            <div className="absolute bottom-16 left-1/3 w-2 h-2 bg-indigo-400/40 rounded-full animate-bounce blur-[0.5px]" style={{animationDelay: '1s', animationDuration: '6s'}}></div>
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-pink-400/60 rounded-full animate-bounce blur-[0.5px]" style={{animationDelay: '4s', animationDuration: '3.5s'}}></div>

          </div>
        </div>

      </div>
    </div>
  );
}