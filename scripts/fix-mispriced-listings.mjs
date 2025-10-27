import { config } from "dotenv";
import { createThirdwebClient, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { getContract } from "thirdweb";
import { cancelListing, createListing } from "thirdweb/extensions/marketplace";
import fs from "fs/promises";
import { defineChain } from "thirdweb/chains";
import path from "path";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env.local") });

// Config
const CLIENT_ID =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
  "b9de842602dfa0732a23d716af4c1451";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const CHAIN = defineChain(8453); // Base
const MARKETPLACE_ADDRESS = "0x187A56dDfCcc96AA9f4FaAA8C0fE57388820A817";
const NFT_COLLECTION_ADDRESS = "0x53b062474eF48FD1aE6798f9982c58Ec0267c2Fc";

async function main() {
  if (!PRIVATE_KEY)
    throw new Error("Set PRIVATE_KEY in your .env or .env.local file");

  // 1. Setup Thirdweb client and account
  const client = createThirdwebClient({ clientId: CLIENT_ID });
  const account = privateKeyToAccount({ client, privateKey: PRIVATE_KEY });

  // 2. Get contracts
  const marketplace = getContract({
    client,
    chain: CHAIN,
    address: MARKETPLACE_ADDRESS,
  });

  // 3. Load mispriced NFTs (by tier or all)
  const tierName = process.argv[2];
  let mispriced;
  
  if (tierName) {
    const byTier = JSON.parse(
      await fs.readFile("./scripts/mispriced_by_tier.json", "utf-8"),
    );
    mispriced = byTier[tierName] || [];
    console.log(`\nWorking on tier: ${tierName}`);
    console.log(`Found ${mispriced.length} NFTs to fix\n`);
  } else {
    mispriced = JSON.parse(
      await fs.readFile("./scripts/mispriced_nfts.json", "utf-8"),
    );
    console.log(`\nWorking on ALL tiers`);
    console.log(`Found ${mispriced.length} NFTs to fix\n`);
  }
  
  if (mispriced.length === 0) {
    console.log("No NFTs to fix. Exiting.");
    return;
  }

  // Skip listings that are already fixed
  const skipListingIds = new Set(
    Array.from({ length: 7826 - 7778 + 1 }, (_, i) => 7778 + i),
  );
  const skipCreator = "0xd896a920e803d32b0fa17f6b2776e65a91371254";

  for (const nft of mispriced) {
    const { listing_id, token_id, expected_price_eth, name } = nft;
    
    // Skip by listing ID
    if (skipListingIds.has(Number(listing_id))) {
      console.log(`Skipping relisted listing ${listing_id}`);
      continue;
    }

    // Skip by creator address (if data includes creator field)
    if (nft.creator && nft.creator.toLowerCase() === skipCreator) {
      console.log(`Skipping listing created by ${skipCreator}`);
      continue;
    }

    try {
      console.log(`\nProcessing: ${name} (Token ${token_id})`);
      
      // Cancel the old listing
      const cancelTx = cancelListing({
        contract: marketplace,
        listingId: BigInt(listing_id),
      });
      const cancelResult = await sendTransaction({
        transaction: cancelTx,
        account,
      });
      console.log(`✓ Cancelled listing ${listing_id}: ${cancelResult.transactionHash}`);

      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Create the new listing
      const createTx = createListing({
        contract: marketplace,
        assetContractAddress: NFT_COLLECTION_ADDRESS,
        tokenId: BigInt(token_id),
        pricePerToken: BigInt(Math.floor(Number(expected_price_eth) * 1e18)), // ETH to wei
        quantity: 1n,
        currencyContractAddress: "0x0000000000000000000000000000000000000000", // Native ETH
      });
      const createResult = await sendTransaction({
        transaction: createTx,
        account,
      });
      console.log(
        `✓ Created new listing for ${name} at ${expected_price_eth} ETH: ${createResult.transactionHash}`,
      );

      // Wait between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(
        `✗ Error processing token ${token_id} (listing ${listing_id}):`,
        err.message,
      );
    }
  }
}

main().catch(console.error);
