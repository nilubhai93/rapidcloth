import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Store,
  Truck,
  UserCheck,
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard Overview', path: '/', icon: LayoutDashboard },
    { name: 'Zone Management', path: '/zones', icon: MapPin },
    { name: 'Admin Users', path: '/admins', icon: Users },
    { name: 'Sellers Directory', path: '/sellers', icon: Store },
    { name: 'Delivery Partners', path: '/delivery-partners', icon: Truck },
    { name: 'Customers', path: '/customers', icon: UserCheck }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 998
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.35)'
            }}>
              <ShieldCheck size={20} color="#ffffff" />
            </div>
            <div>
              <h2 className="sidebar-brand-title" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                RapidCloth
              </h2>
              <span style={{
                fontSize: '0.62rem',
                color: 'var(--accent)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                SUPERADMIN PORTAL
              </span>
            </div>
          </div>

          {/* Close button visible on mobile */}
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Menu */}
        <nav style={{ padding: '1rem 0.65rem', flex: 1, overflowY: 'auto' }}>
          <p style={{
            fontSize: '0.64rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            paddingLeft: '0.6rem',
            marginBottom: '0.6rem'
          }}>
            Core Systems
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="sidebar-nav-item"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    background: isActive ? 'var(--gradient-primary)' : 'transparent',
                    boxShadow: isActive ? '0 4px 15px rgba(255, 107, 107, 0.3)' : 'none',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div style={{
          padding: '1rem 0.85rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {user?.name?.[0] || 'S'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.name || 'Superadmin'}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.email || 'admin@rapidcloth.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                color: '#dc2626',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
