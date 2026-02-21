# Azure Deployment Guide

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- Azure subscription
- GitHub Copilot subscription (for SDK model access)

## Quick Deploy (One Command)

```bash
# Login to Azure
az login

# Run the deployment script
./deploy/azure/deploy.sh <resource-group> <app-name> <location>

# Example:
./deploy/azure/deploy.sh rg-pptx-ninja pptx-ninja eastus2
```

## Manual Deployment

### 1. Create Resource Group

```bash
az group create --name rg-pptx-ninja --location eastus2
```

### 2. Deploy Infrastructure (Bicep)

```bash
az deployment group create \
  --resource-group rg-pptx-ninja \
  --template-file deploy/azure/bicep/main.bicep \
  --parameters appName=pptx-ninja location=eastus2
```

This provisions:
- Azure App Service (Linux, Node.js 20)
- Azure App Service Plan (B1)
- Azure Key Vault
- Azure Application Insights
- Azure Storage Account (optional, for Blob Storage)

### 3. Configure Secrets

```bash
./deploy/azure/scripts/configure-secrets.sh rg-pptx-ninja pptx-ninja
```

### 4. Deploy Application

```bash
cd src
npm ci && npm run build
az webapp deploy --resource-group rg-pptx-ninja --name pptx-ninja --src-path .
```

## Environment Variables (Azure)

Set these in Azure App Service Configuration:

| Variable | Required | Description |
|----------|----------|-------------|
| `COPILOT_GITHUB_TOKEN` | Yes | GitHub token with Copilot access |
| `NEXTAUTH_SECRET` | Yes | Random secret for auth (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Your app URL (e.g., `https://pptx-ninja.azurewebsites.net`) |
| `DATABASE_URL` | No | PostgreSQL connection string (defaults to SQLite) |
| `AZURE_STORAGE_CONNECTION_STRING` | No | Enables Azure Blob Storage |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | No | Enables App Insights telemetry |

## CI/CD via GitHub Actions

The `.github/workflows/ci-cd.yml` pipeline:
1. Lints and builds on every PR
2. Deploys to Azure App Service on push to `main`

Add these GitHub Secrets:
- `AZURE_WEBAPP_NAME`: Your App Service name
- `NEXTAUTH_SECRET`: Auth secret
- `NEXTAUTH_URL`: App URL
