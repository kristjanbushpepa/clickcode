
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';

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
  logo_path?: string;
  banner_path?: string;
  google_reviews_embed?: string;
}

interface MediaUploadProps {
  register: UseFormRegister<RestaurantProfile>;
  setValue: UseFormSetValue<RestaurantProfile>;
  watch: UseFormWatch<RestaurantProfile>;
}

export function MediaUpload({ register, setValue, watch }: MediaUploadProps) {
  const logoPath = watch('logo_path');
  const bannerPath = watch('banner_path');

  const handleLogoChange = (path: string | null) => {
    setValue('logo_path', path);
    if (!path) {
      setValue('logo_url', undefined);
    }
  };

  const handleBannerChange = (path: string | null) => {
    setValue('banner_path', path);
    if (!path) {
      setValue('banner_url', undefined);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Imazhet
        </CardTitle>
        <CardDescription>
          Ngarkoni logon dhe bannerin e restorantit tuaj. Mund të fshini imazhet duke klikuar butonin e fshirjes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload
            currentImagePath={logoPath}
            onImageChange={handleLogoChange}
            label="Logoja e Restorantit"
          />

          <ImageUpload
            currentImagePath={bannerPath}
            onImageChange={handleBannerChange}
            label="Banneri i Restorantit"
          />
        </div>
      </CardContent>
    </Card>
  );
}
