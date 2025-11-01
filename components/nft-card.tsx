// components/nft-card.tsx
"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Heart } from "lucide-react";
import { track } from '@vercel/analytics';
import { TOTAL_COLLECTION_SIZE } from "@/lib/contracts";
// Removed BuyDirectListingButton imports - using regular buttons to avoid RPC calls

interface NFTCardProps {
  image: string;
  name: string;
  rank: string | number;
  rarity: string;
  rarityPercent: string | number;
  priceEth: number; // Static price from metadata
  tokenId: string;
  cardNumber: number; // NFT card number (not token ID)
  isForSale: boolean;
  tier: string | number;
  viewMode?: 'grid-large' | 'grid-medium' | 'grid-small' | 'compact';
  isFavorited?: (tokenId: string) => boolean;
  toggleFavorite?: (nft: { tokenId: string; name: string; image: string; rarity: string; rank: string | number; rarityPercent: string | number }) => Promise<boolean | void>;
  isConnected?: boolean;
  priority?: boolean; // Priority loading for above-the-fold images
}

export default function NFTCard({
  image,
  name,
  rank,
  rarity,
  rarityPercent,
  priceEth,
  tokenId,
  cardNumber,
  isForSale,
  tier,
  viewMode = 'grid-medium',
  isFavorited,
  toggleFavorite,
  isConnected = false,
  priority = false,
}: NFTCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const placeholder = "/nfts/placeholder-nft.webp";
  
  // Ensure we have a valid image URL, default to placeholder if not
  const imageUrl = image && image.trim() !== "" && image !== placeholder ? image : placeholder;
  
  // For IPFS URLs, we need to use unoptimized to avoid Next.js Image optimization issues
  const isIpfsUrl = Boolean(
    imageUrl && 
    typeof imageUrl === 'string' && (
      imageUrl.startsWith('https://cloudflare-ipfs.com') || 
      imageUrl.startsWith('https://ipfs.io') ||
      imageUrl.includes('/ipfs/')
    )
  );

  // Favorites functionality - use props if provided, otherwise fallback to no-op
  const isFav = isFavorited ? isFavorited(tokenId) : false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!toggleFavorite) {
      if (!isConnected) {
        alert('Please connect your wallet to favorite NFTs');
      }
      return;
    }

    if (!isConnected) {
      alert('Please connect your wallet to favorite NFTs');
      return;
    }

    const wasFavorited = isFav;
    toggleFavorite({
      tokenId,
      name,
      image,
      rarity,
      rank,
      rarityPercent,
    });

    // Minimal analytics
    track(wasFavorited ? 'NFT Unfavorited' : 'NFT Favorited', {
      tokenId,
      rarity,
    });
  };


  // Small grid - just images, tightly packed
  if (viewMode === 'grid-small') {
    return (
      <div className="overflow-visible w-full rounded-lg flex flex-col h-full bg-neutral-900 group relative">
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-black/20 blur-sm"></div>
        
        {/* NFT Image Only */}
        <Link href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`} className="block w-full">
          <div className="relative bg-neutral-900 w-full overflow-visible" style={{ aspectRatio: "0.9/1" }}>
            <Image
              src={imageUrl}
              alt={`${name} - NFT #${cardNumber}, Rank ${rank}, ${rarity} rarity, Tier ${tier}`}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className={`object-contain p-2 hover:scale-[1.02] hover:rotate-[5deg] hover:-translate-y-1 transition-all duration-300 ease-out relative z-20 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => {
                setImgLoading(false);
                setImgError(false);
              }}
              onError={() => {
                setImgError(true);
                setImgLoading(false);
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={isIpfsUrl}
            />
            {imgLoading && imageUrl !== placeholder && (
              <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center">
                <div className="animate-pulse text-neutral-400 text-sm">Loading...</div>
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // Large grid - full details (original design)
  if (viewMode === 'grid-large') {
    return (
      <div className="overflow-visible w-full rounded-lg flex flex-col h-full bg-neutral-900 group relative">
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-black/20 blur-sm"></div>
        
        {/* NFT Image - Proportionally scaled padding */}
        <Link href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`} className="block w-full">
          <div className="relative bg-neutral-900 w-full overflow-visible" style={{ aspectRatio: "0.9/1" }}>
            <Image
              src={imageUrl}
              alt={`${name} - NFT #${cardNumber}, Rank ${rank}, ${rarity} rarity, Tier ${tier}`}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className={`object-contain p-3 sm:p-4 md:p-5 lg:p-6 hover:scale-[1.02] hover:rotate-[5deg] hover:-translate-y-1 transition-all duration-300 ease-out relative z-20 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => {
                setImgLoading(false);
                setImgError(false);
              }}
              onError={() => {
                setImgError(true);
                setImgLoading(false);
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={isIpfsUrl}
            />
            {imgLoading && imageUrl !== placeholder && (
              <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center">
                <div className="animate-pulse text-neutral-400 text-sm">Loading...</div>
              </div>
            )}
          </div>
        </Link>

        {/* Details Section - Full details for large grid - Proportionally scaled */}
        <div className="space-y-1.5 sm:space-y-2 pl-4 pr-2 pb-2">
          {/* Title and Favorite - Fixed layout */}
          <div className="flex items-start gap-2 relative">
            <Link href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`} className="flex-1 min-w-0 pr-6">
              <h3 className="font-medium text-sm sm:text-base md:text-lg lg:text-xl leading-tight text-[#FFFBEB] truncate">
                {name}
              </h3>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 p-0 hover:bg-transparent flex-shrink-0 z-10"
              onClick={handleFavoriteClick}
              aria-label={isFav ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
              aria-pressed={isFav}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${isFav ? "fill-[#ff0099] text-[#ff0099]" : "text-neutral-400 hover:text-[#ff0099] hover:outline hover:outline-1 hover:outline-[#ff0099]"}`} />
            </Button>
          </div>

          {/* Stats - Proportionally scaled text */}
          <div className="text-xs sm:text-sm md:text-base text-neutral-400 space-y-1">
            <div className="flex justify-between gap-2">
              <span className="text-neutral-400 whitespace-nowrap">Rank:</span>
              <span className="text-neutral-400 truncate text-right">{rank} of {TOTAL_COLLECTION_SIZE}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-neutral-400 whitespace-nowrap">Rarity:</span>
              <span className="text-neutral-400">{rarityPercent}%</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-neutral-400 whitespace-nowrap">Tier:</span>
              <span className="text-neutral-400 truncate text-right min-w-0">{rarity.replace(" (Ultra-Legendary)", "")}</span>
            </div>
          </div>

          {/* Buy Section - Proportionally scaled */}
          <div className="pt-2">
            {isForSale ? (
              <div className="flex items-end justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0 pr-1">
                  <div className="text-xs sm:text-sm md:text-base text-blue-500 font-medium mb-1 whitespace-nowrap">
                    Buy Now
                  </div>
                  <div className="text-sm sm:text-base md:text-lg text-blue-400 font-semibold truncate">
                    {priceEth} ETH
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-sm text-blue-400 text-xs sm:text-sm md:text-base font-medium hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors whitespace-nowrap"
                    aria-label={`Buy ${name} for ${priceEth} ETH`}
                    >
                    BUY
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Medium grid - current compact design
  return (
    <div className="overflow-visible w-full max-w-full mx-auto rounded-lg flex flex-col h-full bg-neutral-900 group relative">
      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-black/20 blur-sm"></div>
      
      {/* NFT Image - Proportionally scaled padding */}
      <Link href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`} className="block w-full">
        <div className="relative w-full overflow-visible" style={{ aspectRatio: "0.8/1" }}>
          <Image
            src={imageUrl}
            alt={name}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={`object-contain p-2 sm:p-3 md:p-4 hover:scale-[1.02] hover:rotate-[5deg] hover:-translate-y-1 transition-all duration-300 ease-out relative z-20 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => {
              setImgLoading(false);
              setImgError(false);
            }}
            onError={() => {
              setImgError(true);
              setImgLoading(false);
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={imageUrl.startsWith('https://') && (imageUrl.includes('ipfs') || imageUrl.includes('cloudflare-ipfs'))}
          />
          {imgLoading && imageUrl !== placeholder && (
            <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center">
              <div className="animate-pulse text-neutral-400 text-sm">Loading...</div>
            </div>
          )}
          {imgError && imageUrl !== placeholder && (
            <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
              <Image
                src={placeholder}
                alt="Placeholder"
                fill
                className="object-contain p-2 opacity-50"
              />
            </div>
          )}
          
        </div>
      </Link>

      {/* NFT Details Section - Medium grid design */}
      <div className="pl-3 pr-2 sm:pl-4 sm:pr-3 -mt-1 pb-2 flex flex-col">
        {/* NFT Info and Heart - Top Row - Fixed layout to prevent truncation */}
        <div className="flex items-center gap-1.5 mb-1 relative">
          {/* NFT Info - Full width with proper truncation, accounting for heart icon space */}
          <div className="text-green-400 text-xs sm:text-sm md:text-base font-medium leading-tight flex-1 min-w-0 pr-6">
            <span className="block truncate">NFT — #{cardNumber}</span>
          </div>
          
          {/* Heart Icon - Absolute positioned to not interfere with text flow */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 p-0 hover:bg-transparent flex-shrink-0 z-10"
            onClick={handleFavoriteClick}
            aria-label={isFav ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
            aria-pressed={isFav}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${isFav ? "fill-[#ff0099] text-[#ff0099]" : "text-[#FFFBEB] hover:text-[#ff0099] hover:outline hover:outline-1 hover:outline-[#ff0099]"}`} />
          </Button>
        </div>

        {/* Buy Button - Bottom Row - Proportionally scaled */}
        <div className="flex justify-start mt-1">
          {isForSale ? (
            <Link
              href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-blue-500/10 border-2 border-blue-500/30 rounded-sm text-blue-400 text-xs sm:text-sm md:text-base font-medium hover:bg-blue-500/20 transition-colors"
              aria-label={`Buy ${name} for ${priceEth} ETH`}
            >
              Buy
            </Link>
          ) : (
            <Link
              href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400 text-xs sm:text-sm md:text-base font-medium hover:bg-green-500/20 hover:border-green-500/50 transition-colors"
              aria-label={`View sold ${name} details`}
            >
              Sold
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}

