# Quick Start Guide

This guide will help you get TrendPulse AI up and running with Stripe integration.

## Prerequisites

- Node.js installed
- Firebase account
- Stripe account (for payments)

## Quick Setup Steps

### 1. Clone and Install

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Set Up Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Get your Firebase config from Project Settings → Your apps → Web app
5. Copy `env.template` to `.env.local`:
   ```bash
   cp env.template .env.local
   ```
6. Fill in your Firebase credentials in `.env.local`

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions.

### 3. Set Up Stripe (Automated)

Run the setup script:

```bash
./setup-stripe.sh
```

This interactive script will:
- Guide you through Stripe account setup
- Help create the product
- Set Firebase Functions environment variables
- Deploy functions
- Configure webhook

Or follow [STRIPE_SETUP.md](./STRIPE_SETUP.md) for manual setup.

### 4. Verify Setup

Run the verification script:

```bash
node check-setup.js
```

This will check if all required configurations are set.

### 5. Run Locally

```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Start dev server
npm run dev
```

### 6. Test Stripe Integration

1. Sign up/login in the app
2. Click "Upgrade to Pro" or "Start discovering"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify subscription is active

## Environment Variables Checklist

### Frontend (.env.local)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

### Firebase Functions
- [ ] `STRIPE_SECRET_KEY` (starts with `sk_`)
- [ ] `STRIPE_PRO_PRICE_ID` (starts with `price_`)
- [ ] `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
- [ ] `WEBAPP_URL`

Set these with:
```bash
firebase functions:config:set stripe.secret_key="YOUR_KEY"
firebase functions:config:set stripe.pro_price_id="YOUR_PRICE_ID"
firebase functions:config:set stripe.webhook_secret="YOUR_SECRET"
firebase functions:config:set webapp.url="YOUR_URL"
```

## Testing with Stripe

Use these test cards in Stripe Checkout:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

Use any:
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any ZIP code

## Troubleshooting

### Check Setup Status
```bash
node check-setup.js
```

### View Firebase Functions Logs
```bash
firebase functions:log
```

### Common Issues

**"Missing stripe-signature header"**
- Webhook not configured correctly
- Check webhook URL in Stripe Dashboard

**"Webhook signature verification failed"**
- Webhook secret doesn't match
- Regenerate webhook secret in Stripe and update in Firebase

**"Failed to create checkout session"**
- Stripe secret key is invalid
- Check API key in Stripe Dashboard
- Verify you're using correct mode (test vs live)

## Next Steps

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Detailed Firebase setup
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Detailed Stripe setup
- [README.md](./README.md) - Project overview

## Support

If you encounter issues:
1. Run `node check-setup.js` to verify configuration
2. Check Firebase Functions logs: `firebase functions:log`
3. Check Stripe Dashboard → Developers → Logs
4. Review the detailed setup guides

