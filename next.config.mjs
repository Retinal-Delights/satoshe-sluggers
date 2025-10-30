/**
 * Next.js configuration with security headers.
 * Note: CSP is intentionally permissive for third-party scripts (Thirdweb, Termly, analytics)
 * to avoid breaking functionality. We can tighten this iteratively.
 */

const ONE_YEAR = 60 * 60 * 24 * 365;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self' https: data: blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' https: data: blob:",
      "font-src 'self' https: data:",
      "connect-src 'self' https: wss:",
      "media-src 'self' https: data: blob:",
      "frame-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  { key: "Strict-Transport-Security", value: `max-age=${ONE_YEAR}; includeSubDomains; preload` },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "clipboard-read=(self)",
      "clipboard-write=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;


