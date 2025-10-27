import fs from "fs/promises";
import path from "path";

async function loadNFT(tokenId) {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "nfts",
    `${tokenId}.json`
  );
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to load token ${tokenId}:`, err.message);
    return null;
  }
}

async function main() {
  console.log("Verifying rarity tier assignments...\n");

  const needsRelisting = JSON.parse(
    await fs.readFile("./scripts/needs_relisting.json", "utf-8")
  );

  const mismatches = [];
  let checked = 0;

  for (const [expectedTier, nfts] of Object.entries(needsRelisting)) {
    for (const nft of nfts) {
      checked++;
      const actualNFT = await loadNFT(nft.token_id);
      
      if (!actualNFT) {
        mismatches.push({
          token_id: nft.token_id,
          expected_tier: expectedTier,
          actual_tier: "FILE_NOT_FOUND",
        });
        continue;
      }

      const actualTier = actualNFT.attributes?.find(
        (attr) => attr.trait_type === "Rarity Tier"
      )?.value;

      if (actualTier !== expectedTier) {
        mismatches.push({
          token_id: nft.token_id,
          name: nft.name,
          expected_tier: expectedTier,
          actual_tier: actualTier || "NOT_FOUND",
        });
      }

      if (checked % 100 === 0) {
        console.log(`Checked ${checked} NFTs...`);
      }
    }
  }

  console.log(`\n✓ Verification complete!`);
  console.log(`Checked: ${checked} NFTs`);
  console.log(`Mismatches: ${mismatches.length}`);

  if (mismatches.length > 0) {
    await fs.writeFile(
      "scripts/rarity-mismatches.json",
      JSON.stringify(mismatches, null, 2)
    );
    console.log("\n⚠️  Mismatches found! Saved to: scripts/rarity-mismatches.json");
    
    console.log("\nFirst 10 mismatches:");
    mismatches.slice(0, 10).forEach((m) => {
      console.log(
        `Token ${m.token_id}: Expected "${m.expected_tier}", Got "${m.actual_tier}"`
      );
    });
  } else {
    console.log("\n✅ All rarity tiers are correctly assigned!");
  }
}

main().catch(console.error);
