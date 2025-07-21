
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import EnhancedMenu from "./pages/EnhancedMenu";
import Contact from "./pages/Contact";
import CalendarBooking from "./pages/CalendarBooking";
import RestaurantLogin from "./pages/RestaurantLogin";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu/:restaurantName" element={<Menu />} />
            <Route path="/enhanced-menu/:restaurantName" element={<EnhancedMenu />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/calendar-booking" element={<CalendarBooking />} />
            <Route path="/restaurant/login" element={<RestaurantLogin />} />
            <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
