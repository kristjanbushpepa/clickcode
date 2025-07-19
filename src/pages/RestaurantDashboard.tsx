
import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { RestaurantSidebar } from '@/components/restaurant/RestaurantSidebar';
import { ProfileManagement } from '@/components/restaurant/ProfileManagement';
import { MenuManagement } from '@/components/restaurant/MenuManagement';
import { QRCodeGenerator } from '@/components/restaurant/QRCodeGenerator';
import CustomizationSettings from '@/components/restaurant/CustomizationSettings';
import { TranslationManager } from '@/components/restaurant/TranslationManager';
import { PopupSettings } from '@/components/restaurant/PopupSettings';
import { DashboardFormProvider } from '@/contexts/DashboardFormContext';

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileManagement />;
      case 'menu':
        return <MenuManagement />;
      case 'translations':
        return <TranslationManager />;
      case 'qr-generator':
        return <QRCodeGenerator />;
      case 'popup':
        return <PopupSettings />;
      case 'customization':
        return <CustomizationSettings />;
      default:
        return <ProfileManagement />;
    }
  };

  return (
    <DashboardFormProvider>
      <SidebarProvider>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen flex w-full bg-background">
          <RestaurantSidebar onTabChange={setActiveTab} activeTab={activeTab} />
          
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b bg-background px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">Restaurant Dashboard</h1>
              </div>
            </header>
            
            <main className="flex-1 p-6">
              <TabsContent value={activeTab} className="mt-0">
                {renderTabContent()}
              </TabsContent>
            </main>
          </div>
        </Tabs>
      </SidebarProvider>
    </DashboardFormProvider>
  );
};

export default RestaurantDashboard;
