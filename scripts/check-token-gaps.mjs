import fs from 'fs';

// Load pricing mappings
const pricingData = JSON.parse(
  fs.readFileSync('public/data/pricing/token_pricing_mappings.json', 'utf8')
);

// Create set of token IDs
const ids = new Set(pricingData.map(d => d.token_id));

// Find missing token IDs (0-7776)
const missing = [];
for (let i = 0; i <= 7776; i++) {
  if (!ids.has(i)) {
    missing.push(i);
  }
}

// Find duplicates
const idCounts = {};
pricingData.forEach(d => {
  idCounts[d.token_id] = (idCounts[d.token_id] || 0) + 1;
});
const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);

// Find NFTs with price 0
const zeroPrice = pricingData.filter(d => d.price_eth === 0);

// Statistics
console.log('=== PRICING MAPPINGS ANALYSIS ===\n');
console.log(`Total entries: ${pricingData.length}`);
console.log(`Expected range: 0-7776 (${7777} NFTs)`);
console.log(`Missing token IDs: ${missing.length}`);
if (missing.length > 0 && missing.length <= 50) {
  console.log(`Missing IDs: ${missing.join(', ')}`);
} else if (missing.length > 50) {
  console.log(`First 50 missing: ${missing.slice(0, 50).join(', ')}...`);
}

console.log(`\nMax token_id: ${Math.max(...pricingData.map(d => d.token_id))}`);
console.log(`Min token_id: ${Math.min(...pricingData.map(d => d.token_id))}`);
console.log(`\nDuplicates found: ${duplicates.length}`);
if (duplicates.length > 0 && duplicates.length <= 20) {
  console.log(`Duplicate token IDs: ${duplicates.map(([id, count]) => `ID ${id} (${count}x)`).join(', ')}`);
}

console.log(`\nNFTs with price_eth = 0: ${zeroPrice.length}`);
if (zeroPrice.length > 0 && zeroPrice.length <= 30) {
  console.log(`Token IDs with price 0: ${zeroPrice.map(d => d.token_id).join(', ')}`);
} else if (zeroPrice.length > 30) {
  console.log(`First 30 with price 0: ${zeroPrice.slice(0, 30).map(d => d.token_id).join(', ')}...`);
}

// Check metadata coverage
try {
  const metadata = JSON.parse(
    fs.readFileSync('public/data/combined_metadata.json', 'utf8')
  );
  const metadataIds = new Set(metadata.map(m => m.token_id));
  const metadataMissing = [];
  for (let i = 0; i <= 7776; i++) {
    if (!metadataIds.has(i)) {
      metadataMissing.push(i);
    }
  }
  console.log(`\n=== METADATA ANALYSIS ===\n`);
  console.log(`Total metadata entries: ${metadata.length}`);
  console.log(`Missing from metadata: ${metadataMissing.length}`);
  if (metadataMissing.length > 0 && metadataMissing.length <= 50) {
    console.log(`Missing metadata IDs: ${metadataMissing.join(', ')}`);
  }
} catch (err) {
  console.log(`\nCould not analyze metadata: ${err.message}`);
}

