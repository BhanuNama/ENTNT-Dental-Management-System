import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { 
  Calendar, 
  Users, 
  Shield, 
  Heart, 
  Clock, 
  Stethoscope,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };



  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/Dental-Logo.png" 
                alt="ENTNT Dental Connect Logo" 
                className="h-16 w-16 object-contain rounded-xl shadow-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ENTNT Dental Connect</h1>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Professional Care</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium">Home</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium">Services</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium">About</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium">Contact</a>
              </nav>
              <Button 
                onClick={handleLoginClick}
                variant="primary"
                size="md"
                className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Login Here
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Welcome to ENTNT Dental Connect</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Comprehensive
                  <br />
                  <span className="text-blue-600">Dental Services</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                  Few orthodontists in the New York City area have treated more patients 
                  with advanced technology than our experienced team. 
                  This vast experience leads to efficient treatment with outstanding results.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleLoginClick}
                  variant="primary"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Online
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 px-8 py-3"
                >
                  Our Services
                </Button>
              </div>

              {/* Professional Statistics Cards - Inspired by references */}
              <div className="flex items-center space-x-6 pt-8">
                <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-lg">
                  <div className="text-2xl font-bold">25</div>
                  <div className="text-sm opacity-90">years of<br/>experience</div>
                </div>
                <div className="bg-green-600 text-white rounded-2xl p-4 shadow-lg">
                  <div className="text-2xl font-bold">+50k</div>
                  <div className="text-sm opacity-90">satisfied<br/>customers</div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">99%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Interactive Cards - Inspired by reference designs */}
              <div className="flex items-center space-x-4 pt-6">
                {/* Video consultation card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <div className="w-12 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-blue-600 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <div className="font-medium">Watch our</div>
                    <div>dental consultation</div>
                  </div>
                </div>

                {/* Quick call card */}
                <div className="bg-green-500 text-white rounded-xl p-3 shadow-lg flex items-center space-x-2 cursor-pointer hover:bg-green-600 transition-colors">
                  <Phone className="h-4 w-4" />
                  <div className="text-xs">
                    <div className="font-medium">Do you want</div>
                    <div>a quick call?</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              {/* Organic Background Shapes - Inspired by references */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Large organic blue shape */}
                <div className="absolute top-0 right-0 w-96 h-96 opacity-30">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <path fill="#3b82f6" d="M40.7,-69.9C53.1,-63.3,64.3,-51.4,71.8,-36.8C79.2,-22.2,82.9,-4.9,82.1,12.7C81.3,30.3,76,48.2,65.8,61.8C55.6,75.4,40.5,84.7,23.9,88.2C7.3,91.7,-10.8,89.4,-27.3,82.3C-43.8,75.2,-58.7,63.3,-68.8,47.8C-78.9,32.3,-84.2,13.2,-83.4,-6.1C-82.6,-25.4,-75.7,-44.9,-63.8,-59.1C-51.9,-73.3,-35,-82.2,-17.6,-87.2C-0.2,-92.2,17.7,-93.3,32.9,-88.4C48.1,-83.5,60.6,-72.6,68.5,-58.8"/>
                  </svg>
                </div>
                {/* Medium organic green shape */}
                <div className="absolute bottom-0 left-0 w-64 h-64 opacity-25">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <path fill="#10b981" d="M47.1,-57.8C60.9,-47.3,72.1,-31.8,76.8,-14.2C81.5,3.4,79.7,23.1,71.1,39.9C62.5,56.7,47.1,70.6,29.8,78.1C12.5,85.6,-6.7,86.7,-24.8,81.4C-42.9,76.1,-59.9,64.4,-71.2,47.8C-82.5,31.2,-88.1,9.7,-87.4,-12.3C-86.7,-34.3,-79.7,-56.8,-65.8,-67.7C-51.9,-78.6,-31.1,-78,-12.6,-81.2C5.9,-84.4,21.5,-91.4,35.3,-92.2"/>
                  </svg>
                </div>
              </div>
              
              {/* Main Image Container */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <div className="aspect-[4/3] relative">
                  {/* Patient Image - Will be replaced with actual image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30">
                    {/* Image placeholder - replace with actual patient image */}
                    <img 
                      src="/patient-hero.png" 
                      alt="Happy dental patient" 
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        // Fallback if image doesn't exist yet
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) nextElement.style.display = 'flex';
                      }}
                    />
                    {/* Fallback content */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                      <div className="text-center text-gray-800 dark:text-gray-200">
                        <img 
                          src="/Dental-Logo.png" 
                          alt="ENTNT Dental Connect Logo" 
                          className="h-24 w-24 object-contain rounded-2xl shadow-xl mx-auto mb-4"
                        />
                        <div className="text-lg font-semibold">Add patient-hero.jpg</div>
                        <div className="text-sm opacity-90">to public folder</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overlay gradient for better text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">HIPAA Compliant</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Secure & Private</div>
                  </div>
                </div>
              </div>

              {/* Top Right Floating Element */}
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 fill-current text-yellow-300" />
                  <div className="text-sm font-semibold">5.0 Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Dental Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Few dental practices in the area have treated more patients with our advanced technology and experienced team.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 relative overflow-hidden" padding="lg">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
              <div className="relative">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">General Dentistry</h3>
                <p className="text-gray-600 dark:text-gray-300">Complete oral health care including cleanings, fillings, and preventive treatments.</p>
              </div>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 relative overflow-hidden" padding="lg">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full -translate-y-8 translate-x-8 opacity-60"></div>
              <div className="relative">
                <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Cosmetic Dentistry</h3>
                <p className="text-gray-600 dark:text-gray-300">Transform your smile with whitening, veneers, and aesthetic treatments.</p>
              </div>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 relative overflow-hidden" padding="lg">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-full -translate-y-12 translate-x-12 opacity-40"></div>
              <div className="relative">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Emergency Care</h3>
                <p className="text-gray-600 dark:text-gray-300">Immediate dental care when you need it most, available 24/7.</p>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-200 dark:bg-blue-700 rounded-full -translate-y-6 translate-x-6 opacity-50"></div>
                <div className="relative">
                  <div className="text-3xl font-bold text-blue-600 mb-1">25</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-10 h-10 bg-green-200 dark:bg-green-700 rounded-full -translate-y-5 translate-x-5 opacity-60"></div>
                <div className="relative">
                  <div className="text-3xl font-bold text-green-600 mb-1">50K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Satisfied Patients</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-14 h-14 bg-purple-200 dark:bg-purple-700 rounded-full -translate-y-7 translate-x-7 opacity-40"></div>
                <div className="relative">
                  <div className="text-3xl font-bold text-purple-600 mb-1">99.8%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-orange-200 dark:bg-orange-700 rounded-full -translate-y-4 translate-x-4 opacity-70"></div>
                <div className="relative">
                  <div className="text-3xl font-bold text-orange-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Emergency Care</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Patients Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real stories from real patients who trust us with their smiles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="relative">
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-4 right-4 w-24 h-24 bg-blue-300 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-green-300 rounded-full opacity-30 blur-lg"></div>
              </div>
              
              <Card className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-full" padding="lg">
                <div className="flex items-start space-x-4 mb-4">
                  {/* Patient Avatar */}
                  <div className="relative w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/Dental-Logo.png" 
                      alt="Patient Avatar" 
                      className="h-12 w-12 object-contain rounded-full"
                    />
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Mitchell</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Regular Patient</p>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  "Dr. Johnson and her team are absolutely amazing! The technology they use is cutting-edge and the care is exceptional. I've never had such a comfortable dental experience."
                </p>
              </Card>
            </div>

            {/* Testimonial 2 */}
            <div className="relative">
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-4 left-4 w-20 h-20 bg-green-300 rounded-full opacity-25 blur-xl"></div>
                <div className="absolute bottom-4 right-4 w-18 h-18 bg-purple-300 rounded-full opacity-20 blur-lg"></div>
              </div>
              
              <Card className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-full" padding="lg">
                <div className="flex items-start space-x-4 mb-4">
                  {/* Patient Avatar */}
                  <div className="relative w-16 h-16 bg-gradient-to-br from-green-200 to-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full p-2">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    {/* Verified badge */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Michael Chen</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cosmetic Patient</p>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  "My smile transformation exceeded all expectations. The team was professional, gentle, and the results speak for themselves. Highly recommend!"
                </p>
              </Card>
            </div>

            {/* Testimonial 3 */}
            <div className="relative">
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-4 right-4 w-16 h-16 bg-purple-300 rounded-full opacity-30 blur-lg"></div>
                <div className="absolute bottom-4 left-4 w-22 h-22 bg-blue-300 rounded-full opacity-25 blur-xl"></div>
              </div>
              
              <Card className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-full" padding="lg">
                <div className="flex items-start space-x-4 mb-4">
                  {/* Patient Avatar */}
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-200 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full p-2">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    {/* Premium badge */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <Star className="h-3 w-3 text-white fill-current" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Emily Rodriguez</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Family Patient</p>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  "Our whole family comes here. The kids love the friendly staff and modern equipment. It's made dental visits something we actually look forward to!"
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  9 Ways of Your Dental Care
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Our professional doctors will take care of your dental health. 
                  Choose your desired time below and we'll help out.
                </p>
              </div>

              {/* Appointment Booking Card */}
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" padding="lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Book an Appointment</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-900 dark:text-white">New York, NY</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-900 dark:text-white">Select Date</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Patients</label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-900 dark:text-white">1 Adult</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleLoginClick}
                    variant="primary" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Content - Doctor Profile */}
            <div className="space-y-8">
              {/* Doctor Card with Background Elements */}
              <div className="relative">
                {/* Background Decorative Shapes */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute top-6 right-6 w-40 h-40 bg-green-400 rounded-full opacity-20 blur-2xl"></div>
                  <div className="absolute bottom-6 left-6 w-32 h-32 bg-blue-500 rounded-full opacity-25 blur-xl"></div>
                  <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-300 rounded-full opacity-30 blur-lg"></div>
                </div>

                <Card className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="flex items-center p-8">
                    {/* Doctor Image Container */}
                    <div className="relative flex-shrink-0 mr-8">
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                        {/* Real Doctor Photo */}
                        <img 
                          src="/doctor-profile.png" 
                          alt="Dr. Sarah Johnson - Chief Dental Officer" 
                          className="w-full h-full object-cover object-center"
                                                     onError={(e) => {
                             // Fallback if image doesn't exist yet
                             e.currentTarget.style.display = 'none';
                             const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                             if (nextElement) nextElement.style.display = 'flex';
                           }}
                        />
                        {/* Fallback content */}
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-300 to-blue-500 hidden">
                          <div className="bg-white/30 backdrop-blur-sm rounded-full p-4">
                            <Stethoscope className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        
                        {/* Professional overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <div className="text-white text-xs font-medium text-center">Dr. Johnson</div>
                        </div>
                      </div>
                      
                      {/* Experience Badge */}
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg">
                        25+ Years
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="space-y-4 flex-1">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Dr. Sarah Johnson</h3>
                        <p className="text-blue-600 font-medium">Chief Dental Officer & Orthodontist</p>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Combines cutting-edge diagnostic and therapeutic technology with more than 25 years 
                        of extensive orthodontic experience, to provide superior treatment.
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-full">
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">✓ 25 years of experience</span>
                        </div>
                      </div>
                      <Button 
                        onClick={handleLoginClick}
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        Book with Dr. Johnson
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all" padding="lg">
                  <div className="text-center space-y-2">
                    <Calendar className="h-8 w-8 text-blue-600 mx-auto" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Book Appointment</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Ready for a Healthier Smile?</p>
                  </div>
                </Card>
                <Card className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 hover:shadow-lg transition-all" padding="lg">
                  <div className="text-center space-y-2">
                    <Heart className="h-8 w-8 text-green-600 mx-auto" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Patient Comfort</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Painless treatments</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready for a Healthier Smile?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Book your appointment today and experience the difference of expert dental care 
              with our experienced team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLoginClick}
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Appointment
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-3"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/Dental-Logo.png" 
                  alt="ENTNT Dental Connect Logo" 
                  className="h-10 w-10 object-contain rounded-xl shadow-lg"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">ENTNT Dental Connect</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Professional Care</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                Providing exceptional dental care with advanced technology and a commitment to patient comfort. 
                Your smile is our priority.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                  <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Services</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">General Dentistry</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cosmetic Dentistry</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Emergency Care</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Teeth Whitening</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-blue-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-blue-600" />
                  <span>info@entntdental.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3 text-blue-600" />
                  <span>123 Dental St, New York, NY 10001</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-3 text-blue-600" />
                  <span>Mon-Fri: 8AM-6PM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              &copy; 2024 ENTNT Dental Connect. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">HIPAA Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
      );
  }; 