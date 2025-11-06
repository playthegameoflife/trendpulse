#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all required environment variables and configurations are set
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function check(condition, message, fix = '') {
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${message}`);
    return true;
  } else {
    console.log(`${RED}✗${RESET} ${message}`);
    if (fix) {
      console.log(`  ${YELLOW}→${RESET} ${fix}`);
    }
    return false;
  }
}

console.log(`${BLUE}========================================${RESET}`);
console.log(`${BLUE}  Setup Verification${RESET}`);
console.log(`${BLUE}========================================${RESET}\n`);

let allGood = true;

// Check .env.local file
console.log(`${BLUE}Frontend Configuration:${RESET}`);
const envLocalPath = join(__dirname, '.env.local');
const envExists = existsSync(envLocalPath);

if (envExists) {
  const envContent = readFileSync(envLocalPath, 'utf-8');
  
  allGood = check(
    envContent.includes('VITE_FIREBASE_API_KEY=') && !envContent.includes('VITE_FIREBASE_API_KEY=your-'),
    '.env.local file exists',
    'Create .env.local from .env.example'
  ) && allGood;
  
  allGood = check(
    envContent.includes('VITE_FIREBASE_PROJECT_ID=') && !envContent.includes('VITE_FIREBASE_PROJECT_ID=your-'),
    'Firebase Project ID is set',
    'Set VITE_FIREBASE_PROJECT_ID in .env.local'
  ) && allGood;
  
  allGood = check(
    envContent.includes('VITE_FIREBASE_AUTH_DOMAIN=') && !envContent.includes('VITE_FIREBASE_AUTH_DOMAIN=your-'),
    'Firebase Auth Domain is set',
    'Set VITE_FIREBASE_AUTH_DOMAIN in .env.local'
  ) && allGood;
} else {
  console.log(`${RED}✗${RESET} .env.local file not found`);
  console.log(`  ${YELLOW}→${RESET} Copy .env.example to .env.local and fill in your Firebase config`);
  allGood = false;
}

console.log('');

// Check Firebase Functions dependencies
console.log(`${BLUE}Firebase Functions:${RESET}`);
const functionsPackageJson = join(__dirname, 'functions', 'package.json');
if (existsSync(functionsPackageJson)) {
  try {
    const pkg = JSON.parse(readFileSync(functionsPackageJson, 'utf-8'));
    allGood = check(
      pkg.dependencies && pkg.dependencies.stripe,
      'Stripe package is installed',
      'Run: cd functions && npm install'
    ) && allGood;
    
    allGood = check(
      pkg.dependencies && pkg.dependencies['firebase-functions'],
      'Firebase Functions package is installed',
      'Run: cd functions && npm install'
    ) && allGood;
  } catch (e) {
    console.log(`${RED}✗${RESET} Could not read functions/package.json`);
    allGood = false;
  }
} else {
  console.log(`${RED}✗${RESET} functions/package.json not found`);
  allGood = false;
}

console.log('');

// Check if Firebase CLI is available
console.log(`${BLUE}Tools:${RESET}`);
try {
  const { execSync } = await import('child_process');
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    check(true, 'Firebase CLI is installed', 'Install with: npm install -g firebase-tools');
  } catch (e) {
    allGood = check(false, 'Firebase CLI is installed', 'Install with: npm install -g firebase-tools') && allGood;
  }
} catch (e) {
  // Can't check
}

console.log('');

// Environment variables summary
console.log(`${BLUE}Required Environment Variables (Firebase Functions):${RESET}`);
console.log(`  ${YELLOW}STRIPE_SECRET_KEY${RESET} - Stripe secret key (starts with sk_)`);
console.log(`  ${YELLOW}STRIPE_PRO_PRICE_ID${RESET} - Stripe Price ID (starts with price_)`);
console.log(`  ${YELLOW}STRIPE_WEBHOOK_SECRET${RESET} - Webhook signing secret (starts with whsec_)`);
console.log(`  ${YELLOW}WEBAPP_URL${RESET} - Your app URL`);
console.log('');
console.log(`Set these with:`);
console.log(`  firebase functions:config:set stripe.secret_key="YOUR_KEY"`);
console.log(`  firebase functions:config:set stripe.pro_price_id="YOUR_PRICE_ID"`);
console.log(`  firebase functions:config:set stripe.webhook_secret="YOUR_SECRET"`);
console.log(`  firebase functions:config:set webapp.url="YOUR_URL"`);
console.log('');
console.log(`Or for newer projects:`);
console.log(`  firebase functions:secrets:set STRIPE_SECRET_KEY`);
console.log(`  firebase functions:secrets:set STRIPE_PRO_PRICE_ID`);
console.log(`  firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`);
console.log(`  firebase functions:secrets:set WEBAPP_URL`);

console.log('');

if (allGood) {
  console.log(`${GREEN}========================================${RESET}`);
  console.log(`${GREEN}  All checks passed!${RESET}`);
  console.log(`${GREEN}========================================${RESET}`);
} else {
  console.log(`${YELLOW}========================================${RESET}`);
  console.log(`${YELLOW}  Some checks failed${RESET}`);
  console.log(`${YELLOW}  See fixes above${RESET}`);
  console.log(`${YELLOW}========================================${RESET}`);
  console.log('');
  console.log(`For detailed setup instructions:`);
  console.log(`  - Frontend: See FIREBASE_SETUP.md`);
  console.log(`  - Stripe: See STRIPE_SETUP.md`);
  console.log(`  - Or run: ./setup-stripe.sh`);
}

