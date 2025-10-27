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

  // Load failed listings
  try {
    const failed = JSON.parse(
      await fs.readFile("./scripts/failed_cancellations.json", "utf-8"),
    );
    
    console.log(`Retrying ${failed.length} failed cancellations...\n`);

    let cancelled = 0;
    let alreadyCancelled = 0;
    let stillFailed = [];

    for (const nft of failed) {
      try {
        console.log(`\nRetrying: ${nft.name} (Listing ${nft.listing_id})`);
        
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
          stillFailed.push(nft);
        }
      }
    }

    // Save any that still failed
    if (stillFailed.length > 0) {
      await fs.writeFile(
        "./scripts/still_failed.json",
        JSON.stringify(stillFailed, null, 2)
      );
      console.log(`\n⚠️  ${stillFailed.length} still failed, saved to: scripts/still_failed.json`);
    }

    console.log(`\n\n✓ Finished!`);
    console.log(`Successfully cancelled: ${cancelled}`);
    console.log(`Already cancelled: ${alreadyCancelled}`);
    console.log(`Still failed: ${stillFailed.length}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log("No failed_cancellations.json file found. Nothing to retry.");
    } else {
      throw err;
    }
  }
}

main().catch(console.error);
