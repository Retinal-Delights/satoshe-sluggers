import fs from 'fs';

// Read the files
const listings = JSON.parse(fs.readFileSync('scripts/listings.json', 'utf8'));
const pricing = JSON.parse(fs.readFileSync('scripts/token_pricing_mappings.json', 'utf8'));

// Create a map of token_id -> expected price
const expectedPrices = {};
pricing.forEach(item => {
  expectedPrices[item.token_id] = item.price_eth;
});

// Find mismatches
const mismatches = [];
const byTier = {};

listings.forEach(listing => {
  const tokenId = parseInt(listing.tokenId);
  const tokenData = pricing.find(p => p.token_id === tokenId);
  
  if (!tokenData) {
    console.log(`Warning: Token ID ${tokenId} not found in pricing mappings`);
    return;
  }
  
  const expectedPrice = tokenData.price_eth;
  const actualPrice = parseInt(listing.pricePerToken) / 1e18;
  
  // Compare prices (allow for small floating point differences)
  if (Math.abs(actualPrice - expectedPrice) > 0.000001) {
    const mismatch = {
      token_id: tokenId,
      listing_id: listing.listingId,
      name: tokenData.name,
      rarity_tier: tokenData.rarity_tier,
      expected_price_eth: expectedPrice,
      actual_price_eth: actualPrice,
      price_difference_eth: Math.abs(expectedPrice - actualPrice),
      dollar_difference: Math.abs(expectedPrice - actualPrice) * 2400
    };
    
    mismatches.push(mismatch);
    
    // Group by rarity tier
    if (!byTier[tokenData.rarity_tier]) {
      byTier[tokenData.rarity_tier] = [];
    }
    byTier[tokenData.rarity_tier].push(mismatch);
  }
});

// Sort by price difference (highest first)
mismatches.sort((a, b) => b.price_difference_eth - a.price_difference_eth);

// Output results
console.log(`\nFound ${mismatches.length} NFTs with incorrect pricing:\n`);

// Show breakdown by rarity tier
console.log('Breakdown by Rarity Tier:');
console.log('─'.repeat(120));
Object.entries(byTier).sort((a, b) => b[1].length - a[1].length).forEach(([tier, items]) => {
  const totalLoss = items.reduce((sum, item) => sum + item.dollar_difference, 0);
  console.log(`${tier.padEnd(35)} | ${items.length.toString().padStart(4)} NFTs | Total Loss: $${totalLoss.toFixed(2)}`);
});

console.log('\n\nTop 20 mismatches by dollar difference:');
console.log('─'.repeat(120));
mismatches.slice(0, 20).forEach(item => {
  console.log(
    `Token ${item.token_id} | ` +
    `Expected: ${item.expected_price_eth} ETH | ` +
    `Actual: ${item.actual_price_eth.toFixed(6)} ETH | ` +
    `Diff: $${item.dollar_difference.toFixed(2)}`
  );
});

// Save all mismatches to file
fs.writeFileSync(
  'scripts/mispriced_nfts.json',
  JSON.stringify(mismatches, null, 2)
);

// Save by tier
fs.writeFileSync(
  'scripts/mispriced_by_tier.json',
  JSON.stringify(byTier, null, 2)
);

console.log(`\n\nAll mismatches saved to: scripts/mispriced_nfts.json`);
console.log(`Mismatches by tier saved to: scripts/mispriced_by_tier.json`);
console.log(`Total mismatches: ${mismatches.length}`);

