# DevDash — Developer Analytics Dashboard

A responsive single-page application that visualises GitHub developer activity using the GitHub REST API, Chart.js, and React.

## Features

- 🔍 **Search any GitHub user** — live profile + analytics
- 📈 **Commit Activity** — line chart of push events over the last 12 weeks
- 🍩 **Language Breakdown** — doughnut chart of top languages by repo count
- 📊 **Top Repositories** — bar chart comparing stars & forks
- 📁 **Repository Grid** — recent repos with metadata & badges
- ⚡ **Client-side caching** — 5-minute in-memory cache to minimise API calls
- 🔑 **Optional GitHub token** — bumps rate limit from 60 → 5000 req/hr
- 📱 **Fully responsive** — works on mobile, tablet, and desktop

## Tech Stack

| Layer | Library |
|---|---|
| UI Framework | React 18 |
| HTTP Client | Axios |
| Charts | Chart.js 4 + react-chartjs-2 |
| Build Tool | Vite 5 |
| API | GitHub REST API v3 |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173
```

## Build & Deploy

```bash
# Production build (outputs to ./dist)
npm run build

# Preview production build locally
npm run preview
```

The `dist/` folder is a static site — deploy to any CDN:

### Vercel
```bash
npx vercel --prod
```

### Netlify
```bash
npx netlify deploy --dir=dist --prod
```

### GitHub Pages
Push the `dist/` contents to a `gh-pages` branch, or use the `gh-pages` npm package.

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## GitHub API Rate Limits

| Mode | Limit |
|---|---|
| Unauthenticated | 60 requests / hour |
| With personal access token | 5000 requests / hour |

To generate a token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (no scopes needed for public data).

## Project Structure

```
devdash/
├── index.html          # HTML shell + Google Fonts
├── vite.config.js      # Vite configuration
├── package.json
└── src/
    ├── main.jsx        # React DOM entry point
    ├── App.jsx         # All components + API + chart logic
    └── index.css       # Global styles (terminal/cyberpunk aesthetic)
```

## Cache Strategy

All API responses are stored in a `Map` (in-memory) with a 5-minute TTL. On cache hit the network call is skipped entirely. The cache key is `token|path` so different tokens don't share cache entries.

```
Request
  └─► Check memCache (Map)
        ├─ HIT  (age < 5min) → return cached data
        └─ MISS → axios.get(GitHub API) → store in cache → return data
```
