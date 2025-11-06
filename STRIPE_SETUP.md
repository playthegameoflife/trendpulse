# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe for TrendPulse AI SaaS subscription payments.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Firebase project with Functions enabled
3. Node.js installed
4. Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Create Stripe Account & Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in to your account
3. Make sure you're in **Test Mode** (toggle in top right)
4. Navigate to **Developers** → **API keys**
5. Copy your **Publishable key** (starts with `pk_test_`) and **Secret key** (starts with `sk_test_`)
   - Keep these secure! Never commit them to version control

## Step 2: Create Product & Price in Stripe

1. In Stripe Dashboard, go to **Products**
2. Click **+ Add product**
3. Fill in the product details:
   - **Name**: Pro Plan
   - **Description**: Unlimited trend discoveries and personalized insights
   - **Pricing model**: Recurring
   - **Price**: $19.00 USD
   - **Billing period**: Monthly
4. Click **Save product**
5. After creating, you'll see a **Price ID** (starts with `price_`)
   - Copy this Price ID - you'll need it for environment variables

## Step 3: Configure Firebase Functions Environment Variables

Set the following environment variables for your Firebase Functions:

### Using Firebase CLI:

```bash
firebase functions:config:set stripe.secret_key="YOUR_STRIPE_SECRET_KEY"
firebase functions:config:set stripe.pro_price_id="YOUR_STRIPE_PRICE_ID"
firebase functions:config:set webapp.url="YOUR_APP_URL"
```

**Note**: For newer Firebase projects, you may need to use `firebase functions:secrets:set` instead:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_PRO_PRICE_ID
firebase functions:secrets:set WEBAPP_URL
```

### Using Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Functions** → **Configuration**
4. Click **Edit**
5. Add the following secrets:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
   - `STRIPE_PRO_PRICE_ID` - Your Stripe Price ID (starts with `price_`)
   - `WEBAPP_URL` - Your app URL (e.g., `https://your-app.web.app`)

## Step 4: Deploy Firebase Functions

1. Build and deploy your functions:
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase deploy --only functions
   ```

2. After deployment, note your function URLs. You'll see something like:
   ```
   ✔  functions[stripeWebhook(us-central1)]: Successful create operation.
   Function URL: https://us-central1-YOUR-PROJECT.cloudfunctions.net/stripeWebhook
   ```

## Step 5: Set Up Stripe Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Enter your webhook URL:
   ```
   https://REGION-YOUR-PROJECT.cloudfunctions.net/stripeWebhook
   ```
   Replace `REGION` and `YOUR-PROJECT` with your actual values
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. After creating, click on the endpoint to view details
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add it to Firebase Functions environment variables:
   ```bash
   firebase functions:config:set stripe.webhook_secret="YOUR_WEBHOOK_SECRET"
   ```
   Or if using secrets:
   ```bash
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   ```
9. **Important**: Redeploy functions after adding the webhook secret:
   ```bash
   firebase deploy --only functions
   ```

## Step 6: Update Functions Code (If Using Secrets)

If you're using Firebase Functions secrets (newer projects), update `functions/src/index.ts` and `functions/src/stripeWebhook.ts` to use `functions.config()` or access secrets directly.

For functions v2+, you may need to update the code to use:
```typescript
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const priceId = process.env.STRIPE_PRO_PRICE_ID;
const webappUrl = process.env.WEBAPP_URL;
```

## Step 7: Test the Integration

### Test Checkout Flow:

1. Start your app in development mode
2. Click "Upgrade to Pro" or "Start discovering"
3. You'll be redirected to Stripe Checkout
4. Use Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC
   - Any ZIP code
5. Complete the checkout
6. You should be redirected back with a success message
7. Check Firebase Console → Firestore to see:
   - User document updated with `stripeCustomerId`
   - Subscription document created
   - User `subscriptionTier` set to `pro`

### Test Webhook Events:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Recent events** to see if events are being received
4. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

## Environment Variables Summary

### Firebase Functions (Required):

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro plan | `price_...` |
| `WEBAPP_URL` | Your app URL | `https://your-app.web.app` |

## Testing with Stripe Test Cards

Stripe provides test card numbers for testing different scenarios:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0025 0000 3155` | Requires authentication |

**Use any:**
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any ZIP code

## Production Checklist

Before going live:

- [ ] Switch Stripe to **Live Mode**
- [ ] Update environment variables with live keys:
  - `STRIPE_SECRET_KEY` (starts with `sk_live_`)
  - Get new webhook secret for live mode
  - Update `STRIPE_PRO_PRICE_ID` with live price ID
- [ ] Create live webhook endpoint
- [ ] Test complete flow with real payment method (use small amount)
- [ ] Verify webhook events are received
- [ ] Check subscription management works correctly

## Troubleshooting

### Checkout Not Working

- **Check**: Environment variables are set correctly
- **Check**: Functions are deployed
- **Check**: Stripe Price ID is correct
- **Check**: Firebase Functions logs for errors

### Webhook Not Receiving Events

- **Check**: Webhook URL is correct in Stripe Dashboard
- **Check**: Webhook secret is set in environment variables
- **Check**: Functions are deployed
- **Check**: Webhook endpoint has correct events selected
- **Check**: Firebase Functions logs

### Subscription Not Updating

- **Check**: Webhook events are being received
- **Check**: Webhook handler code is correct
- **Check**: Firestore rules allow writes
- **Check**: User document exists in Firestore

### Common Errors

**"Missing stripe-signature header"**
- Webhook is not configured correctly
- Check webhook URL in Stripe Dashboard

**"Webhook signature verification failed"**
- Webhook secret doesn't match
- Regenerate webhook secret in Stripe and update in Firebase

**"Missing STRIPE_PRO_PRICE_ID"**
- Environment variable not set
- Set it in Firebase Functions configuration

**"Failed to create checkout session"**
- Stripe secret key is invalid
- Check API key in Stripe Dashboard
- Verify you're using correct mode (test vs live)

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env)

## Support

If you encounter issues:
1. Check Firebase Functions logs: `firebase functions:log`
2. Check Stripe Dashboard → Developers → Logs
3. Verify all environment variables are set
4. Test with Stripe test cards first
5. Check webhook endpoint is receiving events

