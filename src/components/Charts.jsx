import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getLangColor, MONO, GRID, MUTED } from '../utils.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const makeCenterLabelPlugin = (value, label) => ({
  id: 'centerLabelPlugin',
  afterDraw(chart) {
    const center = chart.getDatasetMeta(0)?.data?.[0];
    if (!center) return;

    const { ctx } = chart;
    const x = center.x;
    const y = center.y;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#c9d6e3';
    ctx.font = `700 20px ${MONO}`;
    ctx.fillText(String(value ?? ''), x, y - 8);

    ctx.fillStyle = MUTED;
    ctx.font = `400 10px ${MONO}`;
    ctx.fillText(String(label ?? ''), x, y + 10);
    ctx.restore();
  },
});

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const tooltipBase = {
  backgroundColor: '#0b1017',
  borderColor: '#1e3044',
  borderWidth: 1,
  titleFont: { family: MONO, size: 11, weight: '600' },
  bodyFont:  { family: MONO, size: 12 },
  padding: 12,
};

// ─── Commit Activity (Line) ───────────────────────────────────────────────────
export function CommitChart({ commitData }) {
  const data = {
    labels: commitData.labels,
    datasets: [{
      label: 'Commits',
      data: commitData.values,
      fill: true,
      borderColor: '#00e676',
      backgroundColor: ctx => {
        const { ctx: c, chartArea } = ctx.chart;
        if (!chartArea) return 'rgba(0,230,118,0.1)';
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, 'rgba(0,230,118,0.28)');
        g.addColorStop(1, 'rgba(0,230,118,0.0)');
        return g;
      },
      borderWidth: 2,
      pointBackgroundColor: '#00e676',
      pointBorderColor: '#060a0d',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
      tension: 0.42,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipBase,
        titleColor: '#00e676', bodyColor: '#c9d6e3', displayColors: false,
        callbacks: {
          title: items => items[0].label,
          label: item => ` ${item.raw} commit${item.raw !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: { grid: { color: GRID }, ticks: { color: MUTED, font: { family: MONO, size: 10 }, maxRotation: 0, maxTicksLimit: 8 }, border: { display: false } },
      y: { grid: { color: GRID }, ticks: { color: MUTED, font: { family: MONO, size: 10 }, precision: 0 }, beginAtZero: true, border: { display: false } },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">COMMIT ACTIVITY</span>
        <span className="chart-sub">push events · last 12 weeks</span>
      </div>
      <div className="chart-body" style={{ height: 230 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

// ─── Language Breakdown (Doughnut) ────────────────────────────────────────────
export function LanguageChart({ langData }) {
  const labels = langData.map(([l]) => l);
  const values = langData.map(([, v]) => v);
  const colors = labels.map(getLangColor);
  const total  = values.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors.map(c => c + 'bb'),
      borderColor: colors,
      borderWidth: 2,
      hoverOffset: 10,
      hoverBorderWidth: 3,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#c9d6e3', font: { family: MONO, size: 10 }, padding: 10, boxWidth: 11, boxHeight: 11, usePointStyle: true },
      },
      tooltip: {
        ...tooltipBase,
        titleColor: '#c9d6e3', bodyColor: '#7a94aa',
        callbacks: { label: ctx => `  ${ctx.raw} repo${ctx.raw !== 1 ? 's' : ''}` },
      },
    },
    cutout: '62%',
    radius: '90%',
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">LANGUAGES</span>
        <span className="chart-sub">{total} repos analysed</span>
      </div>
      <div className="chart-body" style={{ height: 230 }}>
        <Doughnut
          data={data}
          options={options}
          plugins={[makeCenterLabelPlugin(labels.length, 'LANGS')]}
        />
      </div>
    </div>
  );
}

// ─── Top Repos (Bar) ──────────────────────────────────────────────────────────
export function TopReposChart({ repos }) {
  const palette = repos.map((_, i) => {
    const hue = (i * 43 + 140) % 360;
    return { solid: `hsl(${hue},68%,56%)`, mid: `hsla(${hue},68%,56%,0.72)`, dim: `hsla(${hue},68%,56%,0.28)` };
  });

  const data = {
    labels: repos.map(r => r.name.length > 15 ? r.name.slice(0, 14) + '…' : r.name),
    datasets: [
      {
        label: '⭐ Stars',
        data: repos.map(r => r.stargazers_count),
        backgroundColor: palette.map(p => p.mid),
        borderColor: palette.map(p => p.solid),
        borderWidth: 1, borderRadius: 5, borderSkipped: false,
      },
      {
        label: '🍴 Forks',
        data: repos.map(r => r.forks_count),
        backgroundColor: palette.map(p => p.dim),
        borderColor: palette.map(p => p.mid),
        borderWidth: 1, borderRadius: 5, borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top', align: 'end',
        labels: { color: '#7a94aa', font: { family: MONO, size: 10 }, boxWidth: 10, usePointStyle: true, padding: 16 },
      },
      tooltip: { ...tooltipBase, titleColor: '#c9d6e3', bodyColor: '#7a94aa' },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: MUTED, font: { family: MONO, size: 10 }, maxRotation: 30 }, border: { display: false } },
      y: { grid: { color: GRID }, ticks: { color: MUTED, font: { family: MONO, size: 10 }, precision: 0 }, beginAtZero: true, border: { display: false } },
    },
  };

  return (
    <div className="chart-card chart-card--wide">
      <div className="chart-header">
        <span className="chart-title">TOP REPOSITORIES</span>
        <span className="chart-sub">by stars &amp; forks</span>
      </div>
      <div className="chart-body" style={{ height: 270 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
