
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import RestaurantLogin from "./pages/RestaurantLogin";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Get the repository name from the URL for GitHub Pages deployment
const getBasename = () => {
  if (import.meta.env.DEV) {
    return "/";
  }
  
  // For GitHub Pages, extract repository name from pathname
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0 && window.location.hostname.includes('github.io')) {
    return `/${pathSegments[0]}`;
  }
  
  return "/";
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={getBasename()}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/restaurant/login" element={<RestaurantLogin />} />
              <Route path="/restaurant/dashboard/*" element={<RestaurantDashboard />} />
              <Route path="/menu/:restaurantName" element={<Menu />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
