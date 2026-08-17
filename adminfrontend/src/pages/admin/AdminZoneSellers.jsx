import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import PhoneIcon from '@mui/icons-material/PhoneRounded';
import EmailIcon from '@mui/icons-material/EmailRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import ReceiptIcon from '@mui/icons-material/ReceiptLongRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import InventoryIcon from '@mui/icons-material/Inventory2Rounded';
import LaunchIcon from '@mui/icons-material/LaunchRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import BadgeIcon from '@mui/icons-material/BadgeRounded';
import MapIcon from '@mui/icons-material/MapRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import api from '../../api/index';

export default function AdminZoneSellers() {
  const [zones, setZones] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [viewingSeller, setViewingSeller] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/zone-sellers');
      const loadedZones = res.data.zones || [];
      const loadedSellers = res.data.sellers || [];
      setZones(loadedZones);
      setSellers(loadedSellers);

      const firstActiveZone = loadedZones.find(z => {
        const hasSellers = loadedSellers.some(s => s.zone && s.zone._id?.toString() === z._id.toString());
        return hasSellers || (z.sellerCount && z.sellerCount > 0);
      }) || loadedZones[0];

      if (firstActiveZone) {
        setSelectedZoneId(firstActiveZone._id);
      }
    } catch (err) {
      console.error('Failed to load zone sellers:', err);
      setError(err.response?.data?.error || 'Failed to load seller breakdown by zone.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [editingSellerModal, setEditingSellerModal] = useState(null);
  const [editFormData, setEditFormData] = useState({
    storeName: '', ownerName: '', email: '', phone: '',
    zoneId: '', address: '', categories: '', gstNumber: '', status: 'approved'
  });
  const [updatingSeller, setUpdatingSeller] = useState(false);

  const handleOpenEditModal = (seller) => {
    setEditingSellerModal(seller);
    setEditFormData({
      storeName: seller.storeName || seller.ownerName || '',
      ownerName: seller.ownerName || '',
      email: seller.email || '',
      phone: seller.phone || '',
      zoneId: seller.zone?._id || zones[0]?._id || '',
      address: seller.address || '',
      categories: seller.categories || 'Clothing',
      gstNumber: seller.gstNumber || '',
      status: seller.status || 'approved'
    });
  };

  const handleSaveFullSeller = async (e) => {
    e.preventDefault();
    setUpdatingSeller(true);
    try {
      await api.put(`/admin/sellers/${editingSellerModal._id}/full`, editFormData);
      setEditingSellerModal(null);
      if (viewingSeller) setViewingSeller(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update seller');
    } finally {
      setUpdatingSeller(false);
    }
  };

  const getFileUrl = (path) => {
    if (!path) return '';
    const safePath = path.replace(/\\/g, '/');
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}/${safePath}`;
  };

  // Filter and deduplicate sellers by search, zone, and store identity
  const filteredSellers = (() => {
    const rawFiltered = sellers.filter(s => {
      const matchesSearch =
        s.storeName?.toLowerCase().includes(search.toLowerCase()) ||
        s.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.toLowerCase().includes(search.toLowerCase()) ||
        s.categories?.toLowerCase().includes(search.toLowerCase());

      if (!selectedZoneId || selectedZoneId === 'ALL') return matchesSearch;
      if (selectedZoneId === 'UNASSIGNED') return matchesSearch && !s.zone;
      return matchesSearch && s.zone?._id?.toString() === selectedZoneId;
    });

    const unique = [];
    const seen = new Set();
    for (const seller of rawFiltered) {
      const key = `${(seller.storeName || '').toLowerCase().trim()}_${(seller.phone || '').trim()}`;
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      unique.push(seller);
    }
    return unique;
  })();

  const activeZoneObj = zones.find(z => z._id === selectedZoneId);

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  return (
    <div className="zone-sellers-container">
      <style>{`
        .zone-sellers-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 12px 16px;
          min-height: 80vh;
          font-family: inherit;
        }
        @media (max-width: 640px) {
          .zone-sellers-container {
            padding: 6px 6px !important;
          }
          .search-box-wrapper {
            width: 100% !important;
            max-width: 100% !important;
          }
          .header-title-text {
            font-size: 16px !important;
          }
          .seller-table-desktop {
            display: none !important;
          }
          .seller-cards-mobile {
            display: flex !important;
            flex-direction: column;
            gap: 8px;
          }
          .modal-content-inner {
            padding: 14px !important;
            max-width: 96% !important;
          }
        }
        @media (min-width: 641px) {
          .seller-cards-mobile {
            display: none !important;
          }
        }
      `}</style>

      {/* Sleek Compact Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 className="header-title-text" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StorefrontIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
            Zone Sellers Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
            Compact view & management of active zone sellers
          </p>
        </div>

        {/* Compact Search & Info Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
          <div className="search-box-wrapper" style={{ position: 'relative', flex: '1 1 200px' }}>
            <SearchIcon sx={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store, owner, phone..."
              style={{
                width: '100%', padding: '5px 8px 5px 28px', borderRadius: '6px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '11px', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span>Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredSellers.length}</strong> sellers</span>
            {activeZoneObj && (
              <span style={{
                padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
                background: 'rgba(255, 107, 107, 0.12)', color: '#FF6B6B', border: '1px solid rgba(255, 107, 107, 0.2)'
              }}>
                📍 {activeZoneObj.name} ({activeZoneObj.zoneId || activeZoneObj.code})
              </span>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
          {error}
        </div>
      ) : filteredSellers.length === 0 ? (
        <div style={{ padding: '30px 16px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <StorefrontIcon sx={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: '6px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0, fontWeight: 500 }}>
            No sellers found matching the current search criteria.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="seller-table-desktop" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Store Details</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Owner & Contact</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Assigned Zone</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Products</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.map((seller, idx) => (
                    <tr
                      key={seller._id || idx}
                      style={{
                        borderBottom: idx < filteredSellers.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Store Details */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '12px' }}>
                          {seller.storeName}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                          Address: {seller.address?.slice(0, 30)}{seller.address?.length > 30 ? '...' : ''}
                        </div>
                      </td>

                      {/* Owner & Contact */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11px' }}>{seller.ownerName}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{seller.email}</div>
                        <div style={{ fontSize: '10px', color: '#FF6B6B', fontWeight: 600 }}>{seller.phone}</div>
                      </td>

                      {/* Zone Badge */}
                      <td style={{ padding: '8px 10px' }}>
                        {seller.zone ? (
                          <span style={{
                            padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                            background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)',
                            display: 'inline-block'
                          }}>
                            {seller.zone.zoneId || seller.zone.code} - {seller.zone.name}
                          </span>
                        ) : (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 600, background: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', display: 'inline-block' }}>
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px' }}>
                        {seller.categories}
                      </td>

                      {/* Product Count */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '11px' }}>
                          <InventoryIcon sx={{ fontSize: 13, color: '#10b981' }} />
                          {seller.productCount} items
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.4px',
                          background: seller.status === 'approved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: seller.status === 'approved' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${seller.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                        }}>
                          {seller.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            onClick={() => handleOpenEditModal(seller)}
                            style={{
                              padding: '3px 8px', borderRadius: '4px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '10px', fontWeight: 700,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px'
                            }}
                          >
                            <EditRoundedIcon sx={{ fontSize: 12 }} /> Edit
                          </button>
                          <button
                            onClick={() => setViewingSeller(seller)}
                            style={{
                              padding: '3px 8px', borderRadius: '4px',
                              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                              color: 'white', border: 'none', fontSize: '10px', fontWeight: 700,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px',
                              boxShadow: '0 2px 6px rgba(255, 107, 107, 0.2)'
                            }}
                          >
                            <VisibilityRoundedIcon sx={{ fontSize: 12 }} /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile High-Density Cards View */}
          <div className="seller-cards-mobile">
            {filteredSellers.map((seller, idx) => (
              <div
                key={seller._id || idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {/* Header Line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '12px', color: 'var(--text-primary)' }}>
                    {seller.storeName}
                  </span>
                  <span style={{
                    padding: '1px 5px', borderRadius: '8px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase',
                    background: seller.status === 'approved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: seller.status === 'approved' ? '#10b981' : '#f59e0b',
                    border: `1px solid ${seller.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                  }}>
                    {seller.status}
                  </span>
                </div>

                {/* Owner & Phone */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>Owner: <strong style={{ color: 'var(--text-primary)' }}>{seller.ownerName}</strong></span>
                  <span style={{ color: '#FF6B6B', fontWeight: 700 }}>📞 {seller.phone}</span>
                </div>

                {/* Zone & Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                  <div>
                    {seller.zone ? (
                      <span style={{
                        padding: '1px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                        background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        🗺️ {seller.zone.zoneId || seller.zone.code} - {seller.zone.name}
                      </span>
                    ) : (
                      <span style={{ padding: '1px 5px', borderRadius: '4px', fontSize: '9px', background: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af' }}>Unassigned</span>
                    )}
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{seller.categories}</span>
                </div>

                {/* Address & Products */}
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Address: {seller.address?.slice(0, 25)}{seller.address?.length > 25 ? '...' : ''}</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>📦 {seller.productCount} items</span>
                </div>

                {/* Action buttons side-by-side */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <button
                    onClick={() => handleOpenEditModal(seller)}
                    style={{
                      flex: 1, padding: '4px 6px', borderRadius: '4px',
                      background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                      border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '10px', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px'
                    }}
                  >
                    <EditRoundedIcon sx={{ fontSize: 11 }} /> Edit
                  </button>
                  <button
                    onClick={() => setViewingSeller(seller)}
                    style={{
                      flex: 1, padding: '4px 6px', borderRadius: '4px',
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white',
                      border: 'none', fontSize: '10px', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px'
                    }}
                  >
                    <VisibilityRoundedIcon sx={{ fontSize: 11 }} /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Seller Details Modal (Compact & Structured) */}
      <AnimatePresence>
        {viewingSeller && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewingSeller(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)', zIndex: 3000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px'
            }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content-inner"
              style={{
                width: '100%', maxWidth: '520px', maxHeight: '88vh', overflowY: 'auto',
                background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)',
                padding: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {viewingSeller.storeName}
                    </h2>
                    <span style={{
                      padding: '1px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase',
                      background: viewingSeller.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: viewingSeller.status === 'approved' ? '#10b981' : '#f59e0b',
                      border: `1px solid ${viewingSeller.status === 'approved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                    }}>
                      {viewingSeller.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0 }}>
                    Store Profile & Operational Details
                  </p>
                </div>
                <div onClick={() => setViewingSeller(null)} style={{ cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </div>
              </div>

              {/* Compact Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <BadgeIcon sx={{ fontSize: 13, color: '#FF6B6B' }} /> Store Owner
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{viewingSeller.ownerName}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <EmailIcon sx={{ fontSize: 13, color: '#3b82f6' }} /> Email
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{viewingSeller.email}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <PhoneIcon sx={{ fontSize: 13, color: '#10b981' }} /> Phone
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{viewingSeller.phone}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <MapIcon sx={{ fontSize: 13, color: '#a855f7' }} /> Assigned Zone
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', marginTop: '2px' }}>
                    {viewingSeller.zone ? `${viewingSeller.zone.name} (${viewingSeller.zone.zoneId || viewingSeller.zone.code})` : 'Unassigned'}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <HomeIcon sx={{ fontSize: 13, color: '#f59e0b' }} /> Business Address
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.3 }}>{viewingSeller.address}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <CategoryIcon sx={{ fontSize: 13, color: '#ec4899' }} /> Categories
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{viewingSeller.categories}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <ReceiptIcon sx={{ fontSize: 13, color: '#6366f1' }} /> GSTIN
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{viewingSeller.gstNumber}</div>
                </div>
              </div>

              {viewingSeller.documentPath && (
                <div style={{ marginBottom: '12px' }}>
                  <a
                    href={getFileUrl(viewingSeller.documentPath)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      padding: '6px 10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border)', color: '#FF6B6B', fontWeight: 700, fontSize: '11px',
                      textDecoration: 'none'
                    }}
                  >
                    <LaunchIcon sx={{ fontSize: 14 }} /> View Uploaded Document
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setViewingSeller(null)}
                  style={{
                    padding: '6px 16px', borderRadius: '6px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Seller Profile Modal (Compact & Structured) */}
      <AnimatePresence>
        {editingSellerModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditingSellerModal(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)', zIndex: 3500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px'
            }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content-inner"
              style={{
                width: '100%', maxWidth: '480px', maxHeight: '88vh', overflowY: 'auto',
                background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)',
                padding: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Edit Seller: {editFormData.storeName || editingSellerModal.ownerName}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0 }}>
                    Update store profile, owner details, and approval status
                  </p>
                </div>
                <div onClick={() => setEditingSellerModal(null)} style={{ cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </div>
              </div>

              <form onSubmit={handleSaveFullSeller} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>Store Name</label>
                    <input
                      type="text"
                      value={editFormData.storeName}
                      onChange={(e) => setEditFormData({ ...editFormData, storeName: e.target.value })}
                      required
                      style={{
                        width: '100%', padding: '5px 8px', borderRadius: '6px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '11px', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>Owner Name</label>
                    <input
                      type="text"
                      value={editFormData.ownerName}
                      onChange={(e) => setEditFormData({ ...editFormData, ownerName: e.target.value })}
                      required
                      style={{
                        width: '100%', padding: '5px 8px', borderRadius: '6px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '11px', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      required
                      style={{
                        width: '100%', padding: '5px 8px', borderRadius: '6px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '11px', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>Business Phone</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      style={{
                        width: '100%', padding: '5px 8px', borderRadius: '6px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '11px', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>Approval Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    style={{
                      width: '100%', padding: '5px 8px', borderRadius: '6px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: '11px', outline: 'none', boxSizing: 'border-box'
                    }}
                  >
                    <option value="approved">Approved (Active Seller)</option>
                    <option value="pending">Pending Approval</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>Business Address</label>
                  <textarea
                    rows={2}
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    style={{
                      width: '100%', padding: '5px 8px', borderRadius: '6px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: '11px', outline: 'none', boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>Categories</label>
                    <input
                      type="text"
                      value={editFormData.categories}
                      onChange={(e) => setEditFormData({ ...editFormData, categories: e.target.value })}
                      style={{
                        width: '100%', padding: '5px 8px', borderRadius: '6px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '11px', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>GSTIN / Business ID</label>
                    <input
                      type="text"
                      value={editFormData.gstNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value })}
                      style={{
                        width: '100%', padding: '5px 8px', borderRadius: '6px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '11px', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingSellerModal(null)}
                    style={{
                      padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)',
                      background: 'transparent', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingSeller}
                    style={{
                      padding: '6px 16px', borderRadius: '6px', border: 'none',
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                      color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(255, 107, 107, 0.25)'
                    }}
                  >
                    {updatingSeller ? 'Saving...' : 'Update Seller Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
