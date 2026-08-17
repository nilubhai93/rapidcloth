import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AddIcon from '@mui/icons-material/AddRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import PlaceIcon from '@mui/icons-material/PlaceRounded';
import { motion, AnimatePresence } from 'framer-motion';

export default function RentAddresses() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false
  });

  const addresses = user?.addresses || [];

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!form.street || !form.city || !form.zip) return;

    try {
      const newAddresses = [...addresses];
      
      if (form.isDefault || newAddresses.length === 0) {
        newAddresses.forEach(a => a.isDefault = false);
      }
      
      newAddresses.push({
        ...form,
        isDefault: form.isDefault || newAddresses.length === 0
      });

      await updateProfile({ addresses: newAddresses });
      setIsAdding(false);
      setForm({ street: '', city: '', state: '', zip: '', isDefault: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (index) => {
    try {
      const newAddresses = addresses.filter((_, i) => i !== index);
      if (addresses[index]?.isDefault && newAddresses.length > 0) {
        newAddresses[0].isDefault = true;
      }
      await updateProfile({ addresses: newAddresses });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (index) => {
    try {
      const newAddresses = addresses.map((a, i) => ({
        ...a,
        isDefault: i === index
      }));
      await updateProfile({ addresses: newAddresses });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/rent?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a1128', color: '#ffffff', fontFamily: 'var(--font-sans)' }}>
      {/* RENTAL ADDRESS NAVBAR */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#0b132b',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          maxWidth: '1440px', margin: '0 auto',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap'
        }}>
          {/* 1. Rent Button */}
          <Link
            to="/rent"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 18px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128',
              textDecoration: 'none', fontWeight: 800, fontSize: '13px',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.2s ease', flexShrink: 0
            }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 14, color: '#0a1128' }} />
            Rent
          </Link>

          {/* 2. Search Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', background: '#0e1838',
            padding: '2px 4px', borderRadius: '12px', flex: '1 1 300px', maxWidth: '500px',
            border: '1.5px solid #d4af37'
          }}>
            <div style={{ padding: '6px 10px', color: '#f5d061', display: 'flex', alignItems: 'center' }}>
              <SearchIcon sx={{ fontSize: 20 }} />
            </div>
            <input
              type="text"
              placeholder="Search designer outfits to rent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                padding: '8px 0', fontSize: '13.5px', color: '#ffffff',
                outline: 'none', fontWeight: 500, fontFamily: 'inherit'
              }}
            />
          </div>

          {/* 3. Account Option */}
          <Link
            to="/rent/profile"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              textDecoration: 'none', color: '#f5d061', fontWeight: 700,
              fontSize: '13px', padding: '6px 12px', borderRadius: '8px',
              transition: 'background 0.2s', flexShrink: 0
            }}
          >
            <PersonOutlineIcon sx={{ fontSize: 22, color: '#f5d061' }} />
            <span style={{ color: '#ffffff' }}>Account</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '32px 24px 60px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', fontWeight: 600 }}>
          <Link to="/rent" style={{ color: '#f5d061', textDecoration: 'none' }}>Rental Home</Link> › <span style={{ color: '#cbd5e1' }}>Rental Delivery Addresses</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: 0 }}>Rental Addresses</h1>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0', fontWeight: 500 }}>
              Manage your delivery locations for rental garments &amp; express pickups.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128', border: 'none',
              padding: '10px 18px', borderRadius: '10px', fontWeight: 800,
              fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <AddIcon style={{ fontSize: '18px' }} />
            Add New Address
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Add Address Card */}
          <div 
            onClick={() => setIsAdding(true)}
            style={{ 
              border: '2px dashed rgba(212, 175, 55, 0.4)', 
              borderRadius: '16px', 
              minHeight: '220px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              color: '#f5d061',
              background: '#0e1838',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4af37'; e.currentTarget.style.background = '#111d40'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'; e.currentTarget.style.background = '#0e1838'; }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              <AddIcon style={{ fontSize: '28px', color: '#f5d061' }} />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ffffff' }}>Add New Rental Address</h2>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', margin: 0 }}>For fast outfit delivery</p>
          </div>

          {/* Existing Addresses */}
          {addresses.map((address, idx) => (
            <div key={address._id || idx} style={{
              border: `2px solid ${address.isDefault ? '#d4af37' : 'rgba(212, 175, 55, 0.25)'}`,
              borderRadius: '16px',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              background: '#111d40',
              boxShadow: address.isDefault ? '0 4px 20px rgba(212, 175, 55, 0.2)' : '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              {address.isDefault && (
                <div style={{ padding: '8px 16px', background: 'rgba(212, 175, 55, 0.15)', borderTopLeftRadius: '14px', borderTopRightRadius: '14px', borderBottom: '1px solid rgba(212, 175, 55, 0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlaceIcon style={{ fontSize: '16px', color: '#f5d061' }} />
                  <span style={{ fontSize: '11px', color: '#f5d061', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Default Rental Address
                  </span>
                </div>
              )}
              
              <div style={{ padding: '16px 20px', flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>{user?.name || 'Saved Address'}</p>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.4 }}>{address.street}</p>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#f5d061', fontWeight: 600 }}>{address.city}, {address.state} - {address.zip}</p>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8' }}>Phone: <strong style={{ color: '#ffffff' }}>{user?.phone || 'Not provided'}</strong></p>
              </div>

              <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', gap: '12px', background: '#0e1838', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px' }}>
                <button onClick={() => handleRemove(idx)} style={{ color: '#f87171', fontSize: '12px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Remove
                </button>
                {!address.isDefault && (
                  <>
                    <span style={{ color: 'rgba(212, 175, 55, 0.3)' }}>•</span>
                    <button onClick={() => handleSetDefault(idx)} style={{ color: '#f5d061', fontSize: '12px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Set as Default
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Address Modal */}
        <AnimatePresence>
          {isAdding && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 10, 25, 0.75)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ background: '#0a1128', padding: '24px 28px', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>Add New Rental Address</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>Enter your complete address for garment delivery.</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} style={{ background: 'rgba(212, 175, 55, 0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f5d061' }}>
                    <CloseIcon style={{ fontSize: '18px' }} />
                  </button>
                </div>

                <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f5d061', marginBottom: '4px' }}>Street address</label>
                    <input required value={form.street} onChange={e => setForm({...form, street: e.target.value})} type="text" placeholder="House no, Street name, Area" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(212, 175, 55, 0.3)', borderRadius: '10px', outline: 'none', fontSize: '13px', boxSizing: 'border-box', background: '#0e1838', color: '#ffffff' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f5d061', marginBottom: '4px' }}>City</label>
                      <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} type="text" placeholder="e.g. Mumbai" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(212, 175, 55, 0.3)', borderRadius: '10px', outline: 'none', fontSize: '13px', boxSizing: 'border-box', background: '#0e1838', color: '#ffffff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f5d061', marginBottom: '4px' }}>State</label>
                      <input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} type="text" placeholder="e.g. Maharashtra" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(212, 175, 55, 0.3)', borderRadius: '10px', outline: 'none', fontSize: '13px', boxSizing: 'border-box', background: '#0e1838', color: '#ffffff' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f5d061', marginBottom: '4px' }}>Pincode (ZIP)</label>
                    <input required value={form.zip} onChange={e => setForm({...form, zip: e.target.value.replace(/\D/g,'').slice(0,6)})} type="text" placeholder="6-digit pincode" maxLength={6} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(212, 175, 55, 0.3)', borderRadius: '10px', outline: 'none', fontSize: '13px', boxSizing: 'border-box', background: '#0e1838', color: '#ffffff' }} />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <input type="checkbox" id="rentIsDefault" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: '#d4af37' }} />
                    <label htmlFor="rentIsDefault" style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>Set as my default rental address</label>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <button type="submit" style={{ background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128', border: 'none', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 800, width: '100%', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)' }}>
                      Save Rental Address
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
