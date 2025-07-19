
import { useEffect, useState } from 'react';

export const usePWAInput = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // More comprehensive PWA detection
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIosStandalone = (window.navigator as any).standalone === true;
      const isFromHomeScreen = document.referrer === "" || document.referrer.includes('android-app://');
      
      return isStandalone || isIosStandalone || isFromHomeScreen;
    };

    const pwaMode = checkPWA();
    setIsPWA(pwaMode);

    if (pwaMode) {
      console.log('PWA mode detected - applying input fixes and viewport controls');
      
      // Set strict viewport meta tag for PWA
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no'
        );
      }

      // Prevent zoom on orientation change and tab switching
      const preventZoom = (e: Event) => {
        e.preventDefault();
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no'
          );
        }
      };

      // Listen for orientation changes
      window.addEventListener('orientationchange', preventZoom);
      window.addEventListener('resize', preventZoom);
      
      // Listen for visibility changes (tab switching)
      document.addEventListener('visibilitychange', preventZoom);
      
      // Prevent pinch-to-zoom gestures
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });

      document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });

      // Remove existing style if present
      const existingStyle = document.getElementById('pwa-input-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add comprehensive PWA input styles
      const style = document.createElement('style');
      style.id = 'pwa-input-styles';
      style.textContent = `
        /* Critical PWA Input Fixes */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Prevent zoom on any input focus */
        input, textarea, select, [contenteditable] {
          font-size: 16px !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          border-radius: 6px !important;
          background-color: #ffffff !important;
          color: #000000 !important;
          border: 1px solid #d1d5db !important;
          padding: 8px 12px !important;
          outline: none !important;
          box-shadow: none !important;
          -webkit-user-select: text !important;
          user-select: text !important;
          pointer-events: auto !important;
          touch-action: manipulation !important;
          -webkit-touch-callout: default !important;
          -webkit-text-size-adjust: 100% !important;
          text-size-adjust: 100% !important;
          cursor: text !important;
          z-index: 1 !important;
          position: relative !important;
          -webkit-transform: translateZ(0) !important;
          transform: translateZ(0) !important;
        }
        
        input:focus, textarea:focus, select:focus, [contenteditable]:focus {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -2px !important;
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          font-size: 16px !important;
          -webkit-transform: translateZ(0) !important;
          transform: translateZ(0) !important;
        }
        
        input:active, textarea:active {
          background-color: #ffffff !important;
          color: #000000 !important;
          font-size: 16px !important;
        }
        
        /* Prevent zoom on double tap */
        body {
          touch-action: manipulation !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          -webkit-text-size-adjust: 100% !important;
          text-size-adjust: 100% !important;
        }
        
        /* Allow text selection only in inputs and text areas */
        input, textarea, [contenteditable] {
          -webkit-user-select: text !important;
          user-select: text !important;
        }
        
        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          input, textarea {
            -webkit-appearance: none !important;
            -webkit-text-fill-color: #000000 !important;
            -webkit-opacity: 1 !important;
            opacity: 1 !important;
            -webkit-tap-highlight-color: rgba(0,0,0,0) !important;
          }
          
          input::-webkit-input-placeholder,
          textarea::-webkit-input-placeholder {
            color: #6b7280 !important;
            opacity: 1 !important;
            -webkit-text-fill-color: #6b7280 !important;
          }
          
          input:focus::-webkit-input-placeholder,
          textarea:focus::-webkit-input-placeholder {
            color: transparent !important;
          }
        }
        
        /* Android Chrome fixes */
        @media screen and (max-width: 768px) {
          input, textarea, select {
            font-size: 16px !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
            will-change: transform !important;
          }
        }
        
        /* Ensure form elements are clickable */
        form input, form textarea, form select {
          pointer-events: auto !important;
          -webkit-user-select: text !important;
          user-select: text !important;
        }
        
        /* Fix for button interference */
        button:not([type="submit"]):not([type="button"]) {
          pointer-events: auto !important;
        }
        
        /* Ensure labels work */
        label {
          pointer-events: auto !important;
          cursor: pointer !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Prevent zoom on any element */
        * {
          -webkit-text-size-adjust: 100% !important;
          text-size-adjust: 100% !important;
        }
      `;
      
      document.head.appendChild(style);
      
      // Add touch event listeners to ensure inputs are focusable
      const handleInputFocus = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          setTimeout(() => {
            (target as HTMLInputElement).focus();
          }, 10);
        }
      };

      document.addEventListener('touchstart', handleInputFocus, { passive: true });
      document.addEventListener('click', handleInputFocus, { passive: true });
      
      return () => {
        const styleElement = document.getElementById('pwa-input-styles');
        if (styleElement) {
          styleElement.remove();
        }
        window.removeEventListener('orientationchange', preventZoom);
        window.removeEventListener('resize', preventZoom);
        document.removeEventListener('visibilitychange', preventZoom);
        document.removeEventListener('touchstart', handleInputFocus);
        document.removeEventListener('click', handleInputFocus);
      };
    }
  }, []);

  return { isPWA };
};
