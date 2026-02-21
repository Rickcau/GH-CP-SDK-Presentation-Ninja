# setup.ps1 — One-command setup for Presentation Ninja
# Run from the src/ directory: .\setup.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Presentation Ninja — Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Node.js version ────────────────────────────────────────────────
Write-Host "[1/4] Checking Node.js version..." -ForegroundColor Yellow

try {
    $nodeVersion = (node --version 2>$null)
} catch {
    $nodeVersion = $null
}

if (-not $nodeVersion) {
    Write-Host "ERROR: Node.js is not installed." -ForegroundColor Red
    Write-Host "Install Node.js 23.4+ (v24 LTS recommended) from https://nodejs.org/en/download" -ForegroundColor Red
    exit 1
}

# Parse version string like "v23.4.0" → major=23, minor=4
$versionMatch = $nodeVersion -match '^v(\d+)\.(\d+)'
if (-not $versionMatch) {
    Write-Host "ERROR: Could not parse Node.js version: $nodeVersion" -ForegroundColor Red
    exit 1
}

$major = [int]$Matches[1]
$minor = [int]$Matches[2]

if ($major -lt 23 -or ($major -eq 23 -and $minor -lt 4)) {
    Write-Host "ERROR: Node.js $nodeVersion is too old. You need v23.4 or later." -ForegroundColor Red
    Write-Host "The Copilot SDK requires node:sqlite which is only available in Node 23.4+." -ForegroundColor Red
    Write-Host "Download the latest LTS from https://nodejs.org/en/download" -ForegroundColor Red
    exit 1
}

Write-Host "  Node.js $nodeVersion — OK" -ForegroundColor Green

# ── 2. Install dependencies ─────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/4] Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed. Check the output above." -ForegroundColor Red
    exit 1
}
Write-Host "  Dependencies installed — OK" -ForegroundColor Green

# ── 3. Prompt for API keys ──────────────────────────────────────────────────
Write-Host ""
Write-Host "[3/4] Configuring API keys..." -ForegroundColor Yellow
Write-Host ""

$githubToken = Read-Host "Enter your GitHub token (with Copilot access)"
if ([string]::IsNullOrWhiteSpace($githubToken)) {
    Write-Host "ERROR: GitHub token is required. Get one at https://github.com/settings/tokens" -ForegroundColor Red
    exit 1
}

$tavilyKey = Read-Host "Enter your Tavily API key (for web search)"
if ([string]::IsNullOrWhiteSpace($tavilyKey)) {
    Write-Host "ERROR: Tavily API key is required. Get one at https://tavily.com" -ForegroundColor Red
    exit 1
}

# ── 4. Generate .env file ───────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/4] Generating .env file..." -ForegroundColor Yellow

$envContent = @"
# === REQUIRED ===
GITHUB_TOKEN=$githubToken
TAVILY_API_KEY=$tavilyKey

# === LOCAL DEFAULTS (no config needed) ===
DATABASE_URL=file:./data/app.db
STORAGE_PATH=./data/output
VECTOR_STORE_PROVIDER=local
NEXTAUTH_SECRET=local-dev-secret-change-in-production
AUTH_SECRET=local-dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
"@

Set-Content -Path ".env" -Value $envContent -Encoding UTF8
Write-Host "  .env created — OK" -ForegroundColor Green

# ── Done ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run:   npm run dev"
Write-Host "  2. Open:  http://localhost:3000"
Write-Host "  3. Login: demo@deckforge.local / demo1234"
Write-Host ""
