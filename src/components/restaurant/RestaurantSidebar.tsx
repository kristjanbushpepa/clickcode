import { NavLink, useLocation } from 'react-router-dom';
import { Building2, Settings, Menu as MenuIcon, BarChart3, Users, Palette } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface RestaurantSidebarProps {}

const navigationItems = [
  { title: 'Profile', url: '/restaurant/dashboard', icon: Building2, exact: true },
  { title: 'Menu Management', url: '/restaurant/dashboard/menu', icon: MenuIcon },
  { title: 'Analytics', url: '/restaurant/dashboard/analytics', icon: BarChart3 },
  { title: 'Customization', url: '/restaurant/dashboard/customization', icon: Palette },
  { title: 'Settings', url: '/restaurant/dashboard/settings', icon: Settings },
];

export function RestaurantSidebar({}: RestaurantSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string, exact?: boolean) => {
    const active = isActive(path, exact);
    return active 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";
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
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.exact}
                      className={getNavCls(item.url, item.exact)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}