<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TrendPulse AI - Trend Discovery Platform

AI-powered trend discovery platform with subscription management via Stripe.

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for a step-by-step setup guide.

## Setup Scripts

### Automated Stripe Setup
```bash
./setup-stripe.sh
```

### Verify Configuration
```bash
node check-setup.js
```

## Run Locally

**Prerequisites:** Node.js, Firebase account, Stripe account

1. Install dependencies:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. Set up Firebase:
   - Copy `env.template` to `.env.local`
   - Fill in your Firebase config
   - See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

3. Set up Stripe:
   - Run `./setup-stripe.sh` or see [STRIPE_SETUP.md](./STRIPE_SETUP.md)

4. Run the app:
   ```bash
   # Terminal 1: Firebase emulators
   firebase emulators:start
   
   # Terminal 2: Dev server
   npm run dev
   ```

## Documentation

- [QUICK_START.md](./QUICK_START.md) - Quick setup guide
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Stripe integration setup

## Features

- AI-powered trend discovery
- User authentication
- Subscription management (Free/Pro)
- Stripe payment integration
- Business context personalization (Pro)

## Tech Stack

- React + TypeScript
- Firebase (Auth, Firestore, Functions)
- Stripe (Payments)
- Google Gemini AI
- Vite
