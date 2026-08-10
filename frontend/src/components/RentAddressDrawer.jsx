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
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Panel sliding from Right to Left */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px', height: '100%',
              background: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Rental Theme */}
            <div style={{
              background: 'linear-gradient(135deg, #231b1c 0%, #8b1e2f 100%)',
              padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PlaceIcon style={{ fontSize: '18px', color: '#f4dcd9' }} />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
                    Select Delivery Location
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 500, margin: 0, marginTop: '2px' }}>
                    For faster shipping &amp; accurate availability
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddressOpen(false)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <CloseIcon style={{ fontSize: '18px' }} />
              </button>
            </div>

            {/* Info Banner */}
            <div style={{ background: '#fcf5f5', borderBottom: '1px solid #f4dcd9', padding: '10px 20px', display: 'flex', alignItems: 'flex-start', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '15px', marginTop: '1px', flexShrink: 0 }}>📦</span>
              <p style={{ fontSize: '11.5px', color: '#374151', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                Select a location to check <strong style={{ color: '#8b1e2f' }}>product availability</strong>, shipping charges and express rental delivery dates.
              </p>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {/* Saved Addresses Section */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                    Saved Addresses
                  </h4>
                  {isAuthenticated && user?.addresses?.length > 0 && (
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
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
                            padding: '12px 14px', borderRadius: '12px', border: `2px solid ${isActive ? '#8b1e2f' : '#e5e7eb'}`,
                            background: isActive ? '#faf0f1' : '#fafafa', cursor: 'pointer', display: 'flex', alignItems: 'flex-start',
                            gap: '12px', transition: 'all 0.2s ease', boxShadow: isActive ? '0 0 0 3px rgba(139, 30, 47, 0.08)' : 'none'
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = '#f4dcd9'; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                        >
                          <div style={{
                            marginTop: '2px', width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${isActive ? '#8b1e2f' : '#d1d5db'}`,
                            background: isActive ? '#8b1e2f' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s'
                          }}>
                            {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: isActive ? '#8b1e2f' : '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.name || 'Saved Address'}
                              </span>
                              {addr.isDefault && (
                                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '20px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                                  Default
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, lineHeight: 1.4, margin: 0 }}>
                              {addr.street}, {addr.city}, {addr.state}
                            </p>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: '2px 0 0' }}>
                              📍 {addr.zip}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '28px 20px', border: '2px dashed #e5e7eb', borderRadius: '12px', background: '#fafafa' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f3f4f6', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlaceIcon style={{ fontSize: '24px', color: '#d1d5db' }} />
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', margin: 0 }}>No saved addresses found</p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>Add an address to get started</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Address Link -> Redirects to Rental Address Page */}
              <Link
                to="/rent/addresses"
                onClick={() => setAddressOpen(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#8b1e2f',
                  textDecoration: 'none', marginBottom: '20px', padding: '10px 14px', border: '2px dashed #f4dcd9', borderRadius: '10px',
                  background: '#faf0f1', transition: 'all 0.2s', width: '100%', justifyContent: 'center'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f7e3e5'; e.currentTarget.style.borderColor = '#8b1e2f'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#faf0f1'; e.currentTarget.style.borderColor = '#f4dcd9'; }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add a new address
              </Link>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                  Or enter pincode
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              </div>

              {/* Pincode Form */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9ca3af', pointerEvents: 'none' }}>📮</span>
                  <input
                    type="text" value={pincodeInput} onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 700001" maxLength={6}
                    style={{
                      width: '100%', padding: '11px 14px 11px 34px', border: '2px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '13px', fontWeight: 600, color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: 'inherit'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#8b1e2f'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(139,30,47,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; e.target.style.boxShadow = 'none'; }}
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
                    padding: '11px 18px', background: pincodeInput.length === 6 ? '#8b1e2f' : '#e5e7eb', color: pincodeInput.length === 6 ? '#fff' : '#9ca3af',
                    border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: pincodeInput.length === 6 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', flexShrink: 0, fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => { if (pincodeInput.length === 6) e.currentTarget.style.background = '#6b1724'; }}
                  onMouseLeave={e => { if (pincodeInput.length === 6) e.currentTarget.style.background = '#8b1e2f'; }}
                >
                  Apply
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', fontWeight: 500 }}>
                Enter a valid 6-digit Indian postal code
              </p>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 20px', background: '#fafafa', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px' }}>🔒</span>
              <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 600 }}>Your address is safe &amp; secure</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
