// components/termly-script.tsx
"use client"

import Script from "next/script"

export default function TermlyScript() {
  return (
    <Script
      id="termly-consent-banner"
      src="https://app.termly.io/embed.min.js"
      data-auto-block="on"
      data-website-uuid="ba09ca99-2e6c-4e83-adca-6b3e27ffe054"
      strategy="afterInteractive"
    />
  )
}
