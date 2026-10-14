# Azure Deployment Plan — Memory Match (Cerevyn PS09)

## Overview

The application has two deployable units:

| Unit | Technology | Azure target |
|------|-----------|--------------|
| Frontend | Static HTML/CSS/JS (Vite build) | Azure Static Web Apps |
| Backend API | Node.js 24 Express | Azure App Service (Linux, B1 SKU) |
| Database | SQLite file on disk | App Service file system (persistent) |

---

## Architecture Diagram

```
Browser
  │
  ├─ Static assets (HTML/CSS/JS)
  │       ↓
  │  Azure Static Web Apps
  │   (CDN-backed, free tier)
  │
  └─ /api/* requests
          ↓
     Azure App Service (B1)
      Node 24 Express
          │
          └─ SQLite  (/home/data/game.db)
               (App Service persistent storage)
```

---

## Step-by-Step Deployment

### Prerequisites

- Azure subscription (free tier works)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- GitHub repository with the project

---

### 1 — Create a Resource Group

```bash
az group create \
  --name memory-match-rg \
  --location eastus
```

---

### 2 — Deploy the Backend to App Service

#### 2a. Create an App Service Plan (B1 = ~$13/month)

```bash
az appservice plan create \
  --name memory-match-plan \
  --resource-group memory-match-rg \
  --sku B1 \
  --is-linux
```

#### 2b. Create the Web App

```bash
az webapp create \
  --name memory-match-api \
  --resource-group memory-match-rg \
  --plan memory-match-plan \
  --runtime "NODE:24-lts"
```

#### 2c. Set environment variables

```bash
az webapp config appsettings set \
  --name memory-match-api \
  --resource-group memory-match-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DB_DIR=/home/data \
    CORS_ORIGIN=https://memory-match.azurestaticapps.net
```

> **Note:** Azure App Service on Linux maps port 8080 by default. The `PORT` env var is automatically set by the platform; the setting above is for reference.

#### 2d. Enable persistent storage for SQLite

```bash
az webapp config set \
  --name memory-match-api \
  --resource-group memory-match-rg \
  --generic-configurations '{"storageType":"LocalRedundant"}'
```

App Service Linux provides `/home` as persistent storage across restarts. `DB_DIR=/home/data` keeps the SQLite file there.

#### 2e. Deploy via ZIP push

```bash
# Build the backend first
cd backend
npm ci && npm run build

# Package dist + package.json (no node_modules)
zip -r deploy.zip dist package*.json

az webapp deployment source config-zip \
  --name memory-match-api \
  --resource-group memory-match-rg \
  --src deploy.zip
```

App Service runs `npm ci --omit=dev` after deployment automatically.

---

### 3 — Deploy the Frontend to Azure Static Web Apps

#### 3a. Create the Static Web App (free tier)

```bash
az staticwebapp create \
  --name memory-match \
  --resource-group memory-match-rg \
  --source https://github.com/YOUR_ORG/memory-match \
  --location eastus2 \
  --branch main \
  --app-location "frontend" \
  --output-location "dist" \
  --login-with-github
```

This command:
1. Creates the Azure resource
2. Commits a GitHub Actions workflow to your repo that auto-builds and deploys on every push

#### 3b. Set the API base URL

Create `frontend/.env.production`:
```
VITE_API_URL=https://memory-match-api.azurewebsites.net/api
```

Commit and push — the Static Web Apps workflow will pick it up.

---

### 4 — Configure CORS on the Backend

After both services are running, update the backend CORS setting to the exact Static Web Apps URL:

```bash
az webapp config appsettings set \
  --name memory-match-api \
  --resource-group memory-match-rg \
  --settings CORS_ORIGIN=https://memory-match.azurestaticapps.net
```

Restart the app:

```bash
az webapp restart \
  --name memory-match-api \
  --resource-group memory-match-rg
```

---

### 5 — Verify

| Check | Command / URL |
|-------|--------------|
| Backend health | `curl https://memory-match-api.azurewebsites.net/health` |
| Frontend | Open `https://memory-match.azurestaticapps.net` in a browser |
| API smoke test | `curl https://memory-match-api.azurewebsites.net/api/sessions` |

---

## CI/CD Integration

The GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push:

1. Installs dependencies
2. Type-checks TypeScript
3. Runs Vitest unit tests
4. Builds both packages
5. Runs a Docker build smoke test

To add **automatic deployment** to Azure from CI, add these secrets to the GitHub repository:

| Secret | How to get it |
|--------|--------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure Portal → Static Web App → Manage deployment token |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | `az webapp deployment list-publishing-profiles --name memory-match-api ...` |

Then extend `.github/workflows/ci.yml` with deploy steps that trigger only on `push` to `main`.

---

## Cost Estimate

| Resource | SKU | Estimated monthly cost |
|----------|-----|----------------------|
| App Service Plan (backend) | B1 Linux | ~$13 USD |
| Static Web App (frontend) | Free | $0 |
| **Total** | | **~$13/month** |

> Switch to the F1 (Free) App Service plan for zero cost during development — it has a 60-minute/day CPU quota and cold-start delays.

---

## SQLite vs Azure SQL Consideration

SQLite on App Service persistent storage is suitable for this project scale (single-node, low traffic). For production scale-out:

- Replace `node:sqlite` with `@azure/cosmos` or `mssql` + Azure SQL
- Update `backend/src/db.ts` and `backend/src/sessions.ts` accordingly
- No changes needed to the routes or business logic

---

## Security Checklist

- [ ] No secrets or credentials committed to the repository
- [ ] CORS restricted to the specific frontend origin
- [ ] `NODE_ENV=production` set (disables stack traces in error responses)
- [ ] HTTPS enforced by Azure (both Static Web Apps and App Service do this by default)
- [ ] SQLite file stored outside the app directory (`/home/data`, not inside `dist`)
