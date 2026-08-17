import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/HomeRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBagRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CategoryIcon from '@mui/icons-material/CategoryRounded';

export default function RentFooter() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();

  const rentalItemCount = (items || [])
    .filter(i => i.isRental)
    .reduce((acc, i) => acc + i.quantity, 0);

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      path: '/rent',
      icon: HomeOutlinedIcon,
      activeIcon: HomeIcon,
      match: (p) => p === '/rent'
    },
    {
      id: 'account',
      label: 'Account',
      path: '/rent/profile',
      icon: PersonOutlineIcon,
      activeIcon: PersonIcon,
      match: (p) => p === '/rent/profile' || p === '/rent/addresses'
    },
    {
      id: 'bucket',
      label: 'Bucket',
      path: '/rent/cart',
      icon: ShoppingBagOutlinedIcon,
      activeIcon: ShoppingBagIcon,
      badge: rentalItemCount,
      match: (p) => p === '/rent/cart'
    },
    {
      id: 'categories',
      label: 'Categories',
      path: '/rent/categories',
      icon: CategoryOutlinedIcon,
      activeIcon: CategoryIcon,
      match: (p) => p === '/rent/categories' || p === '/rent/category'
    }
  ];

  const isActive = (tab) => tab.match(location.pathname);

  return (
    <>
      {/* Mobile-only spacer to prevent content from hiding behind fixed footer */}
      <style>{`
        @media (max-width: 768px) {
          #rent-bottom-nav-spacer { display: block !important; }
          #rent-bottom-nav { display: block !important; }
        }
        @media (min-width: 769px) {
          #rent-bottom-nav-spacer { display: none !important; }
          #rent-bottom-nav { display: none !important; }
        }
      `}</style>
      <div id="rent-bottom-nav-spacer" style={{ height: '70px', display: 'none' }} />

      <nav
        id="rent-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#070d1e',
          borderTop: '1px solid rgba(212, 175, 55, 0.25)',
          padding: '0 4px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          display: 'none',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '500px',
          margin: '0 auto',
          height: '60px'
        }}>
          {tabs.map((tab) => {
            const active = isActive(tab);
            const IconComp = active ? tab.activeIcon : tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  padding: '6px 0',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  flex: 1,
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp
                    sx={{
                      fontSize: '22px',
                      color: active ? '#f5d061' : 'rgba(212, 175, 55, 0.55)',
                      filter: active ? 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.4))' : 'none'
                    }}
                  />

                  {/* Bucket badge */}
                  {tab.badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-8px',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f5d061, #d4af37)',
                        color: '#070d1e',
                        fontSize: '10px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 2px',
                        border: '2px solid #070d1e'
                      }}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>

                <span style={{
                  fontSize: '10px',
                  fontWeight: active ? 800 : 500,
                  color: active ? '#f5d061' : 'rgba(212, 175, 55, 0.6)',
                  marginTop: '2px',
                  letterSpacing: '0.3px',
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
