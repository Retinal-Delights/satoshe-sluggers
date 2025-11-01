// hooks/useFavorites.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getFavorites, addFavorite, removeFavorite } from '@/lib/favorites-api';

export interface FavoriteNFT {
  tokenId: string;
  name: string;
  image: string;
  rarity: string;
  rank: string | number;
  rarityPercent: string | number;
  addedAt: number;
}

export function useFavorites() {
  const account = useActiveAccount();
  const [favorites, setFavorites] = useState<FavoriteNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevAddressRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // Get storage key for current wallet (for localStorage fallback)
  const getStorageKey = (address: string) => {
    return `nft_favorites_${address.toLowerCase()}`;
  };

  // Load favorites from API when account changes
  useEffect(() => {
    const currentAddress = account?.address || null;
    
    // Only update if address actually changed
    if (currentAddress === prevAddressRef.current || isLoadingRef.current) {
      return;
    }
    
    prevAddressRef.current = currentAddress;
    setIsLoading(true);
    setError(null);
    
    if (!currentAddress) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    // Try to load from API (pass wallet address)
    isLoadingRef.current = true;
    getFavorites(currentAddress)
      .then((apiFavorites) => {
        setFavorites(apiFavorites);
        // Sync to localStorage as backup
        try {
          const storageKey = getStorageKey(currentAddress);
          localStorage.setItem(storageKey, JSON.stringify(apiFavorites));
        } catch {
          // Ignore localStorage errors
        }
      })
      .catch((err) => {
        console.error('Error loading favorites from API:', err);
        setError(err.message || 'Failed to load favorites');
        
        // Fallback to localStorage if API fails
        try {
          const storageKey = getStorageKey(currentAddress);
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsedFavorites = JSON.parse(stored);
            setFavorites(parsedFavorites);
          } else {
            setFavorites([]);
          }
        } catch {
          setFavorites([]);
        }
      })
      .finally(() => {
        setIsLoading(false);
        isLoadingRef.current = false;
      });
  }, [account?.address]);

  // Add NFT to favorites (API + optimistic update)
  const addToFavorites = useCallback(async (nft: Omit<FavoriteNFT, 'addedAt'>) => {
    if (!account?.address) return false;

    // Optimistic update
    const optimisticFavorite: FavoriteNFT = {
      ...nft,
      addedAt: Date.now(),
    };
    setFavorites((prev) => [...prev, optimisticFavorite]);

    try {
      // Sync to API (pass wallet address)
      const apiFavorite = await addFavorite(account.address, nft);
      
      // Update with server data
      setFavorites((prev) => {
        const filtered = prev.filter((f) => f.tokenId !== nft.tokenId);
        return [...filtered, apiFavorite];
      });

      // Sync to localStorage as backup
      try {
        const storageKey = getStorageKey(account.address);
        const updated = [...favorites.filter((f) => f.tokenId !== nft.tokenId), apiFavorite];
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }

      return true;
    } catch (err) {
      // Rollback optimistic update on error
      setFavorites((prev) => prev.filter((f) => f.tokenId !== nft.tokenId));
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to add favorite';
      setError(errorMessage);
      console.error('Error adding favorite:', err);
      
      // Still save to localStorage as fallback
      try {
        const storageKey = getStorageKey(account.address);
        setFavorites((currentFavs) => {
          const updated = [...currentFavs, optimisticFavorite];
          localStorage.setItem(storageKey, JSON.stringify(updated));
          return currentFavs; // Keep original state since API failed
        });
      } catch {
        // Ignore localStorage errors
      }

      return false;
    }
  }, [account?.address, favorites]);

  // Remove NFT from favorites (API + optimistic update)
  const removeFromFavorites = useCallback(async (tokenId: string) => {
    if (!account?.address) return;

    // Optimistic update
    const removedFavorites = favorites.filter((f) => f.tokenId !== tokenId);
    setFavorites(removedFavorites);

    try {
      // Sync to API (pass wallet address)
      await removeFavorite(account.address, tokenId);

      // Sync to localStorage as backup
      try {
        const storageKey = getStorageKey(account.address);
        localStorage.setItem(storageKey, JSON.stringify(removedFavorites));
      } catch {
        // Ignore localStorage errors
      }
    } catch (err) {
      // Rollback optimistic update on error
      setFavorites(favorites);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove favorite';
      setError(errorMessage);
      console.error('Error removing favorite:', err);
      
      // Still update localStorage as fallback
      try {
        const storageKey = getStorageKey(account.address);
        localStorage.setItem(storageKey, JSON.stringify(removedFavorites));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [account?.address, favorites]);

  // Check if NFT is favorited
  const isFavorited = useCallback((tokenId: string) => {
    return favorites.some((fav) => fav.tokenId === tokenId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (nft: Omit<FavoriteNFT, 'addedAt'>) => {
    if (!account?.address) return false;

    if (isFavorited(nft.tokenId)) {
      await removeFromFavorites(nft.tokenId);
      return false;
    } else {
      const success = await addToFavorites(nft);
      return success;
    }
  }, [account?.address, isFavorited, addToFavorites, removeFromFavorites]);

  return {
    favorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    toggleFavorite,
    isConnected: !!account?.address,
  };
}

