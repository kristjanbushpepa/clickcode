import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MenuSkeletonProps {
  layoutStyle?: 'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine';
}

export const MenuItemSkeleton = ({ layoutStyle = 'compact' }: MenuSkeletonProps) => {
  switch (layoutStyle) {
    case 'compact':
      return (
        <Card className="menu-card animate-pulse">
          <div className="p-3">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="h-4 bg-muted rounded-md w-32 loading-shimmer"></div>
                  <div className="h-5 bg-muted rounded-full w-16 loading-shimmer"></div>
                </div>
                <div className="h-3 bg-muted rounded-md w-full mb-2 loading-shimmer"></div>
                <div className="h-3 bg-muted rounded-md w-3/4 loading-shimmer"></div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-5 bg-muted rounded-full w-12 loading-shimmer"></div>
                  <div className="h-3 bg-muted rounded-md w-12 loading-shimmer"></div>
                </div>
              </div>
              <div className="w-14 h-14 bg-muted rounded-lg flex-shrink-0 loading-shimmer"></div>
            </div>
          </div>
        </Card>
      );

    case 'card-grid':
      return (
        <Card className="menu-card animate-pulse">
          <div className="w-full h-32 bg-muted loading-shimmer"></div>
          <div className="p-3">
            <div className="h-4 bg-muted rounded-md w-full mb-2 loading-shimmer"></div>
            <div className="h-3 bg-muted rounded-md w-3/4 mb-2 loading-shimmer"></div>
            <div className="flex items-center justify-between">
              <div className="h-5 bg-muted rounded-full w-16 loading-shimmer"></div>
              <div className="h-3 bg-muted rounded-md w-12 loading-shimmer"></div>
            </div>
          </div>
        </Card>
      );

    case 'image-focus':
      return (
        <Card className="menu-card animate-pulse">
          <div className="w-full h-40 bg-muted loading-shimmer"></div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="h-4 bg-muted rounded-md w-32 loading-shimmer"></div>
              <div className="h-5 bg-muted rounded-full w-16 loading-shimmer"></div>
            </div>
            <div className="h-3 bg-muted rounded-md w-full mb-2 loading-shimmer"></div>
            <div className="h-3 bg-muted rounded-md w-2/3 mb-3 loading-shimmer"></div>
            <div className="flex items-center gap-2">
              <div className="h-5 bg-muted rounded-full w-12 loading-shimmer"></div>
              <div className="h-3 bg-muted rounded-md w-12 loading-shimmer"></div>
            </div>
          </div>
        </Card>
      );

    case 'minimal':
      return (
        <div className="border-b pb-3 mb-3 animate-pulse">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="h-4 bg-muted rounded-md w-32 loading-shimmer"></div>
            <div className="h-4 bg-muted rounded-md w-16 loading-shimmer"></div>
          </div>
          <div className="h-3 bg-muted rounded-md w-full mb-2 loading-shimmer"></div>
          <div className="h-3 bg-muted rounded-md w-3/4 mb-2 loading-shimmer"></div>
          <div className="h-3 bg-muted rounded-md w-12 loading-shimmer"></div>
        </div>
      );

    case 'magazine':
      return (
        <Card className="menu-card animate-pulse">
          <div className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="h-4 bg-muted rounded-md w-32 mb-2 loading-shimmer"></div>
                <div className="h-3 bg-muted rounded-md w-full mb-2 loading-shimmer"></div>
                <div className="h-3 bg-muted rounded-md w-3/4 mb-3 loading-shimmer"></div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-muted rounded-md w-12 loading-shimmer"></div>
                  <div className="h-5 bg-muted rounded-full w-16 loading-shimmer"></div>
                </div>
              </div>
              <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 loading-shimmer"></div>
            </div>
          </div>
        </Card>
      );

    default:
      return null;
  }
};

export const CategorySkeleton = () => (
  <Card className="category-card animate-pulse">
    <CardContent className="p-3 h-28 flex flex-col">
      <div className="flex-1">
        <div className="h-4 bg-muted rounded-md w-24 mb-2 loading-shimmer"></div>
        <div className="h-3 bg-muted rounded-md w-full mb-1 loading-shimmer"></div>
        <div className="h-3 bg-muted rounded-md w-3/4 loading-shimmer"></div>
      </div>
      <div className="h-3 bg-muted rounded-md w-12 mt-2 loading-shimmer"></div>
    </CardContent>
  </Card>
);

export const MenuHeaderSkeleton = () => (
  <div className="relative">
    <div className="px-3 py-4 animate-pulse">
      <div className="max-w-sm mx-auto">
        <div className="flex justify-between items-start mb-3">
          <div className="h-10 w-10 bg-muted/50 rounded-full loading-shimmer"></div>
          <div className="flex gap-1">
            <div className="h-6 w-16 bg-muted/50 rounded-md loading-shimmer"></div>
            <div className="h-6 w-16 bg-muted/50 rounded-md loading-shimmer"></div>
          </div>
        </div>
        <div className="text-center">
          <div className="h-6 bg-muted/50 rounded-md w-48 mx-auto mb-2 loading-shimmer"></div>
          <div className="h-4 bg-muted/50 rounded-md w-32 mx-auto mb-2 loading-shimmer"></div>
          <div className="flex justify-center gap-3">
            <div className="h-4 w-4 bg-muted/50 rounded loading-shimmer"></div>
            <div className="h-4 w-4 bg-muted/50 rounded loading-shimmer"></div>
            <div className="h-4 w-4 bg-muted/50 rounded loading-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const MenuLoadingSkeleton = ({ layoutStyle = 'compact' }: MenuSkeletonProps) => (
  <div className="min-h-screen bg-background">
    <MenuHeaderSkeleton />
    
    <div className="px-3 py-3">
      <div className="max-w-sm mx-auto">
        <div className="h-10 bg-muted rounded-lg mb-4 loading-shimmer"></div>
        
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded-md w-32 loading-shimmer"></div>
          
          <div className={layoutStyle === 'card-grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <MenuItemSkeleton layoutStyle={layoutStyle} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);