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
  ArrowUpRight,
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
    { title: 'Operational Zones', count: summary.totalZones, icon: MapPin, color: '#FF6B6B', path: '/zones' },
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
        onToggleSidebar={toggleSidebar}
      />

      <div className="content-body">
        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0 }}>
              System Overview
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
              Manage zones, admins, sellers, delivery fleets, and customer accounts
            </p>
          </div>
          <button onClick={fetchAnalytics} className="btn btn-secondary btn-sm" style={{ padding: '5px 10px', fontSize: '11px' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '12px',
            fontSize: '11px',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        {/* Top Summary Stat Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '10px',
          marginBottom: '16px'
        }}>
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="glass-card glass-card-interactive"
                onClick={() => navigate(card.path)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'var(--bg-card)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  width: '45px', height: '45px', borderRadius: '50%',
                  background: card.color, opacity: 0.08
                }} />
                <div style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: `${card.color}20`, color: card.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px', lineHeight: 1.1 }}>
                  {loading ? '...' : card.count}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {card.title}
                  </span>
                  <span style={{
                    fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '10px',
                    background: `${card.color}15`, color: card.color, display: 'inline-flex', alignItems: 'center', gap: '2px'
                  }}>
                    Manage <ArrowUpRight size={10} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zone Overview Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Operational Zone Breakdown</h3>
            <button onClick={() => navigate('/zones')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }}>
              Manage All Zones
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Loading Zone Metrics...
            </div>
          ) : zoneOverview.length === 0 ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', borderRadius: '10px' }}>
              No operational zones configured yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {zoneOverview.map((zone) => (
                <div key={zone.zoneId} className="glass-card" style={{ padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{zone.zoneName}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>
                        {zone.code} • {zone.city}
                      </span>
                    </div>
                    <span className={`badge ${zone.status === 'active' ? 'badge-active' : 'badge-inactive'}`} style={{ fontSize: '9px', padding: '2px 7px' }}>
                      {zone.status}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '8px 10px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Sellers</span>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a', margin: 0, lineHeight: 1.2 }}>{zone.sellersCount}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Boys</span>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#0284c7', margin: 0, lineHeight: 1.2 }}>{zone.deliveryCount}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Customers</span>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#d97706', margin: 0, lineHeight: 1.2 }}>{zone.customersCount}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Orders</span>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#db2777', margin: 0, lineHeight: 1.2 }}>{zone.ordersCount}</p>
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
