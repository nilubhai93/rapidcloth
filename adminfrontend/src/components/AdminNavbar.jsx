import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneRounded';
import MenuIcon from '@mui/icons-material/MenuRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import { useAuth } from '../context/AuthContext';

export default function AdminNavbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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

  // Determine current active page title
  const getPageTitle = (pathname) => {
    if (pathname === '/admin' || pathname === '/admin/') return 'Dashboard';
    if (pathname.startsWith('/admin/zone-sellers')) return 'Zone Sellers';
    if (pathname.startsWith('/admin/sellers')) return 'Seller Approvals';
    if (pathname.startsWith('/admin/users')) return 'Users';
    if (pathname.startsWith('/admin/orders')) return 'Orders';
    if (pathname.startsWith('/admin/delivery')) return 'Delivery Partners';
    if (pathname.startsWith('/admin/products')) return 'Products';
    if (pathname.startsWith('/admin/analytics')) return 'Analytics';
    if (pathname.startsWith('/admin/announcements')) return 'Announcements';
    if (pathname.startsWith('/admin/support')) return 'Support';
    if (pathname.startsWith('/admin/settings')) return 'Settings';
    if (pathname.startsWith('/admin/notifications')) return 'Notifications';
    if (pathname.startsWith('/admin/profile')) return 'Admin Profile';
    return 'Dashboard';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(12, 12, 18, 0.95)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div 
          onClick={onMenuClick}
          className="admin-menu-btn"
          style={{ 
            cursor: 'pointer', 
            padding: '8px', 
            borderRadius: '8px',
            display: 'flex', 
            alignItems: 'center', 
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <MenuIcon />
        </div>
        
        {/* Brand & Dynamic Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/admin" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            textDecoration: 'none', color: 'inherit'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)', flexShrink: 0
            }}>
              <AdminPanelSettingsIcon sx={{ fontSize: '18px', color: '#fff' }} />
            </div>
            <div className="nav-brand-text" style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff', letterSpacing: '-0.3px' }}>
                rapidCloth
              </span>
              <span style={{
                marginLeft: '6px',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                padding: '1px 6px', borderRadius: '4px',
                fontSize: '9px', fontWeight: 700, color: '#fff',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                Admin
              </span>
            </div>
          </Link>

          {/* Dynamic Page Title Breadcrumb */}
          <div className="nav-page-title-breadcrumb" style={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.4)', margin: '0 2px' }}>
            <ChevronRightIcon sx={{ fontSize: '18px' }} />
          </div>

          <div className="nav-page-title-breadcrumb" style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '3px 8px', borderRadius: '6px'
          }}>
            <span style={{ fontWeight: 700, fontSize: '12px', color: '#ffffff', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
              {pageTitle}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .admin-menu-btn { display: none !important; }
        }
        @media (max-width: 600px) {
          .nav-brand-text { display: none !important; }
        }
        @media (max-width: 480px) {
          .nav-page-title-breadcrumb { display: none !important; }
        }
      `}</style>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/admin/notifications" style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-primary)', textDecoration: 'none',
          position: 'relative'
        }}>
          <NotificationsNoneIcon />
          <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#FF6B6B', border: '2px solid var(--bg-card)' }} />
        </Link>

        <div onClick={() => navigate('/admin/profile')} style={{ cursor: 'pointer' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--bg-elevated)', border: '1px solid rgba(255, 107, 107, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FF6B6B', fontWeight: 800
          }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </nav>
  );
}
