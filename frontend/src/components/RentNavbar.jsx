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
      background: 'rgba(11, 19, 43, 0.96)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        maxWidth: '1440px', margin: '0 auto',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
      {/* Back to Rent */}
      <Link to="/rent" style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        color: '#d4af37', textDecoration: 'none', fontWeight: 700, fontSize: '14px',
        transition: 'all 0.2s'
      }}>
        <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16, color: '#d4af37' }} />
        Browse Rentals
      </Link>

      {/* Title */}
      <span style={{ fontWeight: 800, fontSize: '16px', color: '#ffffff', letterSpacing: '0.3px' }}>
        {isCart ? '🛍️ Rental Bag' : isProfile ? '👤 Rental Account' : 'Rent Fashion'}
      </span>

      {/* Right icons */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/rent/cart" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textDecoration: 'none', color: isCart ? '#d4af37' : 'rgba(212, 175, 55, 0.7)',
          position: 'relative',
        }}>
          <ShoppingBagOutlinedIcon sx={{ fontSize: 24, color: isCart ? '#f5d061' : '#d4af37' }} />
          {rentalCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-6px',
              background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0b132b', borderRadius: '50%',
              width: '16px', height: '16px', fontSize: '10px', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>{rentalCount}</span>
          )}
          <span style={{ fontSize: '10px', fontWeight: 600, marginTop: '2px', color: isCart ? '#f5d061' : '#cbd5e1' }}>Cart</span>
        </Link>
        <Link to="/rent/profile" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textDecoration: 'none', color: isProfile ? '#d4af37' : 'rgba(212, 175, 55, 0.7)',
        }}>
          <PersonOutlineRoundedIcon sx={{ fontSize: 24, color: isProfile ? '#f5d061' : '#d4af37' }} />
          <span style={{ fontSize: '10px', fontWeight: 600, marginTop: '2px', color: isProfile ? '#f5d061' : '#cbd5e1' }}>Account</span>
        </Link>
      </div>
      </div>
    </div>
  );
}
