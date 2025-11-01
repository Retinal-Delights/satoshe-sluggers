# Backend Solution for Cross-Device Favorites Sync

## 🏗️ Architecture Overview

### **Option 1: Vercel Postgres (Recommended - YOU'RE ALREADY ON VERCEL!)**
- **Database**: PostgreSQL via Vercel
- **Why**: 
  - ✅ **Native Vercel integration** - no separate service to manage
  - ✅ **Same dashboard/billing** - everything in one place
  - ✅ **Better performance** - optimized for Vercel serverless functions
  - ✅ **Zero additional accounts** - use existing Vercel account
  - ✅ **Automatic connection pooling** - built-in
  - ✅ **Edge network optimized** - faster responses
  - ✅ **Easy env var management** - same system you're using now
- **Setup Time**: ~10 minutes
- **Free Tier**: 256 MB storage, 60 hours compute/month (Hobby plan)

### **Option 2: Supabase**
- **Database**: PostgreSQL via Supabase
- **Why**: Free tier with more storage, built-in auth (if needed later)
- **Downside**: Separate service/account to manage
- **Setup Time**: ~15 minutes

### **Option 3: MongoDB Atlas**
- **Database**: NoSQL MongoDB
- **Why**: Flexible schema, free tier
- **Downside**: Different database type, separate service
- **Setup Time**: ~20 minutes

---

## 📊 Database Schema

### Table: `favorites`

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) NOT NULL, -- Ethereum address (0x...)
  token_id VARCHAR(50) NOT NULL,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  rarity TEXT NOT NULL,
  rank TEXT NOT NULL,
  rarity_percent TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one wallet can only favorite a token once
  UNIQUE(wallet_address, token_id),
  
  -- Index for fast lookups by wallet
  INDEX idx_wallet_address (wallet_address)
);
```

---

## 🔐 Security Approach

Since users connect with wallets, we'll use **wallet signature verification**:

1. **Client-side**: User signs a message with their wallet (e.g., "Favorites API - 2025-01-XX")
2. **API verifies**: Backend verifies the signature matches the wallet address
3. **Access granted**: Only the wallet owner can read/write their favorites

### Why This Works:
- ✅ No passwords needed
- ✅ Uses existing wallet connection
- ✅ Cryptographically secure
- ✅ Users can't access other users' favorites

---

## 📁 File Structure

```
app/api/favorites/
├── route.ts              # GET (list), POST (add)
└── [tokenId]/route.ts    # DELETE (remove)

lib/
├── db.ts                 # Vercel Postgres database client
├── wallet-auth.ts        # Wallet signature verification utilities
└── favorites-client.ts   # Client-side API calls

hooks/
└── useFavorites.ts       # Updated to use API instead of localStorage
```

---

## 🔌 API Endpoints

### `GET /api/favorites?walletAddress=0x...&signature=...&message=...`
**Purpose**: Get all favorites for a wallet

**Response**:
```json
{
  "success": true,
  "favorites": [
    {
      "tokenId": "123",
      "name": "Satoshe Slugger #124",
      "image": "ipfs://...",
      "rarity": "Legendary",
      "rank": "45",
      "rarityPercent": "0.58",
      "addedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### `POST /api/favorites`
**Purpose**: Add a favorite

**Request Body**:
```json
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Favorites API - 2025-01-15T10:30:00Z",
  "tokenId": "123",
  "name": "Satoshe Slugger #124",
  "image": "ipfs://...",
  "rarity": "Legendary",
  "rank": "45",
  "rarityPercent": "0.58"
}
```

### `DELETE /api/favorites/[tokenId]?walletAddress=0x...&signature=...&message=...`
**Purpose**: Remove a favorite

---

## 🛠️ Implementation Steps

### Step 1: Set up Vercel Postgres
1. Go to Vercel Dashboard → Your Project → Storage tab
2. Click "Create Database" → Select "Postgres"
3. Choose plan (Hobby free tier is fine for MVP)
4. Select region (choose closest to your users)
5. Vercel automatically creates env vars:
   - `POSTGRES_URL` (connection string)
   - `POSTGRES_PRISMA_URL` (Prisma-compatible)
   - `POSTGRES_URL_NON_POOLING` (direct connection)
6. Run SQL migration via Vercel dashboard or connect locally

### Step 2: Install Dependencies
```bash
pnpm add @vercel/postgres ethers
pnpm add -D @types/node
```

### Step 3: Create Database Client
- `lib/db.ts` - Database connection using `@vercel/postgres`

### Step 4: Create Wallet Auth Utilities
- `lib/wallet-auth.ts` - Verify wallet signatures

### Step 5: Create API Routes
- `app/api/favorites/route.ts` - GET and POST
- `app/api/favorites/[tokenId]/route.ts` - DELETE

### Step 6: Update `useFavorites` Hook
- Replace localStorage with API calls
- Add signature generation
- Handle loading/error states

### Step 7: Update Components
- No changes needed! Hook interface stays the same

---

## 🔄 Migration Strategy

**Gradual Migration**:
1. Deploy API with both localStorage fallback
2. Users gradually sync to backend
3. Eventually remove localStorage support

**Or Full Migration**:
1. Deploy API
2. Update hook to use API only
3. Users lose old favorites (acceptable for MVP)

---

## 💰 Cost Estimate

**Vercel Postgres (Hobby Plan - Free)**:
- ✅ 256 MB database storage
- ✅ 60 hours compute/month
- ✅ Automatic backups
- ✅ Connection pooling included
- ✅ Perfect for MVP (can handle thousands of favorites)

**After Scaling** (if needed):
- Pro: $20/month for 10 GB storage, 1000 hours compute
- Enterprise: Custom pricing

**Note**: Vercel Postgres integrates with your existing Vercel plan, so no separate billing!

---

## ⚡ Performance Considerations

1. **Caching**: Cache favorites in React state (already done)
2. **Batch Operations**: Add batch favorite/unfavorite if needed
3. **Rate Limiting**: Add Vercel rate limiting (100 req/min per IP)
4. **Indexes**: Database indexes on `wallet_address` for fast lookups

---

## 🧪 Testing Strategy

1. **Unit Tests**: Wallet signature verification
2. **Integration Tests**: API endpoints
3. **E2E Tests**: Full favorite flow on different devices

---

## 📝 Next Steps

Would you like me to:
1. ✅ **Implement the full solution** (recommended)
2. 📋 **Create a detailed implementation plan first**
3. 🔍 **Set up Vercel Postgres project structure only**

**Recommended**: Start with Vercel Postgres setup + basic API routes, then migrate the hook.

