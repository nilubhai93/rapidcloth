import React from 'react';
import { Sparkles, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title, subtitle, onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="app-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile Hamburger Menu Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mobile-menu-toggle"
            title="Open Sidebar Menu"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={20} />
          </button>
        )}

        <div>
          <h1 className="navbar-title">{title}</h1>
          {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* System Status Pill */}
        <div className="navbar-pill-active">
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px #10b981'
          }} />
          <span className="pill-text">Zone Engine Active</span>
        </div>

        {/* Superadmin Badge */}
        <div className="navbar-pill-purple">
          <Sparkles size={14} />
          <span className="pill-text">Superadmin</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
