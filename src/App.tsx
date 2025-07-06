
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AdminDashboard from '@/pages/AdminDashboard';
import RestaurantLogin from '@/pages/RestaurantLogin';
import RestaurantDashboard from '@/pages/RestaurantDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/restaurant/login" element={<RestaurantLogin />} />
              <Route path="/restaurant/dashboard/*" element={<RestaurantDashboard />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
