// lib/constants.ts
// Collection constants for Provenance page
// SECURITY: All environment variables validated - no fallbacks allowed

export const COLLECTION_NAME = "SATOSHE SLUGGERS";

// Validate and export contract address - fail hard if missing
const CONTRACT_ADDRESS_ENV = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
if (!CONTRACT_ADDRESS_ENV) {
  throw new Error(
    "SECURITY ERROR: Missing NEXT_PUBLIC_NFT_COLLECTION_ADDRESS environment variable. No fallbacks allowed."
  );
}
export const CONTRACT_ADDRESS = CONTRACT_ADDRESS_ENV;

// Collection metadata (hashes are public, no security risk)
export const FINAL_PROOF_HASH = "a0a4dd729d67df70a8c53ed1ded33b327e326d6f52d95f6c19f8897199b5eb04";
export const MERKLE_ROOT = "bc84cdbe96390266f1b288a92da05b0237449c20669a8dab45b98c4ae35f7526";
