import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Zones from './pages/Zones';
import Admins from './pages/Admins';
import Sellers from './pages/Sellers';
import DeliveryPartners from './pages/DeliveryPartners';
import Customers from './pages/Customers';
import ZoneDrawer from './pages/ZoneDrawer';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Store,
  Menu
} from 'lucide-react';

const ProtectedLayout = () => {
  const { token, user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => setIsMobileSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={isMobileSidebarOpen} onClose={closeSidebar} />
      <div className="main-wrapper">
        <Outlet context={{ isMobileSidebarOpen, toggleSidebar, closeSidebar }} />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {[
          { name: 'Overview', path: '/', icon: LayoutDashboard },
          { name: 'Zones', path: '/zones', icon: MapPin },
          { name: 'Admins', path: '/admins', icon: Users },
          { name: 'Sellers', path: '/sellers', icon: Store },
          { name: 'Menu', path: '#', onClick: (e) => { e.preventDefault(); toggleSidebar(); }, icon: Menu }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={item.onClick}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'none',
                color: isActive && item.path !== '#' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: isActive && item.path !== '#' ? 700 : 500,
                flex: 1
              })}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/zones" element={<Zones />} />
        <Route path="/zones/draw" element={<ZoneDrawer />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/sellers" element={<Sellers />} />
        <Route path="/delivery-partners" element={<DeliveryPartners />} />
        <Route path="/customers" element={<Customers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
