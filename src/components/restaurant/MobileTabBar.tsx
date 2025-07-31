
import { Building2, Menu as MenuIcon, Palette, QrCode, Zap, Languages, DollarSign, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface MobileTabBarProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const navigationItems = [
  { title: 'Profile', value: 'profile', icon: Building2 },
  { title: 'Menu', value: 'menu', icon: MenuIcon },
  { title: 'Translate', value: 'translations', icon: Languages },
  { title: 'Currency', value: 'currency', icon: DollarSign },
  { title: 'QR Code', value: 'qr-generator', icon: QrCode },
  { title: 'Popup', value: 'popup', icon: Zap },
  { title: 'Theme', value: 'customization', icon: Palette },
  { title: 'Logout', value: 'logout', icon: LogOut, isSpecial: true },
];

export function MobileTabBar({ onTabChange, activeTab }: MobileTabBarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Clear restaurant login data
      localStorage.removeItem('currentRestaurant');
      sessionStorage.removeItem('currentRestaurant');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Navigate to login page
      navigate('/restaurant-login');
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive",
      });
      
      // Force redirect even if there's an error
      navigate('/restaurant-login');
    }
  };

  const handleItemClick = (item: any) => {
    if (item.value === 'logout') {
      handleLogout();
    } else {
      onTabChange(item.value);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="grid grid-cols-8 h-16 overflow-x-auto scrollbar-hide">
        {navigationItems.map((item) => (
          <button
            key={item.value}
            onClick={() => handleItemClick(item)}
            className={`flex flex-col items-center justify-center p-1 min-w-0 flex-shrink-0 transition-colors ${
              activeTab === item.value && !item.isSpecial
                ? 'text-primary bg-accent/20'
                : item.isSpecial 
                ? 'text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
            }`}
          >
            <item.icon className="h-4 w-4 mb-0.5" />
            <span className="text-[10px] font-medium truncate leading-tight">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
