import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const PERIODS = [
  { value: 'hour',  label: 'Hour' },
  { value: 'day',   label: '24h' },
  { value: 'week',  label: 'Week' },
  { value: 'month', label: 'Month' },
];

const CustomTooltip = ({ active, payload, label, color, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(13,18,30,0.97)',
      border: `1px solid ${color}50`,
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${color}20`,
      backdropFilter: 'blur(16px)',
      minWidth: 120,
    }}>
      <p style={{ color: '#64748b', fontSize: 11, marginBottom: 6, letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ color, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{payload[0].value}</p>
      <p style={{ color: '#334155', fontSize: 10, marginTop: 4 }}>{unit}</p>
    </div>
  );
};

const CustomActiveDot = ({ cx, cy, color }) => (
  <g>
    <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.15} />
    <circle cx={cx} cy={cy} r={5}  fill={color} />
    <circle cx={cx} cy={cy} r={5}  fill="none" stroke="white" strokeWidth={1.5} opacity={0.6} />
  </g>
);

export default function StatsChart({ title, data, color = '#10b981', period, onPeriodChange, unit = 'incidents' }) {
  const gId = `sc-${color.replace('#', '')}`;

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0f1623 0%, #111827 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '22px 22px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient blob */}
      <div style={{
        position: 'absolute', top: -30, left: -30,
        width: 140, height: 140,
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ color: '#334155', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
            ANALYTICS
          </p>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
        </div>

        {/* Pill tabs */}
        <div style={{
          display: 'flex', gap: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: 3,
        }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => onPeriodChange(p.value)} style={{
              padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, transition: 'all .2s',
              background: period === p.value ? color : 'transparent',
              color:      period === p.value ? (color === '#ef4444' ? '#fff' : '#000') : '#4b5563',
              boxShadow:  period === p.value ? `0 0 14px ${color}70` : 'none',
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {data?.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip color={color} unit={unit} />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gId})`}
              dot={false}
              activeDot={<CustomActiveDot color={color} />}
              style={{ filter: `drop-shadow(0 0 8px ${color}70)` }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{
          height: 280, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', opacity: 0.25 }}>
            {[20, 35, 15, 45, 25, 40, 30].map((h, i) => (
              <div key={i} style={{ width: 6, height: h, borderRadius: '3px 3px 0 0', background: color }} />
            ))}
          </div>
          <p style={{ color: '#1e293b', fontSize: 13, fontWeight: 500 }}>No data for this period</p>
        </div>
      )}
    </div>
  );
}