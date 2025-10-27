import fs from "fs/promises";
import path from "path";

async function main() {
  console.log("Analyzing which NFTs need relisting...\n");

  // Load all the data
  const mispricedByTier = JSON.parse(
    await fs.readFile("./scripts/mispriced_by_tier.json", "utf-8")
  );

  const retinalDelightNFTs = [
    844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856, 857, 
    858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869, 870
  ];
  
  // Test NFTs that should be left alone
  const testNFTs = [59, 1515]; // Token IDs for listing IDs 7827 and 7828
  
  // Already successfully relisted Grand Slam NFTs
  const alreadyRelistedGrandSlam = [1131, 1639, 1907]; // Token IDs for listing IDs 7829, 7830, 7831
  
  // These are all the correctly-relisted token IDs
  const alreadyCorrectlyListed = new Set([
    ...retinalDelightNFTs, 
    ...testNFTs, 
    ...alreadyRelistedGrandSlam
  ]);
  
  // Exclude listing IDs > 7776 (already correctly relisted)
  const MAX_LISTING_ID_TO_RELIST = 7776;

  const results = {
    summary: {},
    toRelist: {}
  };

  // Process each tier
  for (const [tier, nfts] of Object.entries(mispricedByTier)) {
    if (tier === "Ground Ball") {
      console.log(`✓ Skipping ${tier} tier (correctly priced)\n`);
      continue;
    }

    // Filter out:
    // 1. Retinal Delight NFTs that are already correctly listed
    // 2. Test NFTs (59, 1515)
    // 3. Already relisted Grand Slam NFTs (1131, 1639, 1907)
    // 4. Anything after listing ID 7776
    const toRelist = nfts.filter(nft => {
      // Skip if this token_id is already correctly listed
      if (alreadyCorrectlyListed.has(nft.token_id)) {
        return false;
      }
      
      // Skip if listing ID is too high (already relisted)
      if (parseInt(nft.listing_id) > MAX_LISTING_ID_TO_RELIST) {
        return false;
      }
      
      return true;
    });

    results.summary[tier] = {
      total_mispriced: nfts.length,
      needs_relisting: toRelist.length,
      already_relisted: nfts.length - toRelist.length
    };

    results.toRelist[tier] = toRelist;
    
    console.log(`${tier}:`);
    console.log(`  Total mispriced: ${nfts.length}`);
    console.log(`  Needs relisting: ${toRelist.length}`);
    console.log(`  Already relisted: ${nfts.length - toRelist.length}`);
    console.log(`  Expected price: ${toRelist[0]?.expected_price_eth || 'N/A'} ETH\n`);
  }

  // Save results
  await fs.writeFile(
    "./scripts/needs_relisting.json",
    JSON.stringify(results.toRelist, null, 2)
  );
  
  await fs.writeFile(
    "./scripts/relisting_summary.json",
    JSON.stringify(results.summary, null, 2)
  );

  console.log("\n✓ Summary saved to:");
  console.log("  - scripts/needs_relisting.json (detailed list per tier)");
  console.log("  - scripts/relisting_summary.json (summary counts)\n");

  // Print total
  const totalNeedsRelisting = Object.values(results.summary).reduce(
    (sum, tier) => sum + tier.needs_relisting,
    0
  );
  console.log(`\n📊 Total NFTs that need relisting: ${totalNeedsRelisting}`);
}

main().catch(console.error);
