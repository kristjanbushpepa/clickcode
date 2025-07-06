
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const RestaurantLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Restaurant Login</CardTitle>
          <CardDescription>
            Access your restaurant's digital menu dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Restaurant login functionality will be implemented once your restaurant account is set up.
          </p>
          <p className="text-sm text-gray-500">
            Please contact your administrator for setup instructions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantLogin;
