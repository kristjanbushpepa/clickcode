import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Zap, Shield, Cpu, Sparkles, ChevronDown, Monitor, Smartphone, Settings, BarChart3, Menu, X } from 'lucide-react';
import { ImageCarousel } from '@/components/ImageCarousel';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitch from '@/components/LanguageSwitch';
import { Link } from 'react-router-dom';
const Index = () => {
  const {
    t
  } = useLanguage();
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({
        x: ev.clientX,
        y: ev.clientY
      });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  // Placeholder images - these will be replaced with your uploaded images
  const mobileImages = [{
    src: "/lovable-uploads/36e1cb40-c662-4f71-b6de-5d764404f504.png",
    title: "Profile Management",
    description: "Mobile-optimized profile management interface"
  }, {
    src: "/lovable-uploads/b3f03c08-8343-4600-8bb8-c11b5543f234.png",
    title: "Menu Management",
    description: "Touch-friendly menu editing on mobile"
  }, {
    src: "/placeholder.svg",
    title: "Settings",
    description: "Mobile settings panel"
  }, {
    src: "/placeholder.svg",
    title: "Analytics",
    description: "Mobile dashboard analytics"
  }, {
    src: "/placeholder.svg",
    title: "QR Generator",
    description: "Generate QR codes on mobile"
  }];
  const desktopImages = [{
    src: "/placeholder.svg",
    title: "Profile Management",
    description: "Comprehensive desktop profile management"
  }, {
    src: "/placeholder.svg",
    title: "Menu Management",
    description: "Full-featured desktop menu editor"
  }, {
    src: "/placeholder.svg",
    title: "Dashboard Overview",
    description: "Complete desktop dashboard"
  }, {
    src: "/placeholder.svg",
    title: "Translation Manager",
    description: "Multi-language management system"
  }, {
    src: "/placeholder.svg",
    title: "Analytics Suite",
    description: "Advanced desktop analytics"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white relative overflow-hidden">
      {/* Modern Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '2s'
      }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-500/3 via-transparent to-cyan-400/3 rotate-45"></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => <div key={i} className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-pulse" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 3}s`
      }}></div>)}
      </div>

      {/* Mouse Follower Effect */}
      <div className="fixed pointer-events-none z-0 w-96 h-96 bg-gradient-radial from-blue-400/3 to-transparent rounded-full blur-3xl transition-all duration-300" style={{
      left: mousePosition.x - 192,
      top: mousePosition.y - 192
    }}></div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/90 backdrop-blur-md border-b border-blue-100/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Click Code</span>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <LanguageSwitch />
              <Button variant="ghost" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50" onClick={() => window.location.href = '/restaurant/login'}>
                {t('hero.restaurant_login')}
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 shadow-lg" onClick={() => window.location.href = '/contact'}>
                {t('nav.contact')}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && <div className="md:hidden mt-4 pb-4 border-t border-blue-100/50">
              <div className="flex flex-col space-y-3 pt-4">
                <LanguageSwitch />
                <Button variant="ghost" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50 justify-start" onClick={() => window.location.href = '/restaurant/login'}>
                  {t('hero.restaurant_login')}
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 shadow-lg justify-start" onClick={() => window.location.href = '/contact'}>
                  {t('nav.contact')}
                </Button>
              </div>
            </div>}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Animated Logo */}
            <div className="mb-8 relative">
              <div className="w-24 h-24 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25 animate-bounce p-4">
                <img src="/lovable-uploads/47736fb9-9e34-42c1-8aad-be2772515362.png" alt="Click Code Logo" className="w-full h-full object-contain animate-pulse" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-xl opacity-30 animate-ping"></div>
            </div>

            {/* Main Heading */}
            <h1 className="md:text-6xl lg:text-8xl font-bold text-slate-800 mb-6 leading-tight text-2xl">
              {t('hero.welcome')}{' '}
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-pulse bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]">
                {t('hero.title')}
              </span>
            </h1>

            

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 shadow-xl px-6 md:px-8 py-4 text-lg font-semibold group" onClick={() => window.location.href = '/restaurant/login'}>
                {t('hero.restaurant_login')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-blue-200 text-blue-700 hover:bg-blue-50 backdrop-blur-sm px-6 md:px-8 py-4 text-lg" onClick={() => window.location.href = '/contact'}>
                {t('nav.contact')}
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="flex flex-col items-center animate-bounce cursor-pointer" onClick={scrollToFeatures}>
              <span className="text-slate-500 text-sm mb-2">{t('hero.explore_features')}</span>
              <ChevronDown className="h-6 w-6 text-slate-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="relative z-10 py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          {/* Features Carousel */}
          <div className="relative px-4 md:px-12">
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {/* Feature Card 1 */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-white/70 backdrop-blur-md border border-blue-100 hover:bg-white/90 transition-all duration-300 group hover:scale-105 hover:shadow-xl h-full">
                    <CardContent className="p-8 text-center h-full flex flex-col">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">Real-time Updates</h3>
                      <p className="text-slate-600 leading-relaxed flex-grow">
                        Instantly update your menu, prices, and availability across all platforms with our real-time synchronization.
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>

                {/* Feature Card 2 */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-white/70 backdrop-blur-md border border-blue-100 hover:bg-white/90 transition-all duration-300 group hover:scale-105 hover:shadow-xl h-full">
                    <CardContent className="p-8 text-center h-full flex flex-col">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">Multi-language Support</h3>
                      <p className="text-slate-600 leading-relaxed flex-grow">
                        Reach global customers with automatic translations and multi-currency support for international markets.
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>

                {/* Feature Card 3 */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-white/70 backdrop-blur-md border border-blue-100 hover:bg-white/90 transition-all duration-300 group hover:scale-105 hover:shadow-xl h-full">
                    <CardContent className="p-8 text-center h-full flex flex-col">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">Analytics Dashboard</h3>
                      <p className="text-slate-600 leading-relaxed flex-grow">
                        Track performance with detailed analytics, customer insights, and business intelligence tools.
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="bg-white/80 backdrop-blur-md border-blue-200 hover:bg-white/90" />
              <CarouselNext className="bg-white/80 backdrop-blur-md border-blue-200 hover:bg-white/90" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Demo Section with Image Carousel */}
      <section id="demo-section" className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              {t('demo.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('demo.subtitle')}
            </p>
          </div>

          <ImageCarousel mobileImages={mobileImages} desktopImages={desktopImages} />
        </div>
      </section>

      {/* Menu Examples Section */}
      <section className="relative z-10 py-20 bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Shembuj të menuve tona
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Jemi krenarë të punojmë me <span className="font-bold text-blue-600">20+ restorante</span> dhe të prezantojmë shembuj nga përzgjedhja jonë e larmishme të menuve.
            </p>
          </div>

          {/* Menu Examples Carousel */}
          <div className="relative px-4 md:px-12 mb-12">
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {/* Iumentis Steakhouse */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-white/80 backdrop-blur-md border border-blue-100/50 hover:bg-white/95 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer overflow-hidden h-full">
                    <div className="relative h-full overflow-hidden">
                      <img src="/lovable-uploads/3dbaa494-3111-489e-95e1-557c7e7215bf.png" alt="Iumentis Steakhouse Menu" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 className="font-bold text-xl text-white">IUMENTIS STEAKHOUSE</h3>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>

                {/* Omoi Restaurant */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-white/80 backdrop-blur-md border border-blue-100/50 hover:bg-white/95 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer overflow-hidden h-full">
                    <div className="relative h-full overflow-hidden">
                      <img src="/lovable-uploads/35dc9657-4a92-4c5f-8929-5a758c03b6d7.png" alt="Omoi Restaurant Menu" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 className="font-bold text-xl text-white">OMOI</h3>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>

                {/* Oliveta Restaurant */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-white/80 backdrop-blur-md border border-blue-100/50 hover:bg-white/95 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer overflow-hidden h-full">
                    <div className="relative h-full overflow-hidden">
                      <img src="/lovable-uploads/3eca7e2e-53a9-4d5d-b8f4-0aaecc82a077.png" alt="Oliveta Restaurant Menu" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 className="font-bold text-xl text-white">OLIVETA RESTAURANT</h3>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="bg-white/80 backdrop-blur-md border-blue-200 hover:bg-white/90" />
              <CarouselNext className="bg-white/80 backdrop-blur-md border-blue-200 hover:bg-white/90" />
            </Carousel>
          </div>

          <div className="text-center">
            <p className="text-lg text-slate-600 mb-6">
              ...dhe shumë <span className="font-bold text-blue-600">më tepër</span> restorante të mrekullueshme!
            </p>
            
          </div>
        </div>
      </section>

      {/* Restaurant Testimonials Section */}
      <section className="relative z-10 py-20 bg-gradient-to-br from-blue-50/50 via-white/50 to-cyan-50/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              {t('testimonials.title')}
            </h2>
            
          </div>

          {/* Testimonials Carousel */}
          <div className="relative px-4 md:px-12">
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {/* Oliveta Restaurant */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-white/80 backdrop-blur-md border border-blue-100/50 hover:bg-white/90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer h-full" onClick={() => window.location.href = '/menu/oliveta'}>
                    <CardContent className="p-8 h-full flex flex-col">
                      <div className="flex items-center mb-6">
                        <img src="/lovable-uploads/55ee0c88-6f17-4014-b17f-0a98a9315f48.png" alt="Oliveta Restaurant logo" className="w-16 h-16 rounded-full object-cover mr-4 shadow-lg ring-2 ring-blue-100" />
                        <div>
                          <h3 className="font-bold text-xl text-slate-800">Oliveta Restaurant</h3>
                          <p className="text-slate-600 text-sm">Greek Modern Cuisine</p>
                        </div>
                      </div>
                      
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>)}
                      </div>
                      
                      <blockquote className="text-slate-600 italic leading-relaxed mb-6 flex-grow">
                        "Që kur implementuam sistemin e menusë QR të Click Code, kemi parë një rritje prej 40% në vlerësimet e klientëve! Mundësia për të përditësuar menjëherë menunë dhe çmimet ka qenë një ndryshim i vërtetë për operacionet e restorantit tonë."
                      </blockquote>
                      
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 shadow-lg group-hover:scale-105 transition-transform">
                        {t('testimonials.view_menu')} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>

                {/* Iumentis Steakhouse */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-white/80 backdrop-blur-md border border-blue-100/50 hover:bg-white/90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group h-full">
                    <CardContent className="p-8 h-full flex flex-col">
                      <div className="flex items-center mb-6">
                        <img src="/lovable-uploads/80ee67c9-bb51-4df6-a2e5-aee683f09915.png" alt="Iumentis Steakhouse logo" className="w-16 h-16 rounded-full object-cover mr-4 shadow-lg ring-2 ring-blue-100" />
                        <div>
                          <h3 className="font-bold text-xl text-slate-800">Iumentis Steakhouse</h3>
                          <p className="text-slate-600 text-sm">Premium Steakhouse</p>
                        </div>
                      </div>
                      
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>)}
                      </div>
                      
                      <blockquote className="text-slate-600 italic leading-relaxed flex-grow">
                        "Lehtësia e përditësimit të menusë në kohë reale ka transformuar mënyrën se si operojmë. Klientët tanë e duan përvojën interaktive QR dhe kemi marrë shumë më tepër vlerësime pozitive që prej lancimit."
                      </blockquote>
                    </CardContent>
                  </Card>
                </CarouselItem>

                {/* Omoi Restaurant */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-white/80 backdrop-blur-md border border-blue-100/50 hover:bg-white/90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group h-full">
                    <CardContent className="p-8 h-full flex flex-col">
                      <div className="flex items-center mb-6">
                        <img src="/lovable-uploads/fba8d78e-2101-4df7-8e0b-f207f3964add.png" alt="Omoi Restaurant logo" className="w-16 h-16 rounded-full object-cover mr-4 shadow-lg ring-2 ring-blue-100" />
                        <div>
                          <h3 className="font-bold text-xl text-slate-800">Omoi Restaurant</h3>
                          <p className="text-slate-600 text-sm">Contemporary Dining</p>
                        </div>
                      </div>
                      
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>)}
                      </div>
                      
                      <blockquote className="text-slate-600 italic leading-relaxed flex-grow">
                        "Sistemi i menusë së Click Code e ka bërë kaq të thjeshtë të mbajmë ofertat tona të përditësuara. Mund të përditësojmë çmimet dhe përshkrimet menjëherë, dhe komentimi i klientëve ka përmirësuar dramatikisht me përvojën moderne të menusë QR."
                      </blockquote>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="bg-white/80 backdrop-blur-md border-blue-200 hover:bg-white/90" />
              <CarouselNext className="bg-white/80 backdrop-blur-md border-blue-200 hover:bg-white/90" />
            </Carousel>
          </div>

          <div className="text-center mt-16">
            <Card className="bg-white/80 backdrop-blur-md border border-blue-100/50 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Gati për të filluar?
                </h3>
                <p className="text-slate-600 mb-6">
                  Na kontaktoni që të filloni sot dhe transformoni përvojën e menusë së restorantit tuaj.
                </p>
                <Link to="/contact">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Kontaktoni
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white/90 backdrop-blur-md border-t border-blue-100 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src="/lovable-uploads/47736fb9-9e34-42c1-8aad-be2772515362.png" alt="Click Code Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Click Code</span>
            </div>
            <p className="text-slate-600 text-center md:text-right">
              © 2024 Click Code. Built for the future of dining.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;