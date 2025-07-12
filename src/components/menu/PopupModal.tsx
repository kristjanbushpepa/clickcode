import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SpinWheel } from './SpinWheel';
import { ExternalLink, X } from 'lucide-react';

interface PopupSettings {
  enabled: boolean;
  type: 'cta' | 'wheel';
  title: string;
  description: string;
  link: string;
  buttonText: string;
  wheelSettings: {
    enabled: boolean;
    unlockText: string;
    unlockButtonText: string;
    rewards: Array<{
      text: string;
      chance: number;
      color: string;
    }>;
  };
}

interface PopupModalProps {
  settings: PopupSettings;
  restaurantName: string;
}

export const PopupModal: React.FC<PopupModalProps> = ({ settings, restaurantName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  useEffect(() => {
    if (settings.enabled) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [settings.enabled]);

  const handleCtaClick = () => {
    if (settings.type === 'wheel' && settings.wheelSettings.enabled) {
      setShowWheel(true);
    } else if (settings.link) {
      window.open(settings.link, '_blank');
      setIsOpen(false);
    }
  };

  const handleWheelComplete = (result: string) => {
    setHasSpun(true);
    // Show result for 3 seconds then close
    setTimeout(() => {
      setIsOpen(false);
      setShowWheel(false);
      setHasSpun(false);
    }, 3000);
  };

  if (!settings.enabled) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{settings.title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showWheel ? (
            <>
              <p className="text-muted-foreground">
                {settings.description}
              </p>

              {settings.type === 'wheel' && settings.wheelSettings.enabled ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {settings.wheelSettings.unlockText}
                  </p>
                  <Button 
                    onClick={handleCtaClick}
                    className="w-full"
                  >
                    {settings.wheelSettings.unlockButtonText}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleCtaClick}
                  className="w-full flex items-center gap-2"
                >
                  {settings.buttonText}
                  {settings.link && <ExternalLink className="h-4 w-4" />}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              {!hasSpun ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Thanks for your support! Spin to win your reward:
                  </p>
                  <SpinWheel 
                    rewards={settings.wheelSettings.rewards}
                    onComplete={handleWheelComplete}
                  />
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-primary">
                    🎉 Congratulations!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Show this screen to claim your reward!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};