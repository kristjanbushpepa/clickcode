
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { toast } from '@/hooks/use-toast';
import { compressImage, getOptimizedFileName } from '@/utils/imageCompression';

interface ImageUploadProps {
  currentImagePath?: string;
  onImageChange: (imagePath: string | null) => void;
  label: string;
  className?: string;
}

export function ImageUpload({ currentImagePath, onImageChange, label, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImagePath ? getImageUrl(currentImagePath) : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  function getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    const restaurantSupabase = getRestaurantSupabase();
    const { data } = restaurantSupabase.storage
      .from('restaurant-images')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Gabim',
        description: 'Ju lutem zgjidhni një imazh të vlefshëm',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size before compression (max 10MB for original)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Gabim',
        description: 'Imazhi origjinal duhet të jetë më i vogël se 10MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Show compression progress
      toast({
        title: 'Duke kompresuar...',
        description: 'Imazhi po kompresohet për të reduktuar madhësinë',
      });

      // Compress the image
      const compressedBlob = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        format: 'webp'
      });

      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Compressed size: ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Compression ratio: ${((1 - compressedBlob.size / file.size) * 100).toFixed(1)}%`);

      const restaurantSupabase = getRestaurantSupabase();
      const fileName = getOptimizedFileName(file.name, 'webp');

      const { error: uploadError } = await restaurantSupabase.storage
        .from('restaurant-images')
        .upload(fileName, compressedBlob, {
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      const imageUrl = getImageUrl(fileName);
      setPreviewUrl(imageUrl);
      onImageChange(fileName);

      toast({
        title: 'Sukses',
        description: `Imazhi u ngarkua me sukses (kompresuar ${((1 - compressedBlob.size / file.size) * 100).toFixed(1)}%)`,
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Gabim',
        description: `Gabim në ngarkimin e imazhit: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsDeleting(true);
    try {
      if (currentImagePath) {
        const restaurantSupabase = getRestaurantSupabase();
        const { error } = await restaurantSupabase.storage
          .from('restaurant-images')
          .remove([currentImagePath]);
        
        if (error) {
          console.error('Error deleting image from storage:', error);
          // Don't throw here, still proceed with UI update
        }
      }
      
      setPreviewUrl(null);
      onImageChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: 'Sukses',
        description: 'Imazhi u fshi me sukses',
      });
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast({
        title: 'Gabim',
        description: `Gabim në fshirjen e imazhit: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <div className="space-y-2">
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-md border"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isDeleting}
                className="opacity-90 hover:opacity-100"
              >
                {isDeleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-4 text-center">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Nuk ka imazh të ngarkuar
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Duke kompresuar dhe ngarkuar...' : 'Ngarko Imazh'}
          </Button>
          
          {previewUrl && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveImage}
              disabled={isDeleting || isUploading}
              className="px-3"
            >
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
        
        <p className="text-xs text-muted-foreground">
          Imazhet kompresohen automatikisht në WebP për të reduktuar madhësinë (max 1200px, 85% cilësi)
        </p>
      </div>
    </div>
  );
}
