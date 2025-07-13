
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, ExternalLink, Copy, Check, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getRestaurantInfo } from '@/utils/restaurantDatabase';
import { convertRestaurantNameToUrl, convertUrlToRestaurantName } from '@/utils/nameConversion';

export function QRCodeGenerator() {
  const [layout, setLayout] = useState<'categories' | 'items' | 'grid'>('categories');
  const [size, setSize] = useState(256);
  const [includeMargin, setIncludeMargin] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const restaurantInfo = getRestaurantInfo();
  
  // Create restaurant-friendly URL using consistent conversion logic
  const getRestaurantUrlName = () => {
    if (!restaurantInfo?.name) {
      return '';
    }
    
    return convertRestaurantNameToUrl(restaurantInfo.name);
  };

  const restaurantUrlName = getRestaurantUrlName();
  const menuUrl = `${window.location.origin}/menu/${restaurantUrlName}${layout !== 'categories' ? `?layout=${layout}` : ''}`;

  // Validate URL conversion
  const validateUrlConversion = () => {
    if (!restaurantInfo?.name || !restaurantUrlName) return null;
    
    const convertedBack = convertUrlToRestaurantName(restaurantUrlName);
    const isExactMatch = convertedBack.toLowerCase() === restaurantInfo.name.toLowerCase();
    
    return {
      original: restaurantInfo.name,
      urlFriendly: restaurantUrlName,
      convertedBack: convertedBack,
      isExactMatch
    };
  };

  const conversionValidation = validateUrlConversion();

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `menu-qr-${restaurantInfo?.name?.toLowerCase().replace(/\s+/g, '-') || 'restaurant'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      toast({
        title: "URL copied to clipboard",
        description: "Menu URL has been copied successfully."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy URL",
        description: "Please copy the URL manually.",
        variant: "destructive"
      });
    }
  };

  const openMenu = () => {
    window.open(menuUrl, '_blank');
  };

  if (!restaurantInfo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <QrCode className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Restaurant information not found</h3>
              <p className="text-muted-foreground">
                Please ensure you're logged in and have restaurant data configured.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!restaurantUrlName) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <QrCode className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Restaurant name not configured</h3>
              <p className="text-muted-foreground">
                Please configure your restaurant's name to generate QR codes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <QrCode className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">QR Code Generator</h1>
      </div>

      {/* URL Conversion Validation Alert */}
      {conversionValidation && !conversionValidation.isExactMatch && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Info className="h-5 w-5" />
              URL Conversion Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Restaurant Name:</strong> {conversionValidation.original}</p>
            <p><strong>URL Format:</strong> {conversionValidation.urlFriendly}</p>
            <p><strong>Will Convert Back To:</strong> {conversionValidation.convertedBack}</p>
            <p className="text-yellow-700">
              The URL conversion may not perfectly match your restaurant name. 
              Test the menu link to ensure it works correctly.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle>Menu QR Code</CardTitle>
            <CardDescription>
              QR code for {restaurantInfo.name} menu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <QRCodeSVG
                  id="qr-code"
                  value={menuUrl}
                  size={size}
                  level="M"
                  includeMargin={includeMargin}
                  className="border rounded"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={downloadQR} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button onClick={openMenu} variant="outline" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Test Menu Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Settings</CardTitle>
            <CardDescription>
              Customize your QR code appearance and menu layout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="layout">Menu Layout</Label>
              <Select value={layout} onValueChange={(value: 'categories' | 'items' | 'grid') => setLayout(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="categories">Categories View</SelectItem>
                  <SelectItem value="items">All Items View</SelectItem>
                  <SelectItem value="grid">Grid View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size (pixels)</Label>
              <Select value={size.toString()} onValueChange={(value) => setSize(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128x128</SelectItem>
                  <SelectItem value="256">256x256</SelectItem>
                  <SelectItem value="512">512x512</SelectItem>
                  <SelectItem value="1024">1024x1024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Menu URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={menuUrl}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyUrl}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="font-medium mb-2">Preview Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Restaurant:</strong> {restaurantInfo.name}</p>
                <p><strong>URL Name:</strong> {restaurantUrlName}</p>
                <p><strong>Layout:</strong> {layout === 'categories' ? 'Categories' : layout === 'items' ? 'All Items' : 'Grid View'}</p>
                <p><strong>Size:</strong> {size}x{size}px</p>
                {conversionValidation && (
                  <p><strong>Conversion Test:</strong> 
                    <span className={conversionValidation.isExactMatch ? 'text-green-600' : 'text-yellow-600'}>
                      {conversionValidation.isExactMatch ? ' ✓ Perfect Match' : ' ⚠ Approximate Match'}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">1. Generate</h4>
              <p className="text-sm text-muted-foreground">
                Customize and download your QR code
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">2. Print</h4>
              <p className="text-sm text-muted-foreground">
                Add to table tents, posters, or receipts
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <ExternalLink className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">3. Test & Share</h4>
              <p className="text-sm text-muted-foreground">
                Test the link first, then customers can scan to view your menu
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Important: Test Your QR Code</h5>
            <p className="text-sm text-blue-800">
              Always click "Test Menu Link" to ensure your QR code works correctly before printing. 
              The URL conversion process may need adjustment for certain restaurant names.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
