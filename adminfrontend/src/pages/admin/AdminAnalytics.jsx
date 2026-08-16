import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import AttachMoneyIcon from '@mui/icons-material/AttachMoneyRounded';
import BarChartIcon from '@mui/icons-material/BarChartRounded';

const chartData = [
  { month: 'Jan', value: 65 },
  { month: 'Feb', value: 72 },
  { month: 'Mar', value: 58 },
  { month: 'Apr', value: 85 },
  { month: 'May', value: 92 },
  { month: 'Jun', value: 78 },
  { month: 'Jul', value: 95 },
];

const maxVal = Math.max(...chartData.map(d => d.value));

export default function AdminAnalytics() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChartIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
          Platform Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
          Platform performance, conversion rates, and revenue insights
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '14px' }}>
        {[
          { label: 'Monthly Revenue', value: '₹4.2L', icon: <AttachMoneyIcon sx={{ fontSize: 16 }} />, color: '#10b981' },
          { label: 'New Users', value: '342', icon: <PeopleIcon sx={{ fontSize: 16 }} />, color: '#3b82f6' },
          { label: 'Orders Today', value: '89', icon: <ShoppingCartIcon sx={{ fontSize: 16 }} />, color: '#a855f7' },
          { label: 'Conversion Rate', value: '3.2%', icon: <TrendingUpIcon sx={{ fontSize: 16 }} />, color: '#FF6B6B' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: kpi.color }}>
              {kpi.icon}
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '14px 16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', margin: 0 }}>
          Monthly Revenue Trend
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '130px', padding: '0 8px' }}>
          {chartData.map((d, i) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.value / maxVal) * 100}px` }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                style={{
                  width: '100%', maxWidth: '36px',
                  background: 'linear-gradient(180deg, #FF6B6B 0%, #FF8E53 100%)',
                  borderRadius: '6px 6px 3px 3px',
                  minHeight: '6px',
                  position: 'relative'
                }}
              >
                <span style={{
                  position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)'
                }}>
                  {d.value}%
                </span>
              </motion.div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', margin: 0 }}>
          Top Categories
        </h2>
        {[
          { name: 'T-Shirts', percentage: 34, color: '#FF6B6B' },
          { name: 'Dresses', percentage: 28, color: '#a855f7' },
          { name: 'Jeans', percentage: 22, color: '#3b82f6' },
          { name: 'Accessories', percentage: 16, color: '#f59e0b' },
        ].map((cat) => (
          <div key={cat.name} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: cat.color }}>{cat.percentage}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '3px', background: cat.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
