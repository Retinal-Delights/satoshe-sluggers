# Satoshe Sluggers – Production Test & Readiness Checklist

Owner: Engineering

## 1) Wallet & Session
- [ ] Connect/disconnect/reconnect (MetaMask on Base)
- [ ] Idle auto‑disconnect works (no pending TX)
- [ ] Termly banner + Preferences modal visible

## 2) Collection (Grid) UX
- [ ] Filters persist when opening NFT and clicking Back to Collection
- [ ] Sorting: Rank High→Low shows rank #1 first; Rarity High→Low shows lowest % first; Price sorts correctly
- [ ] Table view shows green “Sold” pill for non‑sale items

## 3) NFT Detail Page
- [ ] Image loads from IPFS (Cloudflare gateway) or falls back to `/nfts/placeholder-nft.webp`
- [ ] Success modal shows correct NFT number (metadata.token_id + 1)
- [ ] After purchase: Sold state persists (green “Sold At” + owner link); Buy section hidden; OpenSea link correct

## 4) Dynamic Counts & States
- [ ] Live/Sold counts reflect on‑chain state
- [ ] Grid marks purchased token Sold after confirmation

## 5) My NFTs
- [ ] Favorites visible and toggle works
- [ ] Owned tab lists newly purchased NFT for connected wallet
- [ ] Favorites sync across devices (wallet‑keyed)

## 6) Links, Media & Metadata
- [ ] No broken images/icons/logos anywhere
- [ ] OG/Twitter preview renders correctly

## 7) Security & Compliance
- [ ] Security headers present: CSP, HSTS, Referrer‑Policy, Permissions‑Policy, X‑Content‑Type‑Options, X‑Frame‑Options, COOP, CORP
- [ ] No CSP console violations
- [ ] No hard‑coded secrets; envs managed in Vercel

## 8) Performance & Accessibility
- [ ] Home, /nfts, /nft/[id] load < 3s on broadband
- [ ] Minimal layout shift on image load
- [ ] Keyboard navigation and focus ring work

## 9) Analytics (non‑blocking)
- [ ] Purchase success/failure events fire

## 10) Release Hygiene
- [ ] `pnpm build` succeeds locally and in Vercel
- [ ] Latest commit hash deployed to Vercel
- [ ] Hard refresh shows latest assets

## 11) Remediation Tasks (Pre-Deploy)
- [ ] Merge `vercel.json` into a single valid JSON object (fixed)
- [ ] Tighten CSP in `next.config.mjs` to only required domains (Thirdweb, Termly, Vercel, IPFS gateways)
- [ ] Add `Cross-Origin-Embedder-Policy: require-corp` and `X-DNS-Prefetch-Control: on` headers in `next.config.mjs`
- [ ] Add `supportedChains={[base]}` and a visible Disconnect control for wallet in header
- [ ] Ensure Vercel envs set: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`, `NEXT_PUBLIC_NFT_COLLECTION_ADDRESS`, `NEXT_PUBLIC_MARKETPLACE_ADDRESS`
- [ ] Sync `.env.example` with all required `NEXT_PUBLIC_*` vars
- [ ] Dynamic import heavy modules (e.g., charts) and verify bundle splits
- [ ] Add `priority`/`sizes`/`placeholder="blur"` for above-the-fold images