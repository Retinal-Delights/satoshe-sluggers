import fs from 'fs';

const file = 'full-inventory-merged.csv';
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');
const header = lines[0];

const found = new Set();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const parts = line.split(',');
  const tokenId = parseInt(parts[1]);
  if (!isNaN(tokenId)) {
    found.add(tokenId);
  }
}

const missing = [];
for (let i = 0; i <= 7776; i++) {
  if (!found.has(i)) {
    missing.push(i);
  }
}

console.log(`\n📊 Token ID Analysis:`);
console.log(`   Expected: 7,777 NFTs (Token IDs 0-7776)`);
console.log(`   Found: ${found.size} unique Token IDs`);
console.log(`   Missing: ${missing.length} Token IDs\n`);

if (missing.length > 0) {
  console.log(`❌ Missing Token IDs (${missing.length}):\n`);
  
  // Show first 50, then summarize
  if (missing.length <= 50) {
    console.log(`   ${missing.join(', ')}\n`);
  } else {
    console.log(`   First 30: ${missing.slice(0, 30).join(', ')}`);
    console.log(`   ... and ${missing.length - 30} more\n`);
    console.log(`   All missing: ${missing.join(', ')}\n`);
  }
} else {
  console.log(`✅ All Token IDs 0-7776 are present!\n`);
}

// Also check for out-of-range Token IDs
const outOfRange = [];
for (const tid of found) {
  if (tid < 0 || tid > 7776) {
    outOfRange.push(tid);
  }
}

if (outOfRange.length > 0) {
  console.log(`⚠️  Out-of-range Token IDs found: ${outOfRange.join(', ')}\n`);
}

