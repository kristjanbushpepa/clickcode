
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check if app is launched as PWA and handle redirect
        checkPWALaunch();
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Check if app is running in PWA mode and redirect accordingly
function checkPWALaunch() {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                window.navigator.standalone === true;
  
  if (isPWA && window.location.pathname === '/') {
    // Check if user was previously logged in
    const restaurantInfo = sessionStorage.getItem('restaurant_info');
    
    if (restaurantInfo) {
      // User was logged in before, redirect to dashboard
      window.location.href = '/restaurant/dashboard';
    } else {
      // New user or logged out, redirect to login
      window.location.href = '/restaurant/login';
    }
  }
}

createRoot(document.getElementById("root")!).render(<App />);
