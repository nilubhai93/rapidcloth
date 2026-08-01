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
import CheckroomIcon from '@mui/icons-material/CheckroomRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const SEARCH_PLACEHOLDERS = [
  " Banarasi Silk Sarees...",
  " Designer Sherwanis...",
  " Anarkali Suit Sets...",
  " Tuxedos & Blazers...",
  " Indo-Western Dresses...",
  " Wedding Lehengas...",
  " Evening Cocktail Gowns...",
  " Designer Kurtis & Kurtas..."
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
  const [rentOpen, setRentOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [pincodeInput, setPincodeInput] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const rentRef = useRef(null);
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
      if (rentRef.current && !rentRef.current.contains(e.target)) setRentOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
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

  if (isAuthPage || location.pathname.startsWith('/delivery') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller') || location.pathname.startsWith('/rent')) {
    return null;
  }

  // Desktop 13 category list with bespoke SVG icons
  const desktopCategories = [
    {
      id: 'all',
      title: 'All',
      link: '/products',
      isActive: location.pathname === '/products' && !location.search,
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="8" height="8" rx="2.5" fill="#ffe500" stroke="#1d4ed8" strokeWidth="2" />
          <rect x="13" y="3" width="8" height="8" rx="2.5" fill="#1d4ed8" stroke="#1d4ed8" strokeWidth="2" />
          <rect x="3" y="13" width="8" height="8" rx="2.5" fill="#1d4ed8" stroke="#1d4ed8" strokeWidth="2" />
          <rect x="13" y="13" width="8" height="8" rx="2.5" fill="#ffe500" stroke="#1d4ed8" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'm-tshirt',
      title: 'M-Tshirt',
      link: '/products?category=tshirt&gender=men',
      isActive: location.search.includes('tshirt') && location.search.includes('men'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L8 3H16L20 6V9L17 8V21H7V8L4 9V6Z" fill="#3b82f6" fillOpacity="0.2" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 3C9 4.65685 10.3431 6 12 6C13.6569 6 15 4.65685 15 3" stroke="#2874f0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'm-shirts',
      title: 'M-Shirts',
      link: '/products?category=shirt&gender=men',
      isActive: location.search.includes('category=shirt') && location.search.includes('men'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4L9 2H15L18 4V9L15.5 8V21H8.5V8L6 9V4Z" fill="#0284c7" fillOpacity="0.2" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 2L12 6L15 2" stroke="#2874f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="0.8" fill="#1d4ed8" />
          <circle cx="12" cy="14" r="0.8" fill="#1d4ed8" />
          <circle cx="12" cy="18" r="0.8" fill="#1d4ed8" />
        </svg>
      )
    },
    {
      id: 'm-jeans',
      title: 'M-Jeans',
      link: '/products?category=jeans&gender=men',
      isActive: location.search.includes('jeans') && location.search.includes('men'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 4C5 3.44772 5.44772 3 6 3H18C18.5523 3 19 3.44772 19 4V7L16.5 21H12.5L12 11L11.5 21H7.5L5 7V4Z" fill="#2563eb" fillOpacity="0.2" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
          <path d="M5 7H19" stroke="#1e293b" strokeWidth="1.8" />
          <path d="M8 7V9M16 7V9" stroke="#ffe500" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'w-shirts',
      title: 'W-Shirts',
      link: '/products?category=shirt&gender=women',
      isActive: location.search.includes('category=shirt') && location.search.includes('women'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5L8 3H16L19 5V8.5L16.5 7.5V20C16.5 20.5523 16.0523 21 15.5 21H8.5C7.94772 21 7.5 20.5523 7.5 20V7.5L5 8.5V5Z" fill="#ec4899" fillOpacity="0.2" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 3C9 5 10.5 7 12 7C13.5 7 15 5 15 3" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'baba-suits',
      title: 'Baba suits',
      link: '/products?category=baba-suit',
      isActive: location.search.includes('baba-suit'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3H18V9L16 8V14H8V8L6 9V3Z" fill="#f59e0b" fillOpacity="0.2" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
          <rect x="7" y="14" width="10" height="7" rx="1.5" fill="#ffe500" stroke="#1e293b" strokeWidth="2" />
          <path d="M10 5L12 7L14 5" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'frocks',
      title: 'Frocks',
      link: '/products?category=frock',
      isActive: location.search.includes('frock'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 3H15L17 8L21 20C21.3 21 20 21.5 19 21.5H5C4 21.5 2.7 21 3 20L7 8L9 3Z" fill="#a855f7" fillOpacity="0.2" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
          <path d="M7 8H17" stroke="#a855f7" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'w-jeans',
      title: 'W-Jeans',
      link: '/products?category=jeans&gender=women',
      isActive: location.search.includes('jeans') && location.search.includes('women'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3H18V6L16.5 21H12.5L12 12L11.5 21H7.5L6 6V3Z" fill="#6366f1" fillOpacity="0.2" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
          <path d="M6 6H18" stroke="#1e293b" strokeWidth="1.8" />
          <path d="M9 6C9 8 10 9 12 9C14 9 15 8 15 6" stroke="#6366f1" strokeWidth="1.8" />
        </svg>
      )
    },
    {
      id: 'kurta-pyjama',
      title: 'Kurta-Pyjama',
      link: '/products?category=kurta',
      isActive: location.search.includes('kurta'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 3L10 2H14L17 3V7L15 6.5V17L17 18V21H7V18L9 17V6.5L7 7V3Z" fill="#14327a" fillOpacity="0.2" stroke="#14327a" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 2V10" stroke="#ffe500" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'lehenga-choli',
      title: 'Lehenga Choli',
      link: '/products?category=lehenga-choli',
      isActive: location.search.includes('lehenga-choli'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3H16L18 8H6L8 3Z" fill="#e11d48" fillOpacity="0.25" stroke="#9f1239" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 11H15L19 21H5L9 11Z" fill="#e11d48" fillOpacity="0.2" stroke="#9f1239" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'saree',
      title: 'Saree',
      link: '/products?category=saree',
      isActive: location.search.includes('saree'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 4C5 4 8 3 12 5C16 7 19 4 19 4V20C19 20 16 21 12 19C8 17 5 20 5 20V4Z" fill="#d97706" fillOpacity="0.2" stroke="#78350f" strokeWidth="2" strokeLinejoin="round" />
          <path d="M5 4L19 14" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'top',
      title: 'Top',
      link: '/products?category=top',
      isActive: location.search.includes('category=top'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4L9 2H15L18 4V8L15 7V16C15 16.5523 14.5523 17 14 17H10C9.44772 17 9 16.5523 9 16V7L6 8V4Z" fill="#06b6d4" fillOpacity="0.25" stroke="#0e7490" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 2C9 4 10.5 5.5 12 5.5C13.5 5.5 15 2 15 2" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'lehengas',
      title: 'Lehengas',
      link: '/products?category=lehenga',
      isActive: location.search.includes('category=lehenga') && !location.search.includes('lehenga-choli'),
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 4H16L20 20C20.3 21 19 21.5 18 21.5H6C5 21.5 3.7 21 4 20L8 4Z" fill="#c026d3" fillOpacity="0.2" stroke="#701a75" strokeWidth="2" strokeLinejoin="round" />
          <path d="M8 4H16" stroke="#ffe500" strokeWidth="2.5" />
        </svg>
      )
    }
  ];

  return (
    <>
      <header className="navbar-fixed-container fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200/90 shadow-xs transition-all duration-300 font-sans">

        {/* MOBILE VIEW ONLY: 4 STACKED ROWS FOR ALL MOBILE DIMENSION DEVICES (md:hidden) */}
        {!isCartPage && (
          <div className="md:hidden bg-white px-3.5 py-2.5 flex flex-col gap-2.5 border-b border-slate-200/80 shadow-xs">

            {/* ROW 1: BRAND LOGO ON LEFT & AI STYLIST HEADING/BUTTON ON RIGHT */}
            <div className="flex items-center justify-between w-full">
              <Link to="/shop" className="flex items-center gap-2 text-[#14327a] font-black tracking-tight text-decoration-none shrink-0">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#14327a] via-[#2874f0] to-[#ffe500] text-white flex items-center justify-center font-black shadow-xs text-sm">
                  R
                </div>
                <div className="flex flex-col leading-none text-left">
                  <span className="font-black text-base tracking-tight bg-gradient-to-r from-[#14327a] via-[#2874f0] to-[#14327a] bg-clip-text text-transparent">
                    RapidCloth
                  </span>
                  <span className="text-[8px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">
                    Fashion &amp; Apparel Hub
                  </span>
                </div>
              </Link>

              {/* AI Stylist Button / Heading */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-stylist'))}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black text-white cursor-pointer border-none shadow-md hover:shadow-lg transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #14327a 0%, #2874f0 50%, #8b5cf6 100%)'
                }}
              >
                <AutoAwesomeIcon style={{ fontSize: '15px', color: '#ffe500' }} />
                <span>AI Stylist</span>
              </button>
            </div>

            {/* ROW 2: ADDRESS BAR ONLY */}
            <div
              onClick={() => setAddressOpen(true)}
              className="flex items-center gap-2.5 cursor-pointer py-2 px-3.5 bg-[#f0f5ff] hover:bg-[#e4edff] active:bg-[#dbeafe] border border-blue-200/90 rounded-2xl transition-all w-full shadow-2xs box-sizing-border"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#2874f0] to-[#1e4db7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <PlaceIcon style={{ fontSize: '16px' }} />
              </div>
              <div className="flex flex-col min-w-0 text-left flex-1">
                <span className="text-[9.5px] text-[#2874f0] font-black uppercase tracking-wider leading-none">
                  Deliver to
                </span>
                <span className="text-[12.5px] font-extrabold text-slate-900 truncate leading-tight mt-0.5">
                  {(() => {
                    const active = selectedAddress || user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
                    if (active) {
                      if (active.type === 'pincode') return `Pincode: ${active.zip}`;
                      return `${active.city || active.street || ''} ${active.zip || ''}`.trim();
                    }
                    return t('navbar.selectAddress') || 'Select delivery location';
                  })()}
                </span>
              </div>
              <ExpandMoreIcon style={{ fontSize: '20px', color: '#2874f0' }} className={`transform transition-transform duration-200 ${addressOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* ROW 3: SEARCH BAR WITH CAMERA & MICROPHONE OPTIONS */}
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative flex items-center w-full bg-[#f8fafc] border border-slate-200/90 focus-within:border-[#2874f0] focus-within:bg-white rounded-2xl px-3 py-1.5 shadow-2xs transition-all">
                <SearchIcon style={{ fontSize: '19px', color: '#94a3b8' }} className="shrink-0 mr-1.5" />
                <input
                  type="text"
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                />

                {/* Camera & Microphone Option Icons */}
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <button
                    type="button"
                    title="Camera Visual Search"
                    onClick={() => alert("Visual Camera Search: Upload or scan apparel photo")}
                    className="w-7.5 h-7.5 rounded-full text-slate-600 hover:text-[#2874f0] hover:bg-blue-50 bg-slate-100/80 border-none cursor-pointer flex items-center justify-center transition-all"
                  >
                    <PhotoCameraRoundedIcon style={{ fontSize: '17px' }} />
                  </button>
                  <button
                    type="button"
                    title="Voice Search"
                    onClick={() => alert("Voice Search: Speak to search fashion items...")}
                    className="w-7.5 h-7.5 rounded-full text-slate-600 hover:text-[#2874f0] hover:bg-blue-50 bg-slate-100/80 border-none cursor-pointer flex items-center justify-center transition-all"
                  >
                    <MicRoundedIcon style={{ fontSize: '17px' }} />
                  </button>
                  <button
                    type="submit"
                    className="w-7.5 h-7.5 rounded-full bg-[#2874f0] text-white hover:bg-[#1e4db7] border-none cursor-pointer flex items-center justify-center shadow-xs transition-all"
                  >
                    <SearchIcon style={{ fontSize: '15px' }} />
                  </button>
                </div>
              </div>
            </form>

            {/* ROW 4: BOTTOM PORTION PRODUCT CATEGORIES STRIP WITH BESPOKE ICONS */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-100/80 mt-0.5 -mx-1 px-1">
              {desktopCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl transition-all duration-200 shrink-0 text-decoration-none min-w-[58px] ${cat.isActive
                      ? 'bg-blue-50 text-[#2874f0] font-bold shadow-2xs'
                      : 'text-slate-700 font-medium hover:bg-slate-50'
                    }`}
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center">
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-bold whitespace-nowrap leading-none">
                    {cat.title}
                  </span>
                </Link>
              ))}
            </div>

          </div>
        )}

        {/* MOBILE VIEW ONLY WHEN ON CART PAGE: BACK ARROW, SEARCH BAR & CART OPTION */}
        {isCartPage && (
          <div className="md:hidden bg-white px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-slate-200/80 shadow-xs">
            {/* Back Arrow Icon */}
            <motion.button
              type="button"
              onClick={() => navigate('/shop')}
              whileHover={{ scale: 1.08, x: -3 }}
              whileTap={{ scale: 0.93 }}
              title="Back to Home"
              className="w-9.5 h-9.5 rounded-2xl bg-[#f0f5ff] active:bg-[#2874f0] text-[#2874f0] active:text-white border border-blue-200 flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-2xs"
            >
              <ArrowBackRoundedIcon style={{ fontSize: '20px' }} />
            </motion.button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 min-w-0 relative">
              <div className="relative flex items-center w-full bg-[#f8fafc] border border-slate-200 focus-within:border-[#2874f0] focus-within:bg-white rounded-2xl px-2.5 py-1.5 shadow-2xs transition-all">
                <SearchIcon style={{ fontSize: '17px', color: '#94a3b8' }} className="shrink-0 mr-1" />
                <input
                  type="text"
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                />
              </div>
            </form>

            {/* Redesigned Cart Option */}
            <Link
              to="/cart"
              className="flex items-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-[#2874f0] to-[#14327a] text-white rounded-2xl shadow-xs shrink-0 text-decoration-none"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCartIcon className="!text-lg text-white" />
                <span className="absolute -top-2 -right-2 bg-[#ffe500] text-[#14327a] text-[9px] font-black rounded-full min-w-[16px] h-[16px] px-0.5 flex items-center justify-center border border-white">
                  {itemCount}
                </span>
              </div>
              <span className="text-xs font-black text-white">Cart</span>
            </Link>
          </div>
        )}

        {/* DESKTOP VIEW (md:flex / md:block): 3 HORIZONTAL PARTS WITH SCOPED CUSTOM STYLES */}

        {/* PART 1 (DESKTOP TOP PORTION): BRAND LOGO ON LEFT & ADDRESS BAR ON RIGHT */}
        {!isCartPage && (
          <div
            className="hidden md:flex items-center"
            style={{
              width: '100%',
              maxWidth: '1440px',
              margin: '0 auto',
              paddingLeft: '24px',
              paddingRight: '24px',
              paddingTop: '10px',
              paddingBottom: '6px',
              boxSizing: 'border-box'
            }}
          >
            {/* Brand Logo */}
            <Link to="/shop" className="flex items-center gap-2 text-[#14327a] font-black tracking-tight text-decoration-none shrink-0 group">
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#14327a] via-[#2874f0] to-[#ffe500] text-white flex items-center justify-center font-black shadow-xs text-base group-hover:scale-105 transition-transform">
                R
              </div>
              <div className="flex flex-col leading-none text-left">
                <span className="font-extrabold text-lg lg:text-xl bg-gradient-to-r from-[#14327a] via-[#2874f0] to-[#14327a] bg-clip-text text-transparent">
                  RapidCloth
                </span>
                <span className="text-[9px] lg:text-[9.5px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">
                  Fashion &amp; Apparel Hub
                </span>
              </div>
            </Link>

            {/* Address Bar Widget (Slides to Brand Logo when addressOpen is true) */}
            <div
              ref={addressRef}
              onClick={(e) => { e.stopPropagation(); setAddressOpen(!addressOpen); }}
              className={`flex items-center gap-2.5 cursor-pointer py-1.5 px-4 rounded-2xl transition-all text-gray-700 font-medium group shrink-0 min-w-[280px] lg:min-w-[340px] max-w-[380px] ${addressOpen
                  ? 'bg-[#e4edff] border-2 border-[#2874f0] shadow-md ring-4 ring-blue-100/80'
                  : 'bg-[#f0f5ff] hover:bg-[#e4edff] border border-blue-200/90 shadow-2xs'
                }`}
              style={{
                marginLeft: addressOpen ? '28px' : 'auto',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-[#2874f0] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <PlaceIcon className="!text-lg text-white" />
              </div>
              <div className="flex flex-col min-w-0 text-left flex-1">
                <span className="text-[10px] text-blue-600 font-extrabold leading-none uppercase tracking-wider">
                  Deliver to
                </span>
                <span className="text-xs lg:text-[13px] font-bold text-gray-900 truncate leading-tight group-hover:text-[#2874f0] transition-colors mt-0.5">
                  {(() => {
                    const active = selectedAddress || user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
                    if (active) {
                      if (active.type === 'pincode') return `Pincode: ${active.zip}`;
                      return `${active.city || active.street || ''} ${active.zip || ''}`.trim();
                    }
                    return t('navbar.selectAddress') || 'Select delivery location';
                  })()}
                </span>
              </div>
              <ExpandMoreIcon className={`!text-lg text-gray-500 group-hover:text-[#2874f0] transition-transform duration-200 shrink-0 ${addressOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        )}

        {/* PART 2 (DESKTOP MIDDLE PORTION): SEARCH BAR & ACCOUNT, LANGUAGE, CART */}
        <div
          className="hidden md:flex items-center justify-between"
          style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingTop: '6px',
            paddingBottom: '10px',
            gap: '18px',
            boxSizing: 'border-box'
          }}
        >
          {/* ONLY ON CART PAGE: ANIMATED BACK ARROW BUTTON BEFORE SEARCH BAR */}
          {isCartPage && (
            <motion.button
              type="button"
              onClick={() => navigate('/shop')}
              whileHover={{ scale: 1.08, x: -3 }}
              whileTap={{ scale: 0.93 }}
              title="Back to Home"
              className="flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-[#f0f5ff] hover:bg-[#2874f0] text-[#2874f0] hover:text-white border border-blue-200/90 shadow-2xs hover:shadow-md transition-all duration-200 shrink-0 cursor-pointer group"
            >
              <ArrowBackRoundedIcon className="!text-xl transition-transform duration-200 group-hover:-translate-x-1" />
              <span className="text-xs font-black tracking-wide hidden lg:inline">Back</span>
            </motion.button>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-3xl lg:max-w-4xl relative">
            <div
              className="relative flex items-center w-full transition-all duration-200"
              style={{
                backgroundColor: '#f4f7fc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '3px 4px 3px 6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                boxSizing: 'border-box'
              }}
            >
              {/* Category Select Dropdown */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', shrink: 0 }}>
                <select
                  className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                  style={{
                    padding: '8px 12px',
                    borderRight: '1.5px solid #cbd5e1',
                    fontFamily: 'inherit',
                    appearance: 'none',
                    paddingRight: '22px'
                  }}
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
                <ExpandMoreIcon
                  style={{
                    fontSize: '16px',
                    color: '#64748b',
                    position: 'absolute',
                    right: '4px',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Input Field with Search Icon */}
              <div className="flex-1 flex items-center min-w-0 relative px-2">
                <SearchIcon style={{ fontSize: '18px', color: '#94a3b8', marginRight: '6px', shrink: 0 }} />
                <input
                  type="text"
                  className="w-full bg-transparent py-2 text-xs lg:text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none min-w-0"
                  style={{ border: 'none', fontFamily: 'inherit' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                />
              </div>

              {/* High-Contrast Search Action Button */}
              <div className="shrink-0">
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#2874f0',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 20px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 10px rgba(40, 116, 240, 0.35)',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e4db7'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2874f0'}
                >
                  <SearchIcon style={{ fontSize: '16px', color: '#ffffff' }} />
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

          {/* Rent, Account & Lists, Language, Cart Buttons */}
          <div className="flex items-center gap-2.5 lg:gap-3.5 shrink-0">
            {/* Rent Dropdown Button */}
            {!isCartPage && (
              <div
                ref={rentRef}
                className="relative group shrink-0"
                onMouseEnter={() => setRentOpen(true)}
                onMouseLeave={() => setRentOpen(false)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRentOpen(false);
                    navigate('/rent');
                  }}
                  className={`flex items-center gap-2.5 py-2 px-3.5 lg:px-4 rounded-2xl transition-all duration-200 cursor-pointer shadow-2xs font-sans border text-decoration-none ${isRentPage
                      ? 'bg-gradient-to-r from-[#14327a] via-[#2874f0] to-[#14327a] text-white border-blue-600 shadow-md ring-2 ring-blue-200'
                      : 'bg-[#f8fafc] hover:bg-[#ebf2fe] border border-slate-200/90 hover:border-blue-300 text-gray-800'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs overflow-hidden shadow-xs shrink-0 ${isRentPage ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#2874f0]'
                    }`}>
                    <CheckroomIcon className="!text-lg" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`text-[10px] font-semibold leading-none ${isRentPage ? 'text-blue-100' : 'text-gray-500'}`}>
                      Fashion
                    </span>
                    <div className="flex items-center gap-1 text-xs lg:text-[13px] font-extrabold leading-tight mt-0.5 group-hover:text-[#2874f0] transition-colors">
                      <span className={isRentPage ? 'text-white' : 'text-gray-900'}>Rent</span>
                      <motion.div animate={{ rotate: rentOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ExpandMoreIcon className={`!text-base ${isRentPage ? 'text-white' : 'text-gray-500 group-hover:text-[#2874f0]'}`} />
                      </motion.div>
                    </div>
                  </div>
                </button>

                {/* Rent Options Dropdown Menu */}
                <AnimatePresence>
                  {rentOpen && (
                    <div className="book-container" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 2000, marginTop: '8px' }}>
                      <motion.div
                        className="book-popup profile-menu-popup"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scaleY: 0, opacity: 0, transformOrigin: 'top left' }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        exit={{ scaleY: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{
                          background: '#ffffff',
                          borderRadius: '16px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                          border: '1px solid #e2e8f0',
                          minWidth: '250px',
                          padding: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckroomIcon style={{ fontSize: '18px', color: '#2874f0' }} />
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Rent Outfits</span>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#2874f0', padding: '2px 6px', borderRadius: '10px' }}>
                            PREMIUM
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <Link
                            to="/rent"
                            onClick={() => setRentOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-blue-50 hover:text-[#2874f0] transition-colors text-decoration-none"
                          >
                            <span>✨</span>
                            <span>Browse All Rentals</span>
                          </Link>
                          <Link
                            to="/rent/category?gender=men"
                            onClick={() => setRentOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#2874f0] transition-colors text-decoration-none"
                          >
                            <span>👔</span>
                            <span>Men's Tuxedos & Sherwanis</span>
                          </Link>
                          <Link
                            to="/rent/category?gender=women"
                            onClick={() => setRentOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#2874f0] transition-colors text-decoration-none"
                          >
                            <span>👗</span>
                            <span>Women's Designer Lehengas</span>
                          </Link>
                          <Link
                            to="/rent/cart"
                            onClick={() => setRentOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#2874f0] transition-colors text-decoration-none"
                          >
                            <span>🛍️</span>
                            <span>My Rental Bag</span>
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Account Dropdown */}
            {!isCartPage && (
              <div
                ref={profileRef}
                onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
                className="relative group cursor-pointer py-2 px-3.5 lg:px-4 bg-[#f8fafc] hover:bg-[#ebf2fe] border border-slate-200/90 hover:border-blue-300 rounded-2xl transition-all shadow-2xs shrink-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#2874f0] text-white flex items-center justify-center font-extrabold text-xs overflow-hidden shadow-xs border border-blue-200 shrink-0">
                    {isAuthenticated && user?.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <PersonOutlineIcon className="!text-lg text-white" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-gray-500 font-semibold leading-none">
                      {t('navbar.hello')}, {isAuthenticated ? user?.name?.split(' ')[0] : t('navbar.signIn')}
                    </span>
                    <div className="flex items-center gap-1 text-xs lg:text-[13px] font-bold text-gray-900 leading-tight mt-0.5 group-hover:text-[#2874f0] transition-colors">
                      <span>{t('navbar.accountAndLists')}</span>
                      <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ExpandMoreIcon className="!text-base text-gray-500 group-hover:text-[#2874f0]" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Profile Modal Menu */}
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

            {/* Language Switcher */}
            {!isCartPage && (
              <div
                ref={langRef}
                onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
                className="flex items-center gap-1.5 cursor-pointer py-2 px-3 lg:px-3.5 bg-[#f8fafc] hover:bg-[#ebf2fe] border border-slate-200/90 hover:border-blue-300 rounded-2xl transition-all text-gray-800 font-bold text-xs relative shrink-0 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-100/90 text-[#2874f0] flex items-center justify-center shrink-0">
                  <TranslateIcon className="!text-sm text-[#2874f0]" />
                </div>
                <span className="font-extrabold text-xs text-gray-900">{language}</span>
                <motion.div animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ExpandMoreIcon className="!text-base text-gray-500" />
                </motion.div>

                {/* Language Modal Menu */}
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

            {/* Redesigned Shopping Cart Button */}
            <Link
              to={isRentPage ? '/rent/cart' : '/cart'}
              className={`flex items-center gap-2.5 py-2 px-4 lg:px-5 text-white rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 group text-decoration-none shrink-0 ${isCartPage
                  ? 'bg-gradient-to-r from-[#14327a] via-[#2874f0] to-[#14327a] ring-2 ring-blue-300 border border-blue-400'
                  : 'bg-gradient-to-r from-[#2874f0] to-[#14327a] hover:from-[#1e4db7] hover:to-[#0f2456]'
                }`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCartIcon className="!text-xl text-white group-hover:-rotate-12 transition-transform duration-300" />
                <span className="absolute -top-2.5 -right-2.5 bg-[#ffe500] text-[#14327a] text-[10px] font-black rounded-full min-w-[19px] h-[19px] px-1 flex items-center justify-center shadow-xs border-2 border-white">
                  {itemCount}
                </span>
              </div>
              <span className="text-xs lg:text-sm font-black text-white tracking-wide">
                {isCartPage ? 'Your Bag' : 'Cart'}
              </span>
            </Link>
          </div>
        </div>

        {/* THIN LINE DIVIDER (CONTAINED TO MAIN PAGE WIDTH) */}
        {!isCartPage && (
          <div
            className="hidden md:block"
            style={{
              width: '100%',
              maxWidth: '1440px',
              margin: '0 auto',
              paddingLeft: '24px',
              paddingRight: '24px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ width: '100%', borderTop: '1px solid rgba(229, 231, 235, 0.8)' }} />
          </div>
        )}

        {/* PART 3 (DESKTOP BOTTOM PORTION): 13 PRODUCT CATEGORIES WITH BESPOKE ICONS */}
        {!isCartPage && (
          <div
            className="hidden md:block bg-white"
            style={{
              paddingTop: '4px',
              paddingBottom: '2px'
            }}
          >
            <div
              className="flex items-center justify-between overflow-x-auto scrollbar-none"
              style={{
                width: '100%',
                maxWidth: '1440px',
                margin: '0 auto',
                paddingLeft: '24px',
                paddingRight: '24px',
                gap: '4px',
                boxSizing: 'border-box'
              }}
            >
              {desktopCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className={`group flex flex-col items-center gap-0.5 px-1.5 lg:px-2 py-1 rounded-xl transition-all duration-200 relative text-decoration-none shrink-0 ${cat.isActive ? 'bg-blue-50/90 text-[#2874f0] font-bold' : 'text-gray-700 hover:text-[#2874f0] font-semibold hover:bg-gray-50'
                    }`}
                >
                  <div className="w-7.5 h-7.5 lg:w-8.5 lg:h-8.5 rounded-xl flex items-center justify-center text-gray-800 group-hover:text-[#2874f0] transition-all duration-300 transform group-hover:-translate-y-0.5 group-hover:scale-110">
                    {cat.icon}
                  </div>

                  <span className="text-[10px] lg:text-[11px] whitespace-nowrap tracking-tight transition-colors">
                    {cat.title}
                  </span>

                  {cat.isActive && (
                    <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#2874f0] rounded-full transition-all duration-300" />
                  )}
                </Link>
              ))}
            </div>

            {/* THIN LINE DIVIDER AFTER CATEGORIES (MATCHING IMAGE 1) */}
            <div
              style={{
                width: '100%',
                maxWidth: '1440px',
                margin: '4px auto 0 auto',
                paddingLeft: '24px',
                paddingRight: '24px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ width: '100%', borderTop: '1px solid rgba(229, 231, 235, 0.9)' }} />
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
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '13px' }}>🔒</span>
                <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 600 }}>
                  Your address is safe &amp; secure
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADJUSTED TOP SPACER BELOW FIXED NAVBAR */}
      <div
        className="spacer-fixed transition-all duration-300 h-[196px] md:h-[178px]"
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
