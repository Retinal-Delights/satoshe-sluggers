// components/termly-script.tsx
"use client"

import Script from "next/script"
import { useEffect } from "react"

declare global {
  interface Window {
    Termly?: {
      displayPreferenceModal?: () => void;
    };
  }
}

export default function TermlyScript() {
  useEffect(() => {
    // Set up click handlers for preference links once Termly loads
    const setupPreferenceHandlers = () => {
      if (typeof window === 'undefined') return;
      
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

    // Also check when Termly loads
    const checkTermly = setInterval(() => {
      if (window.Termly) {
        setupPreferenceHandlers();
        clearInterval(checkTermly);
      }
    }, 100);

    // Cleanup
    return () => {
      clearInterval(checkTermly);
    };
  }, []);

  return (
    <Script
      id="termly-consent-banner"
      src="https://app.termly.io/embed.min.js"
      data-auto-block="on"
      data-website-uuid="ba09ca99-2e6c-4e83-adca-6b3e27ffe054"
      strategy="afterInteractive"
      onLoad={() => {
        // Termly should auto-initialize
        if (typeof window !== 'undefined' && window.Termly) {
          // Handlers are already set up via useEffect
        }
      }}
    />
  )
}
