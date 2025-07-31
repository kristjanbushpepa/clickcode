
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
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

  const handleRemoveLogo = () => {
    setValue('logo_path', '');
    setValue('logo_url', '');
  };

  const handleRemoveBanner = () => {
    setValue('banner_path', '');
    setValue('banner_url', '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Imazhet
        </CardTitle>
        <CardDescription>
          Ngarkoni logon dhe bannerin e restorantit tuaj
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <ImageUpload
              currentImagePath={logoPath}
              onImageChange={(path) => setValue('logo_path', path || '')}
              label="Logoja e Restorantit"
            />
            {logoPath && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 transition-colors"
              >
                <X className="h-3 w-3" />
                Hiq logon
              </button>
            )}
          </div>

          <div className="space-y-2">
            <ImageUpload
              currentImagePath={bannerPath}
              onImageChange={(path) => setValue('banner_path', path || '')}
              label="Banneri i Restorantit"
            />
            {bannerPath && (
              <button
                type="button"
                onClick={handleRemoveBanner}
                className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 transition-colors"
              >
                <X className="h-3 w-3" />
                Hiq bannerin
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
