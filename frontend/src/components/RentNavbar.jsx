import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';

export default function RentNavbar() {
  const location = useLocation();
  const { items } = useCart();
  const rentalCount = items.filter(i => i.isRental).reduce((acc, i) => acc + i.quantity, 0);

  const isCart = location.pathname === '/rent/cart';
  const isProfile = location.pathname === '/rent/profile';

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Back to Rent */}
      <Link to="/rent" style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        color: '#4f46e5', textDecoration: 'none', fontWeight: 700, fontSize: '14px',
      }}>
        <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
        Browse Rentals
      </Link>

      {/* Title */}
      <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
        {isCart ? '🛍️ Rental Bag' : isProfile ? '👤 Rental Account' : 'Rent Fashion'}
      </span>

      {/* Right icons */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/rent/cart" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textDecoration: 'none', color: isCart ? '#4f46e5' : '#64748b',
          position: 'relative',
        }}>
          <ShoppingBagOutlinedIcon sx={{ fontSize: 24 }} />
          {rentalCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-6px',
              background: '#4f46e5', color: 'white', borderRadius: '50%',
              width: '16px', height: '16px', fontSize: '10px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{rentalCount}</span>
          )}
          <span style={{ fontSize: '10px', fontWeight: 600, marginTop: '2px' }}>Cart</span>
        </Link>
        <Link to="/rent/profile" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textDecoration: 'none', color: isProfile ? '#4f46e5' : '#64748b',
        }}>
          <PersonOutlineRoundedIcon sx={{ fontSize: 24 }} />
          <span style={{ fontSize: '10px', fontWeight: 600, marginTop: '2px' }}>Account</span>
        </Link>
      </div>
    </div>
  );
}
