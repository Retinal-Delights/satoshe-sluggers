import { config } from "dotenv";
import { createThirdwebClient, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { getContract } from "thirdweb";
import { cancelListing } from "thirdweb/extensions/marketplace";
import fs from "fs/promises";
import { defineChain } from "thirdweb/chains";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "b9de842602dfa0732a23d716af4c1451";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN = defineChain(8453);
const MARKETPLACE_ADDRESS = "0x187A56dDfCcc96AA9f4FaAA8C0fE57388820A817";

async function main() {
  if (!PRIVATE_KEY) throw new Error("Set PRIVATE_KEY");

  const client = createThirdwebClient({ clientId: CLIENT_ID });
  const account = privateKeyToAccount({ client, privateKey: PRIVATE_KEY });
  const marketplace = getContract({
    client,
    chain: CHAIN,
    address: MARKETPLACE_ADDRESS,
  });

  // Load mispriced data
  console.log("Loading mispriced NFTs list...\n");
  const mispriced = JSON.parse(
    await fs.readFile("./scripts/mispriced_nfts.json", "utf-8"),
  );

  // Filter out Ground Ball
  const toCancel = mispriced.filter(nft => nft.rarity_tier !== "Ground Ball");
  console.log(`Found ${toCancel.length} mispriced listings to cancel (excluding Ground Ball tier)\n`);

  let cancelled = 0;
  let alreadyCancelled = 0;
  let errors = 0;
  const failed = [];

  for (const nft of toCancel) {

    try {
      console.log(`\nCancelling: ${nft.name} (Token ${nft.token_id}, Listing ${nft.listing_id})`);
      
      const cancelTx = cancelListing({
        contract: marketplace,
        listingId: BigInt(nft.listing_id),
      });
      
      const cancelResult = await sendTransaction({
        transaction: cancelTx,
        account,
      });
      
      console.log(`✓ Cancelled: ${cancelResult.transactionHash}`);
      cancelled++;

      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      if (err.message && err.message.includes("invalid listing")) {
        console.log(`⏭️  Already cancelled`);
        alreadyCancelled++;
      } else {
        console.error(`✗ Error:`, err.message);
        errors++;
        failed.push({
          ...nft,
          error: err.message
        });
      }
    }
  }

  // Save failed listings to file
  if (failed.length > 0) {
    await fs.writeFile(
      "./scripts/failed_cancellations.json",
      JSON.stringify(failed, null, 2)
    );
    console.log(`\n⚠️  Saved ${failed.length} failed cancellations to: scripts/failed_cancellations.json`);
  }

  console.log(`\n\n✓ Finished!`);
  console.log(`Successfully cancelled: ${cancelled}`);
  console.log(`Already cancelled: ${alreadyCancelled}`);
  console.log(`Failed errors: ${errors}`);
  if (failed.length > 0) {
    console.log(`\n💡 To retry failed ones, run: node scripts/retry-failed-cancellations.mjs`);
  }
}

main().catch(console.error);

