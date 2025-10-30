# Satoshe Sluggers – Production Test & Readiness Checklist

Owner: Engineering

## 1) Wallet & Session
- [ ] Connect/disconnect/reconnect (MetaMask on Base)
- [ ] Idle auto‑disconnect works (no pending TX)
- [ ] Termly banner + Preferences modal visible

## 2) Collection (Grid) UX
- [x] Filters persist when opening NFT and clicking Back to Collection
- [ ] Sorting: Rank High→Low shows rank #1 first; Rarity High→Low shows lowest % first; Price sorts correctly
- [x] Table view shows green "Sold" pill for non‑sale items

## 3) NFT Detail Page
- [x] Image loads from IPFS (Cloudflare gateway) or falls back to `/nfts/placeholder-nft.webp`
- [x] Success modal shows correct NFT number (metadata.token_id + 1)
- [x] After purchase: Sold state persists (green "Sold At" + owner link); Buy section hidden; OpenSea link correct

## 4) Dynamic Counts & States
- [x] Live/Sold counts reflect on‑chain state (using useOnChainOwnership hook)
- [x] Grid marks purchased token Sold after confirmation

## 5) My NFTs
- [ ] Favorites visible and toggle works
- [ ] Owned tab lists newly purchased NFT for connected wallet
- [ ] Favorites sync across devices (wallet‑keyed)

## 6) Links, Media & Metadata
- [ ] No broken images/icons/logos anywhere
- [ ] OG/Twitter preview renders correctly

## 7) Security & Compliance
- [x] Security headers present: CSP, HSTS, Referrer‑Policy, Permissions‑Policy, X‑Content‑Type‑Options, X‑Frame‑Options, COOP, CORP
- [ ] No CSP console violations (needs testing after CSP tightening)
- [x] No hard‑coded secrets; envs managed in Vercel

## 8) Performance & Accessibility
- [ ] Home, /nfts, /nft/[id] load < 3s on broadband
- [ ] Minimal layout shift on image load
- [ ] Keyboard navigation and focus ring work

## 9) Analytics (non‑blocking)
- [x] Purchase success/failure events fire
- [x] Speed Insights added and configured

## 10) Release Hygiene
- [x] `pnpm build` succeeds locally and in Vercel (zero warnings)
- [ ] Latest commit hash deployed to Vercel
- [ ] Hard refresh shows latest assets

## 11) Remediation Tasks (Pre-Deploy)

### Framework & Runtime (16/17 → 17/17)
- [x] Merge `vercel.json` into a single valid JSON object (fixed)
- [ ] Verify Node.js version constraint in `package.json` engines matches Vercel runtime (target: 18.x or 20.x)
- [ ] Ensure Turbopack build completes without warnings in production mode

### Thirdweb Integration (15/17 → 17/17)
- [ ] Add `supportedChains={[base]}` prop to `ThirdwebProvider` in `app/layout.tsx`
  - Import: `import { base } from "thirdweb/chains";`
  - Update: `<ThirdwebProvider supportedChains={[base]}>`
- [ ] Add visible Disconnect button/control in wallet connection UI (header component)
- [ ] Verify wallet connection persists correctly and disconnects cleanly
- [ ] Test all Thirdweb SDK methods with explicit chain parameter where applicable

### Environment (ENV) Management (15/17 → 17/17)
- [ ] Create `.env.example` file with all required variables:
  ```
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID=
  NEXT_PUBLIC_NFT_COLLECTION_ADDRESS=
  NEXT_PUBLIC_MARKETPLACE_ADDRESS=
  NEXT_PUBLIC_CREATOR_ADDRESS=
  ```
- [ ] Verify all `NEXT_PUBLIC_*` vars are set in Vercel dashboard (Settings → Environment Variables)
- [ ] Remove hard-coded fallback values from scripts (e.g., `scripts/fetch-listings.mjs`)
- [ ] Add runtime validation for required env vars in `lib/constants.ts` or `lib/thirdweb.ts` (throw error if missing)
- [ ] Document env var requirements in README.md

### Security Headers (16/17 → 17/17)
- [ ] Add `Cross-Origin-Embedder-Policy: require-corp` header in `next.config.mjs` securityHeaders array
- [ ] Add `X-DNS-Prefetch-Control: on` header in `next.config.mjs` securityHeaders array
- [ ] Test headers using browser DevTools → Network → Response Headers or `curl -I`
- [ ] Verify headers don't break Thirdweb wallet functionality or IPFS image loading

### CSP (Content Security Policy) (14/17 → 17/17)
- [ ] Tighten CSP `connect-src` in `next.config.mjs` to explicit domains:
  - Current: `"connect-src 'self' https: wss:"`
  - Target: `"connect-src 'self' https://*.thirdweb.com https://*.walletconnect.com https://*.walletconnect.org https://rpc.ankr.com https://ipfs.io https://gateway.pinata.cloud https://cloudflare-ipfs.com https://vitals.vercel-insights.com https://vercel.live https://*.termly.io"`
- [ ] Tighten CSP `script-src` to specific Thirdweb and Termly domains (test thoroughly)
- [ ] Add CSP `frame-src` with explicit Termly domain if needed
- [ ] Test all functionality after CSP changes (wallet connect, purchases, images, Termly banner)
- [ ] Monitor browser console for CSP violations in production
- [ ] Add `report-uri` or `report-to` directive for CSP violation reporting (optional)

### Wallet & Session (14/17 → 17/17)
- [ ] Add visible Disconnect button in header/navigation component
- [ ] Test wallet reconnection after page refresh
- [ ] Verify wallet state syncs correctly across tabs/windows
- [ ] Test wallet connection on mobile (MetaMask mobile app)
- [ ] Ensure wallet disconnect clears all session state (favorites, owned NFTs cache)

### Data & Performance (15/17 → 17/17)
- [ ] Audit and remove unused dependencies from `package.json`
- [ ] Use dynamic imports for heavy components (e.g., charts, large modals)
  - Example: `const Chart = dynamic(() => import('./Chart'), { ssr: false })`
- [ ] Verify bundle size with `pnpm build` and check `.next` output
- [ ] Add code splitting for NFT grid (if >100KB)
- [ ] Optimize `combined_metadata.json` loading (consider lazy loading or pagination)
- [ ] Implement caching strategy for IPFS metadata (localStorage or IndexedDB)
- [ ] Add performance monitoring (Web Vitals) via Vercel Analytics

### Images & Assets (14/17 → 17/17)
- [ ] Add `priority` prop to above-the-fold hero images on homepage
- [ ] Add `sizes` prop to NFT grid images for responsive loading
  - Example: `sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"`
- [ ] Add `placeholder="blur"` with base64 blur data URL for hero images
- [ ] Ensure all NFT images use Next.js `Image` component (not `<img>`)
- [ ] Verify IPFS images load correctly with Cloudflare gateway
- [ ] Test image loading performance on slow 3G connection
- [ ] Add loading="lazy" to below-the-fold images

### Additional Code Quality
- [ ] Remove hard-coded contract addresses from `scripts/fetch-listings.mjs` (use env vars)
- [ ] Fix duplicate entries in `token_pricing_mappings.json` (358 duplicates found)
- [ ] Add TypeScript strict mode checks (if not already enabled)
- [ ] Remove console.log statements in production builds (verify `compiler.removeConsole` works)
- [ ] Add error boundaries around critical components (wallet, purchase flow)

### Testing & Validation
- [ ] Run `pnpm build` locally and fix any TypeScript errors
- [ ] Test full purchase flow on Base testnet/mainnet
- [ ] Verify all links work (BaseScan, Blockscout, OpenSea)
- [ ] Test filter persistence across navigation
- [ ] Verify Live/Sold counts update correctly after purchase
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify responsive design on mobile devices
- [ ] Check accessibility with screen reader (NVDA/JAWS/V上用JAWS/Apple VoiceOver)

### Deployment Checklist
- [ ] All Vercel environment variables set and verified
- [ ] `vercel.json` is valid JSON (fixed)
- [ ] Latest code committed and pushed to GitHub
- [ ] Vercel deployment succeeds without errors
- [ ] Production domain SSL certificate valid
- [ ] Test production URL after deployment