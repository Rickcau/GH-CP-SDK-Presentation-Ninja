#!/bin/bash
set -e

RESOURCE_GROUP=${1:-"rg-pptx-ninja"}
APP_NAME=${2:-"pptx-ninja"}
LOCATION=${3:-"eastus2"}

echo "=== PowerPoint Ninja — Azure Deployment ==="
echo "Resource Group: $RESOURCE_GROUP"
echo "App Name: $APP_NAME"
echo "Location: $LOCATION"
echo ""

# Create resource group
echo "Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

# Deploy infrastructure
echo "Deploying infrastructure (Bicep)..."
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$(dirname "$0")/bicep/main.bicep" \
  --parameters appName="$APP_NAME" location="$LOCATION" \
  --output none

# Configure secrets
echo "Configuring secrets..."
"$(dirname "$0")/scripts/configure-secrets.sh" "$RESOURCE_GROUP" "$APP_NAME"

# Build and deploy app
echo "Building application..."
cd "$(dirname "$0")/../../src"
npm ci
npm run build

echo "Deploying to Azure App Service..."
az webapp deploy \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --src-path "." \
  --type zip

APP_URL="https://$APP_NAME.azurewebsites.net"
echo ""
echo "=== Deployment Complete ==="
echo "App URL: $APP_URL"
echo "Login: demo@deckforge.local / demo1234"
