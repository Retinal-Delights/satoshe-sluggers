import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { cancelListing } from "thirdweb/extensions/marketplace";
import { createListing } from "thirdweb/extensions/marketplace";
import { readContract } from "thirdweb";
import fs from "fs/promises";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "b9de842602dfa0732a23d716af4c1451",
});

const marketplace = getContract({
  client,
  chain: base,
  address: "0x187A56dDfCcc96AA9f4FaAA8C0fE57388820A817",
});

const nftCollection = getContract({
  client,
  chain: base,
  address: "0x53b062474eF48FD1aE6798f9982c58Ec0267c2Fc",
});

// Read mispriced data
const mispricedByTier = JSON.parse(await fs.readFile("scripts/mispriced_by_tier.json", "utf8"));

// WARNING: This will CANCEL and RELIST NFTs
// Use carefully!

async function fixTier(tierName, privateKey) {
  const items = mispricedByTier[tierName];
  if (!items || items.length === 0) {
    console.log(`No mispriced NFTs for tier: ${tierName}`);
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Fixing ${items.length} NFTs in tier: ${tierName}`);
  console.log(`${'='.repeat(80)}\n`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    try {
      console.log(`\n[${i + 1}/${items.length}] Processing: ${item.name}`);
      console.log(`  Token ID: ${item.token_id}`);
      console.log(`  Current Price: ${item.actual_price_eth} ETH`);
      console.log(`  Expected Price: ${item.expected_price_eth} ETH`);
      
      // Step 1: Cancel the listing
      console.log(`  Cancelling listing ID: ${item.listing_id}...`);
      await cancelListing({
        contract: marketplace,
        listingId: BigInt(item.listing_id),
      });
      
      // Wait a bit for the transaction to confirm
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 2: Create new listing at correct price
      console.log(`  Creating new listing at ${item.expected_price_eth} ETH...`);
      
      // Convert ETH to wei
      const priceWei = BigInt(Math.floor(item.expected_price_eth * 1e18));
      
      await createListing({
        contract: marketplace,
        assetContractAddress: nftCollection.address,
        tokenId: BigInt(item.token_id),
        pricePerToken: priceWei,
        quantity: 1,
        currencyContractAddress: "0x0000000000000000000000000000000000000000", // Native ETH
      });
      
      console.log(`  ✓ Fixed: ${item.name}`);
      
      // Wait between transactions to avoid nonce issues
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`  ✗ Error fixing ${item.name}:`, error.message);
      // Continue with next NFT
    }
  }

  console.log(`\n✓ Completed tier: ${tierName}`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node scripts/fix-mispriced.mjs <tier-name> <private-key>

Available tiers:
  - "Grand Slam (Ultra-Legendary)" (33 NFTs) - HIGHEST PRIORITY
  - "Walk-Off Home Run" (38 NFTs)
  - "Home Run" (483 NFTs)
  - "Pinch Hit Home Run" (171 NFTs)
  - "Over-the-Fence Shot" (137 NFTs)
  - "Triple" (349 NFTs)
  - "Double" (177 NFTs)
  - "Stand-Up Double" (172 NFTs)
  - "Base Hit" (172 NFTs)
  - "Line Drive" (133 NFTs)
  - "Ground Ball" (1 NFT)

Example:
  node scripts/fix-mispriced.mjs "Grand Slam (Ultra-Legendary)" "your-private-key"

WARNING: This will cancel and relist NFTs. Make sure you have:
  1. Backup of your data
  2. Sufficient ETH for gas fees
  3. Confirmed the tier name is correct
    `);
    return;
  }

  const tierName = args[0];
  const privateKey = args[1];

  if (!privateKey) {
    console.error("Error: Private key required!");
    return;
  }

  console.log("\n⚠️  WARNING: This will cancel existing listings and create new ones!");
  console.log("Make sure you have sufficient ETH for gas fees.\n");

  await fixTier(tierName, privateKey);
}

main().catch(console.error);

