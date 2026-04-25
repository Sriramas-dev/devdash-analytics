import axios from 'axios';

// ─── Language colour map ──────────────────────────────────────────────────────
export const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572a5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#777777', 'C#': '#178600',
  Go: '#00add8', Rust: '#dea584', Ruby: '#701516', PHP: '#4f5d95',
  Swift: '#f05138', Kotlin: '#a97bff', Dart: '#00b4ab', HTML: '#e34c26',
  CSS: '#563d7c', Shell: '#89e051', Vue: '#42b883', Svelte: '#ff3e00',
  Scala: '#c22d40', R: '#198ce7', Haskell: '#5e5086', Lua: '#000080',
  Elixir: '#6e4a7e', Clojure: '#db5855', 'Objective-C': '#438eff',
};

export function getLangColor(lang) {
  if (LANG_COLORS[lang]) return LANG_COLORS[lang];
  let h = 0;
  for (let i = 0; i < lang.length; i++) h = (h * 31 + lang.charCodeAt(i)) % 360;
  return `hsl(${h}, 60%, 55%)`;
}

// ─── Chart style constants ────────────────────────────────────────────────────
export const MONO = "'JetBrains Mono', 'Courier New', monospace";
export const GRID = 'rgba(22, 35, 50, 0.9)';
export const MUTED = '#3d5268';

// ─── In-memory cache (5 min TTL) ─────────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000;
const memCache = new Map();

export function cacheGet(key) {
  const item = memCache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL) { memCache.delete(key); return null; }
  return item.data;
}

export function cacheSet(key, data) {
  memCache.set(key, { data, ts: Date.now() });
}

// ─── GitHub REST API ──────────────────────────────────────────────────────────
const GH = 'https://api.github.com';

export async function ghGet(path, token) {
  const cacheKey = `${token}|${path}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const { data } = await axios.get(`${GH}${path}`, { headers });
  cacheSet(cacheKey, data);
  return data;
}

export async function fetchAllRepos(username, token) {
  const pages = await Promise.all([
    ghGet(`/users/${username}/repos?per_page=100&sort=pushed&page=1`, token),
    ghGet(`/users/${username}/repos?per_page=100&sort=pushed&page=2`, token).catch(() => []),
  ]);
  return pages.flat();
}

export async function loadDashboard(username, token) {
  const [user, repos, events] = await Promise.all([
    ghGet(`/users/${username}`, token),
    fetchAllRepos(username, token),
    ghGet(`/users/${username}/events/public?per_page=100`, token).catch(() => []),
  ]);
  return { user, repos, events };
}

// ─── Data processing ──────────────────────────────────────────────────────────
export function processLanguages(repos) {
  const counts = {};
  repos.forEach(r => {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 9);
}

export function processCommitActivity(events) {
  const NUM_WEEKS = 12;
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const buckets = Array(NUM_WEEKS).fill(0);

  events
    .filter(e => e.type === 'PushEvent')
    .forEach(e => {
      const age = now - new Date(e.created_at).getTime();
      const weekIdx = Math.floor(age / MS_WEEK);
      if (weekIdx < NUM_WEEKS) buckets[NUM_WEEKS - 1 - weekIdx] += e.payload?.commits?.length ?? 1;
    });

  const labels = Array.from({ length: NUM_WEEKS }, (_, i) => {
    const d = new Date(now - (NUM_WEEKS - 1 - i) * MS_WEEK);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  });

  return { labels, values: buckets, total: buckets.reduce((s, v) => s + v, 0) };
}

export function processTopRepos(repos) {
  return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 8);
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
export function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

export function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60)       return `${s}s ago`;
  if (s < 3600)     return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)    return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000)  return `${Math.floor(s / 86400)}d ago`;
  if (s < 31536000) return `${Math.floor(s / 2592000)}mo ago`;
  return `${Math.floor(s / 31536000)}y ago`;
}

// ─── Error message parser ─────────────────────────────────────────────────────
export function parseApiError(err, username) {
  if (err.response?.status === 404) return `User "${username}" not found on GitHub.`;
  if (err.response?.status === 403) return 'API rate limit exceeded. Add a GitHub token for 5000 req/hr.';
  if (err.response?.status === 401) return 'Invalid token. Check your GitHub personal access token.';
  return err.message || 'Something went wrong. Please try again.';
}
