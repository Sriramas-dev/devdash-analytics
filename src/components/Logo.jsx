export default function Logo() {
  return (
    <div className="logo">
      <div className="logo-icon">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="10" height="10" rx="2" fill="#00e676" />
          <rect x="15" y="1" width="10" height="10" rx="2" fill="#00e676" opacity="0.45" />
          <rect x="1" y="15" width="10" height="10" rx="2" fill="#00e676" opacity="0.45" />
          <rect x="15" y="15" width="10" height="10" rx="2" fill="#00e676" />
        </svg>
      </div>
      <span className="logo-text">dev<span>dash</span></span>
    </div>
  );
}
