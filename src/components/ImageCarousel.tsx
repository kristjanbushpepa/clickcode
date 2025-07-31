import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Smartphone, Monitor, X } from 'lucide-react';
interface CarouselImage {
  src: string;
  title: string;
  description?: string;
}
interface ImageCarouselProps {
  mobileImages: CarouselImage[];
  desktopImages: CarouselImage[];
}
export const ImageCarousel = ({
  mobileImages,
  desktopImages
}: ImageCarouselProps) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedImage, setSelectedImage] = useState<CarouselImage | null>(null);

  // Define the actual uploaded images organized by feature
  const actualMobileImages: CarouselImage[] = [{
    src: '/lovable-uploads/0530c405-601e-4e49-81a9-16cc706f8124.png',
    title: 'Currency Settings',
    description: 'Manage exchange rates and supported currencies on mobile'
  }, {
    src: '/lovable-uploads/e1955114-98b5-4aab-80af-1e6530e060b6.png',
    title: 'Translation Management',
    description: 'Multi-language support with easy content translation'
  }, {
    src: '/lovable-uploads/66990fda-a9a2-470d-aacc-9e5ceff842c0.png',
    title: 'Theme Customization',
    description: 'Choose from multiple beautiful themes for your menu'
  }, {
    src: '/lovable-uploads/c51368a7-3a45-48de-834f-289b8d5382a0.png',
    title: 'Profile Management',
    description: 'Update restaurant information and contact details'
  }, {
    src: '/lovable-uploads/3edd287b-8fa3-4357-8d92-61f81c924434.png',
    title: 'Popup Settings',
    description: 'Configure review platform integrations and popups'
  }];
  const actualDesktopImages: CarouselImage[] = [{
    src: '/lovable-uploads/c3288dac-8893-4f6a-880d-a6fcf8982445.png',
    title: 'Currency Settings',
    description: 'Full desktop currency management dashboard'
  }, {
    src: '/lovable-uploads/82e923c6-2809-41e2-bc19-e6820f8bc519.png',
    title: 'Menu Management',
    description: 'Comprehensive menu item management with rich media'
  }, {
    src: '/lovable-uploads/6ca9ca6e-dd6c-49b7-8c4c-06f02516381b.png',
    title: 'Menu Overview',
    description: 'Visual menu management with drag-and-drop functionality'
  }, {
    src: '/lovable-uploads/f1644b5c-3fa9-4e2b-a881-c2dca11a9102.png',
    title: 'Profile Management',
    description: 'Complete restaurant profile management interface'
  }, {
    src: '/lovable-uploads/2a6061bd-3aff-4d68-ada3-85f5cf2fb532.png',
    title: 'Theme Customization',
    description: 'Advanced theme customization with live preview'
  }];
  const currentImages = viewMode === 'mobile' ? actualMobileImages : actualDesktopImages;
  return <div className="w-full space-y-6">
      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant={viewMode === 'mobile' ? 'default' : 'outline'} onClick={() => setViewMode('mobile')} className={`flex items-center gap-2 px-6 py-3 transition-all duration-300 ${viewMode === 'mobile' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}>
          <Smartphone className="h-5 w-5" />
          Mobile View
        </Button>
        <Button variant={viewMode === 'desktop' ? 'default' : 'outline'} onClick={() => setViewMode('desktop')} className={`flex items-center gap-2 px-6 py-3 transition-all duration-300 ${viewMode === 'desktop' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}>
          <Monitor className="h-5 w-5" />
          Desktop View
        </Button>
      </div>

      {/* Image Carousel */}
      <div className="relative px-12">
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {currentImages.map((image, index) => <CarouselItem key={`${viewMode}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                <Card className="bg-white/70 backdrop-blur-md border border-blue-100 hover:bg-white/90 transition-all duration-300 group hover:scale-105 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg overflow-hidden mb-4 border-2 border-blue-100 cursor-pointer" onClick={() => setSelectedImage(image)}>
                      <img src={image.src} alt={image.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">
                      {image.title}
                    </h3>
                    {image.description && <p className="text-slate-600 text-center text-sm">
                        {image.description}
                      </p>}
                  </CardContent>
                </Card>
              </CarouselItem>)}
          </CarouselContent>
          <CarouselPrevious className="bg-white/80 backdrop-blur-md border-blue-200 hover:bg-white/90" />
          <CarouselNext className="bg-white/80 backdrop-blur-md border-blue-200 hover:bg-white/90" />
        </Carousel>
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-0 shadow-none">
          <div className="relative">
            
            {selectedImage && <img src={selectedImage.src} alt={selectedImage.title} className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};