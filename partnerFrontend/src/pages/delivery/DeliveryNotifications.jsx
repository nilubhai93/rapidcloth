import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActiveRounded';
import PaymentIcon from '@mui/icons-material/PaymentRounded';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';

export default function DeliveryNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const defaultNotifs = [
      { id: 'def-1', title: 'New Delivery Request', text: 'You have a new delivery request near your location.', time: '2m ago', type: 'order', isNew: true },
      { id: 'def-2', title: 'Tip Received', text: 'Customer added $5.00 tip for your last delivery.', time: '1h ago', type: 'payment', isNew: true },
      { id: 'def-3', title: 'Peak Pay Active', text: 'Earn extra $2 per delivery in Downtown area.', time: '3h ago', type: 'offer', isNew: false },
      { id: 'def-4', title: 'Weekly Earnings Statement', text: 'Your earnings statement for last week is ready.', time: '1d ago', type: 'payment', isNew: false },
    ];

    try {
      const stored = localStorage.getItem('delivery_notifications');
      const customList = stored ? JSON.parse(stored) : [];
      setNotifications([...customList, ...defaultNotifs]);
    } catch (e) {
      setNotifications(defaultNotifs);
    }
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'shift_complete': return <ScheduleIcon sx={{ color: '#ff5400' }} />;
      case 'order': return <NotificationsActiveIcon sx={{ color: '#3b82f6' }} />;
      case 'payment': return <PaymentIcon sx={{ color: '#10b981' }} />;
      case 'offer': return <LocalOfferIcon sx={{ color: '#f59e0b' }} />;
      default: return <NotificationsActiveIcon sx={{ color: '#8b5cf6' }} />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '90px' }}>
      <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>
        Notifications
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notifications.map(notif => (
          <motion.div 
            key={notif.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (notif.actionUrl) navigate(notif.actionUrl);
            }}
            style={{
              padding: '18px',
              background: notif.type === 'shift_complete' 
                ? 'linear-gradient(135deg, rgba(255,84,0,0.08) 0%, rgba(255,84,0,0.02) 100%)' 
                : notif.isNew ? 'rgba(41,255,198,0.05)' : 'var(--bg-card)',
              border: notif.type === 'shift_complete'
                ? '1.5px solid rgba(255,84,0,0.3)'
                : notif.isNew ? '1px solid rgba(41,255,198,0.2)' : '1px solid var(--border)',
              borderRadius: '20px',
              display: 'flex',
              gap: '16px',
              cursor: notif.actionUrl ? 'pointer' : 'default',
              boxShadow: notif.type === 'shift_complete' ? '0 4px 16px rgba(255,84,0,0.1)' : 'none'
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: notif.type === 'shift_complete' ? '#fff7ed' : 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {getIcon(notif.type)}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: notif.isNew ? 800 : 600, color: notif.type === 'shift_complete' ? '#ea580c' : 'var(--text-primary)' }}>
                  {notif.title}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{notif.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {notif.text}
              </p>

              {notif.actionUrl && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '12px',
                  color: '#ff5400',
                  fontWeight: 800,
                  fontSize: '13px'
                }}>
                  <span>Book Another Shift Now</span>
                  <ArrowForwardIcon sx={{ fontSize: '16px' }} />
                </div>
              )}
            </div>
            
            {notif.isNew && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.type === 'shift_complete' ? '#ff5400' : '#29ffc6', flexShrink: 0, marginTop: '6px' }} />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

