import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PlaceIcon from '@mui/icons-material/PlaceRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { useAuth } from '../context/AuthContext';

export default function RentAddressDrawer({ addressOpen, setAddressOpen, selectedAddress, setSelectedAddress }) {
  const { user, isAuthenticated } = useAuth();
  const [pincodeInput, setPincodeInput] = useState('');

  return (
    <AnimatePresence>
      {addressOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setAddressOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 10, 25, 0.75)', backdropFilter: 'blur(4px)' }}
          />

          {/* Panel sliding from Right to Left */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px', height: '100%',
              background: '#0a1128', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              borderLeft: '1px solid rgba(212, 175, 55, 0.25)', color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Rental Theme */}
            <div style={{
              background: 'linear-gradient(135deg, #070d1e 0%, #111d40 100%)',
              padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <PlaceIcon style={{ fontSize: '18px', color: '#f5d061' }} />
                </div>
                <div>
                  <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
                    Select Delivery Location
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: 500, margin: 0, marginTop: '2px' }}>
                    For faster shipping &amp; accurate availability
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddressOpen(false)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: 'none', cursor: 'pointer', color: '#f5d061',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'}
              >
                <CloseIcon style={{ fontSize: '18px' }} />
              </button>
            </div>

            {/* Info Banner */}
            <div style={{ background: '#0e1838', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', padding: '10px 20px', display: 'flex', alignItems: 'flex-start', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '15px', marginTop: '1px', flexShrink: 0 }}>📦</span>
              <p style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                Select a location to check <strong style={{ color: '#f5d061' }}>product availability</strong>, shipping charges and express rental delivery dates.
              </p>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {/* Saved Addresses Section */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#f5d061', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                    Saved Addresses
                  </h4>
                  {isAuthenticated && user?.addresses?.length > 0 && (
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                      {user.addresses.length} address{user.addresses.length > 1 ? 'es' : ''}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {isAuthenticated && user?.addresses?.length > 0 ? (
                    user.addresses.map((addr, index) => {
                      const isActive = selectedAddress ? selectedAddress._id === addr._id : (addr.isDefault || index === 0);
                      return (
                        <div
                          key={addr._id || index}
                          onClick={() => { setSelectedAddress(addr); setAddressOpen(false); }}
                          style={{
                            padding: '12px 14px', borderRadius: '12px', border: `2px solid ${isActive ? '#d4af37' : 'rgba(212, 175, 55, 0.2)'}`,
                            background: isActive ? '#111d40' : '#0e1838', cursor: 'pointer', display: 'flex', alignItems: 'flex-start',
                            gap: '12px', transition: 'all 0.2s ease', boxShadow: isActive ? '0 0 15px rgba(212, 175, 55, 0.2)' : 'none'
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)'; }}
                        >
                          <div style={{
                            marginTop: '2px', width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${isActive ? '#d4af37' : 'rgba(212, 175, 55, 0.4)'}`,
                            background: isActive ? 'linear-gradient(135deg, #f5d061, #d4af37)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s'
                          }}>
                            {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0a1128' }} />}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: isActive ? '#f5d061' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.name || 'Saved Address'}
                              </span>
                              {addr.isDefault && (
                                <span style={{ background: 'rgba(212, 175, 55, 0.2)', color: '#f5d061', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '2px 6px', borderRadius: '20px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                                  Default
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500, lineHeight: 1.4, margin: 0 }}>
                              {addr.street}, {addr.city}, {addr.state}
                            </p>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#f5d061', margin: '2px 0 0' }}>
                              📍 {addr.zip}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '28px 20px', border: '2px dashed rgba(212, 175, 55, 0.3)', borderRadius: '12px', background: '#0e1838' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlaceIcon style={{ fontSize: '24px', color: '#f5d061' }} />
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', margin: 0 }}>No saved addresses found</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>Add an address to get started</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Address Link -> Redirects to Rental Address Page */}
              <Link
                to="/rent/addresses"
                onClick={() => setAddressOpen(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#f5d061',
                  textDecoration: 'none', marginBottom: '20px', padding: '10px 14px', border: '2px dashed rgba(212, 175, 55, 0.4)', borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.1)', transition: 'all 0.2s', width: '100%', justifyContent: 'center'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'; e.currentTarget.style.borderColor = '#d4af37'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'; }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add a new address
              </Link>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(212, 175, 55, 0.2)' }} />
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#f5d061', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                  Or enter pincode
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(212, 175, 55, 0.2)' }} />
              </div>

              {/* Pincode Form */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#f5d061', pointerEvents: 'none' }}>📮</span>
                  <input
                    type="text" value={pincodeInput} onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 700001" maxLength={6}
                    style={{
                      width: '100%', padding: '11px 14px 11px 34px', border: '2px solid rgba(212, 175, 55, 0.3)', borderRadius: '10px',
                      fontSize: '13px', fontWeight: 600, color: '#ffffff', background: '#0e1838', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: 'inherit'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#d4af37'; e.target.style.background = '#111d40'; e.target.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'; e.target.style.background = '#0e1838'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <button
                  onClick={() => {
                    if (pincodeInput.trim().length === 6) {
                      setSelectedAddress({ type: 'pincode', zip: pincodeInput.trim() });
                      setAddressOpen(false);
                    }
                  }}
                  style={{
                    padding: '11px 18px', background: pincodeInput.length === 6 ? 'linear-gradient(135deg, #f5d061, #d4af37)' : 'rgba(212, 175, 55, 0.2)', color: pincodeInput.length === 6 ? '#0a1128' : '#94a3b8',
                    border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: pincodeInput.length === 6 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', flexShrink: 0, fontFamily: 'inherit',
                    boxShadow: pincodeInput.length === 6 ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none'
                  }}
                  onMouseEnter={e => { if (pincodeInput.length === 6) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { if (pincodeInput.length === 6) e.currentTarget.style.transform = 'none'; }}
                >
                  Apply
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', fontWeight: 500 }}>
                Enter a valid 6-digit Indian postal code
              </p>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)', padding: '14px 20px', background: '#070d1e', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px' }}>🔒</span>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600 }}>Your address is safe &amp; secure</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
