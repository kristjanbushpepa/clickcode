
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, RefreshCw, Sparkles, Settings, Users, BarChart3, Palette, Bell, Star, MessageCircle, Smartphone, QrCode, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const Index = () => {
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['public-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, owner_full_name, city, country, connection_status, created_at')
        .eq('connection_status', 'connected')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Restaurant[];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950/20 dark:via-background dark:to-blue-900/20 py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8">
            <img 
              src="/lovable-uploads/36e1cb40-c662-4f71-b6de-5d764404f504.png" 
              alt="Click Code" 
              className="h-12 sm:h-16 w-auto mb-4 sm:mb-0 sm:mr-4"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-600 dark:text-blue-400 leading-tight">Click Code</h1>
              <p className="text-lg sm:text-xl text-blue-500 dark:text-blue-300 font-medium">Digital Menu Platform</p>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground px-2">
            Transform Your Restaurant with
            <span className="text-blue-600 dark:text-blue-400 block mt-2">Smart Digital Menus</span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Empower your restaurant with our cutting-edge digital menu platform. Increase reviews, boost followers, 
            and create engaging dining experiences with QR code technology and powerful admin tools.
          </p>
          
          <div className="flex flex-col gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4">
            <Button size="lg" className="text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-full sm:w-auto">
              <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Free Trial
            </Button>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link to="/restaurant/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 border-blue-200 text-blue-600 hover:bg-blue-50 w-full">
                  Restaurant Login
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 w-full sm:w-auto">
                Contact Us
              </Button>
            </div>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-4">
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-100">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">Advanced Admin Panel</h3>
              <p className="text-muted-foreground text-sm text-center">Complete control with customization tools and profile management</p>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-green-100">
              <div className="bg-green-100 dark:bg-green-900/30 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">Smart Popups</h3>
              <p className="text-muted-foreground text-sm text-center">Increase reviews and followers with engaging interactive popups</p>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-purple-100 sm:col-span-2 lg:col-span-1">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">QR Code Technology</h3>
              <p className="text-muted-foreground text-sm text-center">Seamless customer experience with instant menu access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-background to-blue-50/30 dark:to-blue-950/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground px-4">Powerful Features for Modern Restaurants</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Everything you need to create, manage, and optimize your digital menu experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center group p-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Theme Customization</h3>
              <p className="text-sm text-muted-foreground">Brand your menu with custom colors, fonts, and layouts</p>
            </div>
            
            <div className="text-center group p-4">
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Profile Management</h3>
              <p className="text-sm text-muted-foreground">Manage restaurant info, hours, and social media links</p>
            </div>
            
            <div className="text-center group p-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">Track menu views, popular items, and customer engagement</p>
            </div>
            
            <div className="text-center group p-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Smart Notifications</h3>
              <p className="text-sm text-muted-foreground">Automated popups to boost reviews and social follows</p>
            </div>
            
            <div className="text-center group p-4">
              <div className="bg-pink-100 dark:bg-pink-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Customer Feedback</h3>
              <p className="text-sm text-muted-foreground">Collect reviews and feedback directly through your menu</p>
            </div>
            
            <div className="text-center group p-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Mobile Optimized</h3>
              <p className="text-sm text-muted-foreground">Perfect experience on all devices and screen sizes</p>
            </div>
            
            <div className="text-center group p-4">
              <div className="bg-teal-100 dark:bg-teal-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Multi-Language</h3>
              <p className="text-sm text-muted-foreground">Support for multiple languages and currencies</p>
            </div>
            
            <div className="text-center group p-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Instant Updates</h3>
              <p className="text-sm text-muted-foreground">Update your menu in real-time without reprinting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Our Partner Restaurants</h2>
          <p className="text-lg text-muted-foreground">
            Click on any restaurant to view their digital menu
          </p>
        </div>

        {restaurants && restaurants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} to={`/menu/${encodeURIComponent(restaurant.name.toLowerCase().replace(/\s+/g, '-'))}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 text-foreground">{restaurant.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {restaurant.city}, {restaurant.country}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(restaurant.connection_status)}>
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-muted/50 rounded-lg p-8 max-w-md mx-auto">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No Restaurants Yet</h3>
              <p className="text-muted-foreground mb-4">
                We're working with restaurants to bring you amazing digital menu experiences.
              </p>
              <Link to="/contact">
                <Button>Contact Us</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 px-4">Ready to Transform Your Restaurant?</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-blue-100 px-4">
            Join hundreds of restaurants already using Click Code to create amazing digital dining experiences
          </p>
          <div className="flex flex-col gap-4 justify-center px-4">
            <Button size="lg" className="text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
              <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Your Free Trial
            </Button>
            <Button variant="outline" size="lg" className="text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="sm:col-span-2 lg:col-span-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <img 
                  src="/lovable-uploads/36e1cb40-c662-4f71-b6de-5d764404f504.png" 
                  alt="Click Code" 
                  className="h-6 sm:h-8 w-auto mr-2 sm:mr-3"
                />
                <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">Click Code</span>
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
                <li>Contact Us</li>
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Live Chat</li>
                <li>Phone Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-6 sm:pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Click Code. All rights reserved. | Made with ❤️ for restaurants worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
