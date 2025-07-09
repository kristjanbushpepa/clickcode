
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Linkedin
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
}

interface MenuFooterProps {
  profile: RestaurantProfile | null;
  customTheme?: any;
}

export function MenuFooter({ profile, customTheme }: MenuFooterProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  if (!profile) return null;

  const hasContactInfo = profile.phone || profile.email || profile.address;
  const hasWorkingHours = profile.working_hours && Object.values(profile.working_hours).some(hours => hours);
  const hasSocialLinks = profile.social_media_links && Object.values(profile.social_media_links).some(link => link);

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
    <div className="mt-8 border-t border-border/20">
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Quick Info Bar */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {todayHours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Today: {todayHours}</span>
              </div>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" />
                <span>{profile.phone}</span>
              </a>
            )}
          </div>

          {/* Description */}
          {profile.description && (
            <div className="text-center text-sm text-muted-foreground px-4">
              {profile.description}
            </div>
          )}

          {/* Expandable Sections */}
          <div className="space-y-2">
            
            {/* Contact Information */}
            {hasContactInfo && (
              <Collapsible open={isContactOpen} onOpenChange={setIsContactOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors">
                  <span>Contact Information</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isContactOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <div className="space-y-3">
                    {profile.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Address</p>
                          <p className="text-muted-foreground">{profile.address}</p>
                        </div>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Phone</p>
                          <a href={`tel:${profile.phone}`} className="text-muted-foreground hover:text-foreground">
                            {profile.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Email</p>
                          <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:text-foreground">
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
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors">
                  <span>Opening Hours</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isHoursOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <div className="space-y-2">
                    {Object.entries(profile.working_hours || {}).map(([day, hours]) => {
                      if (!hours) return null;
                      const isToday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()] === day;
                      
                      return (
                        <div key={day} className={`flex justify-between text-sm ${isToday ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          <span className="capitalize">{day}</span>
                          <span>{hours}</span>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Social Media & Reviews */}
            {hasSocialLinks && (
              <Collapsible open={isSocialOpen} onOpenChange={setIsSocialOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors">
                  <span>Connect With Us</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isSocialOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(profile.social_media_links || {}).map(([platform, url]) => {
                      if (!url) return null;
                      const IconComponent = getSocialIcon(platform);
                      
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground capitalize">
                            {platform.replace('_', ' ')}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Review Embeds */}
          {(profile.google_reviews_embed || profile.tripadvisor_embed || profile.yelp_embed) && (
            <div className="space-y-4 pt-4 border-t border-border/20">
              {profile.google_reviews_embed && (
                <div dangerouslySetInnerHTML={{ __html: profile.google_reviews_embed }} />
              )}
              {profile.tripadvisor_embed && (
                <div dangerouslySetInnerHTML={{ __html: profile.tripadvisor_embed }} />
              )}
              {profile.yelp_embed && (
                <div dangerouslySetInnerHTML={{ __html: profile.yelp_embed }} />
              )}
            </div>
          )}

          {/* Footer Text */}
          <div className="text-center pt-4 border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {profile.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
