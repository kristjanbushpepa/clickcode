
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface LayoutPreviewProps {
  layoutStyle: 'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine';
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
