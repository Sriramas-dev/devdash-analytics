import { useState, useCallback } from 'react';
import Logo from "./components/Logo.jsx";
import SearchBar from "./components/SearchBar.jsx";
import ProfileCard from "./components/ProfileCard.jsx";
import StatCard from "./components/StatCard.jsx";
import RepoCard from "./components/RepoCard.jsx";
import EmptyState from "./components/defaultUserList.jsx";
import { CommitChart, LanguageChart, TopReposChart } from "./components/Charts.jsx";
import {
  loadDashboard,
  processLanguages,
  processCommitActivity,
  processTopRepos,
  fmt,
  parseApiError,
} from './utils.js';

function Spinner({ size = 24 }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size, borderWidth: size > 20 ? 3 : 2 }}
    />
  );
}

export default function App() {
  const [state, setState] = useState({ data: null, loading: false, error: null, username: '' });

  const handleSearch = useCallback(async (username, token) => {
    setState(s => ({ ...s, loading: true, error: null, username }));
    try {
      const data = await loadDashboard(username, token);
      setState({ data, loading: false, error: null, username });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: parseApiError(err, username), data: null }));
    }
  }, []);

  const { data, loading, error, username } = state;

  const langData   = data ? processLanguages(data.repos)       : [];
  const commitData = data ? processCommitActivity(data.events) : null;
  const topRepos   = data ? processTopRepos(data.repos)        : [];
  const totalStars = data ? data.repos.reduce((s, r) => s + r.stargazers_count, 0) : 0;
  const totalForks = data ? data.repos.reduce((s, r) => s + r.forks_count, 0)     : 0;

  return (
    <div className="app">
      <header className="app-header">
        <Logo />
        <SearchBar onSearch={handleSearch} loading={loading} />
      </header>

      <main className="app-main">
        {loading && (
          <div className="loading-state">
            <Spinner size={44} />
            <div className="loading-dots"><span /><span /><span /></div>
            <p>Fetching <span>{username}</span>'s analytics…</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-banner">
            <div className="error-icon">!</div>
            {error}
          </div>
        )}

        {!data && !loading && !error && <EmptyState onSearch={handleSearch} />}

        {data && !loading && (
          <div className="dashboard">
            <div className="dashboard-top">
              <ProfileCard user={data.user} />
              <div className="stats-grid">
                <StatCard label="PUBLIC REPOS"  value={fmt(data.user.public_repos)} color="#00e676" />
                <StatCard label="FOLLOWERS"     value={fmt(data.user.followers)}    color="#2979ff" />
                <StatCard label="FOLLOWING"     value={fmt(data.user.following)}    color="#2979ff" />
                <StatCard label="TOTAL STARS"   value={fmt(totalStars)}             color="#ffab00" />
                <StatCard label="TOTAL FORKS"   value={fmt(totalForks)}             color="#c158dc" />
                <StatCard label="COMMITS (12W)" value={fmt(commitData?.total ?? 0)} sub="from public push events" color="#00e676" />
              </div>
            </div>

            <div className="charts-row">
              {commitData          && <CommitChart   commitData={commitData} />}
              {langData.length > 0 && <LanguageChart langData={langData} />}
            </div>

            {topRepos.length > 0 && <TopReposChart repos={topRepos} />}

            <div className="section-header">
              <span className="section-title">REPOSITORIES</span>
              <span className="section-sub">{data.repos.length} total · sorted by recent push</span>
            </div>
            <div className="repo-grid">
              {data.repos.slice(0, 12).map(r => <RepoCard key={r.id} repo={r} />)}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-left">
          <div className="footer-dot" />
          <span>DevDash — Developer Analytics Dashboard</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>Data cached for 5 min</span>
        </div>
        <a href="https://docs.github.com/en/rest" target="_blank" rel="noopener noreferrer">
          GitHub REST API →
        </a>
      </footer>
    </div>
  );
}
