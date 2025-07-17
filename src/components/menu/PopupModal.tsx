
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
  button_text: string;
  wheel_enabled: boolean;
  wheel_unlock_text: string;
  wheel_unlock_button_text: string;
  wheel_rewards: Array<{
    text: string;
    chance: number;
    color: string;
  }>;
}

interface PopupModalProps {
  settings: PopupSettings;
  restaurantName: string;
}

export const PopupModal: React.FC<PopupModalProps> = ({ settings, restaurantName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonReward, setWonReward] = useState<string>('');

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
    if (settings.type === 'wheel' && settings.wheel_enabled) {
      setShowWheel(true);
    } else if (settings.link) {
      window.open(settings.link, '_blank');
      setIsOpen(false);
    } else {
      // If no link, just close the popup
      setIsOpen(false);
    }
  };

  const handleWheelComplete = (result: string) => {
    setHasSpun(true);
    setWonReward(result);
    // Show result for 5 seconds then close
    setTimeout(() => {
      setIsOpen(false);
      setShowWheel(false);
      setHasSpun(false);
      setWonReward('');
    }, 5000);
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

              {settings.type === 'wheel' && settings.wheel_enabled ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {settings.wheel_unlock_text}
                  </p>
                  <Button 
                    onClick={handleCtaClick}
                    className="w-full"
                  >
                    {settings.wheel_unlock_button_text}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleCtaClick}
                  className="w-full flex items-center gap-2"
                >
                  {settings.button_text}
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
                    rewards={settings.wheel_rewards}
                    onComplete={handleWheelComplete}
                  />
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-primary">
                    🎉 Congratulations!
                  </p>
                  <p className="text-xl font-bold text-primary">
                    You won: {wonReward}
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
