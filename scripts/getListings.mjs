// scripts/getListings.mjs
// -------------------------------------------------------------
// 🔍 Purpose: Fetch all listings from your Thirdweb Marketplace
// -------------------------------------------------------------

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createThirdwebClient, getContract } from "thirdweb";
import { getAllListings } from "thirdweb/extensions/marketplace";
import { base } from "thirdweb/chains";

// -------------------------------------------------------------
// ⚙️ Load .env directly (absolute path)
// -------------------------------------------------------------
dotenv.config({
  path: "C:/Users/krist/OneDrive/Desktop/satoshe-sluggers/.env",
});

// -------------------------------------------------------------
// 🧠 Thirdweb Client + Marketplace Setup
// -------------------------------------------------------------
const clientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
  process.env.NEXT_PUBLIC_CLIENT_ID ||
  process.env.NEXT_PUBLIC_TW_CLIENT_ID;

if (!clientId) {
  console.error(
    "❌ No Thirdweb client ID found. Please ensure NEXT_PUBLIC_THIRDWEB_CLIENT_ID is set in your .env file."
  );
  process.exit(1);
}

const client = createThirdwebClient({
  clientId,
});

const marketplace = getContract({
  client,
  address: "0x187A56dDfCcc96AA9f4FaAA8C0fE57388820A817", // Marketplace on Base
  chain: base,
});

// -------------------------------------------------------------
// 🪙 Fetch Listings and Export
// -------------------------------------------------------------
async function main() {
  try {
    console.log("⏳ Fetching all listings from your marketplace…");

    const listings = await getAllListings({ contract: marketplace });
    console.log(`✅ Found ${listings.length} listings.`);

    // Build tokenId → listingId map
    const tokenIdToListingId = {};
    for (const listing of listings) {
      tokenIdToListingId[listing.tokenId] = listing.id;
    }

    // Convert BigInts safely for JSON
    const replacer = (key, value) =>
      typeof value === "bigint" ? value.toString() : value;

    // Write data to files in project root
    fs.writeFileSync(
      path.resolve("./all_listings.json"),
      JSON.stringify(listings, replacer, 2)
    );

    fs.writeFileSync(
      path.resolve("./tokenIdToListingId.json"),
      JSON.stringify(tokenIdToListingId, null, 2)
    );

    console.log("💾 Saved all_listings.json and tokenIdToListingId.json");
  } catch (err) {
    console.error("❌ Error fetching listings:", err);
  }
}

// -------------------------------------------------------------
// 🚀 Run
// -------------------------------------------------------------
main();
