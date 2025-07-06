
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const RestaurantDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Building2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Restaurant Dashboard</CardTitle>
            <CardDescription>
              Manage your digital menu and restaurant profile
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Restaurant dashboard features will be implemented in the next phase:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
              <li>• Menu management (CRUD operations)</li>
              <li>• Profile settings and customization</li>
              <li>• Multi-language content management</li>
              <li>• Currency exchange settings</li>
              <li>• QR code generation</li>
              <li>• Analytics and reporting</li>
              <li>• Gamification tools (spin-the-wheel)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
