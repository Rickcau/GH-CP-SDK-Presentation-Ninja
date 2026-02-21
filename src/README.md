# GH-CP-SDK Presentation Generator

A [Next.js](https://nextjs.org) application that uses the [GitHub Copilot SDK](https://github.com/github/copilot-sdk) to generate presentations.

## Prerequisites

### Node.js 23.4+ (Node 24 LTS Recommended)

This project requires **Node.js 23.4 or later**. The `@github/copilot-sdk` bundles a Copilot CLI that uses the built-in `node:sqlite` module, which is only available in Node.js 23.4+.

> **⚠️ Node.js 22 and below will NOT work.** The `node:sqlite` module does not exist in those versions, and you will get a `Cannot find module 'node:sqlite'` error when the SDK tries to start the Copilot CLI.

**Recommended version: Node.js 24 LTS** — long-term support, stable, and fully compatible. Node 23.x also works but is no longer actively maintained. Future versions (25+) will also be compatible.

Check your current version:

```bash
node --version
# Must be v23.4.0 or later (v24.x LTS recommended)
```

If you need to install or upgrade Node.js, use one of the following methods. These commands are run from **any terminal window** (they install Node.js globally, not per-project):

**Option 1: Direct download (simplest)**

Download the **LTS** (v24.x) installer from [nodejs.org/en/download](https://nodejs.org/en/download). On Windows, the `.msi` installer upgrades in-place — no need to uninstall your old version.

**Option 2: winget (Windows)**

```bash
winget install OpenJS.NodeJS
```

**Option 3: nvm (Node Version Manager)**

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Install and use Node.js 24 LTS
nvm install 24
nvm use 24
```

**Option 4: fnm (Fast Node Manager)**

```bash
# Install fnm (if not already installed)
curl -fsSL https://fnm.vercel.app/install | bash

# Install and use Node.js 24 LTS
fnm install 24
fnm use 24
```

> **Note:** After installing or switching Node.js versions, you must run `npm install` from the `src/` directory to rebuild native dependencies (like `better-sqlite3`) against the new version.

### GitHub Copilot

- A [GitHub Copilot](https://github.com/features/copilot) subscription is required for the Copilot SDK.

## Getting Started

1. Navigate to the `src/` directory:

   ```bash
   cd src
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

- [GitHub Copilot SDK](https://github.com/github/copilot-sdk) - the SDK used in this project
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub Repository](https://github.com/vercel/next.js) - feedback and contributions welcome

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
