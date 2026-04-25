import { getLangColor, fmt, timeAgo } from '../utils.js';

export default function RepoCard({ repo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="repo-card"
    >
      <div className="repo-top">
        <span className="repo-name">{repo.name}</span>
        <div className="repo-badges">
          {repo.fork     && <span className="badge badge-fork">fork</span>}
          {repo.archived && <span className="badge badge-archived">archived</span>}
          {repo.private  && <span className="badge badge-private">private</span>}
        </div>
      </div>

      {repo.description && (
        <p className="repo-desc">{repo.description}</p>
      )}

      <div className="repo-footer">
        {repo.language && (
          <span className="repo-lang">
            <span
              className="lang-dot"
              style={{ background: getLangColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="repo-stat">⭐ {fmt(repo.stargazers_count)}</span>
        )}
        {repo.forks_count > 0 && (
          <span className="repo-stat">🍴 {fmt(repo.forks_count)}</span>
        )}
        <span className="repo-time">{timeAgo(repo.pushed_at)}</span>
      </div>
    </a>
  );
}
