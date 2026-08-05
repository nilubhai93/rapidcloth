import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import ContactPhoneIcon from '@mui/icons-material/ContactPhoneRounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import CampaignIcon from '@mui/icons-material/CampaignRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import toast from 'react-hot-toast';

export default function DeliveryRefer() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Kolkata');
  const [referrals, setReferrals] = useState([
    // Demo item
    { id: 1, name: 'Rahul Sharma', phone: '+91 98765 43210', city: 'Kolkata', status: 'In Progress (8/15 Deliveries)', date: '2 days ago', bonus: '₹18,500' }
  ]);
  const [showBonusZonesModal, setShowBonusZonesModal] = useState(false);

  const handleReferSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim() || !name.trim()) {
      toast.error('Please fill in friend\'s name and contact number');
      return;
    }

    const newRef = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      city: city || 'Kolkata',
      status: 'Invite Sent · Target Pending',
      date: 'Just now',
      bonus: '₹18,500'
    };

    setReferrals(prev => [newRef, ...prev]);
    setName('');
    setPhone('');
    toast.success(`Referral invite sent to ${newRef.name}! 🎉`);
  };

  const highBonusZones = [
    { city: 'Kolkata (Central)', bonus: '₹18,500', demand: '🔥 Very High' },
    { city: 'Delhi NCR', bonus: '₹16,000', demand: '🔥 High' },
    { city: 'Mumbai South', bonus: '₹15,500', demand: '⚡ Popular' },
    { city: 'Bengaluru HSR', bonus: '₹14,000', demand: '⚡ High' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        paddingBottom: '100px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#0f172a'
      }}
    >
      {/* 1. Top Green Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '0 0 28px 28px',
        padding: '20px 20px 28px',
        color: '#ffffff',
        position: 'relative',
        boxShadow: '0 8px 30px rgba(16, 185, 129, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Decorative background shapes */}
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: '30px', bottom: '-40px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            cursor: 'pointer',
            marginBottom: '16px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '22px' }} />
        </button>

        {/* Header content */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, opacity: 0.95, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Earn upto
          </div>
          <div style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, margin: '2px 0 4px' }}>
            ₹18,500
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, opacity: 0.95, marginBottom: '16px' }}>
            For every referral ✨
          </div>

          <button
            onClick={() => setShowBonusZonesModal(true)}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 18px',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>SEE HIGH BONUS ZONES</span>
            <span>›</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: '20px' }}>
        {/* 2. Refer Your Friend Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          {/* Section Divider Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>
              REFER YOUR FRIEND
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          <form onSubmit={handleReferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Contact Number */}
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                placeholder="Contact number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 16px',
                  borderRadius: '16px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              <div style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: '#ffedd5', color: '#ea580c', borderRadius: '10px', padding: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ContactPhoneIcon sx={{ fontSize: '20px' }} />
              </div>
            </div>

            {/* Contact Name */}
            <div>
              <input
                type="text"
                placeholder="Contact name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
            </div>

            {/* Friend's City */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Friend's city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 16px',
                  borderRadius: '16px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              <div style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                color: '#ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <LocationOnIcon sx={{ fontSize: '22px' }} />
              </div>
            </div>

            {/* Refer Now CTA Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ff5400 0%, #ff3b00 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '16px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255, 84, 0, 0.35)',
                marginTop: '4px'
              }}
            >
              Refer Now
            </button>
          </form>

          {/* Live Recent Referral Ticker Badge */}
          <div style={{
            marginTop: '20px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '16px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ fontSize: '16px' }}>💰</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857', lineHeight: 1.3 }}>
              <strong>Paras Kumar</strong> won ₹13,248 bonus · <span style={{ opacity: 0.8 }}>21 minutes ago</span>
            </div>
          </div>
        </div>

        {/* 3. Your Referrals Section */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Section Divider Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>
              YOUR REFERRALS
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {referrals.length === 0 ? (
            /* Empty State */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                No referrals to show
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '24px' }}>
                Refer in 3 simple steps
              </p>

              {/* 3 Steps List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#f3e8ff', color: '#7c3aed', fontWeight: 900, fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    1
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    Enter your friend's details
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#f3e8ff', color: '#7c3aed', fontWeight: 900, fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    2
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    Complete the Target
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#f3e8ff', color: '#7c3aed', fontWeight: 900, fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    3
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    Enjoy the bonus
                  </div>
                </div>
              </div>

              {/* Megaphone Refer & Earn CTA */}
              <button
                onClick={() => window.scrollTo({ top: 120, behavior: 'smooth' })}
                style={{
                  padding: '14px 28px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ff5400 0%, #ff3b00 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(255, 84, 0, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>Refer & Earn now</span>
                <CampaignIcon sx={{ fontSize: '22px' }} />
              </button>
            </div>
          ) : (
            /* Referrals List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {referrals.map(ref => (
                <div key={ref.id} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                      {ref.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {ref.phone} · {ref.city}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                      ● {ref.status}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, color: '#059669', fontSize: '16px' }}>
                      {ref.bonus}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
                      {ref.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bonus Zones Modal */}
      <AnimatePresence>
        {showBonusZonesModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
            onClick={() => setShowBonusZonesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>High Bonus Zones</h3>
                <button
                  onClick={() => setShowBonusZonesModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <CloseIcon sx={{ color: '#475569', fontSize: '18px' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {highBonusZones.map((zone, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{zone.city}</div>
                      <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>{zone.demand}</div>
                    </div>
                    <div style={{ fontWeight: 900, color: '#10b981', fontSize: '16px' }}>{zone.bonus}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
