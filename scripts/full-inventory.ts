// Save as fullInventory.ts and run as instructed below
import {
    createThirdwebClient,
    getContract,
  } from "thirdweb";
  import { ownerOf, getNFT } from "thirdweb/extensions/erc721";
  import { getAllListings } from "thirdweb/extensions/marketplace";
  import { base } from "thirdweb/chains";
  import { writeFileSync } from "fs";
  import { join } from "path";

  type TokenInfo = {
    tokenId: string;
    name: string;
    rarityTier: string;
    owner: string | null;
    listingId?: string;
    price?: string;
    expiration?: string;
    status?: string;
  };
  
  const client = createThirdwebClient({
    clientId: "cf2e2081218cb0511c735f95e9b5d186",
  });
  const NFT_COLLECTION_ADDRESS = "0x53b062474eF48FD1aE6798f9982c58Ec0267c2Fc";
  const MARKETPLACE_ADDRESS = "0x187A56dDfCcc96AA9f4FaAA8C0fE57388820A817";
  const START_TOKEN_ID = 0;
  const END_TOKEN_ID = 7776; // inclusive
  
  async function getOwner(contract: any, tokenId: bigint) {
    try {
      return (await ownerOf({ contract, tokenId })) as string;
    } catch {
      return null;
    }
  }
  
  async function main() {
    const nftContract = getContract({
      client,
      chain: base,
      address: NFT_COLLECTION_ADDRESS,
    });
    const marketplaceContract = getContract({
      client,
      chain: base,
      address: MARKETPLACE_ADDRESS,
    });
  
    // 1. Build NFT/tokenId base info & owners
    const tokens: TokenInfo[] = [];
    for (let tid = START_TOKEN_ID; tid <= END_TOKEN_ID; tid++) {
      tokens.push({
        tokenId: tid.toString(),
        name: "",
        rarityTier: "",
        owner: null,
      });
    }
    // Batch fetch metadata & owners to avoid rate limits
    for (let i = 0; i < tokens.length; i += 50) {
      await Promise.all(
        tokens.slice(i, i + 50).map(async (t, j) => {
          const tokenId = BigInt(t.tokenId);
          try {
            const nft = await getNFT({ contract: nftContract, tokenId });
            t.name = nft.metadata.name || "#" + t.tokenId;
            const attributes = (nft.metadata.attributes || []) as Array<{ trait_type: string; value: any }>;
            t.rarityTier =
              attributes.find((a) => a.trait_type === "Tier")?.value || "unknown";
          } catch (e) {
            t.name = "#" + t.tokenId;
            t.rarityTier = "unknown";
          }
          t.owner = await getOwner(nftContract, tokenId);
        }),
      );
      // Short delay to avoid throttling
      await new Promise((r) => setTimeout(r, 500));
    }
    // 2. Fetch all active and past listings (with no limit)
    const allListings: any[] = [];
    let start: bigint = 0n;
    let keepGoing = true;
    while (keepGoing) {
      const lpage = await getAllListings({
        contract: marketplaceContract,
        start,
        count: 200,
      } as any);
      allListings.push(...lpage);
      keepGoing = lpage.length === 200;
      start += 200n;
    }
    // Map: {tokenId: [listing, ...]}
    const listingsByToken = new Map<string, any[]>();
    for (const listing of allListings) {
      const tokenId = (listing as any).asset?.tokenId || (listing as any).tokenId;
      if (tokenId) {
        const tokenIdStr = tokenId.toString();
        if (!listingsByToken.has(tokenIdStr))
          listingsByToken.set(tokenIdStr, []);
        listingsByToken.get(tokenIdStr)!.push(listing);
      }
    }
    // 3. Cross join for final output
    const rows = [];
    for (const t of tokens) {
      const mappedListings = listingsByToken.get(t.tokenId) || [];
      if (mappedListings.length) {
        for (const l of mappedListings) {
          rows.push({
            tokenId: t.tokenId,
            name: t.name,
            owner: t.owner,
            rarityTier: t.rarityTier,
            listingId: l.id,
            price: l.pricePerToken,
            expiration: l.endTime
              ? new Date(Number(l.endTime) * 1000).toISOString()
              : "",
            status: l.status,
          });
        }
      } else {
        rows.push({ ...t, listingId: "", price: "", expiration: "", status: "" });
      }
    }
    // CSV Output
    const csvContent = ["tokenId,name,owner,rarityTier,listingId,price,expiration,status"]
      .concat(
        rows.map((r) =>
          [
            r.tokenId,
            r.name,
            r.owner,
            r.rarityTier,
            r.listingId,
            r.price,
            r.expiration,
            r.status,
          ]
            .map((v) =>
              v === undefined ? "" : `"${String(v).replace(/"/g, '""')}"`,
            )
            .join(","),
        ),
      )
      .join("\n");

    const outputFile = join(process.cwd(), "scripts", `full-inventory-${Date.now()}.csv`);
    writeFileSync(outputFile, csvContent, "utf-8");
    console.log(`\n✅ Inventory exported to: ${outputFile}`);
    console.log(`📊 Total NFTs: ${rows.length}`);
  }
  
  main().catch(console.error);
  
  // Run with:
  //   pnpm add thirdweb
  //   pnpm exec tsx fullInventory.ts
  // Docs: https://portal.thirdweb.com/references/typescript
  