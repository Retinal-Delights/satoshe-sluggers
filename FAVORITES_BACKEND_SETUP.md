# Favorites Backend Setup - Next Steps

**Status**: ✅ Code is complete and ready to use!

---

## ✅ What's Been Done

1. **Database Client**: `lib/supabase-server.ts` - Connects to Supabase
2. **Wallet Authentication**: `lib/wallet-auth.ts` - Verifies wallet signatures
3. **API Client**: `lib/favorites-api.ts` - Client-side API calls
4. **API Routes**:
   - `app/api/favorites/route.ts` - GET (list) and POST (add)
   - `app/api/favorites/[tokenId]/route.ts` - DELETE (remove)
5. **Updated Hook**: `hooks/useFavorites.ts` - Now uses API instead of localStorage
6. **SQL Migration**: `database/create-favorites-table.sql` - Table schema

---

## 🔧 What You Need To Do

### Step 1: Create the Database Table

1. Go to **Supabase Dashboard** → Your Project
2. Click **"SQL Editor"** in the sidebar
3. Copy and paste the contents of `database/create-favorites-table.sql`
4. Click **"Run"** to execute the SQL

This will create the `favorites` table with all necessary columns and indexes.

---

## ✅ Environment Variables (Already Set!)

Your Supabase database has already added these to Vercel:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (for API routes)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (if needed for client)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if needed for client)

**Note**: The API routes use `SUPABASE_SERVICE_ROLE_KEY` - this is correct and secure (only runs on server).

---

## 🧪 Testing

After creating the table, test:

1. **Connect wallet** on desktop
2. **Favorite an NFT** - You'll be asked to sign a message (first time only)
3. **Check console** - Should see favorites loading from API
4. **Disconnect wallet**
5. **Connect same wallet on different device** - Favorites should sync!

---

## 🔄 How It Works

1. **User favorites an NFT** → Wallet signature required
2. **Signature verified** → Backend confirms wallet ownership
3. **Saved to Supabase** → Cross-device sync!
4. **Optimistic updates** → UI updates immediately, syncs in background
5. **localStorage fallback** → If API fails, uses local storage

---

## 🐛 Troubleshooting

**"User rejected signature request"**:
- Normal - user cancelled the wallet popup
- Just try again

**"Failed to fetch favorites"**:
- Check Supabase dashboard - is table created?
- Check Vercel env vars - are they set?
- Check browser console for detailed errors

**Favorites not syncing**:
- Ensure you're signing the message (wallet popup should appear)
- Check network tab - API calls should succeed
- Verify Supabase table has data (SQL Editor → Browse table)

---

## 📝 Next Steps After Testing

Once verified working:
1. ✅ Commit and push to GitHub
2. ✅ Deploy to Vercel
3. ✅ Test on production
4. ✅ Monitor for any errors

**Note**: Users will need to sign a message the first time they favorite something. This is a one-time auth per session.

