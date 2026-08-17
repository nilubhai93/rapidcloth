import { motion } from 'framer-motion';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActiveRounded';

export default function AdminNotifications() {
  const notifications = [
    { title: 'New seller application', message: 'Urban Threads submitted a seller application for review.', time: '5 min ago', type: 'seller', unread: true },
    { title: 'Order flagged', message: 'Order #4892 has been flagged due to delivery delay.', time: '30 min ago', type: 'order', unread: true },
    { title: 'Revenue milestone', message: 'Platform has crossed ₹10L in monthly revenue!', time: '2 hrs ago', type: 'revenue', unread: false },
    { title: 'User report', message: 'A user reported inappropriate product listing.', time: '4 hrs ago', type: 'report', unread: false },
    { title: 'System update', message: 'Server maintenance scheduled for tonight 2-4 AM.', time: '6 hrs ago', type: 'system', unread: false },
    { title: 'Delivery partner joined', message: 'Ravi Kumar joined as a delivery partner.', time: '1 day ago', type: 'delivery', unread: false },
  ];

  const getTypeColor = (type) => {
    const map = { seller: '#a855f7', order: '#3b82f6', revenue: '#10b981', report: '#ef4444', system: '#f59e0b', delivery: '#29ffc6' };
    return map[type] || '#FF6B6B';
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <NotificationsActiveIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
          System Notifications
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
          Platform alerts, user reports, and system updates
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {notifications.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            style={{
              background: n.unread ? 'rgba(255,107,107,0.04)' : 'var(--bg-card)',
              border: `1px solid ${n.unread ? 'rgba(255,107,107,0.15)' : 'var(--border)'}`,
              borderRadius: '8px', padding: '10px 14px',
              display: 'flex', gap: '10px', alignItems: 'center',
              cursor: 'pointer', transition: 'background 0.15s'
            }}
          >
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: getTypeColor(n.type), flexShrink: 0,
              boxShadow: n.unread ? `0 0 8px ${getTypeColor(n.type)}` : 'none'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{n.time}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>{n.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
