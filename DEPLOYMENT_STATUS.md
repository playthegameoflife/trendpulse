# Deployment Status & Next Steps

## ✅ Completed

1. **Stripe Environment Variables Set:**
   ```bash
   firebase functions:config:get
   ```
   - ✅ `stripe.secret_key` - Set
   - ✅ `stripe.pro_price_id` - Set (price_1SQGoYI1ZcW4NWjjHpMugecl)
   - ✅ `webapp.url` - Set to http://localhost:3000

2. **TypeScript Errors Fixed:**
   - ✅ Stripe API version updated to '2023-10-16'
   - ✅ Gemini service response handling fixed
   - ✅ Unused variable removed

3. **Functions Built Successfully:**
   ```bash
   cd functions && npm run build
   ```
   ✅ Build completed without errors

## ⚠️ Current Issue

Firebase CLI installation appears corrupted (missing template files). This prevents automatic deployment.

## 🔧 Solutions

### Option 1: Fix Firebase CLI (Recommended)

1. **Upgrade Node.js to version 20+** (Firebase CLI requires Node 20+):
   ```bash
   # Using nvm
   nvm install 20
   nvm use 20
   
   # Reinstall Firebase CLI
   npm install -g firebase-tools@latest
   ```

2. **Or use a local Firebase CLI installation**:
   ```bash
   npm install --save-dev firebase-tools
   npx firebase deploy --only functions
   ```

### Option 2: Deploy via Firebase Console

1. Go to https://console.firebase.google.com
2. Select your project: `odin-ai-926e3`
3. Go to **Functions**
4. Click **Deploy** or use the Firebase Console deployment UI

### Option 3: Use Firebase CLI Docker (Alternative)

If you have Docker installed:
```bash
docker run -it --rm -v "$(pwd):/workspace" -w /workspace node:20-alpine sh -c "npm install -g firebase-tools && firebase deploy --only functions"
```

## 📋 Manual Deployment Steps

Once Firebase CLI is working:

### 1. Deploy Functions
```bash
firebase deploy --only functions
```

After deployment, you'll see output like:
```
✔  functions[stripeWebhook(us-central1)]: Successful create operation.
Function URL: https://us-central1-odin-ai-926e3.cloudfunctions.net/stripeWebhook
```

### 2. Set Up Stripe Webhook

1. Go to https://dashboard.stripe.com → **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. Enter your webhook URL (from step 1 above):
   ```
   https://REGION-odin-ai-926e3.cloudfunctions.net/stripeWebhook
   ```
   Replace `REGION` with your actual region (e.g., `us-central1`)
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

### 3. Set Webhook Secret
```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET_HERE"
```

### 4. Redeploy Functions
```bash
firebase deploy --only functions
```

## ✅ Verification

After deployment, verify everything works:

1. **Test Checkout:**
   - Go to your app
   - Click "Upgrade to Pro"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete checkout

2. **Check Webhook Events:**
   - Go to Stripe Dashboard → **Developers** → **Webhooks**
   - Click on your webhook endpoint
   - View **Recent events** - should show successful events

3. **Check Firebase Functions Logs:**
   ```bash
   firebase functions:log
   ```

4. **Verify Subscription:**
   - Check Firebase Console → Firestore
   - Should see:
     - User document with `stripeCustomerId`
     - Subscription document
     - User `subscriptionTier` set to `pro`

## 📝 Current Configuration

**Project:** `odin-ai-926e3`

**Environment Variables Set:**
- `STRIPE_SECRET_KEY` - ✅ Set
- `STRIPE_PRO_PRICE_ID` - ✅ Set (price_1SQGoYI1ZcW4NWjjHpMugecl)
- `WEBAPP_URL` - ✅ Set (http://localhost:3000)

**Still Needed:**
- `STRIPE_WEBHOOK_SECRET` - ⏳ Will be set after webhook setup

## 🚀 Quick Commands

```bash
# Check current config
firebase functions:config:get

# View functions logs
firebase functions:log

# Deploy functions
firebase deploy --only functions

# Check setup status
node check-setup.js
```

## 📚 Documentation

- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Complete Stripe setup guide
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

