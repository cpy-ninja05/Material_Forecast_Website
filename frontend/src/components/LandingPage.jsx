import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Shield, 
  IndianRupee,
  Users,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  Package,
  MapPin,
  LineChart
} from 'lucide-react';
import PlanGridLogo from '/PlanGrid.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const imageContainerRef = useRef(null);

  // Handle mouse move for 3D tilt effect
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to image center
    const x = e.clientX - rect.left; // Mouse X position within element
    const y = e.clientY - rect.top;  // Mouse Y position within element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (-20 to +20 degrees)
    const rotateY = ((x - centerX) / centerX) * 15; // Left-right tilt
    const rotateX = -((y - centerY) / centerY) * 15; // Up-down tilt (inverted)
    
    setTilt({ rotateX, rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0 }); // Reset to center
  };

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "AI Material Forecasting",
      description: "Predict exact quantities of steel, copper, cement, aluminum, insulators, conductors, and transformers using ML algorithms trained on historical power grid data."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "ROW Risk Dashboard",
      description: "Comprehensive Right-of-Way risk assessment with analytics on high/medium/low risk zones, population density analysis, and land acquisition complexity scores."
    },
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      title: "Geospatial Mapping",
      description: "Interactive maps showing transmission line routes, substation locations, risk zones, and project sites across India with real-time project status."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: "Analytics Dashboard",
      description: "Real-time tracking of forecast accuracy, active projects, material trends, budget utilization, and demand patterns with interactive charts."
    },
    {
      icon: <Package className="h-8 w-8 text-blue-600" />,
      title: "Inventory Management",
      description: "Track material stock levels, warehouse locations, reorder points, and consumption rates for towers, cables, insulators, and transformers."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Team Collaboration",
      description: "Invite team members, assign roles, share project forecasts, and collaborate across departments with secure access control."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Input Project Details",
      description: "Enter transmission line specifications, substation type, voltage levels, and route length.",
      icon: <Calendar className="h-12 w-12 text-blue-600" />
    },
    {
      step: "2",
      title: "AI Material Forecast",
      description: "Machine learning algorithms predict exact quantities of towers, conductors, insulators, and transformers.",
      icon: <Zap className="h-12 w-12 text-blue-600" />
    },
    {
      step: "3",
      title: "ROW Risk Analysis",
      description: "Assess Right-of-Way acquisition risks with population density, land-use, and terrain analysis.",
      icon: <Shield className="h-12 w-12 text-blue-600" />
    },
    {
      step: "4",
      title: "Track & Optimize",
      description: "Monitor material consumption, track forecast accuracy, and optimize procurement in real-time.",
      icon: <TrendingUp className="h-12 w-12 text-blue-600" />
    }
  ];

  const stats = [
    { number: "90%+", label: "Forecast Accuracy" },
    { number: "7+", label: "Material Types" },
    { number: "30%", label: "Cost Reduction" },
    { number: "Real-time", label: "ROW Risk Analysis" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm dark:shadow-gray-800/50 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                <img src={PlanGridLogo} alt="PlanGrid" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">PlanGrid</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/auth')}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 
                className="text-5xl md:text-6xl text-left font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                style={{
                  animation: 'fadeInUp 0.8s ease-out forwards',
                  opacity: 0
                }}
              >
                Get more done with{' '}
                <span className="text-blue-600">PlanGrid</span>
              </h1>
              <p 
                className="text-xl text-gray-600 text-left dark:text-gray-300 mb-8 leading-relaxed"
                style={{
                  animation: 'fadeInUp 0.8s ease-out forwards',
                  animationDelay: '0.2s',
                  opacity: 0
                }}
              >
                AI-powered material demand forecasting and Right-of-Way risk assessment platform 
                for transmission lines and substation infrastructure projects across India.
              </p>
              <div 
                className="flex flex-wrap gap-4 mb-8"
                style={{
                  animation: 'fadeInUp 0.8s ease-out forwards',
                  animationDelay: '0.4s',
                  opacity: 0
                }}
              >
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold text-lg shadow-md hover:shadow-lg hover-lift"
                >
                  Log In
                </button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold text-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  See Features
                </button>
              </div>
              <div 
                className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300"
                style={{
                  animation: 'fadeInUp 0.8s ease-out forwards',
                  animationDelay: '0.6s',
                  opacity: 0
                }}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Free plan available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            <div className="animate-float">
              <div 
                ref={imageContainerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative transform-gpu group"
                style={{
                  animation: 'fadeInRight 0.8s ease-out forwards',
                  animationDelay: '0.3s',
                  opacity: 0,
                  transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${isHovering ? '1.12' : '1.1'})`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                {/* Dashboard preview image - Interactive 3D tilt effect + floating */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-[1.03] relative">
                  <img 
                    src={`${import.meta.env.BASE_URL}${isDark ? 'Dashboard-dark.png' : 'Dashboard.jpg'}`}
                    alt="PlanGrid Dashboard Preview" 
                    className="w-full h-auto select-none"
                    draggable="false"
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      console.log('Current theme isDark:', isDark);
                    }}
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>
                </div>
                {/* Decorative elements with subtle animation - pointer-events-none so they don't block hover */}
                <div 
                  className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 dark:bg-blue-500 rounded-full opacity-20 dark:opacity-30 blur-xl animate-pulse-slow pointer-events-none"
                  style={{
                    transform: `translate(${tilt.rotateY * -0.5}px, ${tilt.rotateX * 0.5}px)`,
                    transition: 'transform 0.15s ease-out'
                  }}
                ></div>
                <div 
                  className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-200 dark:bg-indigo-500 rounded-full opacity-20 dark:opacity-30 blur-xl animate-pulse-slow pointer-events-none" 
                  style={{
                    animationDelay: '1s',
                    transform: `translate(${tilt.rotateY * 0.8}px, ${tilt.rotateX * -0.8}px)`,
                    transition: 'transform 0.15s ease-out'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 overflow-hidden relative">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center transform hover:scale-105 transition-transform duration-300"
                style={{
                  animation: 'fadeInUp 0.8s ease-out forwards',
                  animationDelay: `${index * 0.2}s`,
                  opacity: 0
                }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2 uppercase tracking-wide animate-fade-in">POWERFUL FEATURES</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-up">
              Complete Material Forecasting Suite
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-slide-up" style={{animationDelay: '0.1s'}}>
              From AI predictions to ROW risk analysis - everything you need for accurate power grid project planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 group hover-lift"
                style={{
                  animation: 'fadeInUp 0.8s ease-out forwards',
                  animationDelay: `${index * 0.15}s`,
                  opacity: 0
                }}
              >
                <div className="mb-4 transform group-hover:scale-105 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Power Grid Image Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Specialized for Power Grid Infrastructure
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                From transmission towers to substations, PlanGrid delivers accurate material forecasts 
                and ROW risk assessments for India's power grid expansion projects.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0 transform group-hover:scale-110 transition-all duration-300" />
                  <div className="transition-all duration-300 group-hover:translate-x-1">
                    <span className="text-gray-700 dark:text-gray-200 block">
                      <strong>Transmission Lines:</strong> Suspension, Tension, Terminal, and Transposition tower forecasts
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">132kV, 220kV, 400kV, 765kV & HVDC configurations</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0 transform group-hover:scale-110 transition-all duration-300" />
                  <div className="transition-all duration-300 group-hover:translate-x-1">
                    <span className="text-gray-700 dark:text-gray-200 block">
                      <strong>Material Prediction:</strong> Steel, Copper, Cement, Aluminum, Insulators, Conductors & Transformers
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">ML-powered quantity estimation with 95%+ accuracy</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0 transform group-hover:scale-110 transition-all duration-300" />
                  <div className="transition-all duration-300 group-hover:translate-x-1">
                    <span className="text-gray-700 dark:text-gray-200 block">
                      <strong>ROW Risk Analysis:</strong> Population density, land-use, and terrain complexity assessment
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">High/Medium/Low risk zones with acquisition cost estimates</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0 transform group-hover:scale-110 transition-all duration-300" />
                  <div className="transition-all duration-300 group-hover:translate-x-1">
                    <span className="text-gray-700 dark:text-gray-200 block">
                      <strong>Substation Types:</strong> AIS and GIS configurations from 132kV to 765kV
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Automated equipment and material requirement calculation</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative group animate-float">
              {/* Power Grid Infrastructure Image */}
              <div className="rounded-2xl shadow-2xl overflow-hidden relative transform transition-all duration-500 group-hover:shadow-3xl group-hover:scale-[1.02]">
                <img 
                  src={`${import.meta.env.BASE_URL}PowerGrid.png`}
                  alt="Power Grid Infrastructure - Transmission Towers" 
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    console.error('PowerGrid image failed to load:', e.target.src);
                    // Fallback to placeholder if image doesn't load
                    e.target.parentElement.innerHTML = `
                      <div class="aspect-video bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 flex items-center justify-center">
                        <div class="text-white text-center p-8">
                          <p class="text-lg font-semibold">Power Grid Infrastructure Image</p>
                          <p class="text-sm opacity-75 mt-2">Add PowerGrid.png to frontend/public folder</p>
                        </div>
                      </div>
                    `;
                  }}
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {/* Decorative corner accent - animated - pointer-events-none so they don't block hover */}
              <div 
                className="absolute -top-4 -right-4 w-32 h-32 bg-blue-200 dark:bg-blue-500 rounded-full opacity-20 dark:opacity-30 blur-2xl animate-pulse-slow pointer-events-none"
                style={{ animationDelay: '0s' }}
              ></div>
              <div 
                className="absolute -bottom-4 -left-4 w-40 h-40 bg-indigo-200 dark:bg-indigo-500 rounded-full opacity-20 dark:opacity-30 blur-2xl animate-pulse-slow pointer-events-none"
                style={{ animationDelay: '1.5s' }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2 uppercase tracking-wide">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Simple process, powerful results
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get started in minutes and see improved team productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div 
                key={index} 
                className="text-center group"
                style={{
                  animation: 'fadeInUp 0.8s ease-out forwards',
                  animationDelay: `${index * 0.2}s`,
                  opacity: 0
                }}
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-105 transition-all duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-blue-700 dark:group-hover:bg-blue-600 transition-colors duration-300">
                    {step.step}
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-12 w-24 h-0.5 bg-blue-200 dark:bg-blue-800"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-10 -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full opacity-10 translate-x-48 translate-y-48"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-slide-up">
            Ready to transform your power grid planning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            Join leading power grid organizations using PlanGrid for accurate material forecasting and ROW risk assessment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              Log In
            </button>
            <button
              className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-400 transition-colors font-semibold text-lg border-2 border-blue-400"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  <img src={PlanGridLogo} alt="PlanGrid" className="w-full h-full object-cover" />
                </div>
                <span className="text-2xl font-bold text-white">PlanGrid</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered material forecasting platform for power grid infrastructure projects.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 PlanGrid. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        /* Subtle fade in animation */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Gentle fade in */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        /* Subtle slide up */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Fade in from right */
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Floating animation - smooth up and down motion */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        /* Subtle pulse for decorative elements */
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.05);
          }
        }
        
        /* Gentle glow effect */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
          }
        }
        
        /* Subtle gradient animation */
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.9s ease-out forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Hover lift effect */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        /* 3D Transform optimization */
        .transform-gpu {
          transform-style: preserve-3d;
          will-change: transform;
        }
        
        /* Enhanced shadow for 3D effect */
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 50px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

