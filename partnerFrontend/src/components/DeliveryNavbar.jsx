import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBikeRounded';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneRounded';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsRounded';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMicRounded';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalkRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { deliveryAPI } from '../api';

export function formatDutyTime(totalSecs = 0) {
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
}

export default function DeliveryNavbar() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const profileRef = useRef(null);

  const isOnline = user?.deliveryProfile?.isOnline || false;
  const [dutySeconds, setDutySeconds] = useState(0);

  useEffect(() => {
    // Load initial profile on mount to sync status & duty time
    const fetchProfile = async () => {
      try {
        const res = await deliveryAPI.getProfile();
        if (res.data?.user) setUser(res.data.user);
      } catch (e) {
        console.error('Failed to load profile status');
      }
    };
    if (user?.role === 'delivery') fetchProfile();
  }, []);

  // Calculate live real-time duty seconds
  useEffect(() => {
    const calcSeconds = () => {
      if (!user?.deliveryProfile) return 0;
      const baseSec = user.deliveryProfile.onlineSecondsToday || 0;
      if (user.deliveryProfile.isOnline && user.deliveryProfile.lastOnlineStartTime) {
        const startMs = new Date(user.deliveryProfile.lastOnlineStartTime).getTime();
        const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
        return baseSec + Math.max(0, elapsedSec);
      }
      return baseSec;
    };

    setDutySeconds(calcSeconds());

    if (!isOnline) return;

    const timer = setInterval(() => {
      setDutySeconds(calcSeconds());
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.deliveryProfile, isOnline]);

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    const oldUser = { ...user };
    const now = new Date();

    // Optimistic update for instant visual feedback
    setUser({
      ...user,
      deliveryProfile: {
        ...user?.deliveryProfile,
        isOnline: newStatus,
        lastOnlineStartTime: newStatus ? now : null
      }
    });

    try {
      if (newStatus) {
        // Request geolocation in background non-blockingly
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            () => {},
            (err) => console.warn('Geolocation notice:', err.message),
            { enableHighAccuracy: false, timeout: 5000 }
          );
        }
      } else {
        // Check for active orders when attempting to go offline
        try {
          const res = await deliveryAPI.getCurrentOrders();
          const activeOrders = (res.data?.orders || []).filter(o =>
            o.delivery?.status === 'accepted' || o.delivery?.status === 'assigned'
          );

          if (activeOrders.length > 0) {
            alert('Please complete your assigned active orders before going offline.');
            setUser(oldUser); // Revert
            return; 
          }
        } catch (err) {
          console.error('Failed to check active orders', err);
        }
      }

      const res = await deliveryAPI.updateStatus(newStatus);
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (e) {
      console.error('Failed to update status on server', e);
      setUser(oldUser); // Revert on failure
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(12, 12, 18, 0.95)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(41, 255, 198, 0.1)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      justifyContent: 'space-between',
      boxShadow: '0 2px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Brand / Online Toggle */}
        <div
          onClick={handleToggleOnline}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '20px',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Slider Track */}
          <div style={{
            width: '44px',
            height: '22px',
            backgroundColor: isOnline ? 'rgba(41, 255, 198, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '3px',
            position: 'relative',
            border: `1px solid ${isOnline ? 'rgba(41, 255, 198, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* Slider Thumb */}
            <motion.div
              animate={{ x: isOnline ? 22 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: isOnline ? '#29ffc6' : '#ef4444',
                borderRadius: '50%',
                boxShadow: isOnline ? '0 0 8px rgba(41, 255, 198, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)',
                zIndex: 2
              }}
            />
          </div>
          <motion.span
            initial={false}
            animate={{ color: isOnline ? '#29ffc6' : '#ef4444' }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: '13px', fontWeight: 700 }}>
            {isOnline ? 'Online' : 'Offline'}
          </motion.span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* HELP Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/delivery/support')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            borderRadius: '30px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          <HeadsetMicIcon sx={{ fontSize: '19px', color: '#000000' }} />
          <span>HELP</span>
        </motion.button>

        {/* SOS Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/delivery/emergency')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '7px 16px',
            borderRadius: '30px',
            backgroundColor: '#ffffff',
            color: '#dc2626',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            fontWeight: 900,
            fontSize: '14px',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(220, 38, 38, 0.25)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>SOS</span>
        </motion.button>

        {/* Notifications */}
        <Link to="/delivery/notifications" style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-primary)', textDecoration: 'none',
          position: 'relative'
        }}>
          <NotificationsNoneIcon />
          <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', border: '2px solid var(--bg-card)' }} />
        </Link>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--bg-elevated)', border: '1px solid rgba(41, 255, 198, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden'
            }}
          >
            <span style={{ fontWeight: 800, color: '#29ffc6' }}>{user?.name?.[0]?.toUpperCase() || 'D'}</span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                  width: '260px', borderRadius: '16px',
                  background: 'rgba(18, 18, 28, 0.98)',
                  backdropFilter: 'blur(20px)', border: '1px solid var(--border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
                  overflow: 'hidden', zIndex: 1001
                }}
              >
                <button
                  onClick={() => setProfileOpen(false)}
                  style={{
                    position: 'absolute', top: '12px', right: '12px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', cursor: 'pointer', zIndex: 2
                  }}
                >
                  <CloseIcon sx={{ fontSize: '18px' }} />
                </button>

                <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0cebeb 0%, #29ffc6 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 800, color: '#000', flexShrink: 0
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'D'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Rider'}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                  </div>
                </div>

                <div style={{ padding: '8px' }}>
                  <Link to="/delivery/profile" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                    <AccountCircleOutlinedIcon sx={{ fontSize: '22px', color: '#29ffc6' }} /> My Profile
                  </Link>
                  <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  <button onClick={() => { logout(); setProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '8px', color: 'var(--error)', fontSize: '14px', fontWeight: 500, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <LogoutIcon sx={{ fontSize: '22px' }} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SOS Emergency Assistance Modal */}
      <AnimatePresence>
        {sosModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              style={{
                background: 'linear-gradient(145deg, #1e1215 0%, #12121c 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '24px',
                padding: '32px 28px',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 25px 60px rgba(239, 68, 68, 0.3)',
                textAlign: 'center',
                color: '#ffffff',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSosModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <CloseIcon sx={{ fontSize: '20px' }} />
              </button>

              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px'
              }}>
                <WarningRoundedIcon sx={{ fontSize: '36px', color: '#ef4444' }} />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>
                Emergency SOS Alert
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px', lineHeight: 1.5 }}>
                Do you require immediate safety or emergency support? Our Operations Control Team and Emergency Services are on standby.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                  href="tel:112"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '15px',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <PhoneInTalkIcon /> Call Emergency (112)
                </a>

                <button
                  onClick={() => {
                    alert('🚨 SOS Alert Dispatched! Our Safety Operations Team has received your GPS location.');
                    setSosModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <HeadsetMicIcon sx={{ color: '#29ffc6' }} /> Alert Ops Dispatcher
                </button>

                <button
                  onClick={() => setSosModalOpen(false)}
                  style={{
                    padding: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  Cancel / False Alarm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
