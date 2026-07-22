import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/index';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/SearchRounded';
import MenuIcon from '@mui/icons-material/MenuRounded';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/HistoryRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';

const SEARCH_PLACEHOLDERS = [
  "Search rapidCloth.in",
  "Search for 'Wedding Guest' outfits...",
  "Looking for 'Party Night' dresses?",
  "Find the perfect 'Office Wear'...",
  "Search for 'Date Night' looks...",
  "Need something for a 'Beach Day'?",
  "Search sportswear & gym gear...",
  "Find 'Festival' and traditional outfits...",
  "Explore formal wear for 'Graduation'..."
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isRentPage = location.pathname.startsWith('/rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [pincodeInput, setPincodeInput] = useState('');
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const profileRef = useRef(null);
  const langRef = useRef(null);
  const addressRef = useRef(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const updateScrollDir = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? true : false;
      if (direction !== isScrollingDown && Math.abs(scrollY - lastScrollY) > 5) {
        setIsScrollingDown(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener("scroll", updateScrollDir, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollDir);
  }, [isScrollingDown]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        setLoadingSuggestions(true);
        try {
          const res = await api.get(`/products?search=${searchQuery.trim()}&limit=6`);
          setSuggestions(res.data.products || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Click outside to close popups
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (addressRef.current && !addressRef.current.contains(e.target)) setAddressOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let query = `/products?`;
    if (searchQuery.trim()) {
      query += `search=${encodeURIComponent(searchQuery.trim())}&`;
    }
    if (searchCategory !== 'All' && searchCategory !== 'Fashion') {
      query += `gender=${searchCategory.toLowerCase()}&`;
    }
    if (query.endsWith('&')) query = query.slice(0, -1);
    if (query === `/products?`) query = `/products`;

    navigate(query);
  };

  const navLinks = [
    { path: '/products', label: 'Shop' },
    { path: '/products?gender=women', label: 'Women' },
    { path: '/products?gender=men', label: 'Men' },
    { path: '/offers?sort=-rating', label: 'Deals' },
  ];

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isProductPage = location.pathname.startsWith('/products/') && location.pathname !== '/products';
  if (isAuthPage || location.pathname.startsWith('/delivery') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller') || location.pathname === '/rent') return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transform: isScrollingDown ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease-in-out',
        background: '#131921'
      }}>
        <nav className="navbar-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', height: '60px' }}>

          {/* Logo Section */}
          <Link to="/shop" className="nav-belt-item logo-container" style={{ minWidth: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ background: 'var(--gradient-primary)', width: '28px', height: '28px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>R</div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: 'white' }}>rapidCloth</span>
            </div>
          </Link>



          {/* Delivery Location */}
          <div className="nav-belt-item desktop-only address-container" ref={addressRef} onClick={(e) => { e.stopPropagation(); setAddressOpen(!addressOpen); }} style={{ marginLeft: '10px', position: 'relative', cursor: 'pointer' }}>
            <span className="nav-line-1" style={{ paddingLeft: '20px' }}>
              {t('navbar.deliverTo')} {isAuthenticated && user?.name ? user.name.split(' ')[0] : ''}
            </span>
            <div className="nav-line-2">
              <div style={{ display: 'flex', alignItems: 'center', padding: '5px', marginLeft: '-25px' }}>
                <PlaceIcon style={{ fontSize: '18px' }} />
              </div>
              <span>
                {(() => {
                  const active = selectedAddress || user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
                  if (active) {
                    if (active.type === 'pincode') return active.zip;
                    return `${active.city || ''} ${active.zip || ''}`.trim();
                  }
                  return t('navbar.selectAddress');
                })()}
              </span>
            </div>

            <AnimatePresence>
              {addressOpen && (
                <div className="book-container" style={{ left: 0, right: 'auto' }}>
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scaleY: 0, opacity: 0, transformOrigin: 'top center' }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="book-popup"
                    style={{ width: '400px', padding: 0, overflow: 'hidden' }}
                  >
                    <div style={{ background: '#f0f2f2', padding: '15px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111', margin: 0 }}>Choose your location</h3>
                      <CloseIcon style={{ cursor: 'pointer', fontSize: '20px', color: '#111' }} onClick={() => setAddressOpen(false)} />
                    </div>
                    <div style={{ padding: '15px 20px' }}>
                      <p style={{ fontSize: '12px', color: '#555', marginBottom: '15px', lineHeight: 1.4 }}>
                        Select a delivery location to see product availability and delivery options
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                        {isAuthenticated && user?.addresses?.length > 0 ? (
                          user.addresses.map((addr, index) => {
                            const isActive = selectedAddress ? selectedAddress._id === addr._id : (addr.isDefault || index === 0);
                            return (
                              <div
                                key={addr._id || index}
                                onClick={() => { setSelectedAddress(addr); setAddressOpen(false); }}
                                style={{ border: `1px solid ${isActive ? '#007185' : '#ddd'}`, borderRadius: '8px', padding: '12px', background: isActive ? '#f3f9fa' : 'white', cursor: 'pointer' }}
                              >
                                <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                                  <strong>{user.name}</strong> {addr.street}<br />
                                  {addr.city}, {addr.state} {addr.zip}
                                </p>
                                {addr.isDefault && <p style={{ fontSize: '12px', color: '#555', fontWeight: 600, marginTop: '8px', marginBottom: 0 }}>Default address</p>}
                              </div>
                            );
                          })
                        ) : (
                          <p style={{ fontSize: '13px', color: '#888' }}>No addresses found. Please add one.</p>
                        )}
                      </div>

                      <div style={{ marginTop: '15px' }}>
                        <Link to="/addresses" onClick={() => setAddressOpen(false)} style={{ color: '#007185', fontSize: '13px', textDecoration: 'none' }}>Add a new address</Link>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <div style={{ flex: 1, borderTop: '1px solid #e7e7e7' }}></div>
                        <span style={{ padding: '0 10px', fontSize: '12px', color: '#555' }}>or enter an Indian pincode</span>
                        <div style={{ flex: 1, borderTop: '1px solid #e7e7e7' }}></div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          value={pincodeInput}
                          onChange={(e) => setPincodeInput(e.target.value)}
                          placeholder="Enter Pincode"
                          style={{ flex: 1, padding: '8px 10px', border: '1px solid #888', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                        />
                        <button
                          onClick={() => {
                            if (pincodeInput.trim()) {
                              setSelectedAddress({ type: 'pincode', zip: pincodeInput.trim() });
                              setAddressOpen(false);
                            }
                          }}
                          style={{ background: '#fff', border: '1px solid #d5d9d9', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSearch} className="amazon-search-container">
            <select
              className="amazon-search-select desktop-only"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              <option>All</option>
              <option>Fashion</option>
              <option>Men</option>
              <option>Women</option>
            </select>

            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="amazon-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                style={{ width: '100%' }}
              />

              <AnimatePresence>
                {showSuggestions && (searchQuery.trim().length > 1) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: '#ffffff', borderRadius: '0 0 4px 4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden',
                      zIndex: 10001, border: '1px solid #ddd', borderTop: 'none'
                    }}
                  >
                    {loadingSuggestions ? (
                      <div style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: 'inline-block', marginRight: '8px' }}>
                          <AutoAwesomeIcon style={{ fontSize: '14px', color: 'var(--accent)' }} />
                        </motion.div>
                        Searching...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <>
                        {suggestions.map(p => (
                          <Link
                            key={p._id}
                            to={`/products/${p._id}`}
                            onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '10px 15px', textDecoration: 'none',
                              borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s'
                            }}
                            className="suggestion-item-classic"
                          >
                            <img src={p.images?.[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{p.name}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>{p.brand} in {p.category}</div>
                            </div>
                          </Link>
                        ))}
                        <div
                          onClick={handleSearch}
                          style={{ padding: '10px', textAlign: 'left', paddingLeft: '15px', fontSize: '13px', color: '#007185', fontWeight: 500, cursor: 'pointer', background: '#f8f8f8' }}
                        >
                          See all results for "{searchQuery}"
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                        No results for "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button type="submit" className="amazon-search-button">
              <SearchIcon style={{ color: 'white', fontSize: '24px' }} />
            </button>
          </form>

          <style>{`
          .suggestion-item-classic:hover { background: #f3f3f3 !important; }
          @media (max-width: 768px) {
            .navbar-top {
              height: 110px !important;
              display: grid !important;
              grid-template-columns: 1fr auto auto;
              grid-template-rows: 50px 50px;
              padding: 5px 10px !important;
              gap: 5px 10px;
              align-items: center;
            }
            .nav-belt-item.logo-container {
              grid-column: 1 / 2;
              grid-row: 1;
              justify-self: start;
            }
            .nav-belt-item.address-container {
              grid-column: 2 / 4;
              grid-row: 1;
              display: flex !important;
              justify-self: end;
            }
            .amazon-search-container {
              grid-column: 1 / 4; /* Allow search to take full width or partial depending on space */
              grid-row: 2;
              display: flex !important;
              margin: 0 !important;
            }
            .right-actions-container {
              display: contents !important;
            }
            .right-actions-container > .ai-stylist-container,
            .right-actions-container > .lang-container,
            .right-actions-container > .mobile-search-toggle {
              display: none !important;
            }
            .nav-belt-item.profile-container {
              grid-column: 2 / 3;
              grid-row: 2;
              display: flex !important;
            }
            .nav-belt-item.cart-container {
              grid-column: 3 / 4;
              grid-row: 2;
              display: flex !important;
            }
            .spacer-fixed {
              height: 110px !important;
            }
          }
          @media (max-width: 480px) {
            .amazon-search-container { grid-column: 1 / 2; }
          }
        `}</style>

          {/* Right Actions */}
          <div className="right-actions-container" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '5px' }}>

            {/* AI Stylist */}
            <div
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-ai-stylist'));
              }}
              className="nav-belt-item desktop-only ai-stylist-container"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px', padding: '0 10px', cursor: 'pointer' }}
            >
              <AutoAwesomeIcon style={{ fontSize: '20px', color: '#c084fc' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>AI Stylist</span>
            </div>

            {/* Language Selector */}
            <div className="nav-belt-item desktop-only lang-container" ref={langRef} onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }} style={{ position: 'relative', cursor: 'pointer' }}>
              <div className="nav-line-2" style={{ marginTop: '10px' }}>
                <TranslateIcon style={{ fontSize: '20px' }} />
                <span style={{ fontSize: '14px' }}>{language}</span>
                <div style={{ display: 'flex', padding: '0 5px' }}>
                  <motion.div animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
                    <ExpandMoreIcon style={{ fontSize: '16px', color: '#ccc' }} />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {langOpen && (
                  <div className="book-container">
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0, transformOrigin: 'top center' }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="book-popup"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '16px' }}>{t('navbar.selectLanguage')}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div onClick={() => { setLanguage('EN'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: language === 'EN' ? '#111' : '#666' }}>
                          <input type="radio" checked={language === 'EN'} readOnly style={{ accentColor: '#e47911', cursor: 'pointer' }} /> <span>English - EN</span>
                        </div>
                        <div onClick={() => { setLanguage('HI'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: language === 'HI' ? '#111' : '#666' }}>
                          <input type="radio" checked={language === 'HI'} readOnly style={{ accentColor: '#e47911', cursor: 'pointer' }} /> <span>Hindi - HI</span>
                        </div>
                        <div onClick={() => { setLanguage('BN'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: language === 'BN' ? '#111' : '#666' }}>
                          <input type="radio" checked={language === 'BN'} readOnly style={{ accentColor: '#e47911', cursor: 'pointer' }} /> <span>Bengali - BN</span>
                        </div>
                        <div onClick={() => { setLanguage('MR'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: language === 'MR' ? '#111' : '#666' }}>
                          <input type="radio" checked={language === 'MR'} readOnly style={{ accentColor: '#e47911', cursor: 'pointer' }} /> <span>Marathi - MR</span>
                        </div>
                      </div>
                      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                        {t('navbar.shoppingOn')}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Icon */}
            <div 
              className="mobile-only mobile-search-toggle" 
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              style={{ cursor: 'pointer', color: 'white', padding: '0 8px' }}
            >
              {mobileSearchOpen ? <CloseIcon style={{ fontSize: '28px' }} /> : <SearchIcon style={{ fontSize: '28px' }} />}
            </div>

            {/* Account & Lists */}
            <div className="nav-belt-item profile-container" ref={profileRef} 
              onClick={(e) => { 
                e.stopPropagation();
                setProfileOpen(!profileOpen);
              }} 
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isAuthenticated && user?.avatar && (
                    <img src={user.avatar} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                  )}
                  <span className="nav-line-1">{t('navbar.hello')}, {isAuthenticated ? user?.name?.split(' ')[0] : t('navbar.signIn')}</span>
                </div>
                <div className="nav-line-2">
                  <span>{t('navbar.accountAndLists')}</span>
                  <div style={{ display: 'flex', padding: '0 5px' }}>
                    <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
                      <ExpandMoreIcon style={{ fontSize: '16px', color: '#ccc' }} />
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="mobile-only" style={{ display: 'flex', alignItems: 'center' }}>
                {isAuthenticated && user?.avatar ? (
                  <img src={user.avatar} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <PersonOutlineIcon style={{ fontSize: '28px' }} />
                )}
              </div>

              <AnimatePresence>
                {profileOpen && (
                  <div className="book-container">
                    <motion.div
                      className="book-popup profile-menu-popup"
                      onClick={(e) => e.stopPropagation()}
                      initial={{ scaleY: 0, opacity: 0, transformOrigin: 'top center' }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="profile-menu-section main-account">
                        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>{t('navbar.yourAccount')}</h4>
                        {isAuthenticated ? (
                          <>
                            <Link to={isRentPage ? '/rent/profile' : '/profile'} onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '5px 0', color: '#444', textDecoration: 'none', fontSize: '13px' }}>{t('navbar.yourProfile')}</Link>
                            <Link to="/orders" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '5px 0', color: '#444', textDecoration: 'none', fontSize: '13px' }}>{t('navbar.yourOrders')}</Link>
                            <Link to="/cart" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '5px 0', color: '#444', textDecoration: 'none', fontSize: '13px' }}>{t('navbar.yourWishList')}</Link>
                            <div style={{ borderTop: '1px solid #eee', margin: '10px 0' }} />
                            <button onClick={() => { setProfileOpen(false); logout(); }} style={{ width: '100%', textAlign: 'left', padding: '5px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#c40000', fontWeight: 600, fontSize: '13px' }}>{t('navbar.signOut')}</button>
                          </>
                        ) : (
                          <div style={{ padding: '10px 0' }}>
                            <button 
                              onClick={() => { setProfileOpen(false); navigate('/login'); }}
                              style={{ 
                                width: '100%', background: 'var(--gradient-primary)', color: 'white', 
                                padding: '8px', borderRadius: '4px', fontWeight: 600, marginBottom: '10px' 
                              }}
                            >
                              {t('navbar.signIn')}
                            </button>
                            <p style={{ fontSize: '11px', textAlign: 'center' }}>
                              {t('navbar.newCustomer')} <Link to="/register" onClick={() => setProfileOpen(false)} style={{ color: '#007185' }}>{t('navbar.startHere')}</Link>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="profile-menu-section seller-account">
                        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>{t('navbar.yourSellerAccount')}</h4>
                        {isAuthenticated ? (
                          user?.role === 'seller' ? (
                            <>
                              <Link to="/seller" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '5px 0', color: '#444', textDecoration: 'none', fontSize: '13px' }}>{t('navbar.sellerDashboard')}</Link>
                              <Link to="/seller/products" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '5px 0', color: '#444', textDecoration: 'none', fontSize: '13px' }}>{t('navbar.manageProducts')}</Link>
                              <Link to="/seller/orders" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '5px 0', color: '#444', textDecoration: 'none', fontSize: '13px' }}>{t('navbar.manageOrders')}</Link>
                            </>
                          ) : (
                            <Link to="/become-seller" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '5px 0', color: '#444', textDecoration: 'none', fontSize: '13px' }}>{t('navbar.becomeSeller')}</Link>
                          )
                        ) : (
                          <Link to="/become-seller" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '5px 0', color: '#444', textDecoration: 'none', fontSize: '13px' }}>{t('navbar.sellOn')}</Link>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link to={isRentPage ? '/rent/cart' : '/cart'} className="nav-belt-item cart-container" style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '2px', paddingRight: '15px' }}>
              <div style={{ position: 'relative' }}>
                <ShoppingCartIcon style={{ fontSize: '32px' }} />
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--gradient-primary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 700, fontSize: '12px' }}>{itemCount}</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '14px', marginBottom: '5px' }} className="desktop-only">Cart</span>
            </Link>

          </div>
        </nav>

        {/* Sub Navbar */}
        <nav className="desktop-only" style={{ background: '#3b3b3b', color: 'white', display: 'flex', alignItems: 'center', height: '39px', padding: '0 10px', fontSize: '14px', overflowX: 'auto', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          <div className="nav-sub-item" onClick={() => setSidebarOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <MenuIcon style={{ fontSize: '20px' }} /> {t('navbar.all')}
          </div>

          <Link to="/orders" className="nav-sub-item">{t('navbar.buyAgain')}</Link>
          <Link to="/sell" className="nav-sub-item">{t('navbar.sell')}</Link>
          <Link to="/gift-cards" className="nav-sub-item">{t('navbar.giftCards')}</Link>
          <Link to="/browsing-history" className="nav-sub-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            {t('navbar.browsingHistory')}
          </Link>
          <Link to="/rent" className="nav-sub-item" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            {t('navbar.rent')}
          </Link>
        </nav>
      </div>

      <div className="spacer-fixed" style={{ height: '99px' }}></div> {/* Spacer for fixed navbars */}

      {/* Sidebar Overlay & Menu */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', zIndex: 9999
              }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: '365px', maxWidth: '85%', background: 'white',
                zIndex: 10000, overflowY: 'auto', display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ background: '#1a1632', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isAuthenticated && user?.avatar ? (
                  <img src={user.avatar} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
                ) : (
                  <PersonOutlineIcon style={{ fontSize: '30px' }} />
                )}
                <span style={{ fontSize: '19px', fontWeight: 700 }}>Hello, {user?.name || 'Sign in'}</span>
              </div>
              <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', top: '15px', left: '380px', cursor: 'pointer', color: 'white', zIndex: 10001 }}>
                <CloseIcon style={{ fontSize: '32px' }} />
              </div>

              <div style={{ padding: '20px 0', color: '#111' }}>
                <h3 style={{ padding: '0 36px', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Trending</h3>
                <Link to="/products" onClick={() => setSidebarOpen(false)} style={{ display: 'block', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>Bestsellers</Link>
                <Link to="/products" onClick={() => setSidebarOpen(false)} style={{ display: 'block', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>New Releases</Link>

                <div style={{ borderTop: '1px solid #d5d9d9', margin: '10px 0' }}></div>

                <h3 style={{ padding: '0 36px', fontSize: '18px', fontWeight: 700, margin: '10px 0' }}>Shop by Category</h3>
                <Link to="/products?gender=kids" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                  Kids' Fashion <span style={{ color: '#888' }}>›</span>
                </Link>
                <Link to="/products?gender=men" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                  Men's Fashion <span style={{ color: '#888' }}>›</span>
                </Link>
                <Link to="/products?gender=women" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                  Women's Fashion <span style={{ color: '#888' }}>›</span>
                </Link>
                <AnimatePresence>
                  {showAllCategories && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <Link to="/products?occasion=Wedding Guest" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Wedding Guest <span style={{ color: '#888' }}>›</span>
                      </Link>
                      <Link to="/products?occasion=Party Night" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Party Night <span style={{ color: '#888' }}>›</span>
                      </Link>
                      <Link to="/products?occasion=Office Wear" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Office Wear <span style={{ color: '#888' }}>›</span>
                      </Link>
                      <Link to="/products?occasion=Date Night" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Date Night <span style={{ color: '#888' }}>›</span>
                      </Link>
                      <Link to="/products?occasion=Beach Day" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Beach Day <span style={{ color: '#888' }}>›</span>
                      </Link>
                      <Link to="/products?occasion=Gym / Sports" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Gym / Sports <span style={{ color: '#888' }}>›</span>
                      </Link>
                      <Link to="/products?occasion=Graduation" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Graduation <span style={{ color: '#888' }}>›</span>
                      </Link>
                      <Link to="/products?occasion=Festival" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Festival <span style={{ color: '#888' }}>›</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div onClick={() => setShowAllCategories(!showAllCategories)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 36px', color: '#111', cursor: 'pointer', fontSize: '14px' }}>
                  {showAllCategories ? 'See less' : 'See all'}
                  <ExpandMoreIcon style={{ fontSize: '18px', color: '#888', transform: showAllCategories ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </div>

                <div style={{ borderTop: '1px solid #d5d9d9', margin: '10px 0' }}></div>

                <h3 style={{ padding: '0 36px', fontSize: '18px', fontWeight: 700, margin: '10px 0' }}>Help & Settings</h3>
                <Link to="/orders" onClick={() => setSidebarOpen(false)} style={{ display: 'block', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>Your Orders</Link>
                <Link to="/orders" onClick={() => setSidebarOpen(false)} style={{ display: 'block', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>Order History</Link>
                {isAuthenticated ? (
                  <div onClick={() => { setSidebarOpen(false); logout(); }} style={{ display: 'block', padding: '13px 36px', color: '#111', cursor: 'pointer', fontSize: '14px' }}>Sign Out</div>
                ) : (
                  <Link to="/login" onClick={() => setSidebarOpen(false)} style={{ display: 'block', padding: '13px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>Sign In</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Search Bar Dropdown */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            {/* Backdrop for clicking outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSearchOpen(false)}
              style={{
                position: 'fixed',
                top: '60px',
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1999
              }}
            />
            
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                position: 'fixed',
                top: '60px',
                left: 0,
                right: 0,
                background: '#232f3e',
                padding: '10px',
                zIndex: 2000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}
            >
            <form onSubmit={(e) => { handleSearch(e); setMobileSearchOpen(false); }} style={{ display: 'flex', background: 'white', borderRadius: '4px', overflow: 'hidden', height: '45px' }}>
              <select
                className="amazon-search-select"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                style={{ width: '60px', fontSize: '11px' }}
              >
                <option value="All">All</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Trending">Trending</option>
              </select>
              <input
                type="text"
                className="amazon-search-input"
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="amazon-search-button">
                <SearchIcon style={{ color: '#333' }} />
              </button>
            </form>
            
            {/* Suggestions in mobile search */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{ background: 'white', marginTop: '2px', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
                {suggestions.map((p) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    onClick={() => {
                      setMobileSearchOpen(false);
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                    style={{ 
                      padding: '10px 15px', borderBottom: '1px solid #eee', 
                      color: '#111', fontSize: '14px', textDecoration: 'none',
                      display: 'flex', alignItems: 'center', gap: '12px'
                    }}
                  >
                    <img src={p.images?.[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{p.brand} in {p.category}</div>
                    </div>
                  </Link>
                ))}
                <div
                  onClick={(e) => { handleSearch(e); setMobileSearchOpen(false); }}
                  style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#007185', fontWeight: 600, cursor: 'pointer', background: '#f8f8f8' }}
                >
                  See all results for "{searchQuery}"
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>

  );
}
