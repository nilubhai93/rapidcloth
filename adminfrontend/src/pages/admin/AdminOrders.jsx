import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import api from '../../api/index';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/admin/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    const map = {
      pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
      confirmed: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
      shipped: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
      delivered: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
      cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    };
    return map[status] || map.pending;
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShoppingCartIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
          All Orders
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
          Monitor and manage platform orders
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{
          padding: '30px 16px', textAlign: 'center',
          background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)'
        }}>
          <ShoppingCartIcon sx={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: '6px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>No orders found yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {orders.map((order, i) => {
            const s = getStatusStyle(order.status);
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px 12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Order #{order._id?.slice(-6).toUpperCase()}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {order.userId?.name || 'Customer'} • {order.items?.length || 0} items • <strong style={{ color: '#10b981' }}>₹{order.totalAmount || 0}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '2px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 800,
                    background: s.bg, color: s.color, textTransform: 'uppercase'
                  }}>
                    {order.status}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
