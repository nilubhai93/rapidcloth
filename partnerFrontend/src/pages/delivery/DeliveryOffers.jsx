import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBikeRounded';
import ElectricBoltIcon from '@mui/icons-material/ElectricBoltRounded';

export default function DeliveryOffers() {
  const navigate = useNavigate();

  const offers = [
    { id: 1, title: 'Downtown Peak Pay', amount: '+₹25', desc: 'Extra per delivery in Barrackpore & Station area.', time: 'Active until 11:00 PM', type: 'peak' },
    { id: 2, title: 'Weekend Quest', amount: '₹500 Bonus', desc: 'Complete 25 deliveries between Fri-Sun.', time: 'Expires in 2 days', type: 'quest' },
    { id: 3, title: 'Rain Boost', amount: '+1.5x Fare', desc: 'Surge pricing active due to rain conditions.', time: 'Active now', type: 'surge' },
  ];

  const getIcon = (type) => {
    if (type === 'peak') return <ElectricBoltIcon sx={{ color: '#f59e0b', fontSize: '24px' }} />;
    if (type === 'surge') return <ElectricBoltIcon sx={{ color: '#3b82f6', fontSize: '24px' }} />;
    return <LocalOfferIcon sx={{ color: '#10b981', fontSize: '24px' }} />;
  };

  const getIconBg = (type) => {
    if (type === 'peak') return '#fef3c7';
    if (type === 'surge') return '#dbeafe';
    return '#dcfce7';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '10px 10px 85px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: 'var(--text-primary, #0f172a)'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--bg-elevated, #ffffff)',
            border: 'none',
            color: 'var(--text-primary, #0f172a)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '19px' }} />
        </button>

        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.2px' }}>
          Offers & Quests
        </h1>

        <div style={{ width: '34px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {offers.map(offer => (
          <motion.div
            key={offer.id}
            whileHover={{ y: -1 }}
            style={{
              background: 'var(--bg-elevated, #ffffff)',
              border: '1px solid var(--border, #e2e8f0)',
              borderRadius: '16px',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: getIconBg(offer.type), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getIcon(offer.type)}
              </div>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontWeight: 900, fontSize: '12px' }}>
                {offer.amount}
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: '0 0 4px 0' }}>{offer.title}</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>{offer.desc}</p>

            <div style={{ borderTop: '1px dashed var(--border, #f1f5f9)', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>{offer.time}</span>
              <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>Active</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
