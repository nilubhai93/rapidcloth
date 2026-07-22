import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import AttachMoneyIcon from '@mui/icons-material/AttachMoneyRounded';
import InventoryIcon from '@mui/icons-material/Inventory2Rounded';

const iconMap = {
  PeopleIcon: <PeopleIcon />,
  StorefrontIcon: <StorefrontIcon />,
  ShoppingCartIcon: <ShoppingCartIcon />,
  AttachMoneyIcon: <AttachMoneyIcon />,
  LocalShippingIcon: <LocalShippingIcon />,
  InventoryIcon: <InventoryIcon />,
  TrendingUpIcon: <TrendingUpIcon />
};

export default function AdminOverview() {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.stats);
        setRecentActivity(res.data.recentActivity);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Welcome back, Admin
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px' }}>
          Here's what's happening across your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute', top: '-10px', right: '-10px',
              width: '60px', height: '60px', borderRadius: '50%',
              background: stat.color, opacity: 0.08
            }} />
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `${stat.color}20`, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px'
            }}>
              {iconMap[stat.icon]}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Recent Activity
        </h2>
        {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0',
            borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{activity.text}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '16px' }}>{activity.time}</span>
          </div>
        )) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No recent activity to show</div>
        )}
      </div>
    </div>
  );
}
