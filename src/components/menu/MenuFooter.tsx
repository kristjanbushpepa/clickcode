
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  Instagram, 
  Facebook, 
  MessageCircle,
  Star,
  Globe,
  Camera,
  Youtube,
  Linkedin,
  Share2,
  Settings
} from 'lucide-react';

interface RestaurantProfile {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  working_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  social_media_links?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
    tripadvisor?: string;
    yelp?: string;
    google_maps?: string;
    zomato?: string;
    foursquare?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  google_reviews_embed?: string;
  tripadvisor_embed?: string;
  yelp_embed?: string;
  google_maps_embed?: string;
}

interface MenuFooterProps {
  profile: RestaurantProfile | null;
  customTheme?: any;
  showFullContent?: boolean; // New prop to control visibility
}

export function MenuFooter({ profile, customTheme, showFullContent = false }: MenuFooterProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);

  if (!profile) return null;

  const hasContactInfo = profile.phone || profile.email || profile.address;
  const hasWorkingHours = profile.working_hours && Object.values(profile.working_hours).some(hours => hours);
  const hasSocialLinks = profile.social_media_links && Object.values(profile.social_media_links).some(link => link);
  const hasEmbeds = profile.google_reviews_embed || profile.tripadvisor_embed || profile.yelp_embed || profile.google_maps_embed;

  const getCurrentDayHours = () => {
    if (!profile.working_hours) return null;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return profile.working_hours[today as keyof typeof profile.working_hours];
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      case 'whatsapp': return MessageCircle;
      case 'youtube': return Youtube;
      case 'twitter': return MessageCircle;
      case 'linkedin': return Linkedin;
      case 'tiktok': return Camera;
      case 'tripadvisor': return Star;
      case 'yelp': return Star;
      case 'google_maps': return MapPin;
      case 'zomato': return Star;
      case 'foursquare': return MapPin;
      default: return Globe;
    }
  };

  const todayHours = getCurrentDayHours();

  return (
    <div className="mt-6 border-t border-border/20">
      <div className="px-3 py-4">
        <div className="max-w-sm mx-auto space-y-3">
          
          {/* Quick Info Bar - Always visible */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {todayHours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Today: {todayHours}</span>
              </div>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Phone className="h-3 w-3" />
                <span className="truncate">{profile.phone}</span>
              </a>
            )}
          </div>

          {/* Description - Always visible */}
          {profile.description && (
            <div className="text-center text-xs text-muted-foreground px-2">
              {profile.description}
            </div>
          )}

          {/* Social Media Dropdown - Always visible if links exist */}
          {hasSocialLinks && (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Follow Us
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {Object.entries(profile.social_media_links || {}).map(([platform, url]) => {
                    if (!url) return null;
                    const IconComponent = getSocialIcon(platform);
                    
                    return (
                      <DropdownMenuItem key={platform} asChild>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <IconComponent className="h-4 w-4" />
                          <span className="capitalize">{platform.replace('_', ' ')}</span>
                        </a>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Full Content - Only show on front page */}
          {showFullContent && (
            <>
              {/* Expandable Sections */}
              <div className="space-y-1">
                
                {/* Contact Information */}
                {hasContactInfo && (
                  <Collapsible open={isContactOpen} onOpenChange={setIsContactOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-xs font-medium hover:bg-muted/50 rounded-lg transition-colors">
                      <span>Contact Information</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${isContactOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-2 pb-2">
                      <div className="space-y-2">
                        {profile.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="text-xs">
                              <p className="font-medium">Address</p>
                              <p className="text-muted-foreground">{profile.address}</p>
                            </div>
                          </div>
                        )}
                        {profile.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <div className="text-xs">
                              <p className="font-medium">Phone</p>
                              <a href={`tel:${profile.phone}`} className="text-muted-foreground hover:text-foreground">
                                {profile.phone}
                              </a>
                            </div>
                          </div>
                        )}
                        {profile.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <div className="text-xs">
                              <p className="font-medium">Email</p>
                              <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:text-foreground truncate">
                                {profile.email}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Working Hours */}
                {hasWorkingHours && (
                  <Collapsible open={isHoursOpen} onOpenChange={setIsHoursOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-xs font-medium hover:bg-muted/50 rounded-lg transition-colors">
                      <span>Opening Hours</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${isHoursOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-2 pb-2">
                      <div className="space-y-1">
                        {Object.entries(profile.working_hours || {}).map(([day, hours]) => {
                          if (!hours) return null;
                          const isToday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()] === day;
                          
                          return (
                            <div key={day} className={`flex justify-between text-xs ${isToday ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                              <span className="capitalize">{day}</span>
                              <span>{hours}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>

              {/* Embedded Maps and Reviews - Mobile Optimized */}
              {hasEmbeds && (
                <div className="space-y-3 pt-3 border-t border-border/20">
                  <h4 className="text-sm font-semibold text-center">Find Us & Reviews</h4>
                  
                  {/* Google Maps Embed */}
                  {profile.google_maps_embed && (
                    <div className="w-full">
                      <div 
                        className="w-full h-48 rounded-lg overflow-hidden border"
                        dangerouslySetInnerHTML={{ __html: profile.google_maps_embed.replace(/width="[^"]*"/g, 'width="100%"').replace(/height="[^"]*"/g, 'height="192"') }} 
                      />
                    </div>
                  )}

                  {/* Reviews Embeds */}
                  {profile.google_reviews_embed && (
                    <div className="w-full max-h-64 overflow-hidden rounded-lg border">
                      <div dangerouslySetInnerHTML={{ __html: profile.google_reviews_embed.replace(/width="[^"]*"/g, 'width="100%"') }} />
                    </div>
                  )}
                  
                  {profile.tripadvisor_embed && (
                    <div className="w-full max-h-64 overflow-hidden rounded-lg border">
                      <div dangerouslySetInnerHTML={{ __html: profile.tripadvisor_embed.replace(/width="[^"]*"/g, 'width="100%"') }} />
                    </div>
                  )}
                  
                  {profile.yelp_embed && (
                    <div className="w-full max-h-64 overflow-hidden rounded-lg border">
                      <div dangerouslySetInnerHTML={{ __html: profile.yelp_embed.replace(/width="[^"]*"/g, 'width="100%"') }} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer Text with Admin Contact */}
          <div className="text-center pt-3 border-t border-border/20 space-y-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {profile.name}. All rights reserved.
            </p>
            <div className="flex justify-center">
              <a 
                href={`${window.location.origin}/admin`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-3 w-3" />
                Admin Panel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
