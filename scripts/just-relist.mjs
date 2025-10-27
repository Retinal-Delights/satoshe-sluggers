import { config } from "dotenv";
import { createThirdwebClient, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { getContract } from "thirdweb";
import { createListing } from "thirdweb/extensions/marketplace";
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
    throw new Error("Set PRIVATE_KEY in your .env.local file");

  // 1. Setup Thirdweb client and account
  const client = createThirdwebClient({ clientId: CLIENT_ID });
  const account = privateKeyToAccount({ client, privateKey: PRIVATE_KEY });

  // 2. Get contracts
  const marketplace = getContract({
    client,
    chain: CHAIN,
    address: MARKETPLACE_ADDRESS,
  });

  // 3. Load ONLY Grand Slam mispriced NFTs
  const byTier = JSON.parse(
    await fs.readFile("./scripts/mispriced_by_tier.json", "utf-8"),
  );
  
  const mispriced = byTier["Grand Slam (Ultra-Legendary)"] || [];
  console.log(`\nFound ${mispriced.length} Grand Slam NFTs to relist at 1 ETH each\n`);

  for (const nft of mispriced) {
    const { token_id, expected_price_eth, name } = nft;
    try {
      console.log(`\nCreating listing for: ${name} (Token ${token_id}) at ${expected_price_eth} ETH`);
      
      // Create the new listing
      const createTx = createListing({
        contract: marketplace,
        assetContractAddress: NFT_COLLECTION_ADDRESS,
        tokenId: BigInt(token_id),
        pricePerToken: expected_price_eth.toString(), // Price as string in ETH
      });
      
      const createResult = await sendTransaction({
        transaction: createTx,
        account,
      });
      
      console.log(`✓ Relisted ${name} at ${expected_price_eth} ETH: ${createResult.transactionHash}`);
      
      // Wait for transaction to be included in a block
      const receipt = await createResult.wait();
      console.log(`✓ Confirmed in block: ${receipt.blockNumber}`);

      // Wait between transactions to avoid nonce issues
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (err) {
      console.error(
        `✗ Error relisting token ${token_id}:`,
        err.message,
      );
    }
  }
}

main().catch(console.error);

