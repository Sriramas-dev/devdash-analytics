export default function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ '--c': color }}>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      <div className="stat-label">{label}</div>
      <div className="stat-glow" />
    </div>
  );
}
