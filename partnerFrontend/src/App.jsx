import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Login/Register Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Delivery Layout and Sub-pages
import DeliveryLayout from './components/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrders from './pages/delivery/DeliveryOrders';
import DeliveryHistory from './pages/delivery/DeliveryHistory';
import DeliveryEarnings from './pages/delivery/DeliveryEarnings';
import DeliveryProfile from './pages/delivery/DeliveryProfile';
import DeliverySettings from './pages/delivery/DeliverySettings';
import DeliveryNotifications from './pages/delivery/DeliveryNotifications';
import DeliveryOffers from './pages/delivery/DeliveryOffers';
import DeliveryMarket from './pages/delivery/DeliveryMarket';
import DeliverySupport from './pages/delivery/DeliverySupport';

import './App.css';

function AppContent() {
  return (
    <>
      <main className="app-main" style={{ flex: 1 }}>
        <Routes>
          {/* Main Redirects */}
          <Route path="/" element={<Navigate to="/delivery" replace />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Delivery Partner Routes */}
          <Route path="/delivery" element={<DeliveryLayout />}>
            <Route index element={<DeliveryDashboard />} />
            <Route path="orders" element={<DeliveryOrders />} />
            <Route path="history" element={<DeliveryHistory />} />
            <Route path="earnings" element={<DeliveryEarnings />} />
            <Route path="profile" element={<DeliveryProfile />} />
            <Route path="settings" element={<DeliverySettings />} />
            <Route path="notifications" element={<DeliveryNotifications />} />
            <Route path="offers" element={<DeliveryOffers />} />
            <Route path="market" element={<DeliveryMarket />} />
            <Route path="support" element={<DeliverySupport />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/delivery" replace />} />
        </Routes>
      </main>

      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }
      }} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
