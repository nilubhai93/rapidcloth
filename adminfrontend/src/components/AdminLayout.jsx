import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import BarChartIcon from '@mui/icons-material/BarChartRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import CampaignIcon from '@mui/icons-material/CampaignRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgentRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import MenuIcon from '@mui/icons-material/MenuRounded';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  // Always scroll main window to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
    { name: 'Zone Sellers', path: '/admin/zone-sellers', icon: <StorefrontIcon /> },
    { name: 'Seller Approvals', path: '/admin/sellers', icon: <StorefrontIcon /> },
    { name: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon /> },
    { name: 'Delivery Partners', path: '/admin/delivery', icon: <LocalShippingIcon /> },
    { name: 'Products', path: '/admin/products', icon: <CategoryIcon /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChartIcon /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <CampaignIcon /> },
    { name: 'Support', path: '/admin/support', icon: <SupportAgentIcon /> },
    { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
  ];

  const accentColor = '#FF6B6B';
  const accentGradient = 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)';

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Mobile Close Button Header */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <div onClick={() => setSidebarOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            onClick={() => {
              window.scrollTo(0, 0);
              if (isMobile) setSidebarOpen(false);
            }}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 10px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '12px', fontWeight: 600,
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? accentGradient : 'transparent',
              transition: 'all 0.15s ease'
            })}
          >
            {item.icon && <span style={{ display: 'flex', alignItems: 'center', fontSize: '18px' }}>{item.icon}</span>}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sign Out Section */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px', marginTop: 'auto' }}>
        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            padding: '7px 10px', borderRadius: '8px', background: 'transparent',
            border: 'none', color: 'var(--error)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogoutIcon sx={{ fontSize: 18 }} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
        <CircularProgress size={28} sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: 'var(--bg-secondary)', paddingTop: '64px' }}>

        {/* Desktop Fixed Sidebar */}
        {!isMobile && (
          <aside
            style={{
              width: '210px',
              height: 'calc(100vh - 64px)',
              background: 'var(--bg-card)',
              borderRight: '1px solid var(--border)',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              position: 'fixed',
              top: '64px',
              bottom: 0,
              left: 0,
              zIndex: 10,
              overflowY: 'auto'
            }}
          >
            <SidebarContent />
          </aside>
        )}

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, backdropFilter: 'blur(4px)' }}
              />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                  position: 'fixed', top: 0, left: 0, bottom: 0, width: '230px',
                  background: 'var(--bg-card)', padding: '14px 10px', display: 'flex', flexDirection: 'column',
                  zIndex: 2001, borderRight: '1px solid var(--border)'
                }}
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          marginLeft: isMobile ? '0px' : '210px',
          padding: isMobile ? '8px' : '20px 24px',
          paddingBottom: isMobile ? '70px' : '24px',
          maxWidth: isMobile ? '100%' : '1280px'
        }}>
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justify: 'space-around',
            alignItems: 'center',
            padding: '8px 4px',
            paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
            zIndex: 50
          }}>
            {[
              { name: 'Home', path: '/admin', icon: <DashboardIcon sx={{ fontSize: '24px' }} /> },
              { name: 'Sellers', path: '/admin/sellers', icon: <StorefrontIcon sx={{ fontSize: '24px' }} /> },
              { name: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon sx={{ fontSize: '24px' }} /> },
              { name: 'Products', path: '/admin/products', icon: <CategoryIcon sx={{ fontSize: '24px' }} /> },
              { name: 'Menu', path: '#', onClick: (e) => { e.preventDefault(); setSidebarOpen(true); }, icon: <MenuIcon sx={{ fontSize: '24px' }} /> },
            ].map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={item.onClick}
                end={item.path === '/admin'}
                style={({ isActive }) => ({
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  textDecoration: 'none',
                  color: isActive ? accentColor : 'var(--text-secondary)',
                  fontSize: '11px', fontWeight: 600,
                  flex: 1
                })}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
