import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { base } from "thirdweb/chains";
import fs from "fs";

const client = createThirdwebClient({
  clientId: "b9de842602dfa0732a23d716af4c1451",
});

const marketplace = getContract({
  client,
  address: "0x187A56dDfCcc96AA9f4FaAA8C0fE57388820A817",
  chain: base,
});

// ABI for the Marketplace V3 direct listing struct
const ABI_LISTING = `
  function totalListings() view returns (uint256)
  function getListing(uint256 _listingId) view returns (
    (uint256 id,
     address assetContract,
     uint256 tokenId,
     address seller,
     uint256 quantity,
     address currency,
     uint256 pricePerToken,
     uint256 startTimestamp,
     uint256 endTimestamp,
     bool reserved,
     bool status)
  )
`;

async function main() {
  console.log("⏳ Reading listings from Marketplace V3…");

  // Manually inject the ABI
  marketplace.abi = ABI_LISTING;

  let total;
  try {
    total = await readContract({
      contract: marketplace,
      method: "function totalListings() view returns (uint256)",
      params: [],
    });
  } catch {
    total = 7829; // fallback
  }

  console.log("Total listing slots:", total.toString());

  const listings = [];
  for (let i = 0; i < Number(total); i++) {
    try {
      const listing = await readContract({
        contract: marketplace,
        method: "function getListing(uint256) view returns (tuple(uint256,address,uint256,address,uint256,address,uint256,uint256,uint256,bool,bool))",
        params: [BigInt(i)],
      });
      const price = Number(listing[6]) / 1e18;
      const active = listing[10];
      if (active) {
        listings.push({
          id: i,
          tokenId: listing[2].toString(),
          seller: listing[3],
          pricePerToken: price,
        });
      }
      if (i % 100 === 0) console.log(`Scanned ${i}/${total}`);
    } catch {}
  }

  fs.writeFileSync("all_listings.json", JSON.stringify(listings, null, 2));
  console.log(`✅ Saved ${listings.length} active listings to all_listings.json`);
}

main().catch(console.error);
