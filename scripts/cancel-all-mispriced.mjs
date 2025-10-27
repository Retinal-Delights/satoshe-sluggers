import { config } from "dotenv";
import { createThirdwebClient, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { getContract } from "thirdweb";
import { cancelListing } from "thirdweb/extensions/marketplace";
import fs from "fs/promises";
import { defineChain } from "thirdweb/chains";
import path from "path";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env.local") });

const CLIENT_ID =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
  "b9de842602dfa0732a23d716af4c1451";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN = defineChain(8453); // Base
const MARKETPLACE_ADDRESS = "0x187A56dDfCcc96AA9f4FaAA8C0fE57388820A817";

async function main() {
  if (!PRIVATE_KEY) throw new Error("Set PRIVATE_KEY in your .env.local file");

  const client = createThirdwebClient({ clientId: CLIENT_ID });
  const account = privateKeyToAccount({ client, privateKey: PRIVATE_KEY });
  const marketplace = getContract({
    client,
    chain: CHAIN,
    address: MARKETPLACE_ADDRESS,
  });

  // Load all mispriced NFTs
  const mispriced = JSON.parse(
    await fs.readFile("./scripts/mispriced_nfts.json", "utf-8"),
  );

  // Filter out Ground Ball tier (only cancel the others)
  const toCancel = mispriced.filter(nft => nft.rarity_tier !== "Ground Ball");

  console.log(`\nCancelling ${toCancel.length} mispriced listings (excluding Ground Ball tier)\n`);

  for (const nft of toCancel) {
    const { listing_id, name, token_id } = nft;
    try {
      console.log(`Cancelling: ${name} (Token ${token_id}, Listing ${listing_id})`);
      
      const cancelTx = cancelListing({
        contract: marketplace,
        listingId: BigInt(listing_id),
      });
      
      const cancelResult = await sendTransaction({
        transaction: cancelTx,
        account,
      });
      
      console.log(`✓ Cancelled: ${cancelResult.transactionHash}`);

      // Wait between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`✗ Error cancelling token ${token_id}:`, err.message);
    }
  }

  console.log("\n✓ Finished cancelling all mispriced listings");
}

main().catch(console.error);

