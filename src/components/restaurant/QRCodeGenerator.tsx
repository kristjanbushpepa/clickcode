
import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Eye, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface QRCodeConfig {
  url: string;
  size: number;
  format: 'PNG' | 'SVG';
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  color: {
    dark: string;
    light: string;
  };
}

export function QRCodeGenerator() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [config, setConfig] = useState<QRCodeConfig>({
    url: window.location.origin + '/menu',
    size: 512,
    format: 'PNG',
    errorCorrectionLevel: 'M',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const options = {
        errorCorrectionLevel: config.errorCorrectionLevel,
        margin: config.margin,
        color: config.color,
        width: config.size
      };

      if (config.format === 'PNG') {
        const dataUrl = await QRCode.toDataURL(config.url, options);
        setQrCodeDataUrl(dataUrl);
        setQrCodeSvg('');
      } else {
        const svgString = await QRCode.toString(config.url, {
          ...options,
          type: 'svg'
        });
        setQrCodeSvg(svgString);
        setQrCodeDataUrl('');
      }

      toast({
        title: "QR Kodi u gjenerua me sukses",
        description: `QR kodi ${config.format} është gati për shkarkim`
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Gabim në gjenerimin e QR kodit",
        description: "Provoni përsëri ose kontrolloni URL-në",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (config.format === 'PNG' && qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `menu-qr-code-${Date.now()}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    } else if (config.format === 'SVG' && qrCodeSvg) {
      const blob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `menu-qr-code-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(config.url);
      toast({
        title: "URL-ja u kopjua",
        description: "URL-ja e menusë u kopjua në clipboard"
      });
    } catch (error) {
      toast({
        title: "Gabim në kopjim",
        description: "Nuk mund të kopjojmë URL-në",
        variant: "destructive"
      });
    }
  };

  const openPreview = () => {
    window.open(config.url, '_blank');
  };

  const generateDynamicUrl = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const dynamicUrl = `${window.location.origin}/qr/${randomId}`;
    setConfig(prev => ({ ...prev, url: dynamicUrl }));
    toast({
      title: "URL dinamike u gjenerua",
      description: "Mund ta ndryshoni destinacionin më vonë"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gjeneratori i QR Kodeve</h1>
          <p className="text-muted-foreground">Krijoni QR kode unike që lidhen me menunë digjitale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Konfigurimi i QR Kodit
            </CardTitle>
            <CardDescription>
              Personalizoni QR kodin për menunë tuaj
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL e Menusë</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  value={config.url}
                  onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://restaurant.com/menu"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  title="Kopjo URL-në"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openPreview}
                  title="Shiko menunë"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={generateDynamicUrl}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Gjeneroni URL Dinamike
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Formati</Label>
                <Select
                  value={config.format}
                  onValueChange={(value: 'PNG' | 'SVG') => 
                    setConfig(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PNG">
                      PNG (Statik)
                      <Badge variant="secondary" className="ml-2">Printim i mirë</Badge>
                    </SelectItem>
                    <SelectItem value="SVG">
                      SVG (Vektor)
                      <Badge variant="secondary" className="ml-2">Cilësi e lartë</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Madhësia (px)</Label>
                <Select
                  value={config.size.toString()}
                  onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, size: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">256px - E vogël</SelectItem>
                    <SelectItem value="512">512px - Mesatare</SelectItem>
                    <SelectItem value="1024">1024px - E madhe</SelectItem>
                    <SelectItem value="2048">2048px - Shumë e madhe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="errorLevel">Niveli i Korrigjimit</Label>
                <Select
                  value={config.errorCorrectionLevel}
                  onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => 
                    setConfig(prev => ({ ...prev, errorCorrectionLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L - I ulët (~7%)</SelectItem>
                    <SelectItem value="M">M - Mesatar (~15%)</SelectItem>
                    <SelectItem value="Q">Q - I lartë (~25%)</SelectItem>
                    <SelectItem value="H">H - Shumë i lartë (~30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin">Margjina</Label>
                <Select
                  value={config.margin.toString()}
                  onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, margin: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 - E vogël</SelectItem>
                    <SelectItem value="4">4 - Standarde</SelectItem>
                    <SelectItem value="6">6 - E madhe</SelectItem>
                    <SelectItem value="8">8 - Shumë e madhe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="darkColor">Ngjyra e Errët</Label>
                <div className="flex gap-2">
                  <Input
                    id="darkColor"
                    type="color"
                    value={config.color.dark}
                    onChange={(e) => 
                      setConfig(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, dark: e.target.value } 
                      }))
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.color.dark}
                    onChange={(e) => 
                      setConfig(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, dark: e.target.value } 
                      }))
                    }
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lightColor">Ngjyra e Dritë</Label>
                <div className="flex gap-2">
                  <Input
                    id="lightColor"
                    type="color"
                    value={config.color.light}
                    onChange={(e) => 
                      setConfig(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, light: e.target.value } 
                      }))
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.color.light}
                    onChange={(e) => 
                      setConfig(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, light: e.target.value } 
                      }))
                    }
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={generateQRCode} 
              disabled={isGenerating || !config.url}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Duke gjeneruar...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gjeneroni QR Kodin
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview and Download Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Pamja Paraprake dhe Shkarkimi</CardTitle>
            <CardDescription>
              QR kodi juaj i gjeneruar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(qrCodeDataUrl || qrCodeSvg) ? (
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                  {qrCodeDataUrl && (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code për menunë" 
                      className="max-w-full h-auto"
                      style={{ maxHeight: '300px' }}
                    />
                  )}
                  {qrCodeSvg && (
                    <div 
                      dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                      className="max-w-full"
                      style={{ maxHeight: '300px' }}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{config.format}</Badge>
                    <Badge variant="outline">{config.size}px</Badge>
                    <Badge variant="outline">Korrigjim {config.errorCorrectionLevel}</Badge>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded text-sm break-all">
                    <strong>URL:</strong> {config.url}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadQRCode} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Shkarkoni për Printim
                  </Button>
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={openPreview}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ende pa QR kod</h3>
                <p className="text-muted-foreground mb-4">
                  Konfiguroni opsionet dhe klikoni "Gjeneroni QR Kodin" për të krijuar kodin tuaj
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Udhëzime për Përdorim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">QR Statik (PNG)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• I mirë për printim</li>
                <li>• URL-ja nuk mund të ndryshohet</li>
                <li>• Cilësi e lartë</li>
                <li>• Më pak fleksibël</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">QR Dinamik (Opsional)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• URL-ja mund të ndryshohet</li>
                <li>• Statistika të leximit</li>
                <li>• Menaxhim më i mirë</li>
                <li>• Kërkon shërbim ridrejtimi</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Këshilla për Printim</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Përdorni 300 DPI minimum</li>
                <li>• Madhësi të paktën 2cm x 2cm</li>
                <li>• Testoni para printimit</li>
                <li>• Shmangni ngjyrat shumë të lehta</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
