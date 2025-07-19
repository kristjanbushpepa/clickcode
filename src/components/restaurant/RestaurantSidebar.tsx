
import { Building2, Menu as MenuIcon, Palette, QrCode, Zap, LogOut, Languages } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { clearRestaurantLogin } from '@/utils/restaurantDatabase';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface RestaurantSidebarProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const navigationItems = [
  { title: 'Profile', value: 'profile', icon: Building2 },
  { title: 'Menu Management', value: 'menu', icon: MenuIcon },
  { title: 'Translations', value: 'translations', icon: Languages },
  { title: 'QR Code Generator', value: 'qr-generator', icon: QrCode },
  { title: 'Popup & Wheel', value: 'popup', icon: Zap },
  { title: 'Customization', value: 'customization', icon: Palette },
];

export function RestaurantSidebar({ onTabChange, activeTab }: RestaurantSidebarProps) {
  const { state } = useSidebar();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear restaurant login data first
      clearRestaurantLogin();
      console.log('Restaurant login data cleared');
      
      // Sign out from main auth context
      await signOut();
      console.log('Auth context signed out');
      
      // Force redirect to login page
      window.location.href = '/restaurant/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Force redirect even if there's an error
      clearRestaurantLogin();
      window.location.href = '/restaurant/login';
    }
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary font-semibold">
            {!isCollapsed && 'Restaurant Dashboard'}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.value)}
                    className={activeTab === item.value 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="hover:bg-red-500/10 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
