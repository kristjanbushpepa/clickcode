
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
import { CurrencySettings } from '@/components/restaurant/CurrencySettings';
import { DashboardFormProvider } from '@/contexts/DashboardFormContext';
import { MobileTabBar } from '@/components/restaurant/MobileTabBar';

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
      case 'currency':
        return <CurrencySettings />;
      default:
        return <ProfileManagement />;
    }
  };

  return (
    <DashboardFormProvider>
      <SidebarProvider>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen flex w-full bg-background">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <RestaurantSidebar onTabChange={setActiveTab} activeTab={activeTab} />
          </div>
          
          <div className="flex-1 flex flex-col">
            {/* Desktop Header */}
            <header className="hidden md:flex h-14 items-center border-b bg-background px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">Restaurant Dashboard</h1>
              </div>
            </header>

            {/* Mobile Header */}
            <header className="md:hidden h-14 flex items-center justify-center border-b bg-background px-4">
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
              <TabsContent value={activeTab} className="mt-0">
                {renderTabContent()}
              </TabsContent>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden">
              <MobileTabBar onTabChange={setActiveTab} activeTab={activeTab} />
            </div>
          </div>
        </Tabs>
      </SidebarProvider>
    </DashboardFormProvider>
  );
};

export default RestaurantDashboard;
