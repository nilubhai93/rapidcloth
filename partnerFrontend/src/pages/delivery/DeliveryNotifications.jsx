import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActiveRounded';
import PaymentIcon from '@mui/icons-material/PaymentRounded';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import DoneAllIcon from '@mui/icons-material/DoneAllRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';

export default function DeliveryNotifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const defaultNotifs = [
      { id: 'def-1', title: 'New Delivery Request', text: 'You have a new delivery request near your location.', time: '2m ago', type: 'order', isNew: true, actionUrl: '/delivery/orders' },
      { id: 'def-2', title: 'Tip Received', text: 'Customer added ₹50.00 tip for your last delivery.', time: '1h ago', type: 'payment', isNew: true, actionUrl: '/delivery/earnings' },
      { id: 'def-3', title: 'Peak Pay Active', text: 'Earn extra ₹25 per delivery in Barrackpore zone.', time: '3h ago', type: 'offer', isNew: false, actionUrl: '/delivery/offers' },
      { id: 'def-4', title: 'Weekly Earnings Statement', text: 'Your earnings payout statement for last week is ready.', time: '1d ago', type: 'payment', isNew: false, actionUrl: '/delivery/earnings' },
    ];

    try {
      const stored = localStorage.getItem('delivery_notifications');
      const customList = stored ? JSON.parse(stored) : [];
      setNotifications(customList.length > 0 ? customList : defaultNotifs);
    } catch (e) {
      setNotifications(defaultNotifs);
    }
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isNew: false }));
    setNotifications(updated);
    try {
      localStorage.setItem('delivery_notifications', JSON.stringify(updated));
    } catch (e) {}
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    try {
      localStorage.setItem('delivery_notifications', JSON.stringify([]));
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'shift_complete':
      case 'shift':
        return <ScheduleIcon sx={{ color: '#a855f7', fontSize: '20px' }} />;
      case 'order':
        return <NotificationsActiveIcon sx={{ color: '#0284c7', fontSize: '20px' }} />;
      case 'payment':
        return <PaymentIcon sx={{ color: '#059669', fontSize: '20px' }} />;
      case 'offer':
        return <LocalOfferIcon sx={{ color: '#d97706', fontSize: '20px' }} />;
      default:
        return <NotificationsActiveIcon sx={{ color: '#f59e0b', fontSize: '20px' }} />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'shift_complete':
      case 'shift':
        return '#f3e8ff';
      case 'order':
        return '#e0f2fe';
      case 'payment':
        return '#dcfce7';
      case 'offer':
        return '#fef3c7';
      default:
        return '#fef3c7';
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => n.isNew).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '10px 10px 85px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: 'var(--text-primary, #0f172a)'
      }}
    >
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--bg-elevated, #ffffff)',
            border: 'none',
            color: 'var(--text-primary, #0f172a)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '19px' }} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.2px' }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>
              {unreadCount} unread
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              style={{
                background: 'var(--bg-elevated, #ffffff)',
                border: 'none',
                color: '#f59e0b',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              <DoneAllIcon sx={{ fontSize: '18px' }} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '8px' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'order', label: 'Orders' },
          { id: 'payment', label: 'Payouts' },
          { id: 'offer', label: 'Offers' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: filter === tab.id ? '1.5px solid #f59e0b' : '1px solid var(--border, #e2e8f0)',
              background: filter === tab.id ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-elevated, #ffffff)',
              color: filter === tab.id ? '#f59e0b' : 'var(--text-secondary, #64748b)',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notification Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredNotifs.length === 0 ? (
          <div style={{
            background: 'var(--bg-elevated, #ffffff)',
            borderRadius: '16px',
            padding: '36px 20px',
            textAlign: 'center',
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            marginTop: '10px'
          }}>
            <NotificationsActiveIcon sx={{ fontSize: '42px', color: '#cbd5e1', marginBottom: '8px' }} />
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              No notifications yet
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
              We will notify you when new updates or alerts arrive.
            </div>
          </div>
        ) : (
          filteredNotifs.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (notif.actionUrl) navigate(notif.actionUrl);
              }}
              style={{
                padding: '12px 14px',
                background: 'var(--bg-elevated, #ffffff)',
                border: '1px solid var(--border, #e2e8f0)',
                borderLeft: notif.isNew ? '4px solid #f59e0b' : '1px solid var(--border, #e2e8f0)',
                borderRadius: '14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                cursor: notif.actionUrl ? 'pointer' : 'default',
                boxShadow: notif.isNew ? '0 3px 12px rgba(245, 158, 11, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                position: 'relative'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: getIconBg(notif.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getIcon(notif.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 800,
                    color: 'var(--text-primary, #0f172a)',
                    letterSpacing: '-0.2px'
                  }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', fontWeight: 600, flexShrink: 0, marginLeft: '6px' }}>
                    {notif.time}
                  </span>
                </div>

                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: 'var(--text-secondary, #64748b)',
                  lineHeight: 1.4,
                  fontWeight: 500
                }}>
                  {notif.text}
                </p>

                {notif.actionUrl && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '8px',
                    color: '#f59e0b',
                    fontWeight: 800,
                    fontSize: '11.5px'
                  }}>
                    <span>View Details</span>
                    <ArrowForwardIcon sx={{ fontSize: '14px' }} />
                  </div>
                )}
              </div>

              {notif.isNew && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  flexShrink: 0,
                  marginTop: '4px'
                }} />
              )}
            </motion.div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={clearAllNotifications}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: '6px 12px'
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: '15px' }} />
            Clear All Notifications
          </button>
        </div>
      )}
    </motion.div>
  );
}

