#!/bin/bash
set -e

RESOURCE_GROUP=${1:-"rg-pptx-ninja"}
APP_NAME=${2:-"pptx-ninja"}
APP_URL="https://$APP_NAME.azurewebsites.net"

echo "Configuring App Service settings..."

# Generate NEXTAUTH_SECRET if not set
NEXTAUTH_SECRET=$(openssl rand -base64 32)

az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --settings \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    NEXTAUTH_URL="$APP_URL" \
    NODE_ENV="production" \
    VECTOR_STORE_PROVIDER="local" \
  --output none

echo "App settings configured."
echo "NOTE: You must manually set COPILOT_GITHUB_TOKEN in Azure App Service Configuration."
