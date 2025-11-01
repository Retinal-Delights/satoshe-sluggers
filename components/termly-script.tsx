// components/termly-script.tsx
"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

declare global {
  interface Window {
    Termly?: {
      displayPreferenceModal?: () => void;
      displayBanner?: () => void;
    };
  }
}

export default function TermlyScript() {
  const [termlyLoaded, setTermlyLoaded] = useState(false);
  const [bannerChecked, setBannerChecked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set up click handlers for preference links once Termly loads
    const setupPreferenceHandlers = () => {
      const handlePreferenceClick = (e: Event) => {
        e.preventDefault();
        if (window.Termly?.displayPreferenceModal) {
          window.Termly.displayPreferenceModal();
        }
      };

      // Add handlers to existing elements
      document.querySelectorAll('.termly-display-preferences').forEach((el) => {
        el.removeEventListener('click', handlePreferenceClick);
        el.addEventListener('click', handlePreferenceClick);
      });
    };

    // Set up handlers immediately
    setupPreferenceHandlers();

    // Check when Termly loads and verify banner appears
    const checkTermly = setInterval(() => {
      if (window.Termly) {
        setTermlyLoaded(true);
        setupPreferenceHandlers();
        
        // Verify banner exists in DOM (Termly should inject it automatically)
        // Check after a brief delay to allow Termly to initialize
        if (!bannerChecked) {
          setTimeout(() => {
            const termlyBanner = document.querySelector('[id*="termly"], [class*="termly"], [data-termly]');
            const hasConsentCookie = document.cookie.includes('termly') || 
                                     localStorage.getItem('termly-consent') !== null;
            
            // If Termly loaded but banner isn't visible and no consent exists, try to display it
            // This is a fallback - Termly should auto-show, but some browsers may block
            if (!termlyBanner && !hasConsentCookie && window.Termly?.displayBanner) {
              try {
                window.Termly.displayBanner();
              } catch (err) {
                console.warn('Termly: Could not manually display banner', err);
              }
            }
            
            setBannerChecked(true);
          }, 1000);
        }
        
        clearInterval(checkTermly);
      }
    }, 100);

    // Timeout after 5 seconds - if Termly hasn't loaded, log warning
    const timeout = setTimeout(() => {
      if (!termlyLoaded && !window.Termly) {
        console.warn('Termly: Script did not load within 5 seconds. Cookie consent banner may not appear.');
      }
      clearInterval(checkTermly);
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(checkTermly);
      clearTimeout(timeout);
    };
  }, [termlyLoaded, bannerChecked]);

  return (
    <Script
      id="termly-consent-banner"
      src="https://app.termly.io/embed.min.js"
      data-auto-block="on"
      data-website-uuid="ba09ca99-2e6c-4e83-adca-6b3e27ffe054"
      strategy="beforeInteractive" // Changed to beforeInteractive for earlier load
      onLoad={() => {
        // Termly should auto-initialize
        if (typeof window !== 'undefined' && window.Termly) {
          setTermlyLoaded(true);
        }
      }}
      onError={() => {
        console.error('Termly: Failed to load cookie consent script. Banner will not appear.');
      }}
    />
  )
}
