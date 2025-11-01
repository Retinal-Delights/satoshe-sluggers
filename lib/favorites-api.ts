// lib/favorites-api.ts
// Client-side utilities for calling the favorites API
// Uses wallet address directly (no authentication required)

import type { FavoriteNFT } from '@/hooks/useFavorites';

/**
 * Get all favorites for wallet address
 */
export async function getFavorites(walletAddress: string): Promise<FavoriteNFT[]> {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }

  const response = await fetch(`/api/favorites?walletAddress=${encodeURIComponent(walletAddress)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch favorites: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch favorites');
  }

  return data.favorites.map((fav: {
    tokenId: string;
    name: string;
    image: string;
    rarity: string;
    rank: string | number;
    rarityPercent: string | number;
    addedAt: string;
  }) => ({
    tokenId: fav.tokenId,
    name: fav.name,
    image: fav.image,
    rarity: fav.rarity,
    rank: fav.rank,
    rarityPercent: fav.rarityPercent,
    addedAt: new Date(fav.addedAt).getTime(),
  }));
}

/**
 * Add a favorite (requires wallet address)
 */
export async function addFavorite(
  walletAddress: string,
  nft: Omit<FavoriteNFT, 'addedAt'>
): Promise<FavoriteNFT> {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }

  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      tokenId: nft.tokenId,
      name: nft.name,
      image: nft.image,
      rarity: nft.rarity,
      rank: nft.rank,
      rarityPercent: nft.rarityPercent,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to add favorite: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to add favorite');
  }

  return {
    tokenId: data.favorite.tokenId,
    name: data.favorite.name,
    image: data.favorite.image,
    rarity: data.favorite.rarity,
    rank: data.favorite.rank,
    rarityPercent: data.favorite.rarityPercent,
    addedAt: new Date(data.favorite.addedAt).getTime(),
  };
}

/**
 * Remove a favorite (requires wallet address)
 */
export async function removeFavorite(walletAddress: string, tokenId: string): Promise<void> {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }

  const response = await fetch(`/api/favorites/${tokenId}?walletAddress=${encodeURIComponent(walletAddress)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to remove favorite: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to remove favorite');
  }
}

