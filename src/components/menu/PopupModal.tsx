
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
  showAfterSeconds: number;
  dailyLimit: number;
  wheelSettings: {
    enabled: boolean;
    unlockType: 'free' | 'link';
    unlockText: string;
    unlockButtonText: string;
    unlockLink: string;
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
  const [wonReward, setWonReward] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!settings.enabled) return;

    // Check daily limit
    const today = new Date().toDateString();
    const storageKey = `popup_shown_${restaurantName}_${today}`;
    const shownCount = parseInt(localStorage.getItem(storageKey) || '0');

    if (shownCount >= settings.dailyLimit) return;

    // Show popup after specified seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Increment shown count
      localStorage.setItem(storageKey, (shownCount + 1).toString());
    }, settings.showAfterSeconds * 1000);

    return () => clearTimeout(timer);
  }, [settings.enabled, settings.showAfterSeconds, settings.dailyLimit, restaurantName]);

  const handleCtaClick = () => {
    if (settings.type === 'wheel' && settings.wheelSettings.enabled) {
      if (settings.wheelSettings.unlockType === 'free') {
        setShowWheel(true);
      } else if (settings.wheelSettings.unlockType === 'link' && settings.wheelSettings.unlockLink) {
        // Open the actual link provided, not just any subdomain
        window.open(settings.wheelSettings.unlockLink, '_blank');
        // Start 5-second countdown for wheel unlock
        setTimeLeft(5);
        const countdown = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              setShowWheel(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else if (settings.link) {
      window.open(settings.link, '_blank');
      setIsOpen(false);
    }
  };

  const handleWheelComplete = (result: string) => {
    setWonReward(result);
    setHasSpun(true);
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

              {settings.type === 'wheel' && settings.wheelSettings.enabled ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {settings.wheelSettings.unlockText}
                  </p>
                  {settings.wheelSettings.unlockType === 'link' && timeLeft > 0 && timeLeft < 5 ? (
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Wheel unlocks in {timeLeft} seconds...
                      </p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${((5 - timeLeft) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleCtaClick}
                      className="w-full"
                      disabled={settings.wheelSettings.unlockType === 'link' && timeLeft > 0 && timeLeft < 5}
                    >
                      {settings.wheelSettings.unlockButtonText}
                    </Button>
                  )}
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
                    {settings.wheelSettings.unlockType === 'free' 
                      ? 'Spin the wheel for your reward!' 
                      : 'Thanks for visiting the link! Spin to win your reward:'
                    }
                  </p>
                  <SpinWheel 
                    rewards={settings.wheelSettings.rewards}
                    onComplete={handleWheelComplete}
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <div className="text-6xl">🎉</div>
                  <p className="text-lg font-semibold text-primary">
                    Congratulations!
                  </p>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-xl font-bold text-primary">
                      {wonReward}
                    </p>
                  </div>
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
