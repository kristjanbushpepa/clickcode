
import { useEffect, useState } from 'react';

export const usePWAInput = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detect PWA mode
    const checkPWA = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
    setIsPWA(checkPWA);

    if (checkPWA) {
      // Add global PWA input styles
      const style = document.createElement('style');
      style.id = 'pwa-input-styles';
      style.textContent = `
        /* PWA Input Fixes */
        input, textarea, select {
          font-size: 16px !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          border-radius: 6px !important;
          background-color: white !important;
          color: black !important;
        }
        
        input:focus, textarea:focus {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
          background-color: white !important;
          color: black !important;
        }
        
        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          input[type="email"], 
          input[type="password"], 
          input[type="text"],
          input[type="search"],
          textarea {
            font-size: 16px !important;
            -webkit-appearance: none !important;
            -webkit-text-fill-color: black !important;
            background-color: white !important;
            opacity: 1 !important;
          }
          
          input::-webkit-input-placeholder,
          textarea::-webkit-input-placeholder {
            color: #6b7280 !important;
            opacity: 1 !important;
          }
        }
        
        /* Prevent zoom on focus */
        @media screen and (max-width: 768px) {
          input, textarea, select {
            font-size: 16px !important;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
          }
        }
      `;
      
      // Remove existing style if present
      const existingStyle = document.getElementById('pwa-input-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
      
      return () => {
        const styleElement = document.getElementById('pwa-input-styles');
        if (styleElement) {
          styleElement.remove();
        }
      };
    }
  }, []);

  return { isPWA };
};
