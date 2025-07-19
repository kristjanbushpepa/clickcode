
import { Building2, Menu as MenuIcon, Palette, QrCode, Zap, Languages } from 'lucide-react';

interface MobileTabBarProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const navigationItems = [
  { title: 'Profile', value: 'profile', icon: Building2 },
  { title: 'Menu', value: 'menu', icon: MenuIcon },
  { title: 'Translate', value: 'translations', icon: Languages },
  { title: 'QR Code', value: 'qr-generator', icon: QrCode },
  { title: 'Popup', value: 'popup', icon: Zap },
  { title: 'Theme', value: 'customization', icon: Palette },
];

export function MobileTabBar({ onTabChange, activeTab }: MobileTabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
      <div className="grid grid-cols-6 h-16 bg-background">
        {navigationItems.map((item) => (
          <button
            key={item.value}
            onClick={() => onTabChange(item.value)}
            className={`flex flex-col items-center justify-center p-1 transition-colors ${
              activeTab === item.value
                ? 'text-primary bg-accent/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium truncate">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
