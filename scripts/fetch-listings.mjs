import { createThirdwebClient, getContract } from "thirdweb";
import { getAllListings } from "thirdweb/extensions/marketplace";
import { getNFT } from "thirdweb/extensions/erc721";
import { base } from "thirdweb/chains";
import fs from "fs/promises";

const client = createThirdwebClient({
  clientId:
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
    "b9de842602dfa0732a23d716af4c1451",
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

async function main() {
  const listings = await getAllListings({ contract: marketplace });
  const filtered = listings.filter(
    (l) =>
      l.id >= 0 &&
      l.id <= 7829 &&
      l.assetContractAddress.toLowerCase() ===
        nftCollection.address.toLowerCase(),
  );

  const output = [];
  for (const listing of filtered) {
    try {
      const nft = await getNFT({
        contract: nftCollection,
        tokenId: BigInt(listing.tokenId),
      });
      output.push({
        listingId: listing.id,
        tokenId: listing.tokenId,
        name: nft.metadata?.name || "",
        price: listing.pricePerToken,
        status: listing.status, // <-- this shows if it's live, cancelled, etc.
      });      
    } catch (e) {
      output.push({
        listingId: listing.id,
        tokenId: listing.tokenId,
        name: "",
        price: listing.pricePerToken,
        error: "NFT metadata fetch failed",
      });
    }
  }

  await fs.writeFile("./listings.json", JSON.stringify(output, null, 2));
  console.log("Listings exported to listings.json");
}

main().catch(console.error);
