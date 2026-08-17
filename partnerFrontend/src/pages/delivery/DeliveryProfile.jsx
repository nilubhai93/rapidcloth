import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserRounded';
import MedicalServicesIcon from '@mui/icons-material/MedicalServicesRounded';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceRounded';
import LanguageIcon from '@mui/icons-material/LanguageRounded';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMicRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import toast from 'react-hot-toast';

export default function DeliveryProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { langCode, t, changeLanguage } = useLanguage();

  // Profile fields state
  const [phone, setPhone] = useState(user?.phone || '7407856206');
  const [city, setCity] = useState(user?.city || 'Kolkata');
  const [zone, setZone] = useState(user?.zone || 'Barrackpore');
  const [category, setCategory] = useState('Clothing, Quick Delivery, Express');
  const [joiningDate] = useState('25/12/2024');
  const [rating] = useState(4.92);

  // Bank details state
  const [bankDetails] = useState({
    accountNumber: '•••• •••• 4920',
    ifsc: 'HDFC0001234',
    bankName: 'HDFC Bank',
    holderName: user?.name || 'ASTIK MANDAL'
  });

  // Languages display names map
  const langNames = {
    en: 'English',
    hi: 'Hindi (हिंदी)',
    bn: 'Bengali (বাংলা)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)'
  };

  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'editField' | 'insurance' | 'emergency' | 'bank' | 'language' | 'rating'
  const [editConfig, setEditConfig] = useState({ field: '', label: '', value: '' });

  const languageOptions = [
    { code: 'en', name: 'English', label: 'English' },
    { code: 'hi', name: 'Hindi', label: 'Hindi (हिंदी)' },
    { code: 'bn', name: 'Bengali', label: 'Bengali (বাংলা)' },
    { code: 'ta', name: 'Tamil', label: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu', label: 'Telugu (తెలుగు)' }
  ];

  const handleOpenEdit = (field, label, currentValue) => {
    setEditConfig({ field, label, value: currentValue });
    setActiveModal('editField');
  };

  const handleSaveEdit = () => {
    if (editConfig.field === 'phone') setPhone(editConfig.value);
    if (editConfig.field === 'city') setCity(editConfig.value);
    if (editConfig.field === 'zone') setZone(editConfig.value);
    if (editConfig.field === 'category') setCategory(editConfig.value);
    toast.success(`${editConfig.label} updated successfully!`);
    setActiveModal(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '10px 10px 80px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: 'var(--text-primary, #0f172a)'
      }}
    >
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--bg-elevated, #ffffff)',
            border: 'none',
            color: 'var(--text-primary, #0f172a)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '18px' }} />
        </button>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.2px' }}>
          {t('profileTitle')}
        </h1>
        <div style={{ width: '32px' }} />
      </div>

      {/* 2. Partner Header Card */}
      <div style={{
        background: 'var(--bg-elevated, #ffffff)',
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        border: '1px solid var(--border, #e2e8f0)',
        marginBottom: '14px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff5400 0%, #ff3b00 100%)',
              color: '#ffffff', fontSize: '20px', fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 84, 0, 0.25)'
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div style={{
              position: 'absolute', bottom: '1px', right: '1px',
              width: '12px', height: '12px', borderRadius: '50%',
              background: '#22c55e', border: '2px solid #ffffff'
            }} />
          </div>

          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.3px' }}>
              {user?.name?.toUpperCase() || 'ASTIK MANDAL'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 700, marginTop: '1px' }}>
              DE ID: #{user?._id?.slice(-8).toUpperCase() || '19685857'}
            </div>

            {/* Ratings Badge */}
            <div
              onClick={() => setActiveModal('rating')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                marginTop: '4px', cursor: 'pointer',
                background: '#fff7ed', border: '1px solid #ffedd5',
                padding: '2px 8px', borderRadius: '8px'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#ea580c' }}>{t('yourRatings')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#eab308', fontWeight: 800, fontSize: '11px' }}>
                <StarIcon sx={{ fontSize: '13px' }} />
                <span>{rating}</span>
              </div>
              <ChevronRightIcon sx={{ fontSize: '13px', color: '#ea580c' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Account & Details Grid Card */}
      <div style={{
        background: 'var(--bg-elevated, #ffffff)',
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        border: '1px solid var(--border, #e2e8f0)',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Mobile Number */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
              <span>{t('mobileNumber')}</span>
              <EditIcon
                onClick={() => handleOpenEdit('phone', t('mobileNumber'), phone)}
                sx={{ fontSize: '13px', color: '#ff6b00', cursor: 'pointer' }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
              {phone}
            </div>
          </div>

          {/* Joining Date */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
              {t('joiningDate')}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
              {joiningDate}
            </div>
          </div>

          {/* City */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
              <span>{t('city')}</span>
              <EditIcon
                onClick={() => handleOpenEdit('city', t('city'), city)}
                sx={{ fontSize: '13px', color: '#ff6b00', cursor: 'pointer' }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
              {city}
            </div>
          </div>

          {/* Zone */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
              <span>{t('zone')}</span>
              <EditIcon
                onClick={() => handleOpenEdit('zone', t('zone'), zone)}
                sx={{ fontSize: '13px', color: '#ff6b00', cursor: 'pointer' }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
              {zone}
            </div>
          </div>
        </div>

        {/* Order Category Divider & Row */}
        <div style={{ borderTop: '1px solid var(--border, #f1f5f9)', marginTop: '12px', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
            <span>{t('orderCategory')}</span>
            <EditIcon
              onClick={() => handleOpenEdit('category', t('orderCategory'), category)}
              sx={{ fontSize: '13px', color: '#ff6b00', cursor: 'pointer' }}
            />
          </div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px', lineHeight: 1.3 }}>
            {category}
          </div>
        </div>
      </div>

      {/* 4. Action Details List Card */}
      <div style={{
        background: 'var(--bg-elevated, #ffffff)',
        borderRadius: '12px',
        padding: '4px 12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        border: '1px solid var(--border, #e2e8f0)',
        marginBottom: '16px'
      }}>
        {[
          {
            id: 'insurance',
            label: t('insuranceDetails'),
            subtitle: t('insuranceSubtitle'),
            icon: <VerifiedUserIcon sx={{ color: '#10b981', fontSize: '18px' }} />,
            bg: '#dcfce7'
          },
          {
            id: 'emergency',
            label: t('emergencyDetails'),
            subtitle: t('emergencySubtitle'),
            icon: <MedicalServicesIcon sx={{ color: '#3b82f6', fontSize: '18px' }} />,
            bg: '#dbeafe'
          },
          {
            id: 'bank',
            label: t('bankDetails'),
            subtitle: bankDetails.bankName,
            icon: <AccountBalanceIcon sx={{ color: '#f59e0b', fontSize: '18px' }} />,
            bg: '#fef3c7'
          },
          {
            id: 'language',
            label: t('appLanguage'),
            subtitle: langNames[langCode] || 'English',
            icon: <LanguageIcon sx={{ color: '#8b5cf6', fontSize: '18px' }} />,
            bg: '#f3e8ff'
          },
          {
            id: 'preferredLang',
            label: t('preferredLanguage'),
            subtitle: preferredLanguage,
            icon: <HeadsetMicIcon sx={{ color: '#ec4899', fontSize: '18px' }} />,
            bg: '#fce7f3'
          }
        ].map((item, idx, arr) => (
          <div
            key={item.id}
            onClick={() => setActiveModal(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 2px',
              borderBottom: idx < arr.length - 1 ? '1px dashed var(--border, #f1f5f9)' : 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 600, marginTop: '1px' }}>{item.subtitle}</div>
              </div>
            </div>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRightIcon sx={{ color: '#ff6b00', fontSize: '20px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* 5. Log Out Button */}
      <button
        onClick={() => { logout(); navigate('/login'); }}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '20px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1.5px solid rgba(239, 68, 68, 0.3)',
          color: '#dc2626',
          fontSize: '15px',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          gap: '10px',
          cursor: 'pointer'
        }}
      >
        <LogoutIcon sx={{ fontSize: '22px' }} />
        <span>{t('logOut')}</span>
      </button>

      {/* Modals Section */}
      <AnimatePresence>
        {/* Modal 1: Edit Field */}
        {activeModal === 'editField' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--bg-elevated, #ffffff)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '380px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: 0 }}>{t('edit')} {editConfig.label}</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <CloseIcon sx={{ color: '#475569', fontSize: '18px' }} />
                </button>
              </div>

              <input
                autoFocus
                type="text"
                value={editConfig.value}
                onChange={(e) => setEditConfig(prev => ({ ...prev, value: e.target.value }))}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid #cbd5e1',
                  fontSize: '16px', fontWeight: 700, color: '#0f172a', outline: 'none', marginBottom: '20px'
                }}
              />

              <button
                onClick={handleSaveEdit}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#ff6b00', color: '#ffffff', border: 'none', fontSize: '15px', fontWeight: 900, cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Modal 2: Insurance Details */}
        {activeModal === 'insurance' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--bg-elevated, #ffffff)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: 0 }}>Insurance Coverage</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <CloseIcon sx={{ color: '#475569', fontSize: '18px' }} />
                </button>
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>POLICY STATUS</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#065f46', marginTop: '2px' }}>₹5,00,000 Active Cover</div>
                <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>Valid for 7 days post active delivery.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                <div>● Policy ID: <strong>POL-889124-RC</strong></div>
                <div>● Accidental OPD: <strong>Up to ₹50,000</strong></div>
                <div>● Hospitalization: <strong>Up to ₹5,000,000</strong></div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal 3: Bank Details */}
        {activeModal === 'bank' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--bg-elevated, #ffffff)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: 0 }}>Bank Account Details</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <CloseIcon sx={{ color: '#475569', fontSize: '18px' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>ACCOUNT HOLDER</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{bankDetails.holderName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>BANK NAME</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{bankDetails.bankName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>ACCOUNT NUMBER</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{bankDetails.accountNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>IFSC CODE</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{bankDetails.ifsc}</div>
                </div>
              </div>

              <button
                onClick={() => { toast.success('Bank detail update request submitted!'); setActiveModal(null); }}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#ff6b00', color: '#ffffff', border: 'none', fontSize: '14px', fontWeight: 900, cursor: 'pointer' }}
              >
                Request Bank Detail Change
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Modal 4: App / Preferred Language */}
        {(activeModal === 'language' || activeModal === 'preferredLang') && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--bg-elevated, #ffffff)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '380px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: 0 }}>{t('selectLanguage')}</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <CloseIcon sx={{ color: '#475569', fontSize: '18px' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {languageOptions.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      if (activeModal === 'language') {
                        changeLanguage(opt.code);
                      } else {
                        setPreferredLanguage(opt.name);
                      }
                      toast.success(`App language set to ${opt.label}! 🎉`);
                      setActiveModal(null);
                    }}
                    style={{
                      padding: '14px 16px', borderRadius: '16px',
                      border: langCode === opt.code ? '2px solid #ff6b00' : '1px solid #e2e8f0',
                      background: langCode === opt.code ? '#fff7ed' : '#f8fafc',
                      fontSize: '15px', fontWeight: 800,
                      color: langCode === opt.code ? '#ea580c' : '#0f172a',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{opt.label}</span>
                    {langCode === opt.code && <span style={{ fontSize: '14px', color: '#ff6b00', fontWeight: 900 }}>✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal 5: Rating Breakdown */}
        {activeModal === 'rating' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--bg-elevated, #ffffff)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '380px', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <StarIcon sx={{ fontSize: '44px' }} />
                <span>{rating}</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', marginBottom: '4px' }}>Top Delivery Rating</h3>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '20px' }}>Based on 150 customer reviews</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 700, textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>5 Star Ratings</span>
                  <span style={{ color: '#16a34a' }}>142 deliveries</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>On-time Delivery Score</span>
                  <span style={{ color: '#16a34a' }}>99.4%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Safety Rating</span>
                  <span style={{ color: '#16a34a' }}>100%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
