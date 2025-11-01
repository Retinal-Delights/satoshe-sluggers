# SIWE & Favorites Backend Setup Checklist

## ✅ Already Completed
- [x] Supabase database table created (`favorites`)
- [x] SIWE authentication API routes created
- [x] Session management implemented
- [x] Favorites API updated to use sessions
- [x] ConnectButton configured with SIWE
- [x] Custom wallet-auth.ts removed

## 🔧 Environment Variables to Check/Set

### Required (Should already be set in Vercel):
1. ✅ `SUPABASE_URL` - Your Supabase project URL
2. ✅ `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
3. ✅ `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Your Thirdweb client ID

### Recommended for Production (Set in Vercel):
4. ⚠️ `SESSION_SECRET` - **Add this in Vercel** (optional but recommended)
   - **What it is**: A secret string used to sign/encrypt session tokens
   - **How to generate**: Any random string (32+ characters)
   - **Where to set**: Vercel Dashboard → Your Project → Settings → Environment Variables
   - **Note**: Currently using a fallback, but production should have this set

**To generate a secure SESSION_SECRET:**
```bash
# Option 1: Use openssl (if available)
openssl rand -base64 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Any random string generator (32+ characters)
```

## 🧪 Testing Checklist

### Before Testing:
- [ ] Ensure Supabase table exists (check Table Editor)
- [ ] Environment variables set in Vercel (if deploying)
- [ ] Build runs without errors (`pnpm build`)

### Test Steps:
1. [ ] **Connect Wallet**
   - Click "CONNECT" button
   - Select wallet (MetaMask, Coinbase, etc.)
   - Sign the SIWE message when prompted

2. [ ] **Verify Session Created**
   - Check browser DevTools → Application → Cookies
   - Should see `siwe-session` cookie set

3. [ ] **Test Favorites**
   - Navigate to `/nfts` page
   - Favorite an NFT (click heart icon)
   - Should work without signing again (session handles auth)

4. [ ] **Verify Database**
   - Go to Supabase Dashboard → Table Editor → `favorites`
   - Should see new row with your wallet address and token ID

5. [ ] **Test Cross-Device (Optional)**
   - Connect same wallet on different device/browser
   - Favorite should sync (same wallet address = same favorites)

## 🐛 Troubleshooting

### If SIWE login fails:
- Check browser console for errors
- Verify `/api/auth/siwe` route is working
- Check that wallet signature is valid

### If favorites don't save:
- Check Supabase connection (verify env vars)
- Check browser console for API errors
- Verify session cookie exists after login

### If session expires:
- Sessions last 7 days by default
- User will need to reconnect wallet after expiration

## 📝 Next Steps After Testing

1. If everything works:
   - ✅ You're ready to deploy!
   - Consider adding `SESSION_SECRET` env var for production

2. If issues:
   - Check error messages in console/logs
   - Verify all env vars are set correctly
   - Make sure Supabase table was created successfully

