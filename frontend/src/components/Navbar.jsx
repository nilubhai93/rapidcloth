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
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';

const SEARCH_PLACEHOLDERS = [
  "Search Banarasi Silk Sarees...",
  "Search Designer Sherwanis...",
  "Search Anarkali Suit Sets...",
  "Search Tuxedos & Blazers...",
  "Search Indo-Western Dresses...",
  "Search Wedding Lehengas...",
  "Search Evening Cocktail Gowns...",
  "Search Designer Kurtis & Kurtas..."
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isRentPage = location.pathname.startsWith('/rent');
  const isCartPage = location.pathname === '/cart' || location.pathname === '/rent/cart';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [pincodeInput, setPincodeInput] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const profileRef = useRef(null);
  const langRef = useRef(null);
  const addressRef = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const [cameraSheetOpen, setCameraSheetOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Cycling search placeholder animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported on this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0]?.transcript;
      if (transcript) {
        setSearchQuery(transcript);
        setIsListening(false);
        navigate(`/products?search=${encodeURIComponent(transcript)}`);
      }
    };

    recognition.start();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCameraSheetOpen(false);
      navigate(`/products?search=${encodeURIComponent('designer')}`);
    }
  };

  // Live suggestions autocomplete
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

  // Click outside to close dropdowns
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
    if (e) e.preventDefault();
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

  if (isAuthPage || location.pathname.startsWith('/delivery') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller')) {
    return null;
  }

  // Flipkart style category list with custom icons
  const flipkartCategories = [
    {
      id: 'for-you',
      title: 'For You',
      link: '/products',
      isActive: location.pathname === '/' || location.pathname === '/shop',
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="16" height="15" rx="3" fill="#ffe500" stroke="#1d4ed8" strokeWidth="2" />
          <path d="M9 6V5a3 3 0 016 0v1" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="13" r="2.5" fill="#1d4ed8" />
        </svg>
      )
    },
    {
      id: 'fashion',
      title: 'Fashion',
      link: '/products?category=fashion',
      isActive: location.search.includes('category=fashion'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
          <path d="M7 4L4 8V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V8L17 4H7Z" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10" stroke="#ffe500" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M4 8H20" stroke="#1e293b" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'mobiles',
      title: 'Mobiles',
      link: '/products?gender=women',
      isActive: location.search.includes('gender=women'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
          <rect x="6" y="2" width="12" height="20" rx="3" stroke="#1e293b" strokeWidth="2" />
          <rect x="8" y="4" width="8" height="13" fill="#ffe500" />
          <circle cx="12" cy="19" r="1" fill="#1d4ed8" />
        </svg>
      )
    },
    {
      id: 'electronics',
      title: 'Electronics',
      link: '/products?gender=men',
      isActive: location.search.includes('gender=men'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="12" rx="2" stroke="#1e293b" strokeWidth="2" fill="#ffe500" />
          <path d="M2 20H22V18C22 16.8954 21.1046 16 20 16H4C2.89543 16 2 16.8954 2 18V20Z" stroke="#1e293b" strokeWidth="2" fill="#1e293b" />
        </svg>
      )
    },
    {
      id: 'beauty',
      title: 'Beauty',
      link: '/products?category=beauty',
      isActive: location.search.includes('category=beauty'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
          <path d="M9 11L12 3L15 11" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="8" y="11" width="8" height="10" rx="2" fill="#ffe500" stroke="#1e293b" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'home',
      title: 'Home',
      link: '/products?category=home',
      isActive: location.search.includes('category=home'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
          <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" stroke="#1e293b" strokeWidth="2" />
          <path d="M9 21V14H15V21" fill="#ffe500" stroke="#1e293b" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'appliances',
      title: 'Appliances',
      link: '/products?occasion=Wedding Guest',
      isActive: location.search.includes('Wedding'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="12" rx="2" stroke="#1e293b" strokeWidth="2" fill="#ffe500" />
          <path d="M8 21L10 17H14L16 21" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'toys',
      title: 'Toys, Baby & Sports',
      link: '/products?gender=kids',
      isActive: location.search.includes('kids'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="7" r="4" stroke="#1e293b" strokeWidth="2" fill="#ffe500" />
          <circle cx="7" cy="5" r="2" fill="#1e293b" />
          <circle cx="17" cy="5" r="2" fill="#1e293b" />
          <path d="M6 14C6 12 8 11 12 11C16 11 18 12 18 14V20H6V14Z" stroke="#1e293b" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'food',
      title: 'Food & Health',
      link: '/products?category=health',
      isActive: location.search.includes('health'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
          <rect x="7" y="7" width="10" height="14" rx="2" stroke="#1e293b" strokeWidth="2" fill="#ffe500" />
          <rect x="9" y="3" width="6" height="4" rx="1" fill="#1d4ed8" />
          <path d="M12 11V17M9 14H15" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'rent',
      title: 'Books & Rent Store',
      link: '/rent',
      isActive: isRentPage,
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20V4H6.5A2.5 2.5 0 004 6.5V19.5Z" fill="#ffe500" stroke="#1e293b" strokeWidth="2" />
          <path d="M6.5 17A2.5 2.5 0 004 19.5M6.5 17H20" stroke="#1d4ed8" strokeWidth="2" />
        </svg>
      )
    }
  ];

  return (
    <>
      <header
        className="navbar-fixed-container fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200/90 shadow-xs transition-all duration-300 font-sans pt-2 md:pt-3 pb-1 md:pb-1.5"
      >
        {/* MOBILE VIEW ONLY: FIRST ROW (ADDRESS BAR ONLY) */}
        {!isCartPage && (
          <div className="md:hidden bg-[#f0f5ff] border-b border-blue-100 px-4 sm:px-6 py-2 flex items-center justify-between mb-1 max-w-[1440px] mx-auto">
            <div
              onClick={() => setAddressOpen(true)}
              className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer"
            >
              <PlaceIcon className="!text-base text-[#2874f0] shrink-0" />
              <span className="text-[11px] text-gray-500 font-medium shrink-0">Deliver to:</span>
              <span className="text-xs font-bold text-gray-900 truncate">
                {(() => {
                  const active = selectedAddress || user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
                  if (active) {
                    if (active.type === 'pincode') return active.zip;
                    return `${active.city || active.street || ''} ${active.zip || ''}`.trim();
                  }
                  return t('navbar.selectAddress') || 'Select delivery location';
                })()}
              </span>
            </div>
            <button
              onClick={() => setAddressOpen(true)}
              className="p-1 rounded-full text-[#2874f0] hover:bg-blue-100/60 transition-colors border-none bg-transparent cursor-pointer shrink-0 ml-1 flex items-center justify-center"
              aria-label="Open address popup"
            >
              <ExpandMoreIcon className={`!text-lg transform transition-transform duration-200 ${addressOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {/* MAIN ROW: BRAND LOGO, DESKTOP ADDRESS, SEARCH BAR & DESKTOP ACTIONS */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-2 md:py-2.5 flex items-center justify-between gap-3 md:gap-6">

          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 text-gray-700 hover:text-[#2874f0] rounded-xl hover:bg-gray-100 border-none cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <MenuIcon className="!text-2xl" />
          </button>

          {/* Brand Logo */}
          <Link to="/shop" className="flex items-center gap-1.5 text-[#14327a] font-black tracking-tight text-decoration-none shrink-0">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#14327a] via-[#2874f0] to-[#ffe500] text-white flex items-center justify-center font-black shadow-xs text-sm">
              R
            </div>
            <span className="font-extrabold text-lg md:text-xl bg-gradient-to-r from-[#14327a] via-[#2874f0] to-[#14327a] bg-clip-text text-transparent">
              RapidCloth
            </span>
          </Link>

          {/* DESKTOP VIEW ONLY: SELECT ADDRESS WIDGET (Placed Between Brand Logo and Search Bar) */}
          {!isCartPage && (
            <div
              ref={addressRef}
              onClick={(e) => { e.stopPropagation(); setAddressOpen(!addressOpen); }}
              className="hidden md:flex items-center gap-2 cursor-pointer py-1.5 px-3 bg-[#f0f5ff]/80 hover:bg-blue-100/70 border border-blue-200/60 rounded-xl transition-all text-gray-700 font-medium group shrink-0 max-w-[220px]"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2874f0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PlaceIcon className="!text-base text-[#2874f0]" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[10px] text-gray-500 font-semibold leading-none uppercase tracking-wider">
                  Deliver to
                </span>
                <span className="text-xs font-bold text-gray-900 truncate leading-tight group-hover:text-[#2874f0] transition-colors">
                  {(() => {
                    const active = selectedAddress || user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
                    if (active) {
                      if (active.type === 'pincode') return active.zip;
                      return `${active.city || active.street || ''} ${active.zip || ''}`.trim();
                    }
                    return t('navbar.selectAddress') || 'Select location';
                  })()}
                </span>
              </div>
              <ExpandMoreIcon className={`!text-base text-gray-500 group-hover:text-[#2874f0] transition-transform duration-200 ${addressOpen ? 'rotate-180' : ''}`} />
            </div>
          )}

          {/* PRO DESIGNER SEARCH BAR (SEARCH ICON REMOVED PER INSTRUCTION) */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-3xl relative flex items-center">
            <div className="relative flex items-center w-full bg-[#f4f7fc] hover:bg-[#ebf2fe] focus-within:bg-white border border-gray-300/80 focus-within:border-[#2874f0] focus-within:ring-4 focus-within:ring-blue-100/80 rounded-xl md:rounded-2xl transition-all duration-200 shadow-2xs overflow-visible">

              {/* Category Dropdown (Desktop Only) */}
              <select
                className="hidden lg:block bg-transparent text-xs font-bold text-gray-700 px-3 py-2.5 border-r border-gray-300/60 focus:outline-none cursor-pointer"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Fashion">Fashion</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
              </select>

              {/* Search Text Input (Clean start - search icon removed) */}
              <input
                type="text"
                className="w-full bg-transparent py-2 md:py-2.5 px-3 md:px-4 text-xs md:text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              />

              {/* RIGHT SIDE SEARCH ACTIONS: Camera & Microphone on MOBILE ONLY */}
              <div className="flex items-center gap-0.5 md:gap-1 pr-1.5 md:pr-2 shrink-0">

                {/* Camera Option: MOBILE ONLY */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCameraSheetOpen(true)}
                  title="Visual Search by Camera"
                  className="md:hidden p-1 text-[#2874f0] hover:bg-blue-100/60 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                >
                  <PhotoCameraRoundedIcon className="!text-lg text-[#2874f0]" />
                </motion.button>

                {/* Microphone Option: MOBILE ONLY */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`md:hidden p-1 rounded-full transition-colors border-none cursor-pointer ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 hover:bg-gray-200/60 bg-transparent'
                    }`}
                >
                  <MicRoundedIcon className="!text-lg" />
                </motion.button>

                {/* Desktop Search Button (Icon removed per user instruction) */}
                <button
                  type="submit"
                  className="hidden md:flex items-center justify-center bg-[#2874f0] hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl transition-all border-none cursor-pointer shadow-2xs font-bold text-xs"
                >
                  <span>Search</span>
                </button>
              </div>

              {/* Autocomplete Suggestions Popup */}
              <AnimatePresence>
                {showSuggestions && (searchQuery.trim().length > 1) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: '#ffffff', borderRadius: '0 0 16px 16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)', overflow: 'hidden',
                      zIndex: 10001, border: '1px solid #e2e8f0', borderTop: 'none'
                    }}
                  >
                    {loadingSuggestions ? (
                      <div style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: 'inline-block', marginRight: '8px' }}>
                          <AutoAwesomeIcon style={{ fontSize: '14px', color: '#2874f0' }} />
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
                            className="suggestion-item-classic hover:bg-blue-50/50"
                          >
                            <img src={p.images?.[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{p.name}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>{p.brand} in {p.category}</div>
                            </div>
                          </Link>
                        ))}
                        <div
                          onClick={handleSearch}
                          style={{ padding: '12px', textAlign: 'left', paddingLeft: '15px', fontSize: '13px', color: '#2874f0', fontWeight: 700, cursor: 'pointer', background: '#f8fafc' }}
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
          </form>

          {/* DESKTOP VIEW ONLY: ACCOUNT & LISTS, LANGUAGE, AND CART (REMOVED ON MOBILE VIEW) */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">

            {/* Account / Login Dropdown (Desktop) */}
            {!isCartPage && (
              <div
                ref={profileRef}
                onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
                className="relative group cursor-pointer py-1.5 px-3 bg-gray-50/90 hover:bg-blue-50/80 border border-gray-200/80 hover:border-blue-200 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7.5 h-7.5 rounded-full bg-blue-100 text-[#2874f0] flex items-center justify-center font-bold text-sm overflow-hidden border border-blue-200 shrink-0">
                    {isAuthenticated && user?.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <PersonOutlineIcon className="!text-xl text-[#2874f0]" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-gray-500 font-medium leading-none">
                      {t('navbar.hello')}, {isAuthenticated ? user?.name?.split(' ')[0] : t('navbar.signIn')}
                    </span>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-gray-900 leading-tight mt-0.5">
                      <span>{t('navbar.accountAndLists')}</span>
                      <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ExpandMoreIcon className="!text-sm text-gray-600" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Profile Popup Menu Modal */}
                <AnimatePresence>
                  {profileOpen && (
                    <div className="book-container" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 2000, marginTop: '8px' }}>
                      <motion.div
                        className="book-popup profile-menu-popup"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scaleY: 0, opacity: 0, transformOrigin: 'top right' }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        exit={{ scaleY: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}
                      >
                        <div className="profile-menu-section main-account">
                          <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#333', fontWeight: 800 }}>{t('navbar.yourAccount')}</h4>
                          {isAuthenticated ? (
                            <>
                              <Link to={isRentPage ? '/rent/profile' : '/profile'} onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '6px 0', color: '#444', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{t('navbar.yourProfile')}</Link>
                              <Link to="/orders" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '6px 0', color: '#444', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{t('navbar.yourOrders')}</Link>
                              <Link to="/cart" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '6px 0', color: '#444', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{t('navbar.yourWishList')}</Link>
                              <div style={{ borderTop: '1px solid #eee', margin: '10px 0' }} />
                              <button onClick={() => { setProfileOpen(false); logout(); }} style={{ width: '100%', textAlign: 'left', padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: '13px' }}>{t('navbar.signOut')}</button>
                            </>
                          ) : (
                            <div style={{ padding: '10px 0' }}>
                              <button
                                onClick={() => { setProfileOpen(false); navigate('/login'); }}
                                style={{
                                  width: '100%', background: '#2874f0', color: 'white',
                                  padding: '10px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px'
                                }}
                              >
                                {t('navbar.signIn')}
                              </button>
                              <p style={{ fontSize: '11px', textAlign: 'center', color: '#64748b' }}>
                                {t('navbar.newCustomer')} <Link to="/register" onClick={() => setProfileOpen(false)} style={{ color: '#2874f0', fontWeight: 700 }}>{t('navbar.startHere')}</Link>
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="profile-menu-section seller-account">
                          <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#333', fontWeight: 800 }}>{t('navbar.yourSellerAccount')}</h4>
                          {isAuthenticated ? (
                            user?.role === 'seller' ? (
                              <>
                                <Link to="/seller" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '6px 0', color: '#444', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{t('navbar.sellerDashboard')}</Link>
                                <Link to="/seller/products" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '6px 0', color: '#444', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{t('navbar.manageProducts')}</Link>
                                <Link to="/seller/orders" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '6px 0', color: '#444', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{t('navbar.manageOrders')}</Link>
                              </>
                            ) : (
                              <Link to="/become-seller" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '6px 0', color: '#444', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{t('navbar.becomeSeller')}</Link>
                            )
                          ) : (
                            <Link to="/become-seller" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '6px 0', color: '#444', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>{t('navbar.sellOn')}</Link>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Language Switcher (Desktop) */}
            {!isCartPage && (
              <div
                ref={langRef}
                onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
                className="flex items-center gap-1 cursor-pointer py-1.5 px-3 bg-gray-50/90 hover:bg-blue-50/80 border border-gray-200/80 hover:border-blue-200 rounded-xl transition-all text-gray-700 font-bold text-xs relative shrink-0"
              >
                <TranslateIcon className="!text-lg text-[#2874f0]" />
                <span>{language}</span>
                <motion.div animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ExpandMoreIcon className="!text-sm text-gray-500" />
                </motion.div>

                {/* Language Modal */}
                <AnimatePresence>
                  {langOpen && (
                    <div className="book-container" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 2000, marginTop: '8px' }}>
                      <motion.div
                        initial={{ scaleY: 0, opacity: 0, transformOrigin: 'top right' }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        exit={{ scaleY: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="book-popup"
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}
                      >
                        <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '15px', fontWeight: 800 }}>{t('navbar.selectLanguage')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div onClick={() => { setLanguage('EN'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: language === 'EN' ? '#2874f0' : '#444', fontWeight: language === 'EN' ? 700 : 500 }}>
                            <input type="radio" checked={language === 'EN'} readOnly style={{ accentColor: '#2874f0', cursor: 'pointer' }} /> <span>English - EN</span>
                          </div>
                          <div onClick={() => { setLanguage('HI'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: language === 'HI' ? '#2874f0' : '#444', fontWeight: language === 'HI' ? 700 : 500 }}>
                            <input type="radio" checked={language === 'HI'} readOnly style={{ accentColor: '#2874f0', cursor: 'pointer' }} /> <span>Hindi - HI</span>
                          </div>
                          <div onClick={() => { setLanguage('BN'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: language === 'BN' ? '#2874f0' : '#444', fontWeight: language === 'BN' ? 700 : 500 }}>
                            <input type="radio" checked={language === 'BN'} readOnly style={{ accentColor: '#2874f0', cursor: 'pointer' }} /> <span>Bengali - BN</span>
                          </div>
                          <div onClick={() => { setLanguage('MR'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: language === 'MR' ? '#2874f0' : '#444', fontWeight: language === 'MR' ? 700 : 500 }}>
                            <input type="radio" checked={language === 'MR'} readOnly style={{ accentColor: '#2874f0', cursor: 'pointer' }} /> <span>Marathi - MR</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Shopping Cart Button (Desktop) */}
            <Link
              to={isRentPage ? '/rent/cart' : '/cart'}
              className="flex items-center gap-2 py-1.5 px-3.5 bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/80 rounded-xl transition-all text-[#2874f0] font-extrabold group text-decoration-none shrink-0"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCartIcon className="!text-xl text-[#2874f0]" />
                <span className="absolute -top-2 -right-2 bg-[#2874f0] text-white text-[10px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  {itemCount}
                </span>
              </div>
              <span className="text-xs font-bold text-[#2874f0]">
                Cart
              </span>
            </Link>

          </div>
        </div>

        {/* CATEGORY NAVIGATION STRIP */}
        {!isCartPage && (
          <div className="bg-white border-t border-gray-200/70 shadow-2xs py-2">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between overflow-x-auto scrollbar-none gap-2 sm:gap-4">
              {flipkartCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className={`group flex flex-col items-center gap-1 px-2.5 md:px-3 py-1 rounded-xl transition-all duration-200 relative text-decoration-none ${cat.isActive ? 'bg-blue-50/80 text-[#2874f0] font-bold' : 'text-gray-700 hover:text-[#2874f0] font-semibold hover:bg-gray-50'
                    }`}
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-gray-800 group-hover:text-[#2874f0] transition-all duration-300 transform group-hover:-translate-y-0.5 group-hover:scale-110">
                    {cat.icon}
                  </div>

                  <span className="text-[10px] md:text-[11px] whitespace-nowrap tracking-tight transition-colors">
                    {cat.title}
                  </span>

                  {cat.isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#2874f0] rounded-full transition-all duration-300" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* RIGHT-TO-LEFT SLIDING ADDRESS POPUP DRAWER */}
      <AnimatePresence>
        {addressOpen && (
          <div className="fixed inset-0 z-[10000] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setAddressOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Panel sliding from Right to Left */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-[92%] sm:w-[400px] h-full bg-white shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #14327a 0%, #2874f0 100%)',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <PlaceIcon style={{ fontSize: '18px', color: '#ffe500' }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
                      Select Delivery Location
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 500, margin: 0, marginTop: '2px' }}>
                      For faster shipping &amp; accurate availability
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAddressOpen(false)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none', cursor: 'pointer', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s', flexShrink: 0
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  <CloseIcon style={{ fontSize: '18px' }} />
                </button>
              </div>

              {/* Info Banner */}
              <div style={{
                background: '#f0f7ff',
                borderBottom: '1px solid #d4e6ff',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '15px', marginTop: '1px', flexShrink: 0 }}>📦</span>
                <p style={{ fontSize: '11.5px', color: '#374151', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                  Select a location to check <strong style={{ color: '#2874f0' }}>product availability</strong>, shipping charges and express delivery dates.
                </p>
              </div>

              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

                {/* Saved Addresses Section */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4 style={{
                      fontSize: '11px', fontWeight: 800, color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0
                    }}>
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
                              padding: '12px 14px',
                              borderRadius: '12px',
                              border: `2px solid ${isActive ? '#2874f0' : '#e5e7eb'}`,
                              background: isActive ? '#f0f5ff' : '#fafafa',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              transition: 'all 0.2s ease',
                              boxShadow: isActive ? '0 0 0 3px rgba(40,116,240,0.1)' : 'none'
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = '#93c5fd'; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                          >
                            {/* Radio Indicator */}
                            <div style={{
                              marginTop: '2px',
                              width: '18px', height: '18px', borderRadius: '50%',
                              border: `2px solid ${isActive ? '#2874f0' : '#d1d5db'}`,
                              background: isActive ? '#2874f0' : '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, transition: 'all 0.2s'
                            }}>
                              {isActive && (
                                <div style={{
                                  width: '8px', height: '8px', borderRadius: '50%',
                                  background: '#fff'
                                }} />
                              )}
                            </div>

                            {/* Address Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{
                                  fontSize: '13px', fontWeight: 700,
                                  color: isActive ? '#1d4ed8' : '#111827',
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                  {user.name || 'Saved Address'}
                                </span>
                                {addr.isDefault && (
                                  <span style={{
                                    fontSize: '9px', fontWeight: 800,
                                    background: '#dcfce7', color: '#15803d',
                                    padding: '2px 6px', borderRadius: '20px',
                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                    flexShrink: 0
                                  }}>
                                    Default
                                  </span>
                                )}
                              </div>
                              <p style={{
                                fontSize: '12px', color: '#6b7280',
                                fontWeight: 500, lineHeight: 1.4, margin: 0
                              }}>
                                {addr.street}, {addr.city}, {addr.state}
                              </p>
                              <p style={{
                                fontSize: '12px', fontWeight: 700,
                                color: '#374151', margin: '2px 0 0'
                              }}>
                                📍 {addr.zip}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{
                        textAlign: 'center', padding: '28px 20px',
                        border: '2px dashed #e5e7eb', borderRadius: '12px',
                        background: '#fafafa'
                      }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          background: '#f3f4f6', margin: '0 auto 10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <PlaceIcon style={{ fontSize: '24px', color: '#d1d5db' }} />
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', margin: 0 }}>
                          No saved addresses found
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                          Add an address to get started
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add New Address Link */}
                <Link
                  to="/addresses"
                  onClick={() => setAddressOpen(false)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '13px', fontWeight: 700, color: '#2874f0',
                    textDecoration: 'none', marginBottom: '20px',
                    padding: '8px 14px',
                    border: '2px dashed #93c5fd',
                    borderRadius: '10px',
                    background: '#f0f7ff',
                    transition: 'all 0.2s',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#2874f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f0f7ff'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                >
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
                  Add a new address
                </Link>

                {/* Divider */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '12px', marginBottom: '16px'
                }}>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                  <span style={{
                    fontSize: '10px', fontWeight: 800, color: '#9ca3af',
                    textTransform: 'uppercase', letterSpacing: '1px',
                    whiteSpace: 'nowrap'
                  }}>
                    Or enter pincode
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>

                {/* Pincode Form */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '12px', top: '50%',
                      transform: 'translateY(-50%)', fontSize: '14px',
                      color: '#9ca3af', pointerEvents: 'none'
                    }}>📮</span>
                    <input
                      type="text"
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 700001"
                      maxLength={6}
                      style={{
                        width: '100%', padding: '11px 14px 11px 34px',
                        border: '2px solid #e5e7eb', borderRadius: '10px',
                        fontSize: '13px', fontWeight: 600, color: '#111827',
                        background: '#fafafa', outline: 'none',
                        boxSizing: 'border-box', transition: 'all 0.2s',
                        fontFamily: 'inherit'
                      }}
                      onFocus={e => { e.target.style.borderColor = '#2874f0'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(40,116,240,0.12)'; }}
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
                      padding: '11px 18px',
                      background: pincodeInput.length === 6 ? '#2874f0' : '#e5e7eb',
                      color: pincodeInput.length === 6 ? '#fff' : '#9ca3af',
                      border: 'none', borderRadius: '10px',
                      fontSize: '13px', fontWeight: 700,
                      cursor: pincodeInput.length === 6 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s', flexShrink: 0,
                      fontFamily: 'inherit'
                    }}
                    onMouseEnter={e => { if (pincodeInput.length === 6) e.currentTarget.style.background = '#1d4ed8'; }}
                    onMouseLeave={e => { if (pincodeInput.length === 6) e.currentTarget.style.background = '#2874f0'; }}
                  >
                    Apply
                  </button>
                </div>

                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', fontWeight: 500 }}>
                  Enter a valid 6-digit Indian postal code
                </p>
              </div>

              {/* Footer */}
              <div style={{
                borderTop: '1px solid #f1f5f9',
                padding: '14px 20px',
                background: '#fafafa',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px' }}>🔒</span>
                  <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                    Your address is safe &amp; secure
                  </span>
                </div>
                <button
                  onClick={() => setAddressOpen(false)}
                  style={{
                    padding: '7px 16px', borderRadius: '8px',
                    border: '1.5px solid #e5e7eb', background: '#fff',
                    fontSize: '12px', fontWeight: 700, color: '#374151',
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADJUSTED TOP SPACER BELOW FIXED NAVBAR */}
      <div
        className="spacer-fixed transition-all duration-300 h-[152px] md:h-[132px]"
        style={{
          height: isCartPage ? '60px' : undefined
        }}
      />

      {/* SIDEBAR OVERLAY & DRAWER FOR MOBILE / TABLET */}
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
              <div style={{ background: '#14327a', color: 'white', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isAuthenticated && user?.avatar ? (
                  <img src={user.avatar} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
                ) : (
                  <PersonOutlineIcon style={{ fontSize: '30px' }} />
                )}
                <span style={{ fontSize: '18px', fontWeight: 800 }}>Hello, {user?.name || 'Sign in'}</span>
              </div>
              <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', top: '15px', left: '380px', cursor: 'pointer', color: 'white', zIndex: 10001 }}>
                <CloseIcon style={{ fontSize: '32px' }} />
              </div>

              <div style={{ padding: '20px 0', color: '#111' }}>
                <h3 style={{ padding: '0 36px', fontSize: '16px', fontWeight: 800, marginBottom: '10px', color: '#14327a' }}>Trending</h3>
                <Link to="/products" onClick={() => setSidebarOpen(false)} style={{ display: 'block', padding: '12px 36px', color: '#111', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Bestsellers</Link>
                <Link to="/products" onClick={() => setSidebarOpen(false)} style={{ display: 'block', padding: '12px 36px', color: '#111', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>New Releases</Link>

                <div style={{ borderTop: '1px solid #d5d9d9', margin: '10px 0' }}></div>

                <h3 style={{ padding: '0 36px', fontSize: '16px', fontWeight: 800, margin: '10px 0', color: '#14327a' }}>Shop by Category</h3>
                <Link to="/products?gender=kids" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 36px', color: '#111', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                  Kids' Fashion <span style={{ color: '#888' }}>›</span>
                </Link>
                <Link to="/products?gender=men" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 36px', color: '#111', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                  Men's Fashion <span style={{ color: '#888' }}>›</span>
                </Link>
                <Link to="/products?gender=women" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 36px', color: '#111', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                  Women's Fashion <span style={{ color: '#888' }}>›</span>
                </Link>

                <AnimatePresence>
                  {showAllCategories && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <Link to="/products?occasion=Wedding Guest" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Wedding Guest <span style={{ color: '#888' }}>›</span>
                      </Link>
                      <Link to="/products?occasion=Party Night" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Party Night <span style={{ color: '#888' }}>›</span>
                      </Link>
                      <Link to="/products?occasion=Office Wear" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 36px', color: '#111', textDecoration: 'none', fontSize: '14px' }}>
                        Office Wear <span style={{ color: '#888' }}>›</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div onClick={() => setShowAllCategories(!showAllCategories)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 36px', color: '#2874f0', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
                  {showAllCategories ? 'See less' : 'See all'}
                  <ExpandMoreIcon style={{ fontSize: '18px', color: '#2874f0', transform: showAllCategories ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </div>

                <div style={{ borderTop: '1px solid #d5d9d9', margin: '10px 0' }}></div>

                <h3 style={{ padding: '0 36px', fontSize: '16px', fontWeight: 800, margin: '10px 0', color: '#14327a' }}>Help & Settings</h3>
                <Link to="/orders" onClick={() => setSidebarOpen(false)} style={{ display: 'block', padding: '12px 36px', color: '#111', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Your Orders</Link>
                {isAuthenticated ? (
                  <div onClick={() => { setSidebarOpen(false); logout(); }} style={{ display: 'block', padding: '12px 36px', color: '#dc2626', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>Sign Out</div>
                ) : (
                  <Link to="/login" onClick={() => setSidebarOpen(false)} style={{ display: 'block', padding: '12px 36px', color: '#2874f0', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>Sign In</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CAMERA VISUAL SEARCH SHEET MODAL */}
      <AnimatePresence>
        {cameraSheetOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCameraSheetOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                position: 'relative', width: '100%', maxWidth: '500px',
                background: '#ffffff',
                borderRadius: '24px 24px 0 0',
                padding: '24px 20px 32px',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
                zIndex: 2
              }}
            >
              <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: '0 0 6px', textAlign: 'center' }}>
                Visual Search
              </h3>
              <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '20px' }}>
                Upload or capture an outfit photo to find matching items
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 18px', borderRadius: '14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}>
                  <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(40, 116, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2874f0' }}>
                    <PhotoLibraryRoundedIcon sx={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>1. Choose from Gallery</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Upload an existing photo from your library</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 18px', borderRadius: '14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}>
                  <input type="file" accept="image/*" capture="environment" onChange={handleImageSelect} style={{ display: 'none' }} />
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                    <PhotoCameraRoundedIcon sx={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>2. Click Photo</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Snap a fresh picture using your camera</div>
                  </div>
                </label>
              </div>

              <button
                onClick={() => setCameraSheetOpen(false)}
                style={{
                  width: '100%', marginTop: '20px', padding: '13px',
                  borderRadius: '12px', background: '#f1f5f9', color: '#475569',
                  fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
