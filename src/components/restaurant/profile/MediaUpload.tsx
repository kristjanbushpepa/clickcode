
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

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

interface MediaUploadProps {
  register: UseFormRegister<RestaurantProfile>;
}

export function MediaUpload({ register }: MediaUploadProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Images
        </CardTitle>
        <CardDescription>
          Upload your restaurant logo and banner image. (File upload functionality will be implemented in the next phase)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Logo URL (temporary)</Label>
            <Input
              {...register("logo_url")}
              placeholder="https://example.com/logo.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Banner URL (temporary)</Label>
            <Input
              {...register("banner_url")}
              placeholder="https://example.com/banner.jpg"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
