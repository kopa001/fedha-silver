# FEDHA Silver MMF — Deployment Guide

This repository contains **FEDHA Silver MMF**, a production-grade, mobile-first Progressive Web App (PWA) backed by a 200 kg physical silver base reserve.

---

## 1. Quick Deploy to GitHub & GitHub Pages

The repository is already pre-configured with a complete automated GitHub Actions workflow (`.github/workflows/deploy.yml`).

### Step 1: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `fedha-silver-mmf`).
3. Set visibility to **Public** (recommended for free GitHub Pages) or **Private**.
4. Do **not** initialize with README, .gitignore, or license (they are already included).

### Step 2: Push Your Local Code to GitHub
Open your terminal in this project root and run:
```bash
# 1. Initialize git (if not already done)
git init -b main

# 2. Add all files
git add .

# 3. Create your initial commit
git commit -m "feat: initial commit of FEDHA Silver MMF with 200 kg reserve engine and PWA support"

# 4. Link your GitHub remote (replace YOUR-USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/fedha-silver-mmf.git

# 5. Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages (2 Clicks)
1. On GitHub, navigate to your repository **Settings** tab.
2. In the left sidebar, click **Pages** (under the "Code and automation" section).
3. Under **Build and deployment > Source**, select **"GitHub Actions"**.
4. That's it! GitHub will automatically trigger the `.github/workflows/deploy.yml` workflow, build your project, and publish your live app to:
   ```
   https://YOUR-USERNAME.github.io/fedha-silver-mmf/
   ```

---

## 2. Deploy to Vercel (1-Click)

1. Push your code to GitHub as shown above.
2. Visit [vercel.com/new](https://vercel.com/new).
3. Import your `fedha-silver-mmf` repository.
4. Framework Preset: **Vite** (auto-detected).
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**.

---

## 3. Deploy to Netlify

1. Push your code to GitHub.
2. Visit [app.netlify.com](https://app.netlify.com) and click **"Add new site" > "Import an existing project"**.
3. Select your GitHub repository.
4. Set Build command to `npm run build` and Publish directory to `dist`.
5. Click **Deploy Site**.

---

## 4. Run Full-Stack with Node/Express Server

To run full-stack in containerized environments (Docker, AWS ECS, Google Cloud Run, Railway, Render):

```bash
# 1. Build the frontend
npm run build

# 2. Start the Express backend (serves API + static dist on port 3000)
npm start
```

### Dockerfile (Optional for Container Deployments)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 5. Verification Checklist

- [x] TypeScript builds cleanly with `npm run build` (`dist/` generated).
- [x] Service worker precaches assets for offline capability (`/sw.js`).
- [x] Web App Manifest is compliant for mobile home screen installation (`/manifest.json`).
- [x] In-app install button handles Chromium, Android, and iOS Safari instructions.
- [x] Relative base path configured in `vite.config.ts` for zero-configuration GitHub Pages hosting.
- [x] Continuous Integration (`ci.yml`) and Automated Pages Deployment (`deploy.yml`) active.
