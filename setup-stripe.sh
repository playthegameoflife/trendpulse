#!/bin/bash

# Stripe Setup Helper Script
# This script helps you set up Stripe integration step by step

set -e

echo "=========================================="
echo "  Stripe Integration Setup Helper"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Stripe Account Setup${NC}"
echo "1. Go to https://stripe.com and sign up or log in"
echo "2. Make sure you're in TEST MODE (toggle in top right)"
echo "3. Navigate to Developers → API keys"
echo ""
read -p "Press Enter when you have your Stripe Secret Key (starts with sk_test_)..."

echo ""
echo -e "${BLUE}Step 2: Get Your Stripe Secret Key${NC}"
read -p "Enter your Stripe Secret Key: " STRIPE_SECRET_KEY

if [[ ! $STRIPE_SECRET_KEY =~ ^sk_(test|live)_ ]]; then
    echo -e "${RED}Error: Invalid Stripe Secret Key format. It should start with sk_test_ or sk_live_${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Create Product in Stripe${NC}"
echo "1. Go to Stripe Dashboard → Products"
echo "2. Click '+ Add product'"
echo "3. Fill in:"
echo "   - Name: Pro Plan"
echo "   - Description: Unlimited trend discoveries"
echo "   - Pricing: Recurring"
echo "   - Price: \$19.00 USD"
echo "   - Billing: Monthly"
echo "4. Click 'Save product'"
echo "5. Copy the Price ID (starts with price_)"
echo ""
read -p "Press Enter when you have your Price ID..."

read -p "Enter your Stripe Price ID: " STRIPE_PRICE_ID

if [[ ! $STRIPE_PRICE_ID =~ ^price_ ]]; then
    echo -e "${RED}Error: Invalid Price ID format. It should start with price_${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 4: Get Your App URL${NC}"
read -p "Enter your app URL (e.g., https://your-app.web.app or http://localhost:3000 for dev): " WEBAPP_URL

if [[ ! $WEBAPP_URL =~ ^https?:// ]]; then
    echo -e "${YELLOW}Warning: URL should start with http:// or https://${NC}"
fi

echo ""
echo -e "${BLUE}Step 5: Set Firebase Functions Environment Variables${NC}"
echo "Setting environment variables..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI is not installed. Install it with: npm install -g firebase-tools${NC}"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}You need to log in to Firebase first.${NC}"
    firebase login
fi

echo ""
echo "Setting environment variables..."
echo "Note: For newer Firebase projects, you may need to use secrets instead:"
echo "  firebase functions:secrets:set STRIPE_SECRET_KEY"
echo ""

# Try to set config (for older projects)
firebase functions:config:set stripe.secret_key="$STRIPE_SECRET_KEY" stripe.pro_price_id="$STRIPE_PRICE_ID" webapp.url="$WEBAPP_URL" 2>/dev/null || {
    echo -e "${YELLOW}Note: Using functions:config:set failed. You may need to use secrets instead.${NC}"
    echo "Run these commands manually:"
    echo "  firebase functions:secrets:set STRIPE_SECRET_KEY"
    echo "  firebase functions:secrets:set STRIPE_PRO_PRICE_ID"
    echo "  firebase functions:secrets:set WEBAPP_URL"
}

echo ""
echo -e "${BLUE}Step 6: Deploy Functions${NC}"
echo "Building and deploying functions..."
cd functions
npm install
npm run build
cd ..

echo ""
read -p "Deploy functions now? (y/n): " DEPLOY_NOW

if [[ $DEPLOY_NOW == "y" || $DEPLOY_NOW == "Y" ]]; then
    firebase deploy --only functions
    echo ""
    echo -e "${GREEN}Functions deployed!${NC}"
    echo ""
    echo "Copy your webhook URL from the deployment output above."
    echo "It should look like: https://REGION-PROJECT.cloudfunctions.net/stripeWebhook"
else
    echo "You can deploy later with: firebase deploy --only functions"
fi

echo ""
echo -e "${BLUE}Step 7: Set Up Webhook${NC}"
if [[ $DEPLOY_NOW == "y" || $DEPLOY_NOW == "Y" ]]; then
    read -p "Enter your webhook URL (from deployment above): " WEBHOOK_URL
    echo ""
    echo "1. Go to Stripe Dashboard → Developers → Webhooks"
    echo "2. Click '+ Add endpoint'"
    echo "3. Enter URL: $WEBHOOK_URL"
    echo "4. Select these events:"
    echo "   - checkout.session.completed"
    echo "   - customer.subscription.created"
    echo "   - customer.subscription.updated"
    echo "   - customer.subscription.deleted"
    echo "5. Click 'Add endpoint'"
    echo "6. Copy the Signing secret (starts with whsec_)"
    echo ""
    read -p "Press Enter when you have the webhook secret..."
    
    read -p "Enter your webhook signing secret: " WEBHOOK_SECRET
    
    if [[ ! $WEBHOOK_SECRET =~ ^whsec_ ]]; then
        echo -e "${RED}Error: Invalid webhook secret format. It should start with whsec_${NC}"
        exit 1
    fi
    
    echo "Setting webhook secret..."
    firebase functions:config:set stripe.webhook_secret="$WEBHOOK_SECRET" 2>/dev/null || {
        echo "Set it manually with: firebase functions:secrets:set STRIPE_WEBHOOK_SECRET"
    }
    
    echo ""
    echo -e "${YELLOW}Important: Redeploy functions after setting webhook secret!${NC}"
    read -p "Redeploy functions now? (y/n): " REDEPLOY
    
    if [[ $REDEPLOY == "y" || $REDEPLOY == "Y" ]]; then
        firebase deploy --only functions
    fi
else
    echo "After deploying functions, set up the webhook:"
    echo "1. Get your webhook URL from deployment output"
    echo "2. Add it in Stripe Dashboard → Developers → Webhooks"
    echo "3. Copy the webhook signing secret"
    echo "4. Set it with: firebase functions:config:set stripe.webhook_secret=\"YOUR_SECRET\""
    echo "5. Redeploy functions: firebase deploy --only functions"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Summary of environment variables set:"
echo "  - STRIPE_SECRET_KEY: $STRIPE_SECRET_KEY"
echo "  - STRIPE_PRO_PRICE_ID: $STRIPE_PRICE_ID"
echo "  - WEBAPP_URL: $WEBAPP_URL"
if [[ -n $WEBHOOK_SECRET ]]; then
    echo "  - STRIPE_WEBHOOK_SECRET: $WEBHOOK_SECRET"
fi
echo ""
echo "Next steps:"
echo "1. Test the integration with Stripe test card: 4242 4242 4242 4242"
echo "2. Check webhook events in Stripe Dashboard"
echo "3. Monitor Firebase Functions logs: firebase functions:log"
echo ""
echo "For detailed instructions, see STRIPE_SETUP.md"

