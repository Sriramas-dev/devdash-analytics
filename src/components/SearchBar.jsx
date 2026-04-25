import { useState } from 'react';

function Spinner({ size = 15 }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size, borderWidth: 2 }}
    />
  );
}

export default function SearchBar({ onSearch, loading }) {
  const [username, setUsername] = useState('');
  const [token, setToken]       = useState('');
  const [showToken, setShowToken] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const u = username.trim();
    if (u) onSearch(u, token.trim());
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-main">
        <div className="search-field">
          <span className="search-prefix">$</span>
          <input
            className="search-input"
            type="text"
            placeholder="github_username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          className="search-btn"
          disabled={loading || !username.trim()}
        >
          {loading ? <Spinner /> : 'ANALYZE →'}
        </button>
      </div>

      <button
        type="button"
        className="token-toggle"
        onClick={() => setShowToken(s => !s)}
      >
        {showToken ? '▾' : '▸'} API Token{' '}
        {token ? '✓ set' : '(optional · 60 → 5000 req/hr)'}
      </button>

      {showToken && (
        <input
          className="token-input"
          type="password"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={token}
          onChange={e => setToken(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      )}
    </form>
  );
}
