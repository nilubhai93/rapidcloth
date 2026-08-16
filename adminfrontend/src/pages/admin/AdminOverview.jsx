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
import CircularProgress from '@mui/material/CircularProgress';

const iconMap = {
  PeopleIcon: <PeopleIcon sx={{ fontSize: 16 }} />,
  StorefrontIcon: <StorefrontIcon sx={{ fontSize: 16 }} />,
  ShoppingCartIcon: <ShoppingCartIcon sx={{ fontSize: 16 }} />,
  AttachMoneyIcon: <AttachMoneyIcon sx={{ fontSize: 16 }} />,
  LocalShippingIcon: <LocalShippingIcon sx={{ fontSize: 16 }} />,
  InventoryIcon: <InventoryIcon sx={{ fontSize: 16 }} />,
  TrendingUpIcon: <TrendingUpIcon sx={{ fontSize: 16 }} />
};

export default function AdminOverview() {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.stats || []);
        setRecentActivity(res.data.recentActivity || []);
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress size={28} sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0 }}>
          Dashboard Overview
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
          Here's what's happening across your platform today.
        </p>
      </div>

      {/* Compact High-Density Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '10px', marginBottom: '16px'
      }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '12px 14px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{
              position: 'absolute', top: '-8px', right: '-8px',
              width: '45px', height: '45px', borderRadius: '50%',
              background: stat.color, opacity: 0.08
            }} />
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: `${stat.color}20`, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '10px'
            }}>
              {iconMap[stat.icon]}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px', lineHeight: 1.1 }}>
              {stat.value}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</span>
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity (Compact & Structured) */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', margin: 0 }}>
          Recent Activity
        </h2>
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0',
              borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>{activity.text}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '12px' }}>{activity.time}</span>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px', fontSize: '11px' }}>
            No recent activity to show
          </div>
        )}
      </div>
    </div>
  );
}
