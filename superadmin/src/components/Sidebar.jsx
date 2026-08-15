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
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 998
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}>
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                RapidCloth
              </h2>
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--accent-purple)',
                fontWeight: 700,
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
            <X size={20} />
          </button>
        </div>

        {/* Nav Menu */}
        <nav style={{ padding: '1.25rem 1rem', flex: 1, overflowY: 'auto' }}>
          <p style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            paddingLeft: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            Core Systems
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    background: isActive ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.1) 100%)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-purple)' : '3px solid transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div style={{
          padding: '1.25rem 1rem',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(15, 23, 42, 0.4)'
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
                background: 'var(--accent-purple)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {user?.name?.[0] || 'S'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.name || 'Superadmin'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.email || 'admin@rapidcloth.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: 'none',
                color: '#fb7185',
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
