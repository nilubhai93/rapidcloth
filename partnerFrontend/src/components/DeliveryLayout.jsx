import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBikeRounded';
import HistoryIcon from '@mui/icons-material/HistoryRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgentRounded';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeedRounded';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import GridViewIcon from '@mui/icons-material/GridViewRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import ShieldIcon from '@mui/icons-material/ShieldRounded';
import GroupAddIcon from '@mui/icons-material/GroupAddRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import DarkModeIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import DeliveryNavbar from './DeliveryNavbar';
import { deliveryAPI } from '../api';
import toast from 'react-hot-toast';

export default function DeliveryLayout() {
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('partner_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
      localStorage.setItem('partner_theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-mode');
      localStorage.setItem('partner_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      toast.success(next ? 'Dark Mode Activated 🌙' : 'Light Mode Activated ☀️');
      return next;
    });
  };

  const isFeedPage = location.pathname === '/delivery' || location.pathname === '/delivery/';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [assignedOrder, setAssignedOrder] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user || (user.role !== 'delivery' && user.role !== 'admin')) {
      navigate('/login');
      return;
    }

    let failCount = 0;
    const fetchAssigned = async () => {
      try {
        const res = await deliveryAPI.getCurrentOrders();
        const pending = res.data.orders.find(o => o.delivery?.status === 'assigned');
        setAssignedOrder(pending || null);
        failCount = 0;
      } catch (e) {
        failCount++;
        if (failCount <= 3) console.error('Failed to poll assigned orders', e);
      }
    };

    fetchAssigned();
    const interval = setInterval(fetchAssigned, 15000);
    return () => clearInterval(interval);
  }, [user, loading, navigate]);

  // Track driver location for distance calculation
  const [driverPos, setDriverPos] = useState(null);
  useEffect(() => {
    if (!user || user.role !== 'delivery') return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error(err)
    );
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);

  function getDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  const pickupDist = (driverPos && assignedOrder?.sellerHubLocation?.lat)
    ? getDistanceKm(driverPos.lat, driverPos.lng, assignedOrder.sellerHubLocation.lat, assignedOrder.sellerHubLocation.lng)
    : null;

  const sidebarNavItems = [
    { name: t('dashboard'), path: '/delivery', icon: <DashboardIcon /> },
    { name: t('orders'), path: '/delivery/orders', icon: <DirectionsBikeIcon /> },
    { name: t('history'), path: '/delivery/history', icon: <HistoryIcon /> },
    { name: t('earnings'), path: '/delivery/earnings', icon: <AccountBalanceWalletIcon /> },
    { name: t('profile'), path: '/delivery/profile', icon: <PersonIcon /> },
    { name: t('notifications'), path: '/delivery/notifications', icon: <NotificationsIcon /> },
    { name: t('support'), path: '/delivery/support', icon: <SupportAgentIcon /> },
  ];

  const moreOptions = [
    { name: t('feed'), path: '/delivery', icon: <DynamicFeedIcon sx={{ color: '#ff6b00' }} />, bg: 'rgba(255, 107, 0, 0.1)' },
    { name: t('orders'), path: '/delivery/orders', icon: <DirectionsBikeIcon sx={{ color: '#3b82f6' }} />, bg: 'rgba(59, 130, 246, 0.1)' },
    { name: t('earnings'), path: '/delivery/earnings', icon: <AccountBalanceWalletIcon sx={{ color: '#10b981' }} />, bg: 'rgba(16, 185, 129, 0.1)' },
    { name: t('shifts'), path: '/delivery/shifts', icon: <ScheduleIcon sx={{ color: '#a855f7' }} />, bg: 'rgba(168, 85, 247, 0.1)' },
    { name: t('history'), path: '/delivery/history', icon: <HistoryIcon sx={{ color: '#f59e0b' }} />, bg: 'rgba(245, 158, 11, 0.1)' },
    { name: t('offers'), path: '/delivery/offers', icon: <LocalOfferIcon sx={{ color: '#ec4899' }} />, bg: 'rgba(236, 72, 153, 0.1)', badge: 'NEW' },
    { name: t('profile'), path: '/delivery/profile', icon: <PersonIcon sx={{ color: '#6366f1' }} />, bg: 'rgba(99, 102, 241, 0.1)' },
    { name: t('notifications'), path: '/delivery/notifications', icon: <NotificationsIcon sx={{ color: '#14b8a6' }} />, bg: 'rgba(20, 184, 166, 0.1)' },
    { name: t('market'), path: '/delivery/market', icon: <StorefrontIcon sx={{ color: '#8b5cf6' }} />, bg: 'rgba(139, 92, 246, 0.1)' },
    { name: t('support'), path: '/delivery/support', icon: <SupportAgentIcon sx={{ color: '#06b6d4' }} />, bg: 'rgba(6, 182, 212, 0.1)' },
    { name: t('emergency'), path: '/delivery/emergency', icon: <ShieldIcon sx={{ color: '#ef4444' }} />, bg: 'rgba(239, 68, 68, 0.1)' },
    { name: t('refer'), path: '/delivery/refer', icon: <GroupAddIcon sx={{ color: '#10b981' }} />, bg: 'rgba(16, 185, 129, 0.1)', badge: '₹18.5k' },
  ];

  const mobileBottomNavItems = [
    { name: t('home'), path: '/delivery', icon: <DynamicFeedIcon />, isExact: true },
    { name: t('earnings'), path: '/delivery/earnings', icon: <AccountBalanceWalletIcon /> },
    { name: t('shifts'), path: '/delivery/shifts', icon: <ScheduleIcon /> },
    { name: t('orders'), path: '/delivery/orders', icon: <DirectionsBikeIcon /> },
    { name: t('more'), isMoreButton: true, icon: <GridViewIcon /> },
  ];

  // Pages covered inside the More menu
  const isMorePageActive = ['/delivery/history', '/delivery/offers', '/delivery/profile', '/delivery/notifications', '/delivery/market', '/delivery/support', '/delivery/emergency', '/delivery/refer'].includes(location.pathname);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (!user || (user.role !== 'delivery' && user.role !== 'admin')) {
    return null;
  }

  return (
    <>
      {isFeedPage && <DeliveryNavbar />}
      <div style={{ display: 'flex', minHeight: isFeedPage ? 'calc(100vh - 64px)' : '100vh', background: 'var(--bg-secondary)', paddingTop: isFeedPage ? '64px' : '0px' }}>

        {/* Sidebar Navigation */}
        {!isMobile && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            style={{
              width: '260px',
              background: 'var(--bg-card)',
              borderRight: '1px solid var(--border)',
              padding: '30px 20px',
              display: 'flex',
              flexDirection: 'column',
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              zIndex: 1001
            }}
          >
            <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
              <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-light)', fontWeight: 700 }}>
                Delivery Hub
              </h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
              {sidebarNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/delivery'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    textDecoration: 'none', fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600,
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    background: isActive ? 'var(--gradient-primary)' : 'transparent',
                    transition: 'all var(--transition-fast)'
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.style.background.includes('var(--gradient-primary)')) {
                      e.currentTarget.style.background = 'var(--bg-elevated)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.className.includes('active')) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}

              {/* More button in Sidebar */}
              <button
                onClick={() => setShowMoreMenu(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  background: isMorePageActive ? 'var(--gradient-primary)' : 'transparent',
                  border: 'none', color: isMorePageActive ? 'white' : 'var(--text-secondary)',
                  fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, cursor: 'pointer',
                  textAlign: 'left', marginTop: '4px'
                }}
                onMouseEnter={(e) => {
                  if (!isMorePageActive) {
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMorePageActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <GridViewIcon />
                {t('more')}
              </button>
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: 'auto' }}>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
                  padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'transparent',
                  border: 'none', color: 'var(--error)', fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogoutIcon />
                {t('signOut')}
              </button>
            </div>
          </motion.aside>
        )}

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          marginLeft: isMobile ? '0px' : '260px',
          width: isMobile ? '100%' : 'calc(100% - 260px)',
          boxSizing: 'border-box',
          padding: isMobile ? '16px' : '32px 40px',
          paddingBottom: isMobile ? '90px' : '32px',
          maxWidth: '1200px'
        }}>
          <Outlet />
        </main>

        {/* Mobile Classic Floating Dock Navigation */}
        {isMobile && (
          <nav style={{
            position: 'fixed',
            bottom: '12px', left: '12px', right: '12px',
            height: '68px',
            background: isDarkMode ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: `1.5px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
            borderRadius: '24px',
            display: 'flex',
            justify: 'space-around',
            alignItems: 'center',
            padding: '0 6px',
            zIndex: 10000,
            boxShadow: isDarkMode ? '0 12px 40px rgba(0,0,0,0.7)' : '0 12px 36px rgba(0,0,0,0.12)'
          }}>
            {mobileBottomNavItems.map((item) => {
              if (item.isMoreButton) {
                const isActive = showMoreMenu || isMorePageActive;
                return (
                  <motion.button
                    key="more-btn"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setShowMoreMenu(prev => !prev)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: 'none', outline: 'none', cursor: 'pointer',
                      color: isActive ? '#ff6b00' : (isDarkMode ? '#94a3b8' : '#64748b'),
                      fontSize: '11px', fontWeight: isActive ? 900 : 700,
                      flex: 1, height: '54px', gap: '3px',
                      position: 'relative', borderRadius: '18px',
                      transition: 'color 0.2s'
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="classic-active-pill"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        style={{
                          position: 'absolute', inset: 0,
                          background: isDarkMode ? 'rgba(255, 107, 0, 0.2)' : 'rgba(255, 107, 0, 0.12)',
                          border: '1px solid rgba(255, 107, 0, 0.3)',
                          borderRadius: '18px'
                        }}
                      />
                    )}
                    <div style={{ fontSize: '22px', display: 'flex', zIndex: 1 }}>{item.icon}</div>
                    <span style={{ fontSize: '11px', zIndex: 1 }}>{item.name}</span>
                  </motion.button>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.isExact}
                  onClick={() => setShowMoreMenu(false)}
                  style={({ isActive }) => ({
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none',
                    color: isActive ? '#ff6b00' : (isDarkMode ? '#94a3b8' : '#64748b'),
                    fontSize: '11px', fontWeight: isActive ? 900 : 700,
                    flex: 1, height: '54px', gap: '3px',
                    position: 'relative', borderRadius: '18px',
                    transition: 'color 0.2s'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="classic-active-pill"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          style={{
                            position: 'absolute', inset: 0,
                            background: isDarkMode ? 'rgba(255, 107, 0, 0.2)' : 'rgba(255, 107, 0, 0.12)',
                            border: '1px solid rgba(255, 107, 0, 0.3)',
                            borderRadius: '18px'
                          }}
                        />
                      )}
                      <div style={{ fontSize: '22px', display: 'flex', zIndex: 1 }}>{item.icon}</div>
                      <span style={{ fontSize: '11px', zIndex: 1 }}>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}

      </div>

      {/* "More" Menu Drawer Modal */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9995,
              background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
            }}
            onClick={() => setShowMoreMenu(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              style={{
                background: isDarkMode ? '#0f172a' : '#ffffff',
                width: '100%',
                maxWidth: '640px',
                borderTopLeftRadius: '32px',
                borderTopRightRadius: '32px',
                padding: '24px 20px 100px',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: isDarkMode ? '0 -20px 60px rgba(0,0,0,0.8)' : '0 -20px 60px rgba(0,0,0,0.3)',
                borderTop: `1px solid ${isDarkMode ? '#334155' : 'transparent'}`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle Bar */}
              <div style={{ width: '40px', height: '4px', background: isDarkMode ? '#475569' : '#cbd5e1', borderRadius: '2px', margin: '0 auto 16px' }} />

              {/* 1. Partner Profile Banner with Dark Mode Toggle */}
              <div style={{
                background: isDarkMode ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                borderRadius: '24px',
                padding: '18px 20px',
                marginBottom: '20px',
                border: `1px solid ${isDarkMode ? '#334155' : '#ffedd5'}`,
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff5400 0%, #ff3b00 100%)',
                    color: '#ffffff', fontWeight: 900, fontSize: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(255, 84, 0, 0.3)'
                  }}>
                    {user?.name ? user.name[0].toUpperCase() : 'P'}
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a', letterSpacing: '-0.3px' }}>
                      {user?.name?.toUpperCase() || 'PARTNER'}
                    </div>
                    <div style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 700, marginTop: '2px' }}>
                      DE ID: #{user?._id?.slice(-8).toUpperCase() || '19685857'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Dark Mode Toggle Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDarkMode}
                    style={{
                      background: isDarkMode ? '#334155' : '#ffffff',
                      border: `1.5px solid ${isDarkMode ? '#475569' : '#fed7aa'}`,
                      borderRadius: '20px',
                      padding: '8px 14px',
                      color: isDarkMode ? '#f8fafc' : '#ea580c',
                      fontWeight: 800,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {isDarkMode ? <DarkModeIcon sx={{ fontSize: '16px', color: '#fbbf24' }} /> : <LightModeIcon sx={{ fontSize: '16px', color: '#ea580c' }} />}
                    <span>{isDarkMode ? 'Dark' : 'Light'}</span>
                  </motion.button>

                  <button
                    onClick={() => { setShowMoreMenu(false); navigate('/delivery/support'); }}
                    style={{
                      background: isDarkMode ? '#1e293b' : '#ffffff', border: `1px solid ${isDarkMode ? '#334155' : '#fed7aa'}`, borderRadius: '20px',
                      padding: '8px 14px', color: isDarkMode ? '#93c5fd' : '#ea580c', fontWeight: 800, fontSize: '12px',
                      display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
                    }}
                  >
                    <HelpOutlineIcon sx={{ fontSize: '16px' }} /> {t('help')}
                  </button>
                </div>
              </div>

              {/* 2. Quick Action Pills Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {[
                  { label: t('myProfile'), path: '/delivery/profile', icon: <PersonIcon sx={{ fontSize: '20px', color: '#6366f1' }} /> },
                  { label: t('payouts'), path: '/delivery/earnings', icon: <AccountBalanceWalletIcon sx={{ fontSize: '20px', color: '#10b981' }} /> },
                  { label: t('shifts'), path: '/delivery/shifts', icon: <ScheduleIcon sx={{ fontSize: '20px', color: '#a855f7' }} /> },
                  { label: t('notifications'), path: '/delivery/notifications', icon: <NotificationsIcon sx={{ fontSize: '20px', color: '#14b8a6' }} /> },
                ].map((quick, qIdx) => (
                  <motion.div
                    key={qIdx}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowMoreMenu(false); navigate(quick.path); }}
                    style={{
                      background: isDarkMode ? '#1e293b' : '#ffffff',
                      border: `1.5px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '16px',
                      padding: '12px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    {quick.icon}
                    <span style={{ fontSize: '11px', fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>{quick.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Section Header */}
              <div style={{ fontSize: '11px', fontWeight: 900, color: isDarkMode ? '#94a3b8' : '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px', paddingLeft: '4px' }}>
                {t('moreFeatures')}
              </div>

              {/* 3. Main Feature Grid (3 columns x 4 rows) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
                {moreOptions.map((opt) => (
                  <motion.div
                    key={opt.name}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      setShowMoreMenu(false);
                      navigate(opt.path);
                    }}
                    style={{
                      background: isDarkMode ? '#1e293b' : '#f8fafc',
                      border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '20px',
                      padding: '16px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justify: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}
                  >
                    {opt.badge && (
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: opt.badge.includes('₹') ? '#10b981' : '#ff5400',
                        color: '#ffffff', fontSize: '9px', fontWeight: 900,
                        padding: '2px 6px', borderRadius: '10px'
                      }}>
                        {opt.badge}
                      </div>
                    )}
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '16px',
                      background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}>
                      {opt.icon}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#0f172a', lineHeight: 1.2 }}>
                      {opt.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* 4. Structured Quick Links List */}
              <div style={{
                background: isDarkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                borderRadius: '20px',
                padding: '6px 16px',
                marginBottom: '28px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                {[
                  { title: t('refer'), badge: 'Upto ₹18,500', path: '/delivery/refer', icon: <GroupAddIcon sx={{ color: '#10b981', fontSize: '20px' }} /> },
                  { title: t('offers'), badge: 'NEW', path: '/delivery/offers', icon: <LocalOfferIcon sx={{ color: '#ec4899', fontSize: '20px' }} /> },
                  { title: t('emergency'), path: '/delivery/emergency', icon: <ShieldIcon sx={{ color: '#ef4444', fontSize: '20px' }} /> },
                  { title: t('shifts'), path: '/delivery/shifts', icon: <ScheduleIcon sx={{ color: '#a855f7', fontSize: '20px' }} /> },
                  { title: t('support'), path: '/delivery/support', icon: <SupportAgentIcon sx={{ color: '#06b6d4', fontSize: '20px' }} /> },
                ].map((item, idx, arr) => (
                  <div
                    key={idx}
                    onClick={() => { setShowMoreMenu(false); navigate(item.path); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 4px',
                      borderBottom: idx < arr.length - 1 ? `1px solid ${isDarkMode ? '#334155' : '#f1f5f9'}` : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.icon}
                      <span style={{ fontSize: '14px', fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{item.title}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.badge && (
                        <span style={{
                          fontSize: '11px', fontWeight: 800,
                          color: item.badge.includes('₹') ? '#047857' : '#ea580c',
                          background: item.badge.includes('₹') ? (isDarkMode ? 'rgba(16,185,129,0.2)' : '#ecfdf5') : (isDarkMode ? 'rgba(234,88,12,0.2)' : '#fff7ed'),
                          padding: '3px 8px', borderRadius: '10px',
                          border: `1px solid ${item.badge.includes('₹') ? '#a7f3d0' : '#ffedd5'}`
                        }}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: '20px' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 5. Utility Links & Sign Out */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 6px' }}>
                <span style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 700 }}>App Version 2.4.0 (Build 2026.08)</span>
                <span style={{ fontSize: '12px', color: '#ff6b00', fontWeight: 800, cursor: 'pointer' }} onClick={() => { setShowMoreMenu(false); navigate('/delivery/profile'); }}>
                  {t('appLanguage')} 🌐
                </span>
              </div>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  logout();
                  navigate('/login');
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '18px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  color: '#dc2626',
                  fontSize: '15px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <LogoutIcon sx={{ fontSize: '22px' }} />
                {t('signOut')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-Assignment Popup Modal */}
      <AnimatePresence>
        {assignedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
              style={{
                background: 'var(--bg-card)', padding: '40px 32px', borderRadius: 'var(--radius-xl)',
                maxWidth: '420px', width: '90%', border: '1px solid var(--accent)',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(41,255,198,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
              }}>
                <DirectionsBikeIcon sx={{ fontSize: '40px', color: 'var(--accent)' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
                {assignedOrder.status === 'return-requested' ? 'New Return Assigned!' : 'New Order Assigned!'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                Order <strong>#{assignedOrder._id.slice(-6).toUpperCase()}</strong> — {assignedOrder.items?.length || 0} items
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                <div style={{ padding: '12px 4px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Pickup</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#6366f1' }}>
                    {pickupDist !== null ? `${pickupDist} km` : '--'}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>To {assignedOrder.status === 'return-requested' ? 'User' : 'Store'}</div>
                </div>

                <div style={{ padding: '12px 4px', borderRadius: '12px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Drop</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#f97316' }}>
                    {assignedOrder.deliveryDistanceKm ? `${assignedOrder.deliveryDistanceKm} km` : '--'}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>To {assignedOrder.status === 'return-requested' ? 'Hub' : 'User'}</div>
                </div>

                <div style={{ padding: '12px 4px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Earnings</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#10b981' }}>
                    ₹{assignedOrder.deliveryEarnings || 0}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Profit</div>
                </div>
              </div>

              <div style={{
                padding: '8px 16px', borderRadius: 'var(--radius-full)', marginBottom: '24px',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: assignedOrder.paymentMethod === 'cod' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${assignedOrder.paymentMethod === 'cod' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                color: assignedOrder.paymentMethod === 'cod' ? '#f59e0b' : '#10b981',
                fontSize: '13px', fontWeight: 700
              }}>
                {assignedOrder.status === 'return-requested' ? '🔄 Product Return' : (assignedOrder.paymentMethod === 'cod' ? '💵 Cash on Delivery' : 'Prepaid')}
                {' · '}₹{Math.round(assignedOrder.totalAmount).toLocaleString()}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                <button
                  onClick={async () => {
                    await deliveryAPI.acceptOrder(assignedOrder._id);
                    setAssignedOrder(null);
                    navigate('/delivery/orders');
                  }}
                  style={{ padding: '16px', background: 'var(--gradient-primary)', color: 'white', borderRadius: 'var(--radius-full)', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                  {assignedOrder.status === 'return-requested' ? 'Accept Return' : 'Accept Delivery'}
                </button>
                <button
                  onClick={async () => {
                    await deliveryAPI.rejectOrder(assignedOrder._id);
                    setAssignedOrder(null);
                  }}
                  style={{ padding: '16px', background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: 'var(--radius-full)', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }}
                >
                  Reject & Reassign
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
