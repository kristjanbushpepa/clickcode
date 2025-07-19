
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, ExternalLink, Eye, QrCode, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getRestaurantInfo } from '@/utils/restaurantDatabase';
import { useToast } from '@/hooks/use-toast';

export const QRCodeGenerator = () => {
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [qrSize, setQrSize] = useState('256');
  const [qrLevel, setQrLevel] = useState('M');
  const [menuUrl, setMenuUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const info = getRestaurantInfo();
    if (info) {
      setRestaurantInfo(info);
      // Use restaurant name for the URL, convert spaces to hyphens and make lowercase
      const restaurantNameForUrl = info.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const url = `${window.location.origin}/menu/${restaurantNameForUrl}`;
      setMenuUrl(url);
    }
  }, []);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      toast({
        title: "URL Copied!",
        description: "Menu URL has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('#qr-code-svg') as SVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = parseInt(qrSize);
    canvas.height = parseInt(qrSize);
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `menu-qr-code-${restaurantInfo?.name || 'restaurant'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleTestMenu = () => {
    // Check if running in PWA mode
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    
    if (isPWA) {
      // Open in external browser for PWA
      window.open(menuUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Open in new tab for regular browser
      window.open(menuUrl, '_blank');
    }
  };

  if (!restaurantInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <QrCode className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Loading QR Code Generator</h3>
          <p className="text-muted-foreground">Please wait while we load your restaurant information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">QR Code Generator</h2>
        <p className="text-muted-foreground">
          Generate QR codes for your digital menu that customers can scan to view your menu instantly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Menu QR Code
            </CardTitle>
            <CardDescription>
              Scan this QR code to access your digital menu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-6 bg-white rounded-lg border">
              <QRCodeSVG
                id="qr-code-svg"
                value={menuUrl}
                size={parseInt(qrSize)}
                level={qrLevel as 'L' | 'M' | 'Q' | 'H'}
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleDownloadQR} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
              <Button variant="outline" onClick={handleTestMenu} className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Test Menu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Settings & Info */}
        <div className="space-y-6">
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Settings</CardTitle>
              <CardDescription>
                Customize your QR code appearance and error correction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-size">Size (pixels)</Label>
                <Select value={qrSize} onValueChange={setQrSize}>
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

              <div className="space-y-2">
                <Label htmlFor="qr-level">Error Correction Level</Label>
                <Select value={qrLevel} onValueChange={setQrLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Menu URL Card */}
          <Card>
            <CardHeader>
              <CardTitle>Menu URL</CardTitle>
              <CardDescription>
                Your unique menu link that the QR code will direct customers to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={menuUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleTestMenu}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Mobile-optimized and fast loading</span>
              </div>
            </CardContent>
          </Card>

          {/* Usage Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="secondary" className="w-fit">Printing</Badge>
                <p className="text-sm text-muted-foreground">
                  For best results when printing, use high error correction and larger sizes (512px+)
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Badge variant="secondary" className="w-fit">Placement</Badge>
                <p className="text-sm text-muted-foreground">
                  Place QR codes on tables, menus, or storefront where customers can easily scan them
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Badge variant="secondary" className="w-fit">Testing</Badge>
                <p className="text-sm text-muted-foreground">
                  Always test your QR codes with different devices before printing or displaying
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
