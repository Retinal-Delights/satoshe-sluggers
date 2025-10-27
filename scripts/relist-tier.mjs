import { config } from "dotenv";
import { createThirdwebClient, sendTransaction, prepareContractCall } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { getContract } from "thirdweb";
import fs from "fs/promises";
import { defineChain } from "thirdweb/chains";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "b9de842602dfa0732a23d716af4c1451";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN = defineChain(8453);
const MARKETPLACE_ADDRESS = "0x187A56dDfCcc96AA9f4FaAA8C0fE57388820A817";
const NFT_COLLECTION_ADDRESS = "0x53b062474eF48FD1aE6798f9982c58Ec0267c2Fc";
const CURRENCY_ADDRESS = "0x4200000000000000000000000000000000000006"; // Base ETH

async function main() {
  if (!PRIVATE_KEY) throw new Error("Set PRIVATE_KEY");

  // Get tier name from command line argument
  const tierName = process.argv[2];
  if (!tierName) {
    console.log("Usage: node scripts/relist-tier.mjs '<Tier Name>'");
    console.log("\nAvailable tiers:");
    console.log("  - Grand Slam (Ultra-Legendary)");
    console.log("  - Walk-Off Home Run");
    console.log("  - Home Run");
    console.log("  - Pinch Hit Home Run");
    console.log("  - Over-the-Fence Shot");
    console.log("  - Triple");
    console.log("  - Double");
    console.log("  - Stand-Up Double");
    console.log("  - Base Hit");
    console.log("  - Line Drive");
    return;
  }

  const client = createThirdwebClient({ clientId: CLIENT_ID });
  const account = privateKeyToAccount({ client, privateKey: PRIVATE_KEY });
  const marketplace = getContract({
    client,
    chain: CHAIN,
    address: MARKETPLACE_ADDRESS,
  });

  // Load needs_relisting.json
  const needsRelisting = JSON.parse(
    await fs.readFile("./scripts/needs_relisting.json", "utf-8"),
  );

  const nfts = needsRelisting[tierName];
  if (!nfts || nfts.length === 0) {
    console.log(`No NFTs found for tier: ${tierName}`);
    return;
  }

  console.log(`\n🎯 Relisting ${nfts.length} NFTs for tier: ${tierName}`);
  console.log(`Expected price: ${nfts[0].expected_price_eth} ETH\n`);

  const results = {
    tier: tierName,
    expected_price: nfts[0].expected_price_eth,
    total: nfts.length,
    successful: [],
    failed: [],
    start_time: new Date().toISOString(),
  };

  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i];
    try {
      console.log(`\n[${i + 1}/${nfts.length}] Creating listing: ${nft.name} (Token ${nft.token_id})`);
      console.log(`  Price: ${nft.expected_price_eth} ETH`);
      
      const now = Math.floor(Date.now() / 1000);
      
      const tx = prepareContractCall({
        contract: marketplace,
        method: "function createListing((address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint256 startTimestamp, uint256 endTimestamp, address recipient))",
        params: [{
          assetContract: NFT_COLLECTION_ADDRESS,
          tokenId: BigInt(nft.token_id),
          quantity: 1n,
          currency: CURRENCY_ADDRESS,
          pricePerToken: BigInt(Math.floor(Number(nft.expected_price_eth) * 1e18)),
          startTimestamp: BigInt(now),
          endTimestamp: BigInt(now + 60 * 60 * 24 * 365),
          recipient: "0x0000000000000000000000000000000000000000",
        }],
      });
      
      const result = await sendTransaction({ transaction: tx, account });
      const receipt = await result.wait();
      
      console.log(`✓ Transaction confirmed:`);
      console.log(`  TX Hash: ${receipt.transactionHash}`);
      console.log(`  Gas Used: ${receipt.gasUsed?.toString() ?? 'N/A'}`);
      
      results.successful.push({
        ...nft,
        new_listing_id: null, // Will need to fetch this
        tx_hash: receipt.transactionHash,
        gas_used: receipt.gasUsed?.toString() ?? 'N/A',
      });

      // Wait between transactions (10 seconds as recommended)
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (err) {
      console.error(`✗ Error:`, err.message);
      results.failed.push({
        ...nft,
        error: err.message,
      });
    }
  }

  results.end_time = new Date().toISOString();
  results.success_count = results.successful.length;
  results.failed_count = results.failed.length;

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `scripts/relisting_${tierName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
  await fs.writeFile(filename, JSON.stringify(results, null, 2));

  console.log(`\n\n✓ Finished!`);
  console.log(`Successful: ${results.successful.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Results saved to: ${filename}`);
}

main().catch(console.error);
