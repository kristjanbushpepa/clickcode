import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Download, ExternalLink } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { createClient } from '@supabase/supabase-js';

export function QRCodeGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [layout, setLayout] = useState('categories');
  const [restaurantName, setRestaurantName] = useState('');
  const [menuUrl, setMenuUrl] = useState('');

  // Get restaurant info from session storage
  const getRestaurantInfo = () => {
    try {
      const restaurantInfo = sessionStorage.getItem('restaurant_info');
      if (!restaurantInfo) return null;
      return JSON.parse(restaurantInfo);
    } catch (error) {
      console.error('Error parsing restaurant info:', error);
      return null;
    }
  };

  // Load restaurant profile to get the name
  useEffect(() => {
    const loadRestaurantProfile = async () => {
      const restaurantInfo = getRestaurantInfo();
      if (!restaurantInfo) return;

      try {
        const supabase = createClient(restaurantInfo.supabase_url, restaurantInfo.supabase_anon_key);
        
        const { data: profile, error } = await supabase
          .from('restaurant_profile')
          .select('name')
          .single();

        if (error) {
          console.error('Error loading restaurant profile:', error);
          // Fallback to restaurant info name
          setRestaurantName(restaurantInfo.name || 'restaurant');
          return;
        }

        const name = profile?.name || restaurantInfo.name || 'restaurant';
        setRestaurantName(name);
      } catch (error) {
        console.error('Error:', error);
        // Fallback to restaurant info name
        const restaurantInfo = getRestaurantInfo();
        setRestaurantName(restaurantInfo?.name || 'restaurant');
      }
    };

    loadRestaurantProfile();
  }, []);

  // Generate menu URL with restaurant name
  useEffect(() => {
    if (restaurantName) {
      // Convert restaurant name to URL-friendly format
      const urlFriendlyName = restaurantName.toLowerCase().replace(/\s+/g, '-');
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/menu/${urlFriendlyName}${layout !== 'categories' ? `?layout=${layout}` : ''}`;
      setMenuUrl(url);
    }
  }, [restaurantName, layout]);

  const generateQRCode = () => {
    QRCodeLib.toDataURL(menuUrl, {
      errorCorrectionLevel: 'H'
    }, (err, url) => {
      if (err) {
        console.error(err);
        return;
      }
      setQrCodeUrl(url);
    });
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'menu_qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <QrCode className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">QR Code Generator</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant-name">Restaurant Name</Label>
            <Input
              id="restaurant-name"
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Enter restaurant name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger id="layout">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="categories">Categories</SelectItem>
                <SelectItem value="all">All Items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Menu URL</Label>
            <div className="flex items-center">
              <Input
                type="text"
                value={menuUrl}
                readOnly
                className="cursor-not-allowed"
              />
              <Button variant="ghost" size="sm" onClick={() => window.open(menuUrl, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
        </CardHeader>
        <CardContent className="grid place-items-center">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" />
          ) : (
            <p className="text-muted-foreground">Generate a QR code to display here</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={generateQRCode}>
          <QrCode className="h-4 w-4 mr-2" />
          Generate QR Code
        </Button>
        {qrCodeUrl && (
          <Button variant="secondary" onClick={downloadQRCode}>
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        )}
      </div>
    </div>
  );
}
