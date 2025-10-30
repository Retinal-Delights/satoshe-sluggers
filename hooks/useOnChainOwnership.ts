// hooks/useOnChainOwnership.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { ownerOf } from "thirdweb/extensions/erc721";
import { getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { client } from "@/lib/thirdweb";

const CREATOR_ADDRESS = process.env.NEXT_PUBLIC_CREATOR_ADDRESS?.toLowerCase();
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
const CACHE_KEY = "nft_ownership_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 50; // Check 50 NFTs at a time to avoid rate limits

interface OwnershipCache {
  data: Record<number, boolean>; // tokenId -> isSold
  timestamp: number;
}

/**
 * Hook to compute Live/Sold counts using on-chain ownership data
 * Uses batched checking and caching for performance
 */
export function useOnChainOwnership(totalNFTs: number = 7777) {
  const [soldTokens, setSoldTokens] = useState<Set<number>>(new Set());
  const [isChecking, setIsChecking] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);

  // Load cached ownership data
  const loadCache = useCallback((): OwnershipCache | null => {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const parsed: OwnershipCache = JSON.parse(cached);
      const now = Date.now();
      if (now - parsed.timestamp < CACHE_EXPIRY) {
        return parsed;
      }
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  }, []);

  // Save ownership data to cache
  const saveCache = useCallback((data: Record<number, boolean>) => {
    if (typeof window === "undefined") return;
    try {
      const cache: OwnershipCache = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Check ownership for a batch of token IDs
  const checkBatch = useCallback(
    async (tokenIds: number[]): Promise<Record<number, boolean>> => {
      if (!CONTRACT_ADDRESS || !CREATOR_ADDRESS) return {};

      const contract = getContract({
        client,
        chain: base,
        address: CONTRACT_ADDRESS,
      });

      const results = await Promise.allSettled(
        tokenIds.map(async (tokenId) => {
          try {
            const owner = (await ownerOf({
              contract,
              tokenId: BigInt(tokenId),
            })) as string;
            const isSold = owner.toLowerCase() !== CREATOR_ADDRESS;
            return { tokenId, isSold };
          } catch {
            // If ownerOf fails, assume not sold (conservative)
            return { tokenId, isSold: false };
          }
        })
      );

      const batchResults: Record<number, boolean> = {};
      results.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          batchResults[result.value.tokenId] = result.value.isSold;
        }
      });

      return batchResults;
    },
    []
  );

  // Initialize: Load cache or start checking
  useEffect(() => {
    if (!CONTRACT_ADDRESS || !CREATOR_ADDRESS || totalNFTs === 0) return;

    const cache = loadCache();
    if (cache) {
      // Load from cache
      const soldSet = new Set<number>();
      Object.entries(cache.data).forEach(([tokenId, isSold]) => {
        if (isSold) soldSet.add(parseInt(tokenId));
      });
      setSoldTokens(soldSet);
      setCheckedCount(Object.keys(cache.data).length);
      return;
    }

    // Start checking from scratch
    setIsChecking(true);
    setCheckedCount(0);
    setSoldTokens(new Set());

    let currentBatch: number[] = [];
    let allResults: Record<number, boolean> = {};
    let currentTokenId = 0;

    const processNextBatch = async () => {
      // Build batch
      while (currentBatch.length < BATCH_SIZE && currentTokenId < totalNFTs) {
        currentBatch.push(currentTokenId);
        currentTokenId++;
      }

      if (currentBatch.length === 0) {
        // Done checking all NFTs
        setIsChecking(false);
        saveCache(allResults);
        return;
      }

      // Check batch
      const batchResults = await checkBatch(currentBatch);
      allResults = { ...allResults, ...batchResults };

      // Update state
      setCheckedCount((prev) => prev + currentBatch.length);
      setSoldTokens((prev) => {
        const newSet = new Set(prev);
        Object.entries(batchResults).forEach(([tokenId, isSold]) => {
          if (isSold) newSet.add(parseInt(tokenId));
          else newSet.delete(parseInt(tokenId));
        });
        return newSet;
      });

      // Clear batch and continue
      currentBatch = [];
      
      // Small delay to avoid rate limits
      setTimeout(processNextBatch, 100);
    };

    processNextBatch();
  }, [totalNFTs, loadCache, saveCache, checkBatch]);

  // Compute counts
  const liveCount = totalNFTs - soldTokens.size;
  const soldCount = soldTokens.size;

  return {
    liveCount,
    soldCount,
    isChecking,
    checkedCount,
    totalToCheck: totalNFTs,
    soldTokens, // Expose sold token set for component use
  };
}

