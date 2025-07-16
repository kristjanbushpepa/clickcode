
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface LayoutPreviewProps {
  layoutStyle: 'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine' | 'modern-card' | 'elegant-list' | 'photo-focus';
}

const LayoutPreview = ({ layoutStyle }: LayoutPreviewProps) => {
  const renderLayout = () => {
    switch (layoutStyle) {
      case 'compact':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 border rounded">
              <div className="w-12 h-12 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">Grilled Salmon</h4>
                  <Badge variant="secondary" className="text-xs">€18.50</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Fresh Atlantic salmon</p>
              </div>
            </div>
          </div>
        );

      case 'card-grid':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-2">
              <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
              <h4 className="font-medium text-xs mb-1">Grilled Salmon</h4>
              <p className="text-xs text-muted-foreground mb-1">Fresh Atlantic salmon</p>
              <Badge variant="secondary" className="text-xs">€18.50</Badge>
            </Card>
            <Card className="p-2">
              <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
              <h4 className="font-medium text-xs mb-1">Margherita Pizza</h4>
              <p className="text-xs text-muted-foreground mb-1">Classic pizza</p>
              <Badge variant="secondary" className="text-xs">€12.00</Badge>
            </Card>
          </div>
        );

      case 'image-focus':
        return (
          <div className="space-y-3">
            <Card className="overflow-hidden">
              <div className="w-full h-24 bg-gray-200"></div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm">Grilled Salmon</h4>
                  <Badge variant="secondary" className="text-xs">€18.50</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Fresh Atlantic salmon grilled to perfection</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  15min
                </div>
              </div>
            </Card>
          </div>
        );

      case 'minimal':
        return (
          <div className="space-y-3">
            <div className="border-b pb-2">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-sm">Grilled Salmon</h4>
                <span className="text-sm font-medium">€18.50</span>
              </div>
              <p className="text-xs text-muted-foreground">Fresh Atlantic salmon grilled to perfection with herbs</p>
            </div>
          </div>
        );

      case 'magazine':
        return (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Grilled Salmon</h4>
                <p className="text-xs text-muted-foreground mb-2">Fresh Atlantic salmon grilled to perfection with herbs and lemon. Served with seasonal vegetables.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    15min
                  </div>
                  <Badge variant="secondary" className="text-xs">€18.50</Badge>
                </div>
              </div>
              <div className="w-20 h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        );

      case 'modern-card':
        return (
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
              <div className="relative">
                <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-blue-500/90 text-white">
                    €18.50
                  </Badge>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm mb-2">Grilled Salmon</h4>
                <p className="text-xs text-muted-foreground mb-3">Fresh Atlantic salmon grilled to perfection</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    15min
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'elegant-list':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 rounded-lg border-l-4 border-l-blue-500 bg-gray-50">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm">Grilled Salmon</h4>
                  <span className="text-sm font-semibold text-blue-600">€18.50</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Fresh Atlantic salmon grilled to perfection</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  15min
                </div>
              </div>
            </div>
          </div>
        );

      case 'photo-focus':
        return (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
                  <h4 className="font-semibold text-sm mb-1">Grilled Salmon</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      15min
                    </div>
                    <span className="text-sm font-semibold">€18.50</span>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground">Fresh Atlantic salmon grilled to perfection with herbs and lemon.</p>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-800 px-3 py-4 text-white">
        <div className="text-center">
          <h1 className="text-lg font-bold mb-1 uppercase tracking-wide">
            Sample Restaurant
          </h1>
          <p className="text-xs opacity-80 uppercase tracking-wide">
            DOWNTOWN LOCATION
          </p>
        </div>
      </div>

      <div className="px-3 py-3">
        <h3 className="text-base font-semibold mb-3">Popular Items</h3>
        {renderLayout()}
      </div>
    </div>
  );
};

export default LayoutPreview;
