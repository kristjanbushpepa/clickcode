
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
    <div className="mt-6 border-t border-border/20">
      <div className="px-3 py-4">
        <div className="max-w-sm mx-auto space-y-3">
          
          {/* Quick Info Bar */}
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

          {/* Description */}
          {profile.description && (
            <div className="text-center text-xs text-muted-foreground px-2">
              {profile.description}
            </div>
          )}

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

            {/* Social Media & Reviews */}
            {hasSocialLinks && (
              <Collapsible open={isSocialOpen} onOpenChange={setIsSocialOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-xs font-medium hover:bg-muted/50 rounded-lg transition-colors">
                  <span>Connect With Us</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${isSocialOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-2">
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(profile.social_media_links || {}).map(([platform, url]) => {
                      if (!url) return null;
                      const IconComponent = getSocialIcon(platform);
                      
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground capitalize text-center">
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
            <div className="space-y-3 pt-3 border-t border-border/20">
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
          <div className="text-center pt-3 border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {profile.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
