
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Instagram, Facebook } from 'lucide-react';

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
  };
  logo_url?: string;
  banner_url?: string;
  google_reviews_embed?: string;
}

interface SocialMediaLinksProps {
  register: UseFormRegister<RestaurantProfile>;
}

export function SocialMediaLinks({ register }: SocialMediaLinksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media & Online Presence</CardTitle>
        <CardDescription>
          Add your social media links and Google Reviews embed code.
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
            <Label htmlFor="tiktok">TikTok</Label>
            <Input
              id="tiktok"
              {...register("social_media_links.tiktok")}
              placeholder="https://tiktok.com/@yourrestaurant"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              {...register("social_media_links.whatsapp")}
              placeholder="+355 69 123 4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="google_reviews_embed">Google Reviews Embed Code</Label>
          <Textarea
            id="google_reviews_embed"
            {...register("google_reviews_embed")}
            placeholder="Paste your Google Reviews embed code here..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
