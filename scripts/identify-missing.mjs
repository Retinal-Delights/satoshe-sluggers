import fs from 'fs';

const missingIds = [843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856, 857, 858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869];

console.log('=== IDENTIFYING MISSING NFTs (843-869) ===\n');

// Check metadata
try {
  const metadata = JSON.parse(
    fs.readFileSync('public/data/combined_metadata.json', 'utf8')
  );
  
  console.log('--- METADATA CHECK ---');
  const missingInMetadata = metadata.filter(m => missingIds.includes(parseInt(m.token_id)));
  console.log(`Found ${missingInMetadata.length} of 27 in metadata:\n`);
  
  missingInMetadata.forEach(m => {
    const tokenId = parseInt(m.token_id);
    const nftNumber = tokenId + 1;
    console.log(`Token ID ${tokenId} (NFT #${nftNumber}):`);
    console.log(`  Name: ${m.name || 'N/A'}`);
    console.log(`  Image: ${m.image || m.merged_data?.media_url || 'N/A'}`);
    console.log(`  Rarity: ${m.rarity_tier || m.merged_data?.rarity_tier || 'N/A'}`);
    if (m.name && (m.name.toLowerCase().includes('test') || m.name.toLowerCase().includes('sample'))) {
      console.log(`  ⚠️  POTENTIAL TEST NFT`);
    }
    if (m.image && (m.image.includes('placeholder') || m.image.includes('test'))) {
      console.log(`  ⚠️  PLACEHOLDER/TEST IMAGE`);
    }
    console.log('');
  });
} catch (err) {
  console.log(`Error reading metadata: ${err.message}\n`);
}

// Check CSV
try {
  const csvContent = fs.readFileSync('docs/full-inventory-merged.csv', 'utf8');
  const lines = csvContent.split('\n');
  const header = lines[0].split(',');
  
  console.log('--- CSV CHECK ---');
  const csvMatches = [];
  
  lines.forEach((line, idx) => {
    if (idx === 0 || !line.trim()) return;
    const cols = line.split(',');
    // CSV format appears to be: listing_id, token_id, name, barang, ...
    // Need to check which column is token_id
    const tokenIdCol = cols.findIndex(c => !isNaN(parseInt(c)) && missingIds.includes(parseInt(c)));
    if (tokenIdCol !== -1) {
      const tokenId = parseInt(cols[tokenIdCol]);
      if (missingIds.includes(tokenId)) {
        csvMatches.push({ line: idx + 1, cols, tokenId });
      }
    }
  });
  
  // Try a different approach - check if token_id is in column 1 (index 0)
  lines.slice(1).forEach((line, idx) => {
    if (!line.trim()) return;
    const cols = line.split(',');
    if (cols.length > 1) {
      const possibleTokenId = parseInt(cols[1]);
      if (!isNaN(possibleTokenId) && missingIds.includes(possibleTokenId)) {
        const alreadyFound = csvMatches.find(m => m.tokenId === possibleTokenId);
        if (!alreadyFound) {
          csvMatches.push({ 
            line: idx + 2, 
            cols, 
            tokenId: possibleTokenId,
            name: cols[2] || 'N/A',
            status: cols[cols.length - 1] || 'N/A'
          });
        }
      }
    }
  });
  
  console.log(`Found ${csvMatches.length} of 27 in CSV:\n`);
  csvMatches.forEach(m => {
    console.log(`Token ID ${m.tokenId} (NFT #${m.tokenId + 1}):`);
    console.log(`  Name: ${m.name || 'N/A'}`);
    console.log(`  Status: ${m.status || 'N/A'}`);
    console.log(`  Line: ${m.line}`);
    if (m.name && (m.name.toLowerCase().includes('test') || m.name.toLowerCase().includes('sample'))) {
      console.log(`  ⚠️  POTENTIAL TEST NFT`);
    }
    console.log('');
  });
  
  // Show which ones are NOT in CSV
  const foundIds = csvMatches.map(m => m.tokenId);
  const notInCsv = missingIds.filter(id => !foundIds.includes(id));
  if (notInCsv.length > 0) {
    console.log(`NOT FOUND IN CSV: ${notInCsv.join(', ')} (${notInCsv.length} NFTs)\n`);
  }
  
} catch (err) {
  console.log(`Error reading CSV: ${err.message}\n`);
}

// Check if any have "test" or "sample" indicators
console.log('--- SUMMARY ---');
console.log(`Missing token IDs: ${missingIds.join(', ')}`);
console.log(`NFT numbers: ${missingIds.map(id => id + 1).join(', ')}`);
console.log(`Range: NFT #${missingIds[0] + 1} to NFT #${missingIds[missingIds.length - 1] + 1}`);

