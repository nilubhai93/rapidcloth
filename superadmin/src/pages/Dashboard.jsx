import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { superAdminApi } from '../services/api';
import {
  MapPin,
  Users,
  Store,
  Truck,
  UserCheck,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { toggleSidebar } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminApi.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Fetch Analytics Error:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summary = data?.summary || {
    totalZones: 0,
    totalAdmins: 0,
    totalSellers: 0,
    totalDeliveryPartners: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0
  };

  const zoneOverview = data?.zoneOverview || [];

  const statCards = [
    { title: 'Operational Zones', count: summary.totalZones, icon: MapPin, color: '#8b5cf6', path: '/zones' },
    { title: 'Assigned Admins', count: summary.totalAdmins, icon: Users, color: '#3b82f6', path: '/admins' },
    { title: 'Active Sellers', count: summary.totalSellers, icon: Store, color: '#10b981', path: '/sellers' },
    { title: 'Delivery Partners', count: summary.totalDeliveryPartners, icon: Truck, color: '#06b6d4', path: '/delivery-partners' },
    { title: 'Registered Customers', count: summary.totalCustomers, icon: UserCheck, color: '#f59e0b', path: '/customers' },
    { title: 'Total Platform Orders', count: summary.totalOrders, icon: ShoppingBag, color: '#ec4899', path: '/zones' }
  ];

  return (
    <>
      <Navbar
        title="Superadmin Dashboard"
        subtitle="Real-time multi-zone operational overview & platform telemetry"
      />

      <div className="content-body">
        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>System Overview</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage zones, admins, sellers, delivery fleets, and customer accounts</p>
          </div>
          <button onClick={fetchAnalytics} className="btn btn-secondary btn-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fb7185',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Top Summary Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="glass-card glass-card-interactive"
                onClick={() => navigate(card.path)}
                style={{ borderLeft: `4px solid ${card.color}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{card.title}</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
                      {loading ? '...' : card.count}
                    </h3>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: `${card.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color
                  }}>
                    <Icon size={22} />
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  marginTop: '1rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>Manage in directory</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Zone Overview Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Operational Zone Breakdown</h3>
            <button onClick={() => navigate('/zones')} className="btn btn-secondary btn-sm">
              Manage All Zones
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading Zone Metrics...
            </div>
          ) : zoneOverview.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No operational zones configured yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {zoneOverview.map((zone) => (
                <div key={zone.zoneId} className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{zone.zoneName}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                        {zone.code} • {zone.city}
                      </span>
                    </div>
                    <span className={`badge ${zone.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                      {zone.status}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(11, 15, 25, 0.6)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sellers</span>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>{zone.sellersCount}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Boys</span>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{zone.deliveryCount}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customers</span>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>{zone.customersCount}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Orders</span>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f472b6' }}>{zone.ordersCount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
