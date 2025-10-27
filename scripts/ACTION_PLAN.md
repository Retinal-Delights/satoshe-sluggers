# NFT Price Correction Action Plan

## Summary
- **Total NFTs to Fix:** 1,866
- **Estimated Total Loss if not fixed:** ~$619,000
- **Files Generated:**
  - `scripts/mispriced_nfts.json` - All 1,866 mismatches sorted by loss
  - `scripts/mispriced_by_tier.json` - Grouped by rarity tier

## Breakdown by Rarity Tier

### Priority 1: Highest Value Tiers (Do these FIRST!)
1. **Grand Slam (Ultra-Legendary)** - 33 NFTs
   - Expected Price: 1 ETH
   - Current Price: 0.00333 ETH
   - Total Loss: $78,936.26
   - File: `scripts/mispriced_by_tier.json["Grand Slam (Ultra-Legendary)"]`

2. **Walk-Off Home Run** - 38 NFTs
   - Expected Price: 0.777 ETH
   - Current Price: 0.00333 ETH
   - Total Loss: $70,558.70
   - File: `scripts/mispriced_by_tier.json["Walk-Off Home Run"]`

3. **Home Run** - 483 NFTs
   - Expected Price: 0.333 ETH
   - Current Price: 0.00333 ETH
   - Total Loss: $382,153.46
   - File: `scripts/mispriced_by_tier.json["Home Run"]`

4. **Pinch Hit Home Run** - 171 NFTs
   - Expected Price: 0.0777 ETH
   - Current Price: 0.00333 ETH
   - Total Loss: $30,521.45
   - File: `scripts/mispriced_by_tier.json["Pinch Hit Home Run"]`

5. **Over-the-Fence Shot** - 137 NFTs
   - Expected Price: 0.0777 ETH
   - Current Price: 0.00333 ETH
   - Total Loss: $24,452.86
   - File: `scripts/mispriced_by_tier.json["Over-the-Fence Shot"]`

6. **Triple** - 349 NFTs
   - Expected Price: 0.00777 ETH
   - Current Price: 0.00333 ETH
   - Total Loss: $25,102.87
   - File: `scripts/mispriced_by_tier.json["Triple"]`

### Priority 2: Lower Value Tiers
7. **Double** - 177 NFTs - $1,886.11 total
8. **Stand-Up Double** - 172 NFTs - $1,832.83 total
9. **Base Hit** - 172 NFTs - $1,832.83 total
10. **Line Drive** - 133 NFTs - $1,417.25 total
11. **Ground Ball** - 1 NFT - $7.99 total

## Next Steps

You need to:
1. **Cancel all 1,866 listings** using the listing IDs
2. **Relist them at correct prices** using the token IDs

The `mispriced_by_tier.json` file has everything you need - listing IDs to cancel and the correct prices for each tier.

## Recommended Approach

Option 1: Batch cancel + relist by tier (recommended)
- Work through one tier at a time
- Start with Grand Slam (highest value, only 33 NFTs)
- Then Walk-Off Home Run (38 NFTs)
- Continue in order of total loss

Option 2: Cancel all, then relist all
- More risky if something goes wrong in the middle
- But faster if everything works

