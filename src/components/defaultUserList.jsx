const DEMO_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'yyx990803', 'antirez'];

export default function EmptyState({ onSearch }) {
  return (
    <div className="empty-state">
      <div className="empty-bg-grid">
        {Array.from({ length: 48 }, (_, i) => (
          <div
            key={i}
            className="empty-bg-cell"
            style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
          />
        ))}
      </div>

      <div className="empty-content">
        <div className="empty-terminal-icon">{'</>'}</div>
        <h2>ENTER A GITHUB USERNAME</h2>
        <p>
          Visualise commit trends, language distribution, repository stats,
          and recent activity for any GitHub profile.
        </p>
        <div className="demo-section">
          <span className="demo-label">try →</span>
          {DEMO_USERS.map(u => (
            <button
              key={u}
              className="demo-chip"
              onClick={() => onSearch(u, '')}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
