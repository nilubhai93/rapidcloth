import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/index';

// Zero-Overhead Lightweight SVG Icon Components (No MUI/Emotion runtime overhead)
const SearchIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.35" y2="16.35" />
  </svg>
);

const ShoppingCartIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const PersonOutlineIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MenuIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const PlaceIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TranslateIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="3.6" y1="9" x2="20.4" y2="9" />
    <line x1="3.6" y1="15" x2="20.4" y2="15" />
    <path d="M11.5 3a17 17 0 0 0 0 18" />
    <path d="M12.5 3a17 17 0 0 1 0 18" />
  </svg>
);

const ExpandMoreIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AutoAwesomeIcon = ({ className = "w-4 h-4", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '16px', height: style.fontSize || '16px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="currentColor">
    <path d="m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z" />
  </svg>
);

const PhotoCameraRoundedIcon = ({ className = "w-5 h-5", style = {}, sx = {} }) => (
  <svg className={className} style={{ width: sx?.fontSize || style?.fontSize || '20px', height: sx?.fontSize || style?.fontSize || '20px', color: style?.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const PhotoLibraryRoundedIcon = ({ className = "w-5 h-5", style = {}, sx = {} }) => (
  <svg className={className} style={{ width: sx?.fontSize || style?.fontSize || '20px', height: sx?.fontSize || style?.fontSize || '20px', color: style?.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const MicRoundedIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const CheckroomIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 1 2 2c0 .9-.6 1.7-1.5 1.9L4 15v3h16v-3l-8.5-3.1" />
  </svg>
);

const ArrowBackRoundedIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={{ width: style.fontSize || '20px', height: style.fontSize || '20px', color: style.color || 'currentColor', ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

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
  const { isAuthenticated, user, logout, openLoginModal } = useAuth();
  const { itemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isRentPage = location.pathname.startsWith('/rent');
  const isCartPage = location.pathname === '/cart' || location.pathname === '/rent/cart';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isHomePage = location.pathname === '/' || location.pathname === '/shop' || location.pathname === '/ai-stylist';
  const isProfilePage = location.pathname === '/profile';

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

  const [showFullHeader, setShowFullHeader] = useState(true);
  const [clickedCatId, setClickedCatId] = useState(null);
  const lastScrollY = useRef(0);

  const handleCategoryClick = (catId) => {
    setClickedCatId(catId);
    setTimeout(() => setClickedCatId(null), 450);
  };

  // Butter-Smooth 60fps Scroll-driven Navbar Transformation
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastY;

      if (currentScrollY <= 30) {
        setShowFullHeader(true);
      } else if (diff > 8) {
        // Scrolling down: collapse top logo & address rows
        setShowFullHeader(false);
      } else if (diff < -8) {
        // Scrolling up: expand to full header
        setShowFullHeader(true);
      }
      lastY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  // Desktop 14 dress-related category list with human-crafted SVG icons
  const desktopCategories = [
    {
      id: 'all',
      title: 'For You',
      link: '/shop',
      isActive: location.pathname === '/' || location.pathname === '/shop' || (location.pathname === '/products' && !location.search),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="2" fill="#2874f0" fillOpacity="0.2" stroke="#2874f0" />
          <rect x="14" y="3" width="7" height="7" rx="2" fill="#14327a" fillOpacity="0.2" stroke="#14327a" />
          <rect x="3" y="14" width="7" height="7" rx="2" fill="#14327a" fillOpacity="0.2" stroke="#14327a" />
          <rect x="14" y="14" width="7" height="7" rx="2" fill="#2874f0" fillOpacity="0.2" stroke="#2874f0" />
        </svg>
      )
    },
    {
      id: 'dresses',
      title: 'Dresses',
      link: '/products?category=dress',
      isActive: location.search.includes('category=dress'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6l1.5 4.5h-9L9 3z" fill="#ec4899" fillOpacity="0.2" stroke="#db2777" />
          <path d="M7.5 7.5l-4 13.5h17l-4-13.5h-9z" fill="#f472b6" fillOpacity="0.2" stroke="#db2777" />
          <path d="M12 7.5v13.5" stroke="#db2777" strokeDasharray="1 2" />
        </svg>
      )
    },
    {
      id: 'indo-western',
      title: 'Indo-Western',
      link: '/products?category=indo-western',
      isActive: location.search.includes('category=indo-western'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3h8l1.5 5h-11L8 3z" fill="#8b5cf6" fillOpacity="0.2" stroke="#7c3aed" />
          <path d="M6.5 8h11l2 13h-15l2-13z" fill="#a78bfa" fillOpacity="0.2" stroke="#7c3aed" />
          <path d="M12 3v18" stroke="#7c3aed" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'lehengas',
      title: 'Lehengas',
      link: '/products?category=lehenga',
      isActive: location.search.includes('category=lehenga'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h10l1.5 4.5h-13L7 3z" fill="#e11d48" fillOpacity="0.25" stroke="#be123c" />
          <path d="M8 9.5h8l3.5 11.5h-15L8 9.5z" fill="#fda4af" fillOpacity="0.25" stroke="#be123c" />
          <path d="M4.5 21c5-2 10-2 15 0" stroke="#be123c" strokeWidth="1.6" />
        </svg>
      )
    },
    {
      id: 'saree',
      title: 'Sarees',
      link: '/products?category=saree',
      isActive: location.search.includes('category=saree'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 4c3-1 6 1 9 1s5-2 5-2v15c0 0-2 2-5 2s-6-2-9-1V4z" fill="#f59e0b" fillOpacity="0.2" stroke="#b45309" />
          <path d="M5 4l14 12" stroke="#d97706" strokeWidth="1.8" />
          <path d="M8 20c3-1 6 0 9 0" stroke="#b45309" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'gowns',
      title: 'Gowns',
      link: '/products?category=gown',
      isActive: location.search.includes('category=gown'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6l1.5 4h-9L9 3z" fill="#06b6d4" fillOpacity="0.2" stroke="#0891b2" />
          <path d="M7.5 7h9l3 14H4.5l3-14z" fill="#67e8f9" fillOpacity="0.2" stroke="#0891b2" />
          <path d="M9 11c3 1.5 6 1.5 6 0" stroke="#0891b2" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'anarkali',
      title: 'Anarkalis',
      link: '/products?category=anarkali',
      isActive: location.search.includes('category=anarkali'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3h8l1.5 4.5h-11L8 3z" fill="#10b981" fillOpacity="0.2" stroke="#047857" />
          <path d="M6.5 7.5h11l2.5 13.5h-16l2.5-13.5z" fill="#6ee7b7" fillOpacity="0.2" stroke="#047857" />
        </svg>
      )
    },
    {
      id: 'kurta',
      title: 'Kurtas & Suits',
      link: '/products?category=kurta',
      isActive: location.search.includes('category=kurta'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3h8l2 4v11l-2 1v2H8v-2l-2-1V7l2-4z" fill="#0284c7" fillOpacity="0.2" stroke="#0369a1" />
          <path d="M12 3v8" stroke="#0284c7" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'mens-ethnic',
      title: "Men's Ethnic",
      link: '/products?category=sherwani',
      isActive: location.search.includes('category=sherwani'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4h10l2 5v12H5V9l2-5z" fill="#d97706" fillOpacity="0.2" stroke="#b45309" />
          <path d="M12 4v17" stroke="#b45309" strokeWidth="1.6" />
          <path d="M10 4l2 3 2-3" stroke="#b45309" strokeWidth="1.6" />
        </svg>
      )
    },
    {
      id: 'tshirts',
      title: 'T-Shirts',
      link: '/products?category=tshirt',
      isActive: location.search.includes('category=tshirt'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4L4 7v3h3v10h10V10h3V7l-3-3-3 2a4 4 0 0 1-8 0L7 4z" fill="#2563eb" fillOpacity="0.18" stroke="#1d4ed8" />
          <path d="M10 4a2 2 0 0 0 4 0" stroke="#1d4ed8" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'shirts',
      title: 'Shirts',
      link: '/products?category=shirt',
      isActive: location.search.includes('category=shirt'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4l-3 4v3h3v9h12V11h3V8l-3-4-3 2a3 3 0 0 1-6 0L6 4z" fill="#0284c7" fillOpacity="0.18" stroke="#0369a1" />
          <path d="M12 6v14" stroke="#0284c7" strokeDasharray="1 2" />
          <path d="M9 4l3 3 3-3" stroke="#0369a1" strokeWidth="1.8" />
        </svg>
      )
    },
    {
      id: 'jeans',
      title: 'Jeans & Bottoms',
      link: '/products?category=jeans',
      isActive: location.search.includes('category=jeans'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 4h14v3l-2.2 14h-4L12 12l-0.8 9h-4L5 7V4z" fill="#3b82f6" fillOpacity="0.18" stroke="#1d4ed8" />
          <path d="M5 7h14" stroke="#1d4ed8" strokeWidth="1.8" />
        </svg>
      )
    },
    {
      id: 'kids',
      title: 'Kids Wear',
      link: '/products?category=kids',
      isActive: location.search.includes('category=kids'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3l-2 3v3h2v3h10V9h2V6l-2-3-3 1.5a3 3 0 0 1-4 0L7 3z" fill="#f59e0b" fillOpacity="0.2" stroke="#d97706" />
          <rect x="7.5" y="12" width="9" height="8" rx="1.5" fill="#fef08a" stroke="#d97706" strokeWidth="1.8" />
        </svg>
      )
    },
    {
      id: 'rentals',
      title: 'Rental Outfits',
      link: '/rent',
      isActive: location.pathname === '/rent',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a3 3 0 0 0-3 3c0 1.2.7 2.2 1.7 2.7L4 12v2h16v-2l-6.7-3.3A3 3 0 0 0 15 6a3 3 0 0 0-3-3z" fill="#6366f1" fillOpacity="0.2" stroke="#4f46e5" />
          <path d="M12 14v7" stroke="#4f46e5" strokeWidth="2" />
        </svg>
      )
    }
  ];

  return (
    <>
      <header className={`navbar-fixed-container fixed top-0 left-0 right-0 z-[100] bg-white max-md:rounded-b-[6px] border-b border-gray-200/90 shadow-xs transition-all duration-300 font-sans ${isProfilePage ? 'max-md:hidden' : ''}`}>

        {/* MOBILE VIEW ONLY: 4 STACKED ROWS FOR ALL MOBILE DIMENSION DEVICES (md:hidden) */}
        {!isCartPage && (
          <div className="md:hidden rounded-b-[6px] pt-3.5 pb-4 flex flex-col gap-3 border-b border-slate-200/80 shadow-xs box-border" style={{ background: 'linear-gradient(135deg, #ff69b4, #d68a59)' }}>

            {/* ROW 1 & ROW 2: ANIMATED COLLAPSIBLE CONTAINER ON SCROLL */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: showFullHeader ? '1fr' : '0fr',
                opacity: showFullHeader ? 1 : 0,
                transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
              }}
            >
              <div style={{ minHeight: 0, overflow: 'hidden' }}>
                <div className="flex flex-col gap-3 pb-2.5">
                  {/* ROW 1: BRAND LOGO ROW WITH EXPLICIT HORIZONTAL MARGIN MATCHING MAIN PAGE */}
                  <div className="flex items-center justify-between w-full min-w-0 px-3.5 sm:px-5 pt-5 pb-2 box-border">
                    <Link to="/shop" className="flex items-center text-decoration-none shrink min-w-0" style={{ margin: '4px 8px' }}>
                      <span className="font-black text-base tracking-tight truncate bg-[#000080] text-[#FFD700] inline-block rounded-full shadow-sm" style={{ padding: '5px 10px' }}>
                        RapidCloth
                      </span>
                    </Link>
                  </div>

                  {/* ROW 2: ADDRESS BAR WITH EXPLICIT HORIZONTAL MARGIN MATCHING MAIN PAGE */}
                  <div className="px-3.5 sm:px-5 w-full box-border">
                    <div
                      onClick={() => setAddressOpen(true)}
                      style={{
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        paddingTop: '9px',
                        paddingBottom: '9px',
                        boxSizing: 'border-box',
                        margin: '0 5px'
                      }}
                      className="flex items-center gap-3 cursor-pointer bg-[#f0f5ff] hover:bg-[#e4edff] active:bg-[#dbeafe] border border-[#14327a] rounded-2xl transition-all shadow-2xs"
                    >
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#14327a] to-[#2874f0] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <PlaceIcon style={{ fontSize: '16px' }} />
                      </div>
                      <div className="flex flex-col min-w-0 text-left flex-1" style={{ paddingLeft: '2px', paddingRight: '2px' }}>
                        <span className="text-[9.5px] text-[#14327a] font-black uppercase tracking-wider leading-none">
                          Deliver to
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 truncate leading-tight mt-0.5">
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
                      <ExpandMoreIcon style={{ fontSize: '18px', color: '#14327a' }} className={`transform transition-transform duration-200 shrink-0 ${addressOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: SEARCH BAR WITH EXPLICIT HORIZONTAL MARGIN MATCHING MAIN PAGE */}
            <div className="flex items-center w-full px-3.5 sm:px-5 box-border">
              <form onSubmit={handleSearch} className="flex-1 relative min-w-0" style={{ margin: '0 5px' }}>
                <div
                  style={{ height: '44px', paddingLeft: '16px', paddingRight: '16px', boxSizing: 'border-box' }}
                  className="relative flex items-center w-full bg-[#f8fafc] border border-[#14327a] focus-within:border-[#14327a] focus-within:bg-white rounded-2xl shadow-2xs transition-all"
                >
                  <SearchIcon style={{ fontSize: '19px', color: '#14327a' }} className="shrink-0 mr-2" />
                  <input
                    type="text"
                    className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none min-w-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                  />

                  {/* Fixed Camera & Microphone Position INSIDE search bar */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <button
                      type="button"
                      title="Camera Visual Search"
                      onClick={() => setCameraSheetOpen(true)}
                      className="w-7 h-7 rounded-full text-[#14327a] hover:text-[#2874f0] hover:bg-blue-50/80 border-none bg-transparent cursor-pointer flex items-center justify-center transition-all active:scale-90"
                    >
                      <PhotoCameraRoundedIcon style={{ fontSize: '18px' }} />
                    </button>
                    <button
                      type="button"
                      title="Voice Search"
                      onClick={handleVoiceSearch}
                      className={`w-7 h-7 rounded-full border-none cursor-pointer flex items-center justify-center transition-all active:scale-90 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-[#14327a] hover:text-[#2874f0] hover:bg-blue-50/80 bg-transparent'}`}
                    >
                      <MicRoundedIcon style={{ fontSize: '18px' }} />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* ROW 4: FLIPKART-STYLED PRODUCT CATEGORIES STRIP WITH TOP THIN BORDER & UPPER/LOWER PADDING */}
            {!isCartPage && (
              <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-5 mt-2 px-4 sm:px-6 transition-all duration-300" style={{ margin: '0 5px', paddingTop: '3px' }}>
                {desktopCategories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="relative shrink-0"
                  >
                    <Link
                      to={cat.link}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1 rounded-xl transition-all duration-200 shrink-0 text-decoration-none min-w-[56px] ${cat.isActive
                        ? 'text-white font-black'
                        : 'text-white/90 font-semibold hover:text-white'
                        }`}
                    >
                      {/* ICON CONTAINER: FLIPKART STYLE LIGHT BLUE PILL ON ACTIVE */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${cat.isActive
                          ? 'bg-white/20 border border-white/40 shadow-2xs scale-105'
                          : 'bg-transparent hover:bg-white/10'
                          }`}
                      >
                        {cat.icon}
                      </div>

                      {/* CATEGORY TITLE */}
                      <span className={`text-[11px] whitespace-nowrap leading-tight tracking-tight ${cat.isActive ? 'font-black text-white' : 'font-semibold text-white/90'}`}>
                        {cat.title}
                      </span>

                      {/* FLIPKART STYLE ACTIVE BLUE UNDERLINE BAR */}
                      {cat.isActive && (
                        <motion.div
                          layoutId="flipkartCategoryIndicatorMobile"
                          className="h-[2px] bg-blue-600 rounded-full w-full mt-[2px] shadow-2xs"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* MOBILE VIEW ONLY WHEN ON CART PAGE: BACK ARROW, SEARCH BAR & LANGUAGE OPTION */}
        {isCartPage && (
          <div className="md:hidden bg-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-200/80 shadow-xs">
            {/* Back Arrow Icon */}
            <motion.button
              type="button"
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              title="Go back"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#f0f5ff] active:bg-[#2874f0] text-[#2874f0] active:text-white border border-blue-200 flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-2xs"
            >
              <ArrowBackRoundedIcon style={{ fontSize: '18px' }} />
            </motion.button>

            {/* Search Bar - Responsive Padding */}
            <form onSubmit={handleSearch} className="flex-1 min-w-0 relative">
              <div className="relative flex items-center w-full bg-[#f8fafc] border border-slate-200 focus-within:border-[#2874f0] focus-within:bg-white rounded-xl sm:rounded-2xl px-2 sm:px-2.5 py-1 sm:py-1.5 shadow-2xs transition-all">
                <SearchIcon style={{ fontSize: '15px', color: '#94a3b8' }} className="shrink-0 mr-1" />
                <input
                  type="text"
                  className="w-full bg-transparent text-[11px] sm:text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                />
              </div>
            </form>

            {/* Language Switcher (replaces Cart button) */}
            <div
              ref={langRef}
              onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
              className="flex items-center gap-1 sm:gap-1.5 cursor-pointer bg-[#f8fafc] hover:bg-[#ebf2fe] border border-slate-200/90 hover:border-blue-300 transition-all text-gray-800 font-bold text-[10px] sm:text-xs relative shrink-0 shadow-2xs whitespace-nowrap rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-blue-100/90 text-[#2874f0] flex items-center justify-center shrink-0">
                <TranslateIcon className="!text-xs sm:!text-sm text-[#2874f0]" style={{ fontSize: '13px' }} />
              </div>
              <span className="font-extrabold text-[10px] sm:text-xs text-gray-900">{language}</span>
              <motion.div animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ExpandMoreIcon className="!text-sm text-gray-500" style={{ fontSize: '16px' }} />
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
                      style={{ background: 'white', padding: '16px', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', minWidth: '160px' }}
                    >
                      <h3 style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px', fontSize: '13px', fontWeight: 800 }}>{t('navbar.selectLanguage')}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div onClick={() => { setLanguage('EN'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: language === 'EN' ? '#2874f0' : '#444', fontWeight: language === 'EN' ? 700 : 500, fontSize: '12px' }}>
                          <input type="radio" checked={language === 'EN'} readOnly style={{ accentColor: '#2874f0', cursor: 'pointer' }} /> <span>English - EN</span>
                        </div>
                        <div onClick={() => { setLanguage('HI'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: language === 'HI' ? '#2874f0' : '#444', fontWeight: language === 'HI' ? 700 : 500, fontSize: '12px' }}>
                          <input type="radio" checked={language === 'HI'} readOnly style={{ accentColor: '#2874f0', cursor: 'pointer' }} /> <span>Hindi - HI</span>
                        </div>
                        <div onClick={() => { setLanguage('BN'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: language === 'BN' ? '#2874f0' : '#444', fontWeight: language === 'BN' ? 700 : 500, fontSize: '12px' }}>
                          <input type="radio" checked={language === 'BN'} readOnly style={{ accentColor: '#2874f0', cursor: 'pointer' }} /> <span>Bengali - BN</span>
                        </div>
                        <div onClick={() => { setLanguage('MR'); setLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: language === 'MR' ? '#2874f0' : '#444', fontWeight: language === 'MR' ? 700 : 500, fontSize: '12px' }}>
                          <input type="radio" checked={language === 'MR'} readOnly style={{ accentColor: '#2874f0', cursor: 'pointer' }} /> <span>Marathi - MR</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* DESKTOP VIEW (md:flex / md:block): 3 HORIZONTAL PARTS WITH SCOPED CUSTOM STYLES */}

        {/* PART 1 (DESKTOP TOP PORTION): BRAND LOGO ON LEFT & ADDRESS BAR ON RIGHT */}
        {!isCartPage && (
          <div
            style={{
              display: 'grid',
              gridTemplateRows: showFullHeader ? '1fr' : '0fr',
              opacity: showFullHeader ? 1 : 0,
              transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
            }}
          >
            <div style={{ minHeight: 0, overflow: 'hidden' }}>
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
                  className={`flex items-center gap-3 cursor-pointer transition-all text-gray-700 font-medium group shrink-0 min-w-[290px] lg:min-w-[350px] max-w-[400px] ${addressOpen
                    ? 'bg-[#e4edff] border-2 border-[#2874f0] shadow-md ring-4 ring-blue-100/80'
                    : 'bg-[#f0f5ff] hover:bg-[#e4edff] border border-blue-200/90 shadow-2xs'
                    }`}
                  style={{
                    paddingLeft: '16px',
                    paddingRight: '18px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    borderRadius: '16px',
                    boxSizing: 'border-box',
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
          {/* COMPACT BRAND LOGO WHEN SCROLLED */}
          {!showFullHeader && !isCartPage && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="shrink-0 mr-1"
              >
                <Link to="/shop" className="flex items-center gap-2 text-[#14327a] font-black tracking-tight text-decoration-none">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#14327a] via-[#2874f0] to-[#ffe500] text-white flex items-center justify-center font-black shadow-xs text-sm">
                    R
                  </div>
                  <span className="font-extrabold text-base lg:text-lg bg-gradient-to-r from-[#14327a] via-[#2874f0] to-[#14327a] bg-clip-text text-transparent hidden lg:inline">
                    RapidCloth
                  </span>
                </Link>
              </motion.div>
            </AnimatePresence>
          )}

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
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            {/* Rent Dropdown Button */}
            {!isCartPage && (
              <div
                ref={rentRef}
                className="relative shrink-0"
              >
                <div
                  style={{
                    paddingLeft: '14px',
                    paddingRight: '16px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    borderRadius: '16px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  className={`transition-all shadow-2xs font-sans border text-decoration-none ${isRentPage
                    ? 'bg-gradient-to-r from-[#14327a] via-[#2874f0] to-[#14327a] text-white border-blue-600 shadow-md ring-2 ring-blue-200'
                    : 'bg-[#f8fafc] hover:bg-[#ebf2fe] border border-slate-200/90 hover:border-blue-300 text-gray-800'
                    }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRentOpen(false);
                      navigate('/rent');
                    }}
                    className="flex items-center gap-2 cursor-pointer border-none bg-transparent"
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs overflow-hidden shadow-xs shrink-0 ${isRentPage ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#2874f0]'
                      }`}>
                      <CheckroomIcon className="!text-base" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`text-[9.5px] font-semibold leading-none ${isRentPage ? 'text-blue-100' : 'text-gray-500'}`}>
                        Fashion
                      </span>
                      <span className={`text-xs lg:text-[12.5px] font-extrabold leading-tight mt-0.5 transition-colors ${isRentPage ? 'text-white' : 'text-gray-900 group-hover:text-[#2874f0]'}`}>Rent</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRentOpen(!rentOpen);
                    }}
                    className={`flex items-center justify-center p-1 ml-0.5 rounded-full cursor-pointer transition-colors border-none bg-transparent ${isRentPage ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-blue-100 hover:text-[#2874f0]'}`}
                  >
                    <motion.div animate={{ rotate: rentOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ExpandMoreIcon className="!text-base" />
                    </motion.div>
                  </button>
                </div>

                {/* Rent Options Dropdown Menu */}
                <AnimatePresence>
                  {rentOpen && (
                    <div className="book-container" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 2000, marginTop: '8px' }}>
                      <motion.div
                        className="book-popup"
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
                          minWidth: '220px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckroomIcon style={{ fontSize: '18px', color: '#2874f0' }} />
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>Rent Outfits</span>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#2874f0', padding: '2px 6px', borderRadius: '10px' }}>
                            PREMIUM
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <Link
                            to="/rent"
                            onClick={() => setRentOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-gray-800 hover:bg-blue-50 hover:text-[#2874f0] transition-colors text-decoration-none"
                          >
                            <span className="text-lg">✨</span>
                            <span>Browse All Rentals</span>
                          </Link>
                          <Link
                            to="/rent/category?gender=men"
                            onClick={() => setRentOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#2874f0] transition-colors text-decoration-none"
                          >
                            <span className="text-lg">👔</span>
                            <span>Men's Tuxedos & Sherwanis</span>
                          </Link>
                          <Link
                            to="/rent/category?gender=women"
                            onClick={() => setRentOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#2874f0] transition-colors text-decoration-none"
                          >
                            <span className="text-lg">👗</span>
                            <span>Women's Designer Lehengas</span>
                          </Link>
                          <Link
                            to="/rent/cart"
                            onClick={() => setRentOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#2874f0] transition-colors text-decoration-none"
                          >
                            <span className="text-lg">🛍️</span>
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
            {!isCartPage && !isProfilePage && (
              <div
                ref={profileRef}
                onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
                style={{
                  paddingLeft: '16px',
                  paddingRight: '18px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  borderRadius: '16px',
                  boxSizing: 'border-box'
                }}
                className="relative group cursor-pointer bg-[#f8fafc] hover:bg-[#ebf2fe] border border-slate-200/90 hover:border-blue-300 transition-all shadow-2xs shrink-0 whitespace-nowrap"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#2874f0] text-white flex items-center justify-center font-extrabold text-xs overflow-hidden shadow-xs border border-blue-200 shrink-0">
                    {isAuthenticated && user?.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <PersonOutlineIcon style={{ fontSize: '16px', color: '#ffffff' }} />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9.5px] text-gray-500 font-semibold leading-none">
                      {t('navbar.hello')}, {isAuthenticated ? user?.name?.split(' ')[0] : t('navbar.signIn')}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs lg:text-[12.5px] font-extrabold text-gray-900 leading-tight mt-0.5 group-hover:text-[#2874f0] transition-colors whitespace-nowrap">
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
                                onClick={() => { setProfileOpen(false); openLoginModal(); }}
                                style={{
                                  width: '100%', background: '#2874f0', color: 'white',
                                  padding: '10px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px'
                                }}
                              >
                                {t('navbar.signIn')}
                              </button>
                              <p style={{ fontSize: '11px', textAlign: 'center', color: '#64748b' }}>
                                {t('navbar.newCustomer')} <button onClick={() => { setProfileOpen(false); openLoginModal(); }} style={{ color: '#2874f0', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>{t('navbar.startHere')}</button>
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
            {!isCartPage && !isProfilePage && (
              <div
                ref={langRef}
                onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
                style={{
                  paddingLeft: '14px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  borderRadius: '16px',
                  boxSizing: 'border-box'
                }}
                className="flex items-center gap-2 cursor-pointer bg-[#f8fafc] hover:bg-[#ebf2fe] border border-slate-200/90 hover:border-blue-300 transition-all text-gray-800 font-bold text-xs relative shrink-0 shadow-2xs whitespace-nowrap"
              >
                <div className="w-6.5 h-6.5 rounded-lg bg-blue-100/90 text-[#2874f0] flex items-center justify-center shrink-0">
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
              style={{
                paddingLeft: '16px',
                paddingRight: '22px',
                paddingTop: '9px',
                paddingBottom: '9px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '16px',
                boxSizing: 'border-box'
              }}
              className={`text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.03] group text-decoration-none shrink-0 whitespace-nowrap ml-2 overflow-visible relative ${isCartPage
                ? 'bg-gradient-to-r from-[#14327a] via-[#2874f0] to-[#14327a] ring-2 ring-blue-300 border border-blue-400'
                : 'bg-gradient-to-r from-[#2874f0] via-[#1e4db7] to-[#14327a] hover:from-[#1e4db7] hover:to-[#0f2456]'
                }`}
            >
              <div className="relative flex items-center justify-center shrink-0 w-6 h-6">
                <ShoppingCartIcon style={{ fontSize: '20px', color: '#ffffff' }} className="group-hover:-rotate-12 transition-transform duration-300" />
                <span
                  style={{
                    minWidth: '22px',
                    height: '22px',
                    paddingLeft: '6px',
                    paddingRight: '6px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    boxSizing: 'border-box',
                    fontSize: '11px',
                    fontWeight: 900
                  }}
                  className="absolute -top-2.5 -right-3 bg-[#ffe500] text-[#14327a] rounded-full flex items-center justify-center shadow-xs border-2 border-white leading-none z-10"
                >
                  {itemCount}
                </span>
              </div>
              <span
                style={{ paddingLeft: '6px', paddingRight: '12px' }}
                className="text-xs lg:text-sm font-black text-white tracking-wide whitespace-nowrap shrink-0"
              >
                {isCartPage ? 'Your Bag' : 'Cart'}
              </span>
            </Link>
          </div>
        </div>

        {/* PART 3 (DESKTOP BOTTOM PORTION): FLIPKART-STYLED PRODUCT CATEGORIES STRIP */}
        {!isCartPage && (
          <div className="hidden md:block bg-white border-t border-slate-100/90 transition-all">
            <div
              className="flex items-center justify-between overflow-x-auto scrollbar-none"
              style={{
                width: '100%',
                maxWidth: '1440px',
                margin: '0 auto',
                padding: '10px 24px 5px 24px',
                gap: '12px',
                boxSizing: 'border-box'
              }}
            >
              {desktopCategories.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="relative shrink-0"
                >
                  <Link
                    to={cat.link}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`group flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 relative text-decoration-none shrink-0 ${cat.isActive ? 'text-[#2874f0] font-black' : 'text-slate-800 hover:text-[#2874f0] font-semibold'
                      }`}
                  >
                    {/* ICON CONTAINER: FLIPKART STYLE LIGHT BLUE PILL ON ACTIVE */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${cat.isActive
                        ? 'bg-[#e0edff] border border-blue-200/80 shadow-2xs text-[#2874f0] scale-105'
                        : 'bg-transparent text-slate-700 group-hover:bg-slate-100/80 group-hover:text-[#2874f0]'
                        }`}
                    >
                      {cat.icon}
                    </div>

                    <span className={`text-[11.5px] lg:text-[12px] whitespace-nowrap tracking-tight leading-none transition-colors ${cat.isActive ? 'font-black text-[#2874f0]' : 'font-semibold text-slate-800 group-hover:text-[#2874f0]'}`}>
                      {cat.title}
                    </span>

                    {cat.isActive && (
                      <motion.div
                        layoutId="flipkartCategoryIndicator"
                        className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#2874f0] rounded-full shadow-2xs"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
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
                  <div onClick={() => { setSidebarOpen(false); openLoginModal(); }} style={{ display: 'block', padding: '12px 36px', color: '#2874f0', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>Sign In</div>
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
                  padding: '16px 18px', borderRadius: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}>
                  <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(40, 116, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2874f0', flexShrink: 0 }}>
                    <PhotoLibraryRoundedIcon sx={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Choose from Gallery</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Select an existing photo from your device</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 18px', borderRadius: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}>
                  <input type="file" accept="image/*" capture="environment" onChange={handleImageSelect} style={{ display: 'none' }} />
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                    <PhotoCameraRoundedIcon sx={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Upload Photo</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Take a new photo using your camera</div>
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
