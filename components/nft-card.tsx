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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const placeholder = "/nfts/placeholder-nft.webp";
  
  // Ensure we have a valid image URL, default to placeholder if not
  const imageUrl = image && image.trim() !== "" && image !== placeholder ? image : placeholder;
  const showPlaceholder = !imgLoaded || imgError || !image || image.trim() === "" || image === placeholder;
  
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
              src={showPlaceholder ? placeholder : imageUrl}
              alt={`${name} - NFT #${cardNumber}, Rank ${rank}, ${rarity} rarity, Tier ${tier}`}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className={`object-contain p-2 hover:scale-[1.02] hover:rotate-[5deg] hover:-translate-y-1 transition-all duration-300 ease-out relative z-20 ${showPlaceholder ? 'animate-pulse' : ''}`}
              onLoad={() => {
                if (!showPlaceholder) {
                  setImgLoaded(true);
                  setImgLoading(false);
                  setImgError(false);
                }
              }}
              onError={() => {
                setImgError(true);
                setImgLoading(false);
                setImgLoaded(false);
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={isIpfsUrl}
            />
            {imgLoading && !showPlaceholder && (
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
        
        {/* NFT Image */}
        <Link href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`} className="block w-full">
          <div className="relative bg-neutral-900 w-full overflow-visible" style={{ aspectRatio: "0.9/1" }}>
            <Image
              src={showPlaceholder ? placeholder : imageUrl}
              alt={`${name} - NFT #${cardNumber}, Rank ${rank}, ${rarity} rarity, Tier ${tier}`}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className={`object-contain p-2 hover:scale-[1.02] hover:rotate-[5deg] hover:-translate-y-1 transition-all duration-300 ease-out relative z-20 ${showPlaceholder ? 'animate-pulse' : ''}`}
              onLoad={() => {
                if (!showPlaceholder) {
                  setImgLoaded(true);
                  setImgLoading(false);
                  setImgError(false);
                }
              }}
              onError={() => {
                setImgError(true);
                setImgLoading(false);
                setImgLoaded(false);
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={isIpfsUrl}
            />
            {imgLoading && !showPlaceholder && (
              <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center">
                <div className="animate-pulse text-neutral-400 text-sm">Loading...</div>
              </div>
            )}
          </div>
        </Link>

        {/* Details Section - Full details for large grid */}
        <div className="space-y-1 pl-4 pr-2 pb-2">
          {/* Title and Favorite */}
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <Link href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`} className="flex-1 min-w-0">
              <h3 className="font-medium text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight text-[#FFFBEB] truncate">
                {name}
              </h3>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 p-0 hover:bg-transparent flex-shrink-0"
              onClick={handleFavoriteClick}
              aria-label={isFav ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
              aria-pressed={isFav}
            >
              <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${isFav ? "fill-[#ff0099] text-[#ff0099]" : "text-neutral-400 hover:text-[#ff0099] hover:outline hover:outline-1 hover:outline-[#ff0099]"}`} />
            </Button>
          </div>

          {/* Stats */}
          <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-neutral-400 space-y-0.5">
            <div className="flex justify-between gap-1">
              <span className="text-neutral-400 whitespace-nowrap">Rank:</span>
              <span className="text-neutral-400 truncate text-right">{rank} of {TOTAL_COLLECTION_SIZE}</span>
            </div>
            <div className="flex justify-between gap-1">
              <span className="text-neutral-400 whitespace-nowrap">Rarity:</span>
              <span className="text-neutral-400">{rarityPercent}%</span>
            </div>
            <div className="flex justify-between gap-1">
              <span className="text-neutral-400 whitespace-nowrap">Tier:</span>
              <span className="text-neutral-400 truncate text-right min-w-0">{rarity.replace(" (Ultra-Legendary)", "")}</span>
            </div>
          </div>

          {/* Buy Section */}
          <div className="pt-1">
            {isForSale ? (
              <div className="flex items-end justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0 pr-1">
                  <div className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-blue-500 font-medium mb-0.5 whitespace-nowrap">
                    Buy Now
                  </div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-blue-400 font-semibold truncate">
                    {priceEth} ETH
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`}
                    className="px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-sm text-blue-400 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-medium hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors whitespace-nowrap"
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
      
      {/* NFT Image */}
      <Link href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`} className="block w-full">
        <div className="relative w-full overflow-visible" style={{ aspectRatio: "0.8/1" }}>
          <Image
            src={showPlaceholder ? placeholder : imageUrl}
            alt={name}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={`object-contain p-1 hover:scale-[1.02] hover:rotate-[5deg] hover:-translate-y-1 transition-all duration-300 ease-out relative z-20 ${showPlaceholder ? 'animate-pulse' : ''}`}
            onLoad={() => {
              if (!showPlaceholder) {
                setImgLoaded(true);
                setImgLoading(false);
                setImgError(false);
              }
            }}
            onError={() => {
              setImgError(true);
              setImgLoading(false);
              setImgLoaded(false);
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={imageUrl.startsWith('https://') && (imageUrl.includes('ipfs') || imageUrl.includes('cloudflare-ipfs'))}
          />
          {imgLoading && !showPlaceholder && (
            <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center">
              <div className="animate-pulse text-neutral-400 text-sm">Loading...</div>
            </div>
          )}
          
        </div>
      </Link>

      {/* NFT Details Section - Medium grid design */}
      <div className="pl-3 pr-2 sm:pl-4 sm:pr-3 -mt-1 pb-2 flex flex-col">
        {/* NFT Info and Heart - Top Row */}
        <div className="flex items-center justify-between mb-1">
          {/* NFT Info */}
          <div className="text-green-400 text-[10px] sm:text-xs md:text-sm font-medium leading-tight truncate flex-1 min-w-0">
            NFT — #{cardNumber}
          </div>
          
          {/* Heart Icon */}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-transparent flex-shrink-0"
            onClick={handleFavoriteClick}
            aria-label={isFav ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
            aria-pressed={isFav}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? "fill-[#ff0099] text-[#ff0099]" : "text-[#FFFBEB] hover:text-[#ff0099] hover:outline hover:outline-1 hover:outline-[#ff0099]"}`} />
          </Button>
        </div>

        {/* Buy Button - Bottom Row */}
        <div className="flex justify-start">
          {isForSale ? (
            <Link
              href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-500/10 border-2 border-blue-500/30 rounded-sm text-blue-400 text-[10px] sm:text-xs md:text-sm font-medium hover:bg-blue-500/20 transition-colors"
              aria-label={`Buy ${name} for ${priceEth} ETH`}
            >
              Buy
            </Link>
          ) : (
            <Link
              href={`/nft/${cardNumber}${typeof window !== 'undefined' && window.location.search ? `?returnTo=${encodeURIComponent(`/nfts${window.location.search}`)}` : ''}`}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400 text-[10px] sm:text-xs md:text-sm font-medium hover:bg-green-500/20 hover:border-green-500/50 transition-colors"
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

