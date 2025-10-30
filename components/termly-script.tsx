// components/termly-script.tsx
"use client"

import Script from "next/script"

export default function TermlyScript() {
  return (
    <Script
      id="termly-consent-banner"
      src="https://app.termly.io/resource-blocker/ba09ca99-2e6c-4e83-adca-6b3e27ffe054?autoBlock=on"
      strategy="afterInteractive"
    />
  )
}
