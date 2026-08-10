import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/SearchRounded';
import CameraAltIcon from '@mui/icons-material/CameraAltRounded';
import MicIcon from '@mui/icons-material/MicRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import RentCameraModal from '../../../components/RentCameraModal';
import RentVoiceSearchModal from '../../../components/RentVoiceSearchModal';

export default function RentCategories() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const categories = [
    { name: 'Bridal Lehengas', count: '140+ Items', icon: '👑', color: '#fdf2f8', border: '#fbcfe8', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80' },
    { name: 'Groom Sherwanis', count: '95+ Items', icon: '👔', color: '#f0fdf4', border: '#bbf7d0', img: 'https://images.unsplash.com/photo-1594938298598-708a31ec2f15?w=500&q=80' },
    { name: 'Cocktail Gowns', count: '120+ Items', icon: '👗', color: '#faf5ff', border: '#e9d5ff', img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80' },
    { name: 'Tuxedos & Suits', count: '80+ Items', icon: '💼', color: '#f1f5f9', border: '#cbd5e1', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&q=80' },
    { name: 'Indo-Western Sets', count: '65+ Items', icon: '✨', color: '#fff7ed', border: '#fed7aa', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80' },
    { name: 'Anarkalis & Suits', count: '110+ Items', icon: '🌸', color: '#fcf5f5', border: '#f4dcd9', img: 'https://images.unsplash.com/photo-1515347619362-7935764d2625?w=500&q=80' },
    { name: 'Designer Sarees', count: '75+ Items', icon: '✨', color: '#fefce8', border: '#fef08a', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80' },
    { name: 'Jewelry & Accessories', count: '150+ Items', icon: '💎', color: '#f0f9ff', border: '#bae6fd', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80' }
  ];

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/rent?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f8', color: '#231b1c' }}>
      {/* Top Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/rent" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8b1e2f', textDecoration: 'none', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
            Rent
          </Link>

          {/* Search Bar with Camera and Mic */}
          <div style={{
            display: 'flex', alignItems: 'center', background: '#f1f5f9',
            padding: '2px 8px 2px 12px', borderRadius: '14px', flex: 1, border: '1.5px solid #e2e8f0'
          }}>
            <SearchIcon sx={{ color: '#8b1e2f', fontSize: 20, marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search designer lehengas, suits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                padding: '8px 0', fontSize: '13.5px', color: '#231b1c',
                outline: 'none', fontWeight: 500, fontFamily: 'inherit'
              }}
            />
            {/* Camera Logo */}
            <button
              onClick={() => setCameraOpen(true)}
              title="Visual Search"
              style={{ border: 'none', background: 'transparent', padding: '6px', cursor: 'pointer', color: '#8b1e2f', display: 'flex', alignItems: 'center' }}
            >
              <CameraAltIcon sx={{ fontSize: 20 }} />
            </button>
            {/* Microphone Logo */}
            <button
              onClick={() => setVoiceOpen(true)}
              title="Voice Search"
              style={{ border: 'none', background: 'transparent', padding: '6px', cursor: 'pointer', color: '#8b1e2f', display: 'flex', alignItems: 'center' }}
            >
              <MicIcon sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Categories Body */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#231b1c', margin: 0 }}>Rental Categories</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
              Browse premium designer outfits available for instant rental.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#8b1e2f', background: '#faf0f1', padding: '6px 12px', borderRadius: '20px', border: '1px solid #f4dcd9' }}>
            ✨ AI Verified Dry-Cleaned
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/rent/category?name=${encodeURIComponent(cat.name)}`)}
              style={{
                background: '#fff', borderRadius: '16px', border: `1.5px solid ${cat.border}`,
                overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, color: '#231b1c' }}>
                  {cat.icon} {cat.count}
                </div>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: cat.color }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#231b1c', margin: 0 }}>{cat.name}</h3>
                <span style={{ color: '#8b1e2f', fontWeight: 800, fontSize: '16px' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <RentCameraModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} />
      <RentVoiceSearchModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} onQuerySubmit={(q) => setSearchQuery(q)} />
    </div>
  );
}
