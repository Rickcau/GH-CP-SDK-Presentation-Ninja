#!/bin/bash
set -e

RESOURCE_GROUP=${1:-"rg-pptx-ninja"}
APP_NAME=${2:-"pptx-ninja"}
LOCATION=${3:-"eastus2"}

echo "Provisioning Azure resources..."

az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$(dirname "$0")/../bicep/main.bicep" \
  --parameters appName="$APP_NAME" location="$LOCATION"

echo "Provisioning complete."
