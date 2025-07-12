
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { RestaurantSidebar } from '@/components/restaurant/RestaurantSidebar';
import { ProfileManagement } from '@/components/restaurant/ProfileManagement';
import { MenuManagement } from '@/components/restaurant/MenuManagement';
import { QRCodeGenerator } from '@/components/restaurant/QRCodeGenerator';
import { CustomizationSettings } from '@/components/restaurant/CustomizationSettings';
import { TranslationManager } from '@/components/restaurant/TranslationManager';

const RestaurantDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <RestaurantSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-lg font-semibold">Restaurant Dashboard</h1>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<ProfileManagement />} />
              <Route path="/menu" element={<MenuManagement />} />
              <Route path="/translations" element={<TranslationManager />} />
              <Route path="/qr-generator" element={<QRCodeGenerator />} />
              <Route path="/analytics" element={<div>Analytics (Coming Soon)</div>} />
              <Route path="/customization" element={<CustomizationSettings />} />
              <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantDashboard;
