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
    
    // Only update if address actually changed (string comparison, not object reference)
    if (currentAddress === prevAddressRef.current || isLoadingRef.current) {
      if (!currentAddress && prevAddressRef.current === null) {
        // Both null, already handled
        setIsLoading(false);
      }
      return;
    }
    
    // Mark as loading immediately to prevent re-runs
    isLoadingRef.current = true;
    prevAddressRef.current = currentAddress;
    setIsLoading(true);
    setError(null);
    
    if (!currentAddress) {
      setFavorites([]);
      setIsLoading(false);
      isLoadingRef.current = false;
      return;
    }

    // Try to load from API (pass wallet address)
    getFavorites(currentAddress)
      .then((apiFavorites) => {
        // Double-check address hasn't changed during the API call
        if (prevAddressRef.current !== currentAddress) {
          return;
        }
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
        // Double-check address hasn't changed during the API call
        if (prevAddressRef.current !== currentAddress) {
          return;
        }
        // Only log if it's not a connection refused (server down)
        if (!err.message?.includes('Failed to fetch') && !err.message?.includes('ERR_CONNECTION_REFUSED')) {
          console.error('Error loading favorites from API:', err);
        }
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
        // Only update if address hasn't changed
        if (prevAddressRef.current === currentAddress) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
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
        setFavorites((currentFavs) => {
          const updated = [...currentFavs.filter((f) => f.tokenId !== nft.tokenId), apiFavorite];
          localStorage.setItem(storageKey, JSON.stringify(updated));
          return currentFavs; // Don't update state here, already updated above
        });
      } catch {
        // Ignore localStorage errors
      }

      return true;
    } catch (err) {
      // Rollback optimistic update on error
      setFavorites((prev) => prev.filter((f) => f.tokenId !== nft.tokenId));
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to add favorite';
      setError(errorMessage);
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        console.error('Error adding favorite:', err);
      }
      
      // Still save to localStorage as fallback
      try {
        const storageKey = getStorageKey(account.address);
        setFavorites((currentFavs) => {
          const updated = [...currentFavs.filter((f) => f.tokenId !== nft.tokenId), optimisticFavorite];
          localStorage.setItem(storageKey, JSON.stringify(updated));
          return currentFavs; // Keep original state since API failed
        });
      } catch {
        // Ignore localStorage errors
      }

      return false;
    }
  }, [account?.address]);

  // Remove NFT from favorites (API + optimistic update)
  const removeFromFavorites = useCallback(async (tokenId: string) => {
    if (!account?.address) return;

    // Optimistic update - capture current favorites before update
    setFavorites((prev) => {
      const removedFavorites = prev.filter((f) => f.tokenId !== tokenId);
      
      // Save to localStorage immediately for fallback
      try {
        const storageKey = getStorageKey(account.address);
        localStorage.setItem(storageKey, JSON.stringify(removedFavorites));
      } catch {
        // Ignore localStorage errors
      }
      
      return removedFavorites;
    });

    try {
      // Sync to API (pass wallet address)
      await removeFavorite(account.address, tokenId);
    } catch (err) {
      // Rollback optimistic update on error
      setFavorites((prev) => {
        // Check if token was already removed - if not, restore previous state
        const wasRemoved = !prev.some((f) => f.tokenId === tokenId);
        if (wasRemoved) {
          // Restore from localStorage
          try {
            const storageKey = getStorageKey(account.address);
            const stored = localStorage.getItem(storageKey);
            if (stored) {
              return JSON.parse(stored);
            }
          } catch {
            // Fall through to return prev
          }
        }
        return prev;
      });
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove favorite';
      setError(errorMessage);
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        console.error('Error removing favorite:', err);
      }
    }
  }, [account?.address]);

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

