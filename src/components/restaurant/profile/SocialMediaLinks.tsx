
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Instagram, Facebook, MapPin, Star, MessageCircle, Camera, Phone, Globe } from 'lucide-react';

interface RestaurantProfile {
  id?: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  working_hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  social_media_links: {
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
  logo_url?: string;
  banner_url?: string;
  google_reviews_embed?: string;
  tripadvisor_embed?: string;
  yelp_embed?: string;
}

interface SocialMediaLinksProps {
  register: UseFormRegister<RestaurantProfile>;
}

export function SocialMediaLinks({ register }: SocialMediaLinksProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>
            Connect your restaurant's social media accounts to build your online presence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                {...register("social_media_links.instagram")}
                placeholder="https://instagram.com/yourrestaurant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </Label>
              <Input
                id="facebook"
                {...register("social_media_links.facebook")}
                placeholder="https://facebook.com/yourrestaurant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                TikTok
              </Label>
              <Input
                id="tiktok"
                {...register("social_media_links.tiktok")}
                placeholder="https://tiktok.com/@yourrestaurant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                YouTube
              </Label>
              <Input
                id="youtube"
                {...register("social_media_links.youtube")}
                placeholder="https://youtube.com/@yourrestaurant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Twitter/X
              </Label>
              <Input
                id="twitter"
                {...register("social_media_links.twitter")}
                placeholder="https://twitter.com/yourrestaurant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                {...register("social_media_links.linkedin")}
                placeholder="https://linkedin.com/company/yourrestaurant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                {...register("social_media_links.whatsapp")}
                placeholder="+355 69 123 4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Platforms & Discovery</CardTitle>
          <CardDescription>
            Link to your restaurant's profiles on review and discovery platforms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="google_maps" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Google Maps/Business
              </Label>
              <Input
                id="google_maps"
                {...register("social_media_links.google_maps")}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tripadvisor" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                TripAdvisor
              </Label>
              <Input
                id="tripadvisor"
                {...register("social_media_links.tripadvisor")}
                placeholder="https://tripadvisor.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yelp" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Yelp
              </Label>
              <Input
                id="yelp"
                {...register("social_media_links.yelp")}
                placeholder="https://yelp.com/biz/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zomato" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Zomato
              </Label>
              <Input
                id="zomato"
                {...register("social_media_links.zomato")}
                placeholder="https://zomato.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foursquare" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Foursquare/Swarm
              </Label>
              <Input
                id="foursquare"
                {...register("social_media_links.foursquare")}
                placeholder="https://foursquare.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Widgets & Embeds</CardTitle>
          <CardDescription>
            Add embed codes from review platforms to display reviews on your menu page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google_reviews_embed">Google Reviews Embed Code</Label>
            <Textarea
              id="google_reviews_embed"
              {...register("google_reviews_embed")}
              placeholder="Paste your Google Reviews embed code here..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tripadvisor_embed">TripAdvisor Widget Code</Label>
            <Textarea
              id="tripadvisor_embed"
              {...register("tripadvisor_embed")}
              placeholder="Paste your TripAdvisor widget embed code here..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yelp_embed">Yelp Badge/Widget Code</Label>
            <Textarea
              id="yelp_embed"
              {...register("yelp_embed")}
              placeholder="Paste your Yelp badge or widget embed code here..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
