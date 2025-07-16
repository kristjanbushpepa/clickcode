import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSetup from '@/components/admin/AdminSetup';
import RestaurantList from '@/components/admin/RestaurantList';
import AddRestaurantDialog from '@/components/admin/AddRestaurantDialog';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, Users, Building2, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin, hasAdminUsers, signOut, loading } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show setup page if no admin users exist and user is not authenticated
  if (!hasAdminUsers && !user) {
    return <AdminSetup />;
  }

  // Show login if user is not authenticated but admins exist
  if (!user) {
    return <AdminLogin />;
  }

  // Show login if user is authenticated but not an admin
  if (!isAdmin) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md shadow-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))' }} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Digital Menu Admin</h1>
                <p className="text-sm text-muted-foreground">Restaurant Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut} className="hover:bg-secondary">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-border hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.3))' }} />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Restaurants</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-border hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-accent-foreground" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--accent) / 0.3))' }} />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-border hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.3))' }} />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Management Section */}
        <div className="bg-card/80 backdrop-blur-md rounded-lg shadow-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-foreground">Restaurants</h2>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ boxShadow: 'var(--glow-primary)' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Button>
            </div>
          </div>
          <RestaurantList />
        </div>
      </main>

      <AddRestaurantDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
};

export default AdminDashboard;
