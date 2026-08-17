import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpwardRounded';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import PaymentsIcon from '@mui/icons-material/PaymentsRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import CircularProgress from '@mui/material/CircularProgress';
import { deliveryAPI } from '../../api';

// Helper for calculating week start/end dates based on offset
function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day); // Monday is day 1
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon + (offset * 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const formatShort = (d) => {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return {
    start: monday,
    end: sunday,
    label: `${formatShort(monday)} - ${formatShort(sunday)}`
  };
}

export default function DeliveryEarnings() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState('deliveries');

  const weekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  const fetchEarnings = async () => {
    try {
      const res = await deliveryAPI.getEarnings();
      setData(res.data);
    } catch (e) {
      console.error('Failed to fetch earnings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handlePay = async () => {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return alert('Invalid amount');
    if (amount > (data?.cashCollected || 0)) return alert('Exceeds current balance');

    setPaying(true);
    try {
      await deliveryAPI.payCompany(amount);
      await fetchEarnings();
      setShowPayModal(false);
      setPayAmount('');
    } catch (e) {
      alert(e.response?.data?.error || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const {
    cashCollected = 0,
    cashLimit = 2500,
    isBlocked = false,
    recentDeliveries = [],
    remittanceHistory = []
  } = data || {};

  // Filter deliveries by selected week range
  const weekDeliveries = useMemo(() => {
    if (!recentDeliveries) return [];
    return recentDeliveries.filter(o => {
      const d = new Date(o.updatedAt || o.createdAt);
      return d >= weekRange.start && d <= weekRange.end;
    });
  }, [recentDeliveries, weekRange]);

  const weeklyEarningsAmount = useMemo(() => {
    if (weekOffset === 0 && data?.weeklyEarnings !== undefined && weekDeliveries.length === 0) {
      return data.weeklyEarnings;
    }
    return weekDeliveries.reduce((sum, o) => sum + (o.deliveryEarnings || 0), 0);
  }, [weekDeliveries, weekOffset, data]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: 'var(--accent)' }} />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '10px 10px 80px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* 1. Date Range Week Navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
        <button
          onClick={() => setWeekOffset(prev => prev - 1)}
          style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: '#ff6b00', border: 'none', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 6px rgba(255, 107, 0, 0.3)',
            transition: 'transform 0.15s'
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: '20px' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #1a1a2e)' }}>
          <span>{weekRange.label}</span>
          <ChevronRightIcon sx={{ fontSize: '16px', color: '#94a3b8' }} />
        </div>

        <button
          onClick={() => setWeekOffset(prev => Math.min(0, prev + 1))}
          disabled={weekOffset >= 0}
          style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: weekOffset >= 0 ? '#e2e8f0' : '#ff6b00',
            border: 'none', color: weekOffset >= 0 ? '#94a3b8' : '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: weekOffset >= 0 ? 'default' : 'pointer',
            boxShadow: weekOffset >= 0 ? 'none' : '0 2px 6px rgba(255, 107, 0, 0.3)'
          }}
        >
          <ChevronRightIcon sx={{ fontSize: '20px' }} />
        </button>
      </div>

      {/* 2. Main Weekly Earnings Display */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          ₹{weeklyEarningsAmount.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted, #64748b)', letterSpacing: '0.8px', marginTop: '4px', textTransform: 'uppercase' }}>
          YOUR WEEKLY EARNINGS
        </div>
      </div>

      {/* 3. Action Cards Grid: Offer zone & Payouts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {/* Offer Zone Card */}
        <motion.div
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/delivery/offers')}
          style={{
            background: 'var(--bg-elevated, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)'
            }}>
              <LocalOfferIcon sx={{ color: '#d97706', fontSize: '18px' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #1e293b)' }}>Offer zone</span>
          </div>
          <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: '18px' }} />
        </motion.div>

        {/* Payouts Card */}
        <motion.div
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowPayModal(true)}
          style={{
            background: 'var(--bg-elevated, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(34, 197, 94, 0.2)'
            }}>
              <PaymentsIcon sx={{ color: '#15803d', fontSize: '18px' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #1e293b)' }}>Payouts</span>
          </div>
          <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: '18px' }} />
        </motion.div>
      </div>

      {/* 4. COD Remittance Limit Card (RapidCloth) */}
      <div style={{
        background: isBlocked ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-elevated, #ffffff)',
        border: `1px solid ${isBlocked ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
        borderRadius: '12px',
        padding: '12px 14px',
        marginBottom: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              COD Cash Collected
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: isBlocked ? '#dc2626' : 'var(--text-primary, #0f172a)' }}>
              ₹{cashCollected.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>/ ₹{cashLimit} limit</span>
            </div>
          </div>
          <button
            onClick={() => setShowPayModal(true)}
            style={{
              padding: '6px 12px', borderRadius: '10px',
              background: isBlocked ? '#dc2626' : '#ff6b00',
              border: 'none', color: '#ffffff', fontWeight: 800, fontSize: '11px',
              display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255, 107, 0, 0.25)'
            }}
          >
            <ArrowDownwardIcon sx={{ fontSize: '14px' }} /> Remit Cash
          </button>
        </div>

        {/* Limit Bar */}
        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, (cashCollected / cashLimit) * 100)}%`,
            background: isBlocked ? '#ef4444' : 'linear-gradient(90deg, #ff6b00, #ff8c00)',
            borderRadius: '3px', transition: 'width 0.4s'
          }} />
        </div>
      </div>

      {/* 5. Section Header & Filter Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          WEEKLY EARNINGS HISTORY ({weekRange.label})
        </h3>
        <button
          onClick={() => setShowDetailsModal(true)}
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            background: '#000000',
            color: '#ffffff',
            border: 'none',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.2px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
          }}
        >
          All Details
        </button>
      </div>

      {/* 6. Main Weekly Earnings Content */}
      {weeklyEarningsAmount === 0 && weekDeliveries.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px' }}>
          <div style={{ position: 'relative', width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* 1st Order + Star Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '-10px', zIndex: 2 }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#ff6b00', display: 'flex', alignItems: 'center', gap: '2px' }}>
                1st <StarIcon sx={{ fontSize: '18px', color: '#000000' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ff6b00', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ORDER
              </div>
            </div>

            {/* Rounded Speech Bubble */}
            <div style={{
              width: '100%',
              background: 'var(--bg-elevated, #ffffff)',
              border: '1.5px solid var(--border, #e2e8f0)',
              borderRadius: '140px',
              padding: '26px 20px',
              textAlign: 'center',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', lineHeight: 1.2 }}>
                Let's deliver
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
                our first order of the week!
              </div>
            </div>

            {/* Bubble Tail */}
            <div style={{
              width: '18px', height: '18px', background: 'var(--bg-elevated, #ffffff)',
              borderRight: '1.5px solid var(--border, #e2e8f0)', borderBottom: '1.5px solid var(--border, #e2e8f0)',
              transform: 'rotate(45deg)', marginTop: '-10px', zIndex: 2
            }} />

            {/* Partner Avatar Illustration */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Body / Orange Polo Shirt */}
                <path d="M35 190 C35 140, 58 115, 100 115 C142 115, 165 140, 165 190 Z" fill="#ff6b00" />
                {/* Collar */}
                <path d="M78 115 L100 138 L122 115 L107 115 L100 124 L93 115 Z" fill="#1e293b" />
                {/* RapidCloth badge */}
                <rect x="130" y="142" width="18" height="18" rx="5" fill="#ffffff" />
                <path d="M134 146 H144 V156 H134 Z" fill="#ff6b00" />

                {/* Neck */}
                <rect x="90" y="100" width="20" height="20" fill="#f8a978" rx="4" />

                {/* Face */}
                <circle cx="100" cy="76" r="34" fill="#f8a978" />
                {/* Ears */}
                <circle cx="65" cy="76" r="7" fill="#f8a978" />
                <circle cx="135" cy="76" r="7" fill="#f8a978" />

                {/* Black Hair */}
                <path d="M65 72 C65 42, 78 36, 100 36 C122 36, 135 42, 135 72 C135 56, 118 46, 100 46 C82 46, 65 56, 65 72 Z" fill="#1e1e1e" />

                {/* Eyes */}
                <ellipse cx="85" cy="72" rx="3.5" ry="4.5" fill="#1e1e1e" />
                <ellipse cx="115" cy="72" rx="3.5" ry="4.5" fill="#1e1e1e" />

                {/* Eyebrows */}
                <path d="M80 64 Q85 61 90 64" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M110 64 Q115 61 120 64" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round" />

                {/* Mustache & Smile */}
                <path d="M80 82 Q100 94 120 82 Q100 87 80 82 Z" fill="#1e1e1e" />
                <path d="M88 90 Q100 98 112 90" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" fill="none" />

                {/* Waving Hand */}
                <g transform="translate(142, 105) rotate(-10)">
                  <path d="M12 40 L12 12 C12 7, 20 7, 20 12 L20 35" stroke="#f8a978" strokeWidth="12" strokeLinecap="round" />
                  <circle cx="16" cy="10" r="7" fill="#f8a978" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      ) : (
        /* Deliveries List for Selected Week */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {weekDeliveries.map((delivery) => (
            <div
              key={delivery._id}
              style={{
                background: 'var(--bg-elevated, #ffffff)',
                borderRadius: '18px',
                padding: '16px 18px',
                border: '1px solid var(--border, #e2e8f0)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>
                  #{delivery._id.slice(-6).toUpperCase()}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', fontWeight: 600 }}>
                  {delivery.deliveryDistanceKm ? `${delivery.deliveryDistanceKm.toFixed(1)} km` : 'Standard delivery'} · {new Date(delivery.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#16a34a', fontWeight: 900, fontSize: '16px' }}>
                  +₹{delivery.deliveryEarnings?.toFixed(2) || '0.00'}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  marginTop: '2px',
                  color: delivery.paymentMethod === 'cod' ? '#d97706' : '#2563eb'
                }}>
                  {delivery.paymentMethod === 'cod' ? `COD: ₹${delivery.totalAmount}` : 'Prepaid'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. All Details / Breakdown Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
              zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
            }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              style={{
                background: '#ffffff', width: '100%', maxWidth: '560px',
                borderTopLeftRadius: '28px', borderTopRightRadius: '28px',
                padding: '24px 20px 40px', maxHeight: '85vh', overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>Weekly Earnings Details</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{weekRange.label}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <CloseIcon sx={{ color: '#475569', fontSize: '20px' }} />
                </button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
                <button
                  onClick={() => setActiveTab('deliveries')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                    background: activeTab === 'deliveries' ? '#ffffff' : 'transparent',
                    fontWeight: 800, fontSize: '13px', color: activeTab === 'deliveries' ? '#0f172a' : '#64748b',
                    boxShadow: activeTab === 'deliveries' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Deliveries ({weekDeliveries.length})
                </button>
                <button
                  onClick={() => setActiveTab('remittance')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                    background: activeTab === 'remittance' ? '#ffffff' : 'transparent',
                    fontWeight: 800, fontSize: '13px', color: activeTab === 'remittance' ? '#0f172a' : '#64748b',
                    boxShadow: activeTab === 'remittance' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Remittance Logs ({remittanceHistory.length})
                </button>
              </div>

              {/* Content */}
              {activeTab === 'deliveries' ? (
                weekDeliveries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {weekDeliveries.map(delivery => (
                      <div key={delivery._id} style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>#{delivery._id.slice(-6).toUpperCase()}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{new Date(delivery.updatedAt).toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 900, color: '#16a34a', fontSize: '15px' }}>₹{delivery.deliveryEarnings}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{delivery.paymentMethod.toUpperCase()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontSize: '13px', fontWeight: 600 }}>No delivery records for this period.</p>
                )
              ) : (
                remittanceHistory.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {remittanceHistory.map((log, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpwardIcon sx={{ fontSize: '18px' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>Remitted Cash</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(log.date).toLocaleString()}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: '16px', color: '#0f172a' }}>₹{log.amount}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontSize: '13px', fontWeight: 600 }}>No remittance records found.</p>
                )
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Pay / Remit Cash Modal */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
              style={{ background: '#ffffff', borderRadius: '24px', padding: '26px', width: '100%', maxWidth: '380px' }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>Remit Cash to Company</h3>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Enter the cash amount to deposit.</p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>AMOUNT (₹)</label>
                <input
                  autoFocus
                  type="number"
                  placeholder="0.00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '12px',
                    background: '#f8fafc', border: '1.5px solid #cbd5e1',
                    color: '#0f172a', fontSize: '20px', fontWeight: 800, outline: 'none'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>Current COD Cash: <strong>₹{cashCollected}</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowPayModal(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: '#f1f5f9', border: 'none', color: '#475569',
                    fontSize: '14px', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={paying || !payAmount}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: '#ff6b00', border: 'none', color: '#ffffff',
                    fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                    opacity: (paying || !payAmount) ? 0.6 : 1
                  }}
                >
                  {paying ? '...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
