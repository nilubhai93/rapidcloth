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
    <div style={{ minHeight: '100vh', background: '#faf9f8', color: '#231b1c' }}>
      {/* RENTAL ADDRESS NAVBAR - strictly containing Rent Button, Search Bar, and Account Option */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
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
              padding: '8px 16px', borderRadius: '10px',
              background: '#8b1e2f', color: '#fff',
              textDecoration: 'none', fontWeight: 700, fontSize: '13px',
              boxShadow: '0 2px 8px rgba(139,30,47,0.2)',
              transition: 'all 0.2s ease', flexShrink: 0
            }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} />
            Rent
          </Link>

          {/* 2. Search Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', background: '#f1f5f9',
            padding: '2px 4px', borderRadius: '12px', flex: '1 1 300px', maxWidth: '500px',
            border: '1.5px solid #e2e8f0'
          }}>
            <div style={{ padding: '6px 10px', color: '#8b1e2f', display: 'flex', alignItems: 'center' }}>
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
                padding: '8px 0', fontSize: '13.5px', color: '#231b1c',
                outline: 'none', fontWeight: 500, fontFamily: 'inherit'
              }}
            />
          </div>

          {/* 3. Account Option */}
          <Link
            to="/rent/profile"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              textDecoration: 'none', color: '#231b1c', fontWeight: 700,
              fontSize: '13px', padding: '6px 12px', borderRadius: '8px',
              transition: 'background 0.2s', flexShrink: 0
            }}
          >
            <PersonOutlineIcon sx={{ fontSize: 22, color: '#8b1e2f' }} />
            <span>Account</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '32px 24px 60px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', fontWeight: 600 }}>
          <Link to="/rent" style={{ color: '#8b1e2f', textDecoration: 'none' }}>Rental Home</Link> › <span style={{ color: '#231b1c' }}>Rental Delivery Addresses</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#231b1c', margin: 0 }}>Rental Addresses</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
              Manage your delivery locations for rental garments &amp; express pickups.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#8b1e2f', color: '#fff', border: 'none',
              padding: '10px 18px', borderRadius: '10px', fontWeight: 700,
              fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139,30,47,0.25)'
            }}
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
              border: '2px dashed #f4dcd9', 
              borderRadius: '16px', 
              minHeight: '220px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#8b1e2f',
              background: '#faf0f1',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b1e2f'; e.currentTarget.style.background = '#f7e3e5'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#f4dcd9'; e.currentTarget.style.background = '#faf0f1'; }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <AddIcon style={{ fontSize: '28px', color: '#8b1e2f' }} />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Add New Rental Address</h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: 0 }}>For fast outfit delivery</p>
          </div>

          {/* Existing Addresses */}
          {addresses.map((address, idx) => (
            <div key={address._id || idx} style={{
              border: `2px solid ${address.isDefault ? '#8b1e2f' : '#e2e8f0'}`,
              borderRadius: '16px',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              background: '#fff',
              boxShadow: address.isDefault ? '0 4px 14px rgba(139,30,47,0.1)' : '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              {address.isDefault && (
                <div style={{ padding: '8px 16px', background: '#faf0f1', borderTopLeftRadius: '14px', borderTopRightRadius: '14px', borderBottom: '1px solid #f4dcd9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlaceIcon style={{ fontSize: '16px', color: '#8b1e2f' }} />
                  <span style={{ fontSize: '11px', color: '#8b1e2f', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Default Rental Address
                  </span>
                </div>
              )}
              
              <div style={{ padding: '16px 20px', flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#231b1c' }}>{user?.name || 'Saved Address'}</p>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>{address.street}</p>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>{address.city}, {address.state} - {address.zip}</p>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>Phone: <strong style={{ color: '#231b1c' }}>{user?.phone || 'Not provided'}</strong></p>
              </div>

              <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', background: '#fafafa', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px' }}>
                <button onClick={() => handleRemove(idx)} style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Remove
                </button>
                {!address.isDefault && (
                  <>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <button onClick={() => handleSetDefault(idx)} style={{ color: '#8b1e2f', fontSize: '12px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ background: '#fff', padding: '24px 28px', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#231b1c' }}>Add New Rental Address</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Enter your complete address for garment delivery.</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <CloseIcon style={{ fontSize: '18px', color: '#64748b' }} />
                  </button>
                </div>

                <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Street address</label>
                    <input required value={form.street} onChange={e => setForm({...form, street: e.target.value})} type="text" placeholder="House no, Street name, Area" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>City</label>
                      <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} type="text" placeholder="e.g. Mumbai" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>State</label>
                      <input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} type="text" placeholder="e.g. Maharashtra" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Pincode (ZIP)</label>
                    <input required value={form.zip} onChange={e => setForm({...form, zip: e.target.value.replace(/\D/g,'').slice(0,6)})} type="text" placeholder="6-digit pincode" maxLength={6} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <input type="checkbox" id="rentIsDefault" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: '#8b1e2f' }} />
                    <label htmlFor="rentIsDefault" style={{ fontSize: '13px', color: '#231b1c', fontWeight: 600 }}>Set as my default rental address</label>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <button type="submit" style={{ background: '#8b1e2f', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, width: '100%', boxShadow: '0 4px 12px rgba(139,30,47,0.25)' }}>
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
