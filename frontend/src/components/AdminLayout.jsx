import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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

import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/shop');
    }
  }, [user, navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
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
    <>
      <div style={{ marginBottom: '40px', paddingLeft: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px', color: accentColor, fontWeight: 700 }}>
          Admin Panel
        </h2>
        {isMobile && (
          <div onClick={() => setSidebarOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <CloseIcon />
          </div>
        )}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            onClick={() => isMobile && setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '11px 16px', borderRadius: '12px',
              textDecoration: 'none', fontSize: '14px', fontWeight: 600,
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? accentGradient : 'transparent',
              transition: 'all 0.2s ease'
            })}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px', marginTop: 'auto' }}>
        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
            padding: '12px 16px', borderRadius: '12px', background: 'transparent',
            border: 'none', color: 'var(--error)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogoutIcon />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: 'var(--bg-secondary)', paddingTop: '64px' }}>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            style={{
              width: '260px', background: 'var(--bg-card)',
              borderRight: '1px solid var(--border)',
              padding: '30px 20px', display: 'flex', flexDirection: 'column',
              position: 'fixed', top: '64px', bottom: 0, left: 0, zIndex: 10
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
                  position: 'fixed', top: 0, left: 0, bottom: 0, width: '300px',
                  background: 'var(--bg-card)', padding: '30px 20px', display: 'flex', flexDirection: 'column',
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
          marginLeft: isMobile ? '0px' : '260px',
          padding: isMobile ? '16px' : '32px 40px',
          paddingBottom: isMobile ? '80px' : '32px',
          maxWidth: isMobile ? '100%' : '1200px'
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
            justifyContent: 'space-around',
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

// Added MenuIcon for the mobile bottom bar
import MenuIcon from '@mui/icons-material/MenuRounded';
