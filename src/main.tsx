
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
                (window.navigator as any).standalone === true;
  
  if (isPWA) {
    // Set strict viewport for PWA mode
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no'
      );
    }

    // Prevent zoom on orientation change
    const preventZoom = () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no'
        );
      }
    };

    window.addEventListener('orientationchange', preventZoom);
    window.addEventListener('resize', preventZoom);
    document.addEventListener('visibilitychange', preventZoom);

    // Remove automatic redirect from main page - allow users to access landing page
  }
}

createRoot(document.getElementById("root")!).render(<App />);
