
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, RefreshCw } from 'lucide-react';
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
      <div className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-foreground">Digital Menu Solutions</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover our partner restaurants and their digital menus. Modern dining experiences with QR code technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Your Menu
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
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

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">
            Transform your restaurant with digital menus
          </p>
          <Link to="/contact">
            <Button variant="outline">
              Get started today
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
