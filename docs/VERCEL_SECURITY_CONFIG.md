# Vercel Pro Security Configuration Checklist

## 🔒 Essential Security Settings

### 1. **Environment Variables** (Settings → Environment Variables)
- [ ] Verify all `NEXT_PUBLIC_*` vars are set for Production, Preview, and Development
- [ ] Remove any unused or old environment variables
- [ ] Enable "Protect" for sensitive values (if applicable)
- [ ] Required vars:
  - `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
  - `NEXT_PUBLIC_NFT_COLLECTION_ADDRESS`
  - `NEXT_PUBLIC_MARKETPLACE_ADDRESS`
  - `NEXT_PUBLIC_CREATOR_ADDRESS`

### 2. **Bot Protection** (Settings → Security)
- [x] Enable Bot Protection
- [ ] Test wallet connections after enabling
- [ ] Monitor for false positives (legitimate users blocked)
- [ ] Adjust sensitivity if needed (Vercel Pro allows fine-tuning)

### 3. **DDoS Protection** (Automatic, but verify)
- [ ] Verify DDoS Protection is active (usually automatic on Pro)
- [ ] Check rate limiting settings in `vercel.json` if needed
- [ ] Monitor for abuse patterns in Vercel Analytics

### 4. **Access Control / Team Permissions**
- [ ] Review team member permissions (Settings → Team)
- [ ] Limit production deployment access to admins only
- [ ] Enable 2FA for all team members (if applicable)
- [ ] Review audit logs periodically (Vercel Pro includes this)

### 5. **Deployment Protection**
- [ ] Enable "Production Protection" (requires approval for production deploys)
- [ ] Set up deployment hooks/webhooks for notifications
- [ ] Enable "Vercel for Git" protection (prevent force pushes to main)

### 6. **Rate Limiting** (via `vercel.json` or Edge Config)
Add to `vercel.json` if you have API routes that need protection:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]  // US East for lower latency
}
```

### 7. **Domain & SSL Settings**
- [ ] Verify SSL/TLS certificates are active (automatic)
- [ ] Enable "Force HTTPS" redirects (should be automatic)
- [ ] Verify domain DNS settings are correct
- [ ] Enable HSTS (already configured in `next.config.mjs`)

### 8. **Preview Deployments Security**
- [ ] Enable "Vercel Authentication" for preview deployments (optional)
- [ ] Set preview deployment retention (Settings → Git)
- [ ] Configure preview deployment notifications

### 9. **Analytics & Monitoring**
- [x] Speed Insights enabled (already added)
- [x] Analytics enabled (already enabled)
- [ ] Set up alerts for unusual traffic patterns
- [ ] Monitor error rates in Vercel dashboard

### 10. **Webhook Security** (if using)
- [ ] Verify webhook secret tokens are set (if applicable)
- [ ] Use HTTPS-only webhooks
- [ ] Validate webhook signatures server-side

### 11. **IP Filtering / Firewall** (Vercel Pro feature)
- [ ] Consider IP allowlisting for admin areas (if needed)
- [ ] Block known malicious IPs via Vercel firewall (if available)

### 12. **Content Security Policy** (Already configured in code)
- [x] CSP headers set in `next.config.mjs` ✅
- [ ] Monitor CSP violations in browser console after deployment
- [ ] Adjust CSP as needed based on violations

### 13. **Function Timeout & Memory**
Current in `vercel.json`:
- API routes: 30s max duration ✅
- Verify this is sufficient for your use case

### 14. **Backup & Recovery**
- [ ] Enable automatic backups (if available on Pro)
- [ ] Document rollback procedure
- [ ] Keep environment variable backups (secure location)

### 15. **Monitoring & Alerts**
- [ ] Set up alerts for:
  - High error rates
  - Unusual traffic spikes
  - Failed deployments
  - SSL certificate expiration
- [ ] Configure notification channels (email/Slack)

---

## 🚨 Critical Security Items (Do First)

1. **Environment Variables** - Verify all are set correctly
2. **Bot Protection** - Enable and test
3. **Access Control** - Review team permissions
4. **Deployment Protection** - Enable production protection
5. **Rate Limiting** - Verify API routes have proper limits

---

## 📋 Recommended Vercel Pro Features for NFT Marketplace

### Must-Have:
- ✅ Bot Protection (protects against purchase bots)
- ✅ DDoS Protection (automatic)
- ✅ Analytics & Speed Insights (performance monitoring)
- ✅ Production Protection (prevent accidental bad deploys)

### Nice-to-Have:
- Preview Deployment Authentication (if sharing previews)
- Advanced IP Filtering (if you need to block specific regions/IPs)
- Enhanced monitoring/alerting (better visibility)

---

## 🔍 How to Verify Security Settings

1. **Check Environment Variables:**
   - Settings → Environment Variables
   - Verify all required vars exist for Production

2. **Test Bot Protection:**
   - Enable it
   - Test wallet connections (MetaMask, WalletConnect)
   - Test purchase flow
   - Monitor for false positives

3. **Verify Headers:**
   - Deploy to production
   - Use `curl -I https://your-domain.com` or browser DevTools
   - Check that security headers are present (CSP, HSTS, etc.)

4. **Monitor Analytics:**
   - Check Vercel Analytics for unusual patterns
   - Review error rates
   - Monitor performance metrics

---

## ⚠️ Things to Watch Out For

1. **False Positives from Bot Protection:**
   - Some wallet extensions might be flagged
   - Test thoroughly after enabling
   - Adjust sensitivity if needed

2. **Rate Limiting:**
   - Don't make limits too strict (could block legitimate users)
   - Monitor for abuse patterns

3. **Environment Variables:**
   - Don't expose secrets in client-side code
   - Use `NEXT_PUBLIC_*` only for public values
   - Keep sensitive vars server-side only

---

## 📚 Additional Resources

- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [Vercel Pro Features](https://vercel.com/docs/pro)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

