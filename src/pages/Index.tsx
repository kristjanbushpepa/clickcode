import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, RefreshCw, Sparkles, Settings, Users, BarChart3, Palette, Bell, Star, MessageCircle, Smartphone, QrCode, Zap, User, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
interface Restaurant {
  id: string;
  name: string;
  owner_email: string;
  owner_full_name: string;
  city: string;
  country: string;
  connection_status: string;
  created_at: string;
}
interface CompanySettings {
  id: string;
  company_name: string;
  logo_url?: string;
  google_form_url?: string;
  contact_email?: string;
  contact_phone?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}
const Index = () => {
  const navigate = useNavigate();

  // Fetch company settings
  const {
    data: companySettings
  } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('company_settings').select('*').single();
      if (error) throw error;
      return data as CompanySettings;
    }
  });
  const {
    data: restaurants,
    isLoading
  } = useQuery({
    queryKey: ['public-restaurants'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('restaurants').select('id, name, owner_full_name, city, country, connection_status, created_at').eq('connection_status', 'connected').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data as Restaurant[];
    }
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handlePricingClick = () => {
    navigate('/contact');
  };
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={companySettings?.logo_url || "/lovable-uploads/36e1cb40-c662-4f71-b6de-5d764404f504.png"} alt={`${companySettings?.company_name || 'Click Code'} Logo`} className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" className="text-foreground hover:text-primary text-sm sm:text-base" onClick={scrollToFeatures}>
                Features
              </Button>
              <Button variant="ghost" className="text-foreground hover:text-primary text-sm sm:text-base" onClick={handlePricingClick}>
                Pricing
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 text-sm sm:text-base px-3 sm:px-4" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="relative inline-block mb-6 sm:mb-8">
              <img src={companySettings?.logo_url || "/lovable-uploads/36e1cb40-c662-4f71-b6de-5d764404f504.png"} alt={`${companySettings?.company_name || 'Click Code'} Hero Logo`} className="h-16 w-16 sm:h-24 sm:w-24 mx-auto filter drop-shadow-lg" style={{
              filter: 'drop-shadow(0 0 15px hsl(var(--primary) / 0.3))'
            }} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Welcome to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{companySettings?.company_name || 'Click Code'}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your restaurant with our cutting-edge digital menu platform. Create stunning QR code menus, 
              manage your profile with ease, and boost your online presence with our powerful admin panel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12">
              
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover:scale-105 transition-all duration-300" onClick={() => navigate('/restaurant/login')}>
                Restaurant Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-12 sm:py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Modern Restaurants
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, customize, and manage your digital presence
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-border hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Admin Panel</h3>
              <p className="text-muted-foreground">
                Comprehensive dashboard to manage all your restaurants, analytics, and system settings in one place.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-border hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-lg mb-4">
                <Palette className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Customization</h3>
              <p className="text-muted-foreground">
                Personalize your menu's appearance with custom themes, colors, and layouts that match your brand.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-border hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Profile Management</h3>
              <p className="text-muted-foreground">
                Easily update restaurant information, hours, contact details, and social media links.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-border hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-lg mb-4">
                <MessageSquare className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Review Popups</h3>
              <p className="text-muted-foreground">
                Smart popup system to encourage customer reviews and increase your online ratings automatically.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-border hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Social Growth</h3>
              <p className="text-muted-foreground">
                Boost your social media followers with integrated campaigns and engagement tools.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-border hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-lg mb-4">
                <QrCode className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">QR Code Menus</h3>
              <p className="text-muted-foreground">
                Generate beautiful QR codes for contactless menu access with real-time updates and analytics.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Partner Restaurants
            </h2>
            <p className="text-lg text-muted-foreground">
              Click on any restaurant to view their digital menu
            </p>
          </div>

          {restaurants && restaurants.length > 0 ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map(restaurant => <Link key={restaurant.id} to={`/menu/${encodeURIComponent(restaurant.name.toLowerCase().replace(/\s+/g, '-'))}`}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-border hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:scale-105">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 text-foreground">{restaurant.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {restaurant.city}, {restaurant.country}
                          </CardDescription>
                        </div>
                        <Badge className="bg-primary/10 text-primary">
                          Online
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Owner: {restaurant.owner_full_name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Since {new Date(restaurant.created_at).getFullYear()}
                          </span>
                          <div className="flex items-center gap-1 text-primary">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm font-medium">View Menu</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>)}
            </div> : <div className="text-center py-12">
              <div className="bg-card/50 rounded-lg p-8 max-w-md mx-auto border border-border">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">No Restaurants Yet</h3>
                <p className="text-muted-foreground mb-4">
                  We're working with restaurants to bring you amazing digital menu experiences.
                </p>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Contact Us
                </Button>
              </div>
            </div>}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4 sm:mb-6">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-primary-foreground/90">
              Join hundreds of restaurants already using Click Code to create amazing digital dining experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Start Your Free Trial
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/30 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover:scale-105 transition-all duration-300 text-slate-50 bg-slate-950 hover:bg-slate-800">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="sm:col-span-2 lg:col-span-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <img src={companySettings?.logo_url || "/lovable-uploads/36e1cb40-c662-4f71-b6de-5d764404f504.png"} alt={companySettings?.company_name || 'Click Code'} className="h-6 sm:h-8 w-auto mr-2 sm:mr-3" />
                <span className="text-xl sm:text-2xl font-bold text-primary">{companySettings?.company_name || 'Click Code'}</span>
              </div>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base max-w-md mx-auto sm:mx-0">
                The most advanced digital menu platform for modern restaurants. Increase engagement, 
                boost reviews, and create unforgettable dining experiences.
              </p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-3 sm:mb-4 text-foreground">Features</h3>
              <ul className="space-y-1 sm:space-y-2 text-sm text-muted-foreground">
                <li>Digital Menus</li>
                <li>QR Code Generation</li>
                <li>Admin Dashboard</li>
                <li>Customization Tools</li>
                <li>Analytics & Reports</li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-3 sm:mb-4 text-foreground">Support</h3>
              <ul className="space-y-1 sm:space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Documentation</li>
                <li>Video Tutorials</li>
                <li>Community Forum</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 sm:pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 {companySettings?.company_name || 'Click Code'}. All rights reserved. Building the future of digital dining.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;