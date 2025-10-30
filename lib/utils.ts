// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert IPFS URLs to HTTP URLs for Next.js Image component
 * @param url - The URL to convert (can be IPFS or HTTP)
 * @returns HTTP URL that can be used with Next.js Image component
 */
export function convertIpfsUrl(url: string | undefined | null): string {
  if (!url) return "/nfts/placeholder-nft.webp";
  
  // Already an HTTP/HTTPS URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Convert IPFS protocol URL to HTTP gateway URL
  if (url.startsWith('ipfs://')) {
    // Prefer Cloudflare IPFS gateway for reliability
    // Replace ipfs:// with https://cloudflare-ipfs.com/ipfs/
    // This preserves the CID and any path (e.g., /0.webp)
    return url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
  }
  
  // Fallback to placeholder if we don't recognize the format
  return "/nfts/placeholder-nft.webp";
}