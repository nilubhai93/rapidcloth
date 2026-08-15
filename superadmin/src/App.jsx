import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
