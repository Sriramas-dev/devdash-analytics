export default function ProfileCard({ user }) {
  const type = user.type === 'Organization' ? 'ORG' : 'USER';

  return (
    <div className="profile-card">
      <div className="profile-top">
        <div className="avatar-wrap">
          <img src={user.avatar_url} alt={user.login} className="profile-avatar" />
          <div className="avatar-ring" />
        </div>
        <div className="profile-names">
          <h2 className="profile-name">{user.name || user.login}</h2>
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-handle"
          >
            @{user.login}
          </a>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
        </div>
      </div>

      <div className="profile-meta">
        {user.company && (
          <span className="meta-item">
            <span className="meta-icon">🏢</span>
            <span>{user.company.replace(/^@/, '')}</span>
          </span>
        )}
        {user.location && (
          <span className="meta-item">
            <span className="meta-icon">📍</span>
            <span>{user.location}</span>
          </span>
        )}
        {user.blog && (
          <a
            href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
            target="_blank"
            rel="noopener noreferrer"
            className="meta-item"
          >
            <span className="meta-icon">🔗</span>
            <span>{user.blog.replace(/^https?:\/\//, '')}</span>
          </a>
        )}
        {user.twitter_username && (
          <a
            href={`https://twitter.com/${user.twitter_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="meta-item"
          >
            <span className="meta-icon">𝕏</span>
            <span>@{user.twitter_username}</span>
          </a>
        )}
      </div>

      <div className="profile-footer">
        <span className="profile-since">
          Joined{' '}
          {new Date(user.created_at).toLocaleDateString('en', {
            year: 'numeric',
            month: 'short',
          })}
        </span>
        <span className="profile-type">{type}</span>
      </div>
    </div>
  );
}
