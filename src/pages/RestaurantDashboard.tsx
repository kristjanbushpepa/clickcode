
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

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const isMobile = useIsMobile();

  return (
    <DashboardFormProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          {!isMobile && <RestaurantSidebar />}
          
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b bg-background px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">Restaurant Dashboard</h1>
              </div>
            </header>
            
            <main className="flex-1 p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} mb-6`}>
                  <TabsTrigger value="profile" className="text-xs sm:text-sm">
                    {isMobile ? 'Profile' : 'Profile'}
                  </TabsTrigger>
                  <TabsTrigger value="menu" className="text-xs sm:text-sm">
                    {isMobile ? 'Menu' : 'Menu'}
                  </TabsTrigger>
                  <TabsTrigger value="translations" className="text-xs sm:text-sm">
                    {isMobile ? 'Trans' : 'Translations'}
                  </TabsTrigger>
                  {!isMobile && (
                    <>
                      <TabsTrigger value="qr-generator" className="text-xs sm:text-sm">
                        QR Code
                      </TabsTrigger>
                      <TabsTrigger value="popup" className="text-xs sm:text-sm">
                        Popup
                      </TabsTrigger>
                      <TabsTrigger value="customization" className="text-xs sm:text-sm">
                        Custom
                      </TabsTrigger>
                    </>
                  )}
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
              </Tabs>

              {/* Mobile dropdown for additional tabs */}
              {isMobile && (
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
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DashboardFormProvider>
  );
};

export default RestaurantDashboard;
