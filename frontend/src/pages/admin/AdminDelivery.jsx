import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import ExpandLessIcon from '@mui/icons-material/ExpandLessRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { AnimatePresence } from 'framer-motion';
import api from '../../api/index';

export default function AdminDelivery() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setColumns(1);
      else if (window.innerWidth < 1100) setColumns(2);
      else setColumns(3);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
        background: isOnline ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)',
        color: isOnline ? '#22c55e' : '#6b7280', textTransform: 'uppercase',
        display: 'inline-flex', alignItems: 'center', gap: '4px'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#6b7280' }}></span>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box', padding: '0 20px', overflowX: 'hidden' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px', 
        flexWrap: 'wrap', 
        gap: '24px',
        width: '100%',
        padding: '8px 4px'
      }}>
        <div style={{ flex: '1 1 auto', minWidth: '240px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Delivery Partners</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', fontWeight: 500 }}>Manage and monitor your delivery fleet</p>
        </div>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '350px' }}>
          <SearchIcon sx={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '22px', color: 'var(--text-muted)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search partners..."
            style={{
              padding: '14px 16px 14px 50px', borderRadius: '14px',
              background: 'var(--bg-elevated)', border: '2px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '15px', outline: 'none', 
              width: '100%', boxSizing: 'border-box',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
            onFocus={e => {
              e.target.style.borderColor = '#FF6B6B';
              e.target.style.boxShadow = '0 8px 20px rgba(255, 107, 107, 0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
            }}
          />
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
        gap: '24px',
        width: '100%',
        padding: '4px'
      }}>
        {filteredPartners.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <LocalShippingIcon sx={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>No delivery partners found.</p>
          </div>
        ) : (
          filteredPartners.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '20px', position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    background: 'var(--bg-secondary)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', color: '#FF6B6B'
                  }}>
                    <BadgeIcon />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.email}</p>
                  </div>
                </div>
                {getStatusBadge(p.deliveryProfile?.isOnline)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Vehicle</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
                    <DirectionsCarIcon sx={{ fontSize: '16px' }} />
                    {p.deliveryProfile?.vehicleType} - {p.deliveryProfile?.vehicleNumber || 'N/A'}
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Earnings</p>
                  <div style={{ color: '#22c55e', fontSize: '13px', fontWeight: 700 }}>
                    ₹{p.deliveryProfile?.totalEarnings || 0}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Joined {new Date(p.createdAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => setSelectedPartner(p)}
                  style={{ 
                    background: 'transparent', border: 'none', color: '#FF6B6B', 
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    padding: '4px 8px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <ExpandMoreIcon sx={{ fontSize: '18px' }} /> View Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPartner(null)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--bg-card)', borderRadius: '24px',
                  width: '100%', maxWidth: '450px', position: 'relative',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid var(--border)',
                  overflow: 'hidden'
                }}
              >
                {/* Modal Header */}
                <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '16px',
                      background: 'var(--bg-card)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#FF6B6B',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      <BadgeIcon sx={{ fontSize: '28px' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{selectedPartner.name}</h2>
                      <div style={{ marginTop: '4px' }}>
                        {getStatusBadge(selectedPartner.deliveryProfile?.isOnline)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPartner(null)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <CloseIcon sx={{ fontSize: '20px' }} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'rgba(255, 107, 107, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 107, 107, 0.1)' }}>
                      <p style={{ fontSize: '10px', color: '#FF6B6B', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Phone Number</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                        <PhoneIcon sx={{ fontSize: '18px', color: '#FF6B6B' }} />
                        {selectedPartner.phone || 'N/A'}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                      <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Identity Proof</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                        <AssignmentIndIcon sx={{ fontSize: '18px', color: '#3b82f6' }} />
                        {selectedPartner.deliveryProfile?.aadharOrLicense || 'Verified ID'}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>FINANCIAL OVERVIEW</p>
                      <AccountBalanceWalletIcon sx={{ fontSize: '24px', color: 'var(--text-muted)' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Cash Collected (COD)</span>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}>₹{selectedPartner.deliveryProfile?.cashCollected || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Remitted to Admin</span>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>₹{selectedPartner.deliveryProfile?.remittanceHistory?.reduce((acc, curr) => acc + curr.amount, 0) || 0}</span>
                      </div>
                      <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Total Lifetime Earnings</span>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>₹{selectedPartner.deliveryProfile?.totalEarnings || 0}</span>
                      </div>
                    </div>
                  </div>

                  {selectedPartner.deliveryProfile?.remittanceHistory?.length > 0 && (
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PaymentsIcon sx={{ fontSize: '18px' }} /> Recent Remittances
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedPartner.deliveryProfile.remittanceHistory.slice(-3).reverse().map((rem, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '13px', border: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{new Date(rem.date).toLocaleDateString()}</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{rem.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button style={{
                      flex: 1, padding: '14px', borderRadius: '12px',
                      background: 'var(--accent-gradient, linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%))',
                      color: 'white', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                      boxShadow: '0 8px 16px rgba(255, 107, 107, 0.2)'
                    }}>
                      Remit Cash
                    </button>
                    <button style={{
                      padding: '14px', borderRadius: '12px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', cursor: 'pointer', width: '56px'
                    }}>
                      <PhoneIcon sx={{ fontSize: '20px' }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
