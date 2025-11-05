# Firebase Setup Guide

This guide will help you set up Firebase for TrendPulse AI SaaS.

## Prerequisites

1. A Firebase account (https://firebase.google.com)
2. A Stripe account (https://stripe.com) for payment processing
3. Node.js installed

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: "TrendPulse AI" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** authentication
4. Click "Save"

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode** (we'll add security rules)
4. Choose a location for your database
5. Click "Enable"

## Step 4: Deploy Firestore Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize Firebase: `firebase init`
   - Select Firestore
   - Select the existing project
   - Use `firestore.rules` as the rules file
4. Deploy rules: `firebase deploy --only firestore:rules`

## Step 5: Set Up Firebase Functions

1. Initialize Functions: `firebase init functions`
   - Select TypeScript
   - Use ESLint (optional)
   - Install dependencies: Yes

2. Set environment variables:
   ```bash
   firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
   firebase functions:config:set stripe.secret_key="YOUR_STRIPE_SECRET_KEY"
   firebase functions:config:set stripe.webhook_secret="YOUR_STRIPE_WEBHOOK_SECRET"
   firebase functions:config:set stripe.pro_price_id="YOUR_STRIPE_PRO_PRICE_ID"
   firebase functions:config:set webapp.url="YOUR_WEBAPP_URL"
   ```

3. Build and deploy functions:
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase deploy --only functions
   ```

## Step 6: Configure Frontend

1. In Firebase Console, go to **Project Settings**
2. Under "Your apps", click the web icon (</>)
3. Register your app with a nickname
4. Copy the Firebase config

5. Create `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

## Step 7: Set Up Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from Stripe Dashboard
3. Create a product for Pro tier ($19/month subscription)
4. Copy the Price ID
5. Set up webhook endpoint in Stripe Dashboard:
   - URL: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook`
   - Events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
6. Copy the webhook signing secret

## Step 8: Deploy

1. Build frontend: `npm run build`
2. Deploy to Firebase Hosting: `firebase deploy --only hosting`

## Environment Variables Summary

### Frontend (.env.local)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Firebase Functions
- `GEMINI_API_KEY` - Your Google Gemini API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_PRO_PRICE_ID` - Stripe Price ID for Pro tier
- `WEBAPP_URL` - Your app URL (e.g., https://your-app.web.app)

## Testing Locally

1. Install dependencies:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. Start Firebase emulators:
   ```bash
   firebase emulators:start
   ```

3. In another terminal, start frontend:
   ```bash
   npm run dev
   ```

## Troubleshooting

- **Authentication errors**: Make sure Email/Password auth is enabled in Firebase Console
- **Firestore permission errors**: Check that security rules are deployed correctly
- **Function errors**: Check Firebase Functions logs in Firebase Console
- **Stripe webhook errors**: Verify webhook URL and signing secret are correct

## Next Steps

1. Set up custom domain (optional)
2. Configure email templates in Firebase Authentication
3. Set up monitoring and analytics
4. Configure error tracking (Sentry, etc.)

