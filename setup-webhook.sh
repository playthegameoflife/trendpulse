#!/bin/bash

# Stripe Webhook Setup Script
# This script creates the webhook endpoint in Stripe

set -e

WEBHOOK_URL="https://us-central1-odin-ai-926e3.cloudfunctions.net/stripeWebhook"

# Get Stripe secret key from user
if [ -z "$STRIPE_SECRET_KEY" ]; then
  read -p "Enter your Stripe Secret Key (starts with sk_): " STRIPE_SECRET_KEY
fi

if [[ ! $STRIPE_SECRET_KEY =~ ^sk_(test|live)_ ]]; then
  echo "Error: Invalid Stripe Secret Key format. It should start with sk_test_ or sk_live_"
  exit 1
fi

echo "=========================================="
echo "  Setting up Stripe Webhook"
echo "=========================================="
echo ""

echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Create webhook endpoint using Stripe API
echo "Creating webhook endpoint in Stripe..."

RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/webhook_endpoints \
  -u "$STRIPE_SECRET_KEY:" \
  -d "url=$WEBHOOK_URL" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=customer.subscription.created" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=customer.subscription.deleted" \
  -H "Content-Type: application/x-www-form-urlencoded")

# Check if webhook was created successfully
if echo "$RESPONSE" | grep -q '"id":'; then
  WEBHOOK_SECRET=$(echo "$RESPONSE" | grep -o '"secret":"[^"]*' | cut -d'"' -f4)
  WEBHOOK_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  
  echo "✅ Webhook created successfully!"
  echo ""
  echo "Webhook ID: $WEBHOOK_ID"
  echo "Webhook Secret: $WEBHOOK_SECRET"
  echo ""
  
  # Set webhook secret in Firebase Functions
  echo "Setting webhook secret in Firebase Functions..."
  source ~/.nvm/nvm.sh 2>/dev/null || true
  nvm use 20 2>/dev/null || true
  
  firebase functions:config:set stripe.webhook_secret="$WEBHOOK_SECRET"
  
  echo ""
  echo "✅ Webhook secret set in Firebase Functions!"
  echo ""
  echo "Next step: Redeploy functions to activate the webhook secret"
  read -p "Redeploy functions now? (y/n): " REDEPLOY
  
  if [[ $REDEPLOY == "y" || $REDEPLOY == "Y" ]]; then
    firebase deploy --only functions --force
    echo ""
    echo "✅ Functions redeployed with webhook secret!"
  else
    echo "You can redeploy later with: firebase deploy --only functions --force"
  fi
  
  echo ""
  echo "✅ Webhook setup complete!"
else
  echo "❌ Failed to create webhook. Error:"
  echo "$RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4 || echo "$RESPONSE"
  echo ""
  echo "Please set up the webhook manually in Stripe Dashboard:"
  echo "1. Go to https://dashboard.stripe.com → Developers → Webhooks"
  echo "2. Click '+ Add endpoint'"
  echo "3. Enter URL: $WEBHOOK_URL"
  echo "4. Select events: checkout.session.completed, customer.subscription.*"
  echo "5. Copy the webhook signing secret"
  echo "6. Set it with: firebase functions:config:set stripe.webhook_secret=\"YOUR_SECRET\""
fi

