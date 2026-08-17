import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import BadgeIcon from '@mui/icons-material/BadgeRounded';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCarRounded';
import PhoneIcon from '@mui/icons-material/PhoneRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AssignmentIndIcon from '@mui/icons-material/AssignmentIndRounded';
import PaymentsIcon from '@mui/icons-material/PaymentsRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import api from '../../api/index';

export default function AdminDelivery() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await api.get('/admin/delivery');
        setPartners(res.data.partners || []);
      } catch (err) {
        console.error('Failed to load delivery partners:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.deliveryProfile?.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (isOnline) => {
    return (
      <span style={{
        padding: '2px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 800,
        background: isOnline ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)',
        color: isOnline ? '#22c55e' : '#6b7280', textTransform: 'uppercase',
        display: 'inline-flex', alignItems: 'center', gap: '3px'
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#6b7280' }}></span>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '12px', flexWrap: 'wrap', gap: '8px'
      }}>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LocalShippingIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
            Delivery Partners
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
            Manage and monitor your delivery fleet
          </p>
        </div>
        <div style={{ position: 'relative', width: '220px' }}>
          <SearchIcon sx={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--text-muted)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search partners..."
            style={{
              padding: '5px 8px 5px 28px', borderRadius: '6px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '11px', outline: 'none', 
              width: '100%', boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
        gap: '10px'
      }}>
        {filteredPartners.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '30px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <LocalShippingIcon sx={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>No delivery partners found.</p>
          </div>
        ) : (
          filteredPartners.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '10px 12px', position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: 'var(--bg-secondary)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', color: '#FF6B6B'
                  }}>
                    <BadgeIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{p.name}</h3>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>{p.email}</p>
                  </div>
                </div>
                {getStatusBadge(p.deliveryProfile?.isOnline)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: 0, marginBottom: '2px' }}>Vehicle</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 600 }}>
                    <DirectionsCarIcon sx={{ fontSize: '13px' }} />
                    {p.deliveryProfile?.vehicleType || 'N/A'} - {p.deliveryProfile?.vehicleNumber || 'N/A'}
                  </div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: 0, marginBottom: '2px' }}>Earnings</p>
                  <div style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700 }}>
                    ₹{p.deliveryProfile?.totalEarnings || 0}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Joined {new Date(p.createdAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => setSelectedPartner(p)}
                  style={{ 
                    background: 'rgba(255, 107, 107, 0.08)', border: '1px solid rgba(255, 107, 107, 0.2)', color: '#FF6B6B', 
                    fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                    padding: '3px 8px', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', gap: '2px'
                  }}
                >
                  <ExpandMoreIcon sx={{ fontSize: '14px' }} /> Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail Modal (Compact) */}
      <AnimatePresence>
        {selectedPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPartner(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
              zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px'
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)', borderRadius: '12px',
                width: '100%', maxWidth: '420px', position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid var(--border)',
                overflow: 'hidden', padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'var(--bg-secondary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#FF6B6B'
                  }}>
                    <BadgeIcon sx={{ fontSize: '20px' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{selectedPartner.name}</h2>
                    <div style={{ marginTop: '2px' }}>
                      {getStatusBadge(selectedPartner.deliveryProfile?.isOnline)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPartner(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <CloseIcon sx={{ fontSize: '18px' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '8px 10px', background: 'rgba(255, 107, 107, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 107, 107, 0.1)' }}>
                    <p style={{ fontSize: '9px', color: '#FF6B6B', textTransform: 'uppercase', fontWeight: 800, margin: 0, marginBottom: '2px' }}>Phone Number</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 600 }}>
                      <PhoneIcon sx={{ fontSize: '14px', color: '#FF6B6B' }} />
                      {selectedPartner.phone || 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 10px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                    <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', fontWeight: 800, margin: 0, marginBottom: '2px' }}>Identity Proof</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 600 }}>
                      <AssignmentIndIcon sx={{ fontSize: '14px', color: '#3b82f6' }} />
                      {selectedPartner.deliveryProfile?.aadharOrLicense || 'Verified ID'}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>FINANCIAL OVERVIEW</p>
                    <AccountBalanceWalletIcon sx={{ fontSize: '18px', color: 'var(--text-muted)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cash Collected (COD)</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>₹{selectedPartner.deliveryProfile?.cashCollected || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Remitted to Admin</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>₹{selectedPartner.deliveryProfile?.remittanceHistory?.reduce((acc, curr) => acc + curr.amount, 0) || 0}</span>
                    </div>
                    <div style={{ marginTop: '2px', paddingTop: '6px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Total Lifetime Earnings</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#22c55e' }}>₹{selectedPartner.deliveryProfile?.totalEarnings || 0}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    onClick={() => setSelectedPartner(null)}
                    style={{
                      padding: '6px 16px', borderRadius: '6px', background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
