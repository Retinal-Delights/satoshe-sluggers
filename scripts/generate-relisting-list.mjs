import fs from "fs/promises";

async function main() {
  const needsRelisting = JSON.parse(
    await fs.readFile("./scripts/needs_relisting.json", "utf-8")
  );

  let csv = "token_id,rarity_tier,price_eth,name\n";
  let json = [];

  for (const [tier, nfts] of Object.entries(needsRelisting)) {
    for (const nft of nfts) {
      csv += `${nft.token_id},${tier},${nft.expected_price_eth},${nft.name}\n`;
      json.push({
        token_id: nft.token_id,
        rarity_tier: tier,
        price_eth: nft.expected_price_eth,
        name: nft.name,
      });
    }
  }

  await fs.writeFile("scripts/relisting-list.csv", csv);
  await fs.writeFile("scripts/relisting-list.json", JSON.stringify(json, null, 2));

  console.log(`\n✓ Generated lists:`);
  console.log(`  - scripts/relisting-list.csv`);
  console.log(`  - scripts/relisting-list.json`);
  console.log(`\nTotal NFTs to relist: ${json.length}`);
}

main().catch(console.error);
