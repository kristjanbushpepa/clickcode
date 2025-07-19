
import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantSidebar } from '@/components/restaurant/RestaurantSidebar';
import { ProfileManagement } from '@/components/restaurant/ProfileManagement';
import { MenuManagement } from '@/components/restaurant/MenuManagement';
import { QRCodeGenerator } from '@/components/restaurant/QRCodeGenerator';
import CustomizationSettings from '@/components/restaurant/CustomizationSettings';
import { TranslationManager } from '@/components/restaurant/TranslationManager';
import { PopupSettings } from '@/components/restaurant/PopupSettings';
import { DashboardFormProvider } from '@/contexts/DashboardFormContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const isMobile = useIsMobile();
  const location = useLocation();

  // Determine active component based on route (for desktop) or tab (for mobile)
  const getActiveComponent = () => {
    if (!isMobile) {
      // Desktop: use route-based navigation
      const path = location.pathname;
      if (path.includes('/menu')) return <MenuManagement />;
      if (path.includes('/qr-generator')) return <QRCodeGenerator />;
      if (path.includes('/popup')) return <PopupSettings />;
      if (path.includes('/customization')) return <CustomizationSettings />;
      if (path.includes('/translations')) return <TranslationManager />;
      return <ProfileManagement />; // default
    } else {
      // Mobile: use tab-based navigation
      switch (activeTab) {
        case 'menu': return <MenuManagement />;
        case 'translations': return <TranslationManager />;
        case 'qr-generator': return <QRCodeGenerator />;
        case 'popup': return <PopupSettings />;
        case 'customization': return <CustomizationSettings />;
        default: return <ProfileManagement />;
      }
    }
  };

  return (
    <DashboardFormProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          {!isMobile && <RestaurantSidebar />}
          
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b bg-background px-4">
              {!isMobile && <SidebarTrigger />}
              <div className={isMobile ? "mx-auto" : "ml-4"}>
                <h1 className="text-lg font-semibold">Restaurant Dashboard</h1>
              </div>
            </header>
            
            <main className="flex-1 p-6">
              {isMobile ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="profile" className="text-xs sm:text-sm">
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="menu" className="text-xs sm:text-sm">
                      Menu
                    </TabsTrigger>
                    <TabsTrigger value="translations" className="text-xs sm:text-sm">
                      Trans
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="mt-0">
                    <ProfileManagement />
                  </TabsContent>

                  <TabsContent value="menu" className="mt-0">
                    <MenuManagement />
                  </TabsContent>

                  <TabsContent value="translations" className="mt-0">
                    <TranslationManager />
                  </TabsContent>

                  <TabsContent value="qr-generator" className="mt-0">
                    <QRCodeGenerator />
                  </TabsContent>

                  <TabsContent value="popup" className="mt-0">
                    <PopupSettings />
                  </TabsContent>

                  <TabsContent value="customization" className="mt-0">
                    <CustomizationSettings />
                  </TabsContent>

                  {/* Mobile dropdown for additional tabs */}
                  <div className="fixed bottom-4 right-4">
                    <select 
                      value={activeTab} 
                      onChange={(e) => setActiveTab(e.target.value)}
                      className="bg-background border rounded-lg px-3 py-2 text-sm shadow-lg"
                    >
                      <option value="profile">Profile</option>
                      <option value="menu">Menu</option>
                      <option value="translations">Translations</option>
                      <option value="qr-generator">QR Code</option>
                      <option value="popup">Popup Settings</option>
                      <option value="customization">Customization</option>
                    </select>
                  </div>
                </Tabs>
              ) : (
                // Desktop: render component based on route
                getActiveComponent()
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DashboardFormProvider>
  );
};

export default RestaurantDashboard;
