import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../../api';
import ProductCard from '../../components/ProductCard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE.replace(/\/api\/?$/, '');

const CarouselCard = memo(({ item }) => {
  const { addToCart, items } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const cartItem = items?.find(i => i.product?._id === item._id);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    const size = item.sizes?.find(s => s.stock > 0)?.size || 'One Size';
    try {
      await addToCart(item._id, size, item.colors?.[0]);
      setTimeout(() => setAdding(false), 2000);
    } catch (err) {
      console.error(err);
      setAdding(false);
    }
  };

  return (
    <div style={{ flex: '0 0 160px', scrollSnapAlign: 'start', cursor: 'pointer', paddingBottom: '10px' }}>
      <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '240px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#f8f8f8', color: '#333', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '2px', zIndex: 2 }}>
            <AccessTimeIcon sx={{ fontSize: 12 }} /> 10 Min
          </div>
          <div style={{ height: '140px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
            <img src={item.images?.[0] || '/images/placeholder.png'} alt={item.name} loading="lazy" decoding="async" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>
          <div style={{ padding: '8px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#0F1111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: '#0F1111' }}>₹{(item.discountPrice || item.price || 85).toLocaleString()}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F1111', display: 'flex', alignItems: 'center', gap: '2px', background: '#f8f8f8', padding: '2px 4px', borderRadius: '4px' }}>
                {item.rating || 4.8} <span style={{ color: '#FFA41C' }}>★</span>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <div style={{ fontSize: '11px', color: '#1e4db7', display: 'flex', alignItems: 'center', fontWeight: 600, gap: '2px', background: 'rgba(30, 77, 183, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                <LocalShippingOutlinedIcon sx={{ fontSize: 12 }} /> 10 Min
              </div>

              {cartItem ? (
                <div
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/cart'); }}
                  style={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.35)',
                    transition: 'background 0.2s ease, opacity 0.2s ease'
                  }}>
                  Go to Cart
                </div>
              ) : (
                <div
                  onClick={handleQuickAdd}
                  style={{
                    background: adding ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : 'linear-gradient(135deg, #1e4db7 0%, #14327a 100%)',
                    color: '#ffffff',
                    borderRadius: '6px',
                    width: adding ? 'auto' : '26px',
                    padding: adding ? '0 8px' : '0',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: adding ? '10px' : '18px',
                    fontWeight: adding ? 700 : 600,
                    boxShadow: adding ? '0 2px 6px rgba(22, 163, 74, 0.35)' : '0 2px 8px rgba(30, 77, 183, 0.4)',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease, opacity 0.2s ease'
                  }}>
                  {adding ? 'Added' : '+'}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

const singleDressSlides = [
  {
    id: 's1',
    brandTag: '',
    partnerTag: '',
    title: 'New Arrivals',
    subtitle: '',
    desc: '',
    bgGradient: '#fedbd0',
    themeRgb: '254, 219, 208',
    image: '/images/trending_look_1.png',
    link: '/products',
    badgeText: '',
    ctaText: ''
  },
  {
    id: 's2',
    brandTag: '',
    partnerTag: '',
    title: 'Modest Wear',
    subtitle: '',
    desc: '',
    bgGradient: '#fbe2d7',
    themeRgb: '251, 226, 215',
    image: '/images/trending_look_2.png',
    link: '/products',
    badgeText: '',
    ctaText: ''
  },
  {
    id: 's3',
    brandTag: '',
    partnerTag: '',
    title: 'Accessories',
    subtitle: '',
    desc: '',
    bgGradient: '#f5d6cc',
    themeRgb: '245, 214, 204',
    image: '/images/trending_look_1.png',
    link: '/products',
    badgeText: '',
    ctaText: ''
  },
  {
    id: 's4',
    partnerTag: 'PREMIUM ⚡',
    title: 'LUXURY EVENING & COCKTAIL GOWNS',
    subtitle: 'Red Carpet Special | Buy 1 Get 1 Free',
    desc: 'Glamorous sequin ball gowns, bodycon & slit evening dresses.',
    bgGradient: 'linear-gradient(135deg, #831843 0%, #9d174d 45%, #be185d 75%, #db2777 100%)',
    themeRgb: '157, 23, 77',
    image: '/cocktail_dress.png',
    link: '/products?category=dress',
    badgeText: 'BUY 1 GET 1',
    ctaText: 'Shop Gowns →'
  },
  {
    id: 's5',
    brandTag: 'ANARKALI SUITS',
    partnerTag: 'FLASH DEAL ⚡',
    title: 'FESTIVE ANARKALI SUIT SETS',
    subtitle: 'Starting at Only ₹799',
    desc: 'Pure cotton & georgette 3-piece suit sets with designer dupattas.',
    bgGradient: 'linear-gradient(135deg, #713f12 0%, #854d0e 45%, #ca8a04 75%, #eab308 100%)',
    themeRgb: '133, 77, 14',
    image: '/anarkali_suit.png',
    link: '/products?category=saree',
    badgeText: 'FLASH DEAL',
    ctaText: 'View Suits →'
  },
  {
    id: 's6',
    brandTag: 'RAPIDCLOTH MEN',
    partnerTag: 'STYLE ⚡',
    title: 'RUNWAY BLAZERS & SUITS',
    subtitle: 'Flat ₹1000 OFF | Premium Tailoring',
    desc: 'Slim fit velvet jackets, 3-piece formal suits & Bandhgalas.',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #334155 75%, #475569 100%)',
    themeRgb: '30, 41, 59',
    image: '/blazer.png',
    link: '/products?category=jacket',
    badgeText: 'PREMIUM FIT',
    ctaText: 'Shop Men →'
  }
];

const categoryTabs = [
  { icon: '✨', label: 'For You', link: '/products' },
  { icon: '👗', label: 'Women', link: '/products?gender=women' },
  { icon: '👔', label: 'Men', link: '/products?gender=men' },
  { icon: '👶', label: 'Kids', link: '/products?gender=kids' },
  { icon: '🥻', label: 'Ethnic', link: '/products?occasion=festival' },
  { icon: '👘', label: 'Western', link: '/products?category=dress' },
  { icon: '👟', label: 'Footwear', link: '/products?category=shoes' },
  { icon: '👜', label: 'Bags', link: '/products?category=bag' },
  { icon: '💎', label: 'Jewellery', link: '/products?category=jewelry' },
  { icon: '🏋️', label: 'Sports', link: '/products?occasion=gym' },
  { icon: '🧥', label: 'Winterwear', link: '/products?category=jacket' },
  { icon: '⌚', label: 'Accessories', link: '/products?category=accessory' },
  { icon: '🎉', label: 'Party', link: '/products?occasion=party' },
  { icon: '💼', label: 'Formal', link: '/products?occasion=office' },
];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainHeroIndex, setMainHeroIndex] = useState(0);

  // Continue Shopping Section State
  const [csStoryFilter, setCsStoryFilter] = useState('all');
  const [csGenderFilter, setCsGenderFilter] = useState('all');
  const [csCategoryFilter, setCsCategoryFilter] = useState('all');
  const [csSortBy, setCsSortBy] = useState('popular');
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    const mainHeroTimer = setInterval(() => {
      if (document.hidden) return;
      setMainHeroIndex(prev => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(mainHeroTimer);
  }, []);

  // Automatic Single Banner Carousel state with bidirectional infinite loop
  const N = singleDressSlides.length;

  const extendedSlides = useMemo(() => [
    singleDressSlides[N - 1], // Clone of last slide at index 0
    ...singleDressSlides,      // Index 1..N
    singleDressSlides[0]       // Clone of first slide at index N+1
  ], [N]);

  const [displayIndex, setDisplayIndex] = useState(1);
  const [isResetting, setIsResetting] = useState(false);

  const activeBannerIndex = useMemo(() => {
    return (displayIndex - 1 + N) % N;
  }, [displayIndex, N]);

  const activeThemeRgb = singleDressSlides[activeBannerIndex]?.themeRgb || '185, 28, 28';

  const isSwipingRef = useRef(false);
  const bannerScrollRef = useRef(null);

  // Ad carousel state & video stylist state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentAiSentence, setCurrentAiSentence] = useState(0);
  const timerRef = useRef(null);
  const categoriesScrollRef = useRef(null);

  const nextBanner = useCallback(() => {
    if (isResetting || isSwipingRef.current) return;
    setDisplayIndex(prev => prev + 1);
  }, [isResetting]);

  const prevBanner = useCallback(() => {
    if (isResetting || isSwipingRef.current) return;
    setDisplayIndex(prev => prev - 1);
  }, [isResetting]);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      if (document.hidden || isSwipingRef.current) return;
      nextBanner();
    }, 4000);
    return () => clearInterval(bannerTimer);
  }, [nextBanner]);

  const isProgrammaticScrollRef = useRef(false);

  // Initial centering alignment on mount
  useEffect(() => {
    const track = bannerScrollRef.current;
    if (track && track.children[1]) {
      const card = track.children[1];
      const targetScrollLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = targetScrollLeft;
    }
  }, []);

  useEffect(() => {
    const track = bannerScrollRef.current;
    if (!track || !track.children[displayIndex]) return;

    const card = track.children[displayIndex];
    const targetScrollLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;

    isProgrammaticScrollRef.current = true;

    if (displayIndex === N + 1) {
      // Smooth scroll forward to cloned first slide
      track.style.scrollBehavior = 'smooth';
      track.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      setIsResetting(true);

      const timer = setTimeout(() => {
        if (track && track.children[1]) {
          track.style.scrollBehavior = 'auto';
          const realFirstCard = track.children[1];
          track.scrollLeft = realFirstCard.offsetLeft - (track.clientWidth - realFirstCard.clientWidth) / 2;
        }
        setDisplayIndex(1);
        setIsResetting(false);
        isProgrammaticScrollRef.current = false;
      }, 450);
      return () => clearTimeout(timer);
    } else if (displayIndex === 0) {
      // Smooth scroll backward to cloned last slide
      track.style.scrollBehavior = 'smooth';
      track.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      setIsResetting(true);

      const timer = setTimeout(() => {
        if (track && track.children[N]) {
          track.style.scrollBehavior = 'auto';
          const realLastCard = track.children[N];
          track.scrollLeft = realLastCard.offsetLeft - (track.clientWidth - realLastCard.clientWidth) / 2;
        }
        setDisplayIndex(N);
        setIsResetting(false);
        isProgrammaticScrollRef.current = false;
      }, 450);
      return () => clearTimeout(timer);
    } else {
      track.style.scrollBehavior = 'smooth';
      track.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      const timer = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [displayIndex, N]);

  const handleTrackScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current || !isSwipingRef.current) return;
    const track = bannerScrollRef.current;
    if (!track || !track.children[1]) return;

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIdx = 1;
    let minDiff = Infinity;

    for (let i = 0; i < extendedSlides.length; i++) {
      const card = track.children[i];
      if (!card) continue;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const diff = Math.abs(cardCenter - trackCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    if (closestIdx !== displayIndex) {
      setDisplayIndex(closestIdx);
    }
  }, [displayIndex, extendedSlides.length]);

  const handleTouchStart = () => {
    isSwipingRef.current = true;
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      isSwipingRef.current = false;
    }, 400);
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };
  const [aiData] = useState([
    {
      query: "I have a wedding in 2 hours, what should I wear?",
      chat: [
        { role: 'user', text: "I have a wedding in 2 hours, what should I wear? 🤵" },
        { role: 'ai', text: "Finding you something royal... checking local inventory..." }
      ]
    },
    {
      query: "Help me find a perfect outfit for my first date.",
      chat: [
        { role: 'user', text: "Help me find a perfect outfit for my first date. ❤️" },
        { role: 'ai', text: "I have some romantic and stylish options for you. Let me check the closest warehouse..." }
      ]
    },
    {
      query: "What's the best smart-casual look for an office party?",
      chat: [
        { role: 'user', text: "What's the best smart-casual look for an office party? 👔" },
        { role: 'ai', text: "Smart-casual is my specialty! Pulling up premium blazers and chinos..." }
      ]
    },
    {
      query: "I need a comfortable but stylish outfit for a long flight.",
      chat: [
        { role: 'user', text: "I need a comfortable but stylish outfit for a long flight. ✈️" },
        { role: 'ai', text: "Comfort is key. Looking for breathable fabrics and trendy athleisure..." }
      ]
    },
    {
      query: "Suggest some trendy street-wear for this weekend.",
      chat: [
        { role: 'user', text: "Suggest some trendy street-wear for this weekend. 🔥" },
        { role: 'ai', text: "Street-wear vibes activated. Fetching oversized tees and fresh sneakers..." }
      ]
    }
  ]);

  useEffect(() => {
    const aiTimer = setInterval(() => {
      if (document.hidden) return;
      setCurrentAiSentence((prev) => (prev + 1) % aiData.length);
    }, 4000);
    return () => clearInterval(aiTimer);
  }, [aiData.length]);



  // Automatic category scroll
  useEffect(() => {
    const scrollContainer = categoriesScrollRef.current;
    if (!scrollContainer) return;

    const scrollInterval = setInterval(() => {
      if (document.hidden) return;
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 10) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ left: 150, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(scrollInterval);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, dealRes, catRes, latestRes] = await Promise.all([
          productAPI.getFeatured(),
          productAPI.getDeals(),
          productAPI.getCategories(),
          productAPI.getAll({ limit: 10, sort: '-createdAt' })
        ]);
        setFeatured(featRes.data.products || []);
        setDeals(dealRes.data.products || []);
        setCategories(catRes.data.categories || []);
        setLatestProducts(latestRes.data.products || []);
        setTotalProducts(latestRes.data.pagination?.total || 0);
      } catch (e) {
        console.error('Failed to load home data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoryIcons = {
    dress: '👗', shirt: '👔', jeans: '👖', tshirt: '👕',
    jacket: '🧥', shoes: '👟', bag: '👜', jewelry: '💎',
    accessory: '⌚', skirt: '🩱', shorts: '🩳', sweater: '🧶',
    outerwear: '🧥'
  };

  const features = [
    { icon: <LocalShippingOutlinedIcon />, title: '10-30 Min Delivery', desc: 'Lightning fast to your doorstep' },
    { icon: <AutoAwesomeIcon />, title: 'AI Personal Stylist', desc: 'Smart outfit recommendations' },
    { icon: <AccessTimeIcon />, title: 'Real-time Tracking', desc: 'Know exactly when it arrives' },
    { icon: <VerifiedIcon />, title: '100% Authentic', desc: 'Guaranteed genuine brands' },
  ];

  const allProducts = [...new Map([...latestProducts, ...deals, ...featured].map(p => [p._id, p])).values()];

  const csDefaultProducts = useMemo(() => [
    {
      _id: 'cs-1',
      name: "Men's Formal Trousers - Beige",
      price: 1499,
      discountPrice: 449,
      category: 'trousers',
      gender: 'men',
      rating: 3.8,
      reviewsCount: '5.9k',
      isAd: true,
      images: ['/images/trending_look_1.png'],
      delivery: '10 Min'
    },
    {
      _id: 'cs-2',
      name: "Slim Fit Cotton Casual Shirt",
      price: 1299,
      discountPrice: 599,
      category: 'shirt',
      gender: 'men',
      rating: 4.1,
      reviewsCount: '266',
      isAd: false,
      images: ['/images/trending_look_1.png'],
      delivery: '10 Min'
    },
    {
      _id: 'cs-3',
      name: "Floral Print Georgette Dress",
      price: 1899,
      discountPrice: 499,
      category: 'dress',
      gender: 'women',
      rating: 4.3,
      reviewsCount: '1.4k',
      isAd: true,
      images: ['/images/hero_banner_2.png'],
      delivery: '15 Min'
    },
    {
      _id: 'cs-4',
      name: "Oversized Streetwear Hoodie",
      price: 1999,
      discountPrice: 699,
      category: 'jacket',
      gender: 'men',
      rating: 4.5,
      reviewsCount: '890',
      isAd: false,
      images: ['/images/trending_look_2.png'],
      delivery: '10 Min'
    },
    {
      _id: 'cs-5',
      name: "Autumn Knit Fashion Cardigan",
      price: 2499,
      discountPrice: 899,
      category: 'jacket',
      gender: 'women',
      rating: 4.6,
      reviewsCount: '3.2k',
      isAd: false,
      images: ['/images/offer_banner.png'],
      delivery: '20 Min'
    },
    {
      _id: 'cs-6',
      name: "Classic Indigo Denim Jeans",
      price: 2199,
      discountPrice: 799,
      category: 'jeans',
      gender: 'men',
      rating: 4.4,
      reviewsCount: '2.1k',
      isAd: true,
      images: ['/images/product_handbag.png'],
      delivery: '10 Min'
    }
  ], []);

  const csFilteredProducts = useMemo(() => {
    let list = (allProducts && allProducts.length >= 4) ? [...allProducts] : [...csDefaultProducts];

    // Apply Story Shortcut Filter
    if (csStoryFilter === 'under499') {
      list = list.filter(p => (p.discountPrice || p.price || 0) <= 499);
    } else if (csStoryFilter === 'megadrop') {
      list = list.filter(p => p.price && p.discountPrice && ((p.price - p.discountPrice) / p.price) >= 0.35);
    } else if (csStoryFilter === 'new') {
      list = [...list].reverse();
    } else if (csStoryFilter === 'autumn') {
      list = list.filter(p => (p.category || '').includes('jacket') || (p.category || '').includes('sweater') || (p.name || '').toLowerCase().includes('shirt') || (p.name || '').toLowerCase().includes('trouser'));
    }

    // Apply Gender Filter
    if (csGenderFilter !== 'all') {
      list = list.filter(p => !p.gender || p.gender === csGenderFilter || p.gender === 'unisex');
    }

    // Apply Category Filter
    if (csCategoryFilter !== 'all') {
      list = list.filter(p => (p.category || '').toLowerCase().includes(csCategoryFilter));
    }

    // Apply Sorting
    if (csSortBy === 'price_low') {
      list.sort((a, b) => (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0));
    } else if (csSortBy === 'price_high') {
      list.sort((a, b) => (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0));
    } else if (csSortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (list.length === 0) list = csDefaultProducts;
    return list;
  }, [allProducts, csDefaultProducts, csStoryFilter, csGenderFilter, csCategoryFilter, csSortBy]);

  const getCardProducts = (filterFn) => {
    let matches = allProducts.filter(filterFn);
    if (matches.length < 4) {
      matches = [...new Set([...matches, ...allProducts])];
    }
    return matches.slice(0, 4);
  };

  const visitedProducts = getCardProducts(() => true).slice(0, 4);
  const leftOffProducts = getCardProducts(() => true).slice(-4).reverse();
  const under300Men = getCardProducts(p => p.gender === 'men' && p.price < 300);
  const bestProducts = getCardProducts(p => p.rating >= 4.5);

  return (
    <div style={{
      '--bg-primary': '#f0f4f9',
      '--bg-secondary': '#e2e8f0',
      '--bg-card': '#ffffff',
      '--bg-elevated': '#ffffff',
      '--border': '#cbd5e1',
      '--text-primary': '#0f172a',
      '--text-secondary': '#334155',
      '--text-muted': '#64748b',
      '--accent': '#2563eb',
      '--accent-light': '#3b82f6',
      '--accent-bg': 'rgba(37, 99, 235, 0.1)',
      '--gradient-primary': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      fontFamily: 'var(--font-sans)',
      minHeight: '100vh',
      paddingBottom: '40px',
      paddingTop: '0px'
    }}>
      {/* ═══ Multi-Banner Slider (Rendered Direct on Root Page) ═══ */}
      <div className="fk-hero-container" style={{ marginTop: '20px' }}>
        <button
          className="fk-nav-btn fk-nav-prev"
          onClick={prevBanner}
          aria-label="Previous Slide"
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </button>

        <div
          className="fk-track"
          ref={bannerScrollRef}
          onScroll={handleTrackScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {extendedSlides.map((slide, idx) => (
            <div
              key={`${slide.id}-${idx}`}
              className="fk-card"
              onClick={() => navigate(slide.link)}
              style={{ background: slide.bgGradient, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}
            >
              {/* Premium 3D Background Decorative Shapes */}
              <div style={{
                position: 'absolute', top: '-15%', left: '-10%', width: '180px', height: '180px',
                border: '20px solid rgba(255,255,255,0.12)', transform: 'rotate(45deg)', zIndex: 1,
                boxShadow: 'inset 5px 5px 15px rgba(0,0,0,0.05), 5px 5px 15px rgba(0,0,0,0.05)'
              }} />
              <div style={{
                position: 'absolute', bottom: '-15%', right: '35%', width: '120px', height: '120px',
                background: 'rgba(255,255,255,0.08)', transform: 'rotate(45deg)', zIndex: 1,
                boxShadow: '10px 10px 25px rgba(0,0,0,0.1)'
              }} />
              <div style={{
                position: 'absolute', top: '15%', left: '45%', width: '60px', height: '60px',
                background: 'rgba(255,255,255,0.15)', transform: 'rotate(45deg)', zIndex: 1,
                boxShadow: '5px 5px 15px rgba(0,0,0,0.08)'
              }} />
              
              {/* Large Floating Percentage Sign */}
              <div style={{
                position: 'absolute', top: '5%', right: '30%', fontSize: '200px', fontWeight: 900,
                color: 'rgba(255,255,255,0.15)', lineHeight: 1, zIndex: 1, pointerEvents: 'none',
                fontFamily: 'serif'
              }}>%</div>

              {/* Thin Inner Border Box */}
              <div style={{
                position: 'absolute', inset: '16px 40% 16px 16px',
                border: '1px solid rgba(255,255,255,0.4)',
                pointerEvents: 'none', zIndex: 2
              }} className="max-md:inset-[10px_30%_10px_10px]" />

              {/* Card Content Left Side */}
              <div className="fk-card-content" style={{ zIndex: 3, padding: '24px', flex: '1 1 60%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="fk-card-tags" style={{ justifyContent: 'center', marginBottom: '12px' }}>
                  {slide.brandTag && <span className="fk-tag-brand" style={{ background: 'none', color: '#fff', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{slide.brandTag}</span>}
                  {slide.partnerTag && <span className="fk-tag-partner" style={{ background: 'none', color: '#fff', fontSize: '11px', letterSpacing: '2px', padding: 0, textTransform: 'uppercase', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{slide.partnerTag}</span>}
                </div>
                
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <h2 className="fk-card-title" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff', textShadow: '2px 2px 8px rgba(0,0,0,0.15)', margin: '0' }}>{slide.title}</h2>
                  <p className="fk-card-subtitle" style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', fontWeight: 700, letterSpacing: '1px', marginTop: '12px', color: '#fff', textShadow: '1px 1px 4px rgba(0,0,0,0.1)' }}>{slide.subtitle || 'UP TO 50% OFF'}</p>
                  <p className="fk-card-desc" style={{ fontSize: 'clamp(10px, 1vw, 12px)', opacity: 0.9, letterSpacing: '0.5px', marginTop: '4px', textTransform: 'uppercase' }}>{slide.desc}</p>
                  
                  {slide.ctaText && (
                    <button className="fk-card-cta" onClick={(e) => { e.stopPropagation(); navigate(slide.link); }} style={{
                      marginTop: '16px', background: 'transparent', color: '#fff', border: '2px solid #fff',
                      borderRadius: '0', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 24px',
                      fontWeight: 700, transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = slide.bgGradient.includes('linear') ? '#B90039' : '#e87272'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#fff'; }}
                    >
                      {slide.ctaText}
                    </button>
                  )}
                </div>
              </div>

              {/* Card Image Right Side */}
              <div className="fk-card-img" style={{ zIndex: 3, flex: '1 1 40%', position: 'relative', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', padding: 0 }}>
                <img src={slide.image} alt={slide.title} loading="lazy" style={{ height: '110%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom center', transform: 'translateY(10%)', filter: 'drop-shadow(-5px 5px 15px rgba(0,0,0,0.2))' }} />
              </div>
            </div>
          ))}
        </div>

        <button
          className="fk-nav-btn fk-nav-next"
          onClick={nextBanner}
          aria-label="Next Slide"
        >
          <ChevronRightIcon sx={{ fontSize: 24 }} />
        </button>

        <div className="fk-dots">
          {singleDressSlides.map((_, idx) => (
            <div
              key={idx}
              className={`fk-dot${idx === activeBannerIndex ? ' fk-dot-active' : ''}`}
              onClick={() => setDisplayIndex(idx + 1)}
            />
          ))}
        </div>
      </div>

      {/* ═══ "Astik, still looking for these?" Personalized Recommendations Section (Flipkart Style) ═══ */}
      <div style={{ padding: '16px 20px 0 20px', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #eef2ff 0%, #f0f7ff 100%)',
          borderRadius: '20px',
          padding: '16px 18px',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)',
          border: '1px solid #e0e7ff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#1e1b4b',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {user?.name || user?.firstName || 'Astik'}, still looking for these?
            </h2>
            <span onClick={() => navigate('/products')} style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
              See All →
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '6px',
            scrollbarWidth: 'none'
          }}>
            {[
              { title: "Men's T-shirts", cta: "View Store", discount: "60%", img: "/images/product_tshirt.png" },
              { title: "Men's Trousers", cta: "Deals for you", discount: "55%", img: "/images/trending_look_1.png" },
              { title: "Men's Kurtas", cta: "View Store", discount: "40%", img: "/kurta_pajama.png" },
              { title: "Casual Shirts", cta: "Top Discount", discount: "50%", img: "/images/trending_look_2.png" },
              { title: "Winter Jackets", cta: "View Store", discount: "65%", img: "/images/product_jacket.png" }
            ].map((card, idx) => {
              const product = (visitedProducts[idx] || latestProducts[idx] || {});
              const hasValidProductImg = product.images?.[0] && !product.images[0].includes('placeholder');
              const imageSrc = hasValidProductImg ? product.images[0] : card.img;

              return (
                <div
                  key={idx}
                  onClick={() => navigate('/products')}
                  style={{
                    flex: '0 0 145px',
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    position: 'relative',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  {/* Discount Badge Pill top left */}
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 800,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    ↓ {card.discount}
                  </div>

                  <div style={{
                    height: '115px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <img
                      src={imageSrc}
                      alt={product.name || card.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = card.img; }}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name ? product.name.slice(0, 16) : card.title}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{card.cta}</span>
                    <span style={{ color: '#2563eb', fontSize: '10px' }}>➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ FESTIVE COLLECTIONS (Ganesh Chaturthi & Navratri Garba Fits) ═══ */}
      <section style={{ padding: '28px 20px 10px 20px', maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* ─── SECTION 1: GANESH CHATURTHI ─── */}
        <div style={{ marginBottom: '36px' }}>
          
          {/* Header Banner */}
          <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#9a3412', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
              DESI #OOTDS FOR
            </span>

            {/* Pill Banner with Serif Title */}
            <div
              onClick={() => navigate('/products?occasion=festival')}
              style={{
                background: '#fffdfa',
                border: '1.5px solid #fed7aa',
                borderRadius: '30px',
                padding: '8px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)',
                cursor: 'pointer'
              }}>
              <h2 style={{
                fontFamily: 'serif',
                fontSize: 'clamp(20px, 3.5vw, 28px)',
                fontWeight: 900,
                color: '#1c1917',
                margin: 0,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                GANESH CHATURTHI
              </h2>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: '#1c1917', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700
              }}>
                ➔
              </div>
            </div>
          </div>

          {/* Cards Row (Horizontal Scrollable Grid) */}
          <div style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: '10px'
          }}>
            {[
              {
                title: 'Ganesh Chaturthi',
                subtitle: 'Festive faves',
                isPill: true,
                image: '/saree.png',
                bgGradient: 'linear-gradient(145deg, #ea580c 0%, #c2410c 100%)',
                garland: true
              },
              {
                title: 'Temple necklace sets',
                subtitle: 'Under ₹299',
                isPill: false,
                image: '/images/dress_ethnic_ad.png',
                bgGradient: 'linear-gradient(145deg, #f97316 0%, #ea580c 100%)',
                garland: true
              },
              {
                title: 'Dhoti sets',
                subtitle: 'Up to 70% Off',
                isPill: false,
                image: '/kurta_pajama.png',
                bgGradient: 'linear-gradient(145deg, #ea580c 0%, #9a3412 100%)',
                garland: true
              },
              {
                title: 'Anarkali suits',
                subtitle: 'Min. 50% Off',
                isPill: false,
                image: '/anarkali_suit.png',
                bgGradient: 'linear-gradient(145deg, #f97316 0%, #c2410c 100%)',
                garland: true
              }
            ].map((card, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/products?occasion=festival')}
                style={{
                  flex: '0 0 175px',
                  width: '175px',
                  borderRadius: '24px',
                  background: card.bgGradient,
                  padding: '12px 10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  boxShadow: '0 6px 18px rgba(234, 88, 12, 0.25)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  overflow: 'hidden'
                }}>

                {/* Top Garland Graphics */}
                {card.garland && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '2px 10px', zIndex: 5, pointerEvents: 'none', fontSize: '13px' }}>
                    <span>🌼</span>
                    <span>🏵️</span>
                    <span>🌼</span>
                  </div>
                )}

                {/* Ornate Bracket Scalloped Window Frame */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 0 2.5px #ffffff, 0 4px 12px rgba(0,0,0,0.18)',
                  background: '#fff'
                }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Scalloped Bracket Window Cutout SVG */}
                  <svg
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}
                    viewBox="0 0 100 120"
                    preserveAspectRatio="none"
                  >
                    <rect x="2" y="2" width="96" height="116" rx="14" fill="none" stroke="#ffffff" strokeWidth="3" />
                    {/* Left & Right Bracket Curves matching user reference image */}
                    <path d="M 0,40 Q 10,40 10,50 Q 10,60 0,60 Z" fill="rgba(0,0,0,0.06)" />
                    <path d="M 100,40 Q 90,40 90,50 Q 90,60 100,60 Z" fill="rgba(0,0,0,0.06)" />
                  </svg>
                </div>

                {/* Content Below Window Frame */}
                <div style={{ marginTop: '10px', textAlign: 'center', width: '100%', zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {card.title}
                  </div>

                  {card.isPill ? (
                    <div style={{
                      marginTop: '4px',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}>
                      {card.subtitle} <span style={{ fontSize: '9px', background: '#0f172a', color: '#fff', borderRadius: '50%', width: '13px', height: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>➔</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', textShadow: '0 1px 2px rgba(0,0,0,0.3)', marginTop: '2px' }}>
                      {card.subtitle}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* ─── SECTION 2: GARBA & DANDIYA FITS (FOR NAVRATRI) ─── */}
        <div>
          
          {/* Header Banner */}
          <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#a16207', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              GARBA & DANDIYA FITS 🥢
            </span>

            {/* Pill Banner with Serif Title */}
            <div
              onClick={() => navigate('/products?occasion=festival')}
              style={{
                background: '#fffdfa',
                border: '1.5px solid #fde047',
                borderRadius: '30px',
                padding: '8px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 14px rgba(234, 179, 8, 0.12)',
                cursor: 'pointer'
              }}>
              <h2 style={{
                fontFamily: 'serif',
                fontSize: 'clamp(20px, 3.5vw, 28px)',
                fontWeight: 900,
                color: '#1c1917',
                margin: 0,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                FOR NAVRATRI
              </h2>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: '#1c1917', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700
              }}>
                ➔
              </div>
            </div>
          </div>

          {/* Cards Row (Horizontal Scrollable Grid) */}
          <div style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: '10px'
          }}>
            {[
              {
                title: 'Navratri',
                subtitle: 'Festive faves',
                isPill: true,
                image: '/lehenga_choli.png',
                bgGradient: 'linear-gradient(145deg, #fde047 0%, #eab308 100%)',
                lotus: true
              },
              {
                title: "Men's kurtas",
                subtitle: 'Min. 65% Off',
                isPill: false,
                image: '/kurta_pajama.png',
                bgGradient: 'linear-gradient(145deg, #facc15 0%, #ca8a04 100%)',
                lotus: true
              },
              {
                title: 'Wide pant sets',
                subtitle: 'Up to 70% Off',
                isPill: false,
                image: '/bandhgala.png',
                bgGradient: 'linear-gradient(145deg, #fde047 0%, #d97706 100%)',
                lotus: true
              },
              {
                title: 'Nehru jackets',
                subtitle: 'Special Deals',
                isPill: false,
                image: '/nehru_jacket.png',
                bgGradient: 'linear-gradient(145deg, #facc15 0%, #b45309 100%)',
                lotus: true
              }
            ].map((card, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/products?occasion=festival')}
                style={{
                  flex: '0 0 175px',
                  width: '175px',
                  borderRadius: '24px',
                  background: card.bgGradient,
                  padding: '12px 10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  boxShadow: '0 6px 18px rgba(234, 179, 8, 0.25)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  overflow: 'hidden'
                }}>

                {/* Ornate Bracket Scalloped Window Frame */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 0 2.5px #ffffff, 0 4px 12px rgba(0,0,0,0.18)',
                  background: '#fff'
                }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Scalloped Bracket Window Cutout SVG */}
                  <svg
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}
                    viewBox="0 0 100 120"
                    preserveAspectRatio="none"
                  >
                    <rect x="2" y="2" width="96" height="116" rx="14" fill="none" stroke="#ffffff" strokeWidth="3" />
                    <path d="M 0,40 Q 10,40 10,50 Q 10,60 0,60 Z" fill="rgba(0,0,0,0.06)" />
                    <path d="M 100,40 Q 90,40 90,50 Q 90,60 100,60 Z" fill="rgba(0,0,0,0.06)" />
                  </svg>
                </div>

                {/* Lotus Flower at bottom left */}
                {card.lotus && (
                  <div style={{ position: 'absolute', bottom: '6px', left: '8px', fontSize: '18px', zIndex: 5, pointerEvents: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
                    🪷
                  </div>
                )}

                {/* Content Below Window Frame */}
                <div style={{ marginTop: '10px', textAlign: 'center', width: '100%', zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1c1917', textShadow: '0 1px 2px rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {card.title}
                  </div>

                  {card.isPill ? (
                    <div style={{
                      marginTop: '4px',
                      background: '#1c1917',
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}>
                      {card.subtitle} <span style={{ fontSize: '9px', background: '#ffffff', color: '#1c1917', borderRadius: '50%', width: '13px', height: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>➔</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#78350f', marginTop: '2px' }}>
                      {card.subtitle}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ═══ Main Hero Banner Ad Section (Flipkart Style) ═══ */}
      <div style={{ padding: '20px 0 0', backgroundColor: 'transparent' }}>
        <div className="container" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 20px',
        }}>
          <div style={{
            display: 'grid',
            width: '100%',
            minHeight: '210px',
            maxHeight: '230px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            position: 'relative'
          }}>
            
            {/* Mint Green / Cyan Flipkart-Style Ad Banner */}
            <div style={{
              gridArea: '1/1',
              display: 'flex',
              flexDirection: 'row',
              justify: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 40%, #7dd3fc 100%)',
              opacity: mainHeroIndex === 0 ? 1 : 0,
              pointerEvents: mainHeroIndex === 0 ? 'auto' : 'none',
              transition: 'opacity 0.8s ease-in-out',
              zIndex: mainHeroIndex === 0 ? 2 : 1,
              position: 'relative',
              padding: '24px 28px',
              overflow: 'hidden'
            }}>
              {/* Left Content */}
              <div style={{ zIndex: 2, flex: '1 1 55%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {/* Badge Pill */}
                <div style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '10px'
                }}>
                  ⚡ GEAR UP
                </div>

                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  lineHeight: '1.2'
                }}>
                  For fashion enthusiasts
                </h2>

                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#0f172a',
                  margin: '4px 0 6px 0',
                  lineHeight: '1.1'
                }}>
                  Min. 50% Off
                </h3>

                <p style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  margin: 0
                }}>
                  Jackets, Shirts, & more
                </p>
              </div>

              {/* Right Image Cutout */}
              <div style={{ zIndex: 2, flex: '0 0 40%', height: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <img
                  src="/images/summer_sale_model.jpg"
                  alt="Fashion Model"
                  style={{
                    maxHeight: '200px',
                    maxWidth: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
                  }}
                />
              </div>

              {/* "AD" Badge Tag in Bottom Right */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '16px',
                background: 'rgba(15, 23, 42, 0.35)',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
                zIndex: 3
              }}>
                AD
              </div>
            </div>

            {/* Slide 2: Yellow Season Sale Ad Banner */}
            <div style={{
              gridArea: '1/1',
              display: 'flex',
              flexDirection: 'row',
              justify: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #fef08a 0%, #fde047 50%, #facc15 100%)',
              opacity: mainHeroIndex === 1 ? 1 : 0,
              pointerEvents: mainHeroIndex === 1 ? 'auto' : 'none',
              transition: 'opacity 0.8s ease-in-out',
              zIndex: mainHeroIndex === 1 ? 2 : 1,
              position: 'relative',
              padding: '24px 28px',
              overflow: 'hidden'
            }}>
              {/* Left Content */}
              <div style={{ zIndex: 2, flex: '1 1 55%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{
                  background: '#b45309',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  marginBottom: '10px'
                }}>
                  🔥 HOT DEAL
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Best Season Sale
                </h2>

                <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', margin: '4px 0 6px 0' }}>
                  Up to 75% Discount
                </h3>

                <p style={{ fontSize: '13px', fontWeight: 600, color: '#78350f', margin: 0 }}>
                  Only This Week
                </p>
              </div>

              {/* Right Image Cutout */}
              <div style={{ zIndex: 2, flex: '0 0 40%', height: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <img
                  src="/images/yellow_sale_model.jpg"
                  alt="Season Sale Model"
                  style={{
                    maxHeight: '200px',
                    maxWidth: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
                  }}
                />
              </div>

              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '16px',
                background: 'rgba(15, 23, 42, 0.35)',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                zIndex: 3
              }}>
                AD
              </div>
            </div>

            {/* Flipkart-Style Carousel Indicators (Dashed Pill Indicators) */}
            <div style={{
              gridArea: '1/1',
              alignSelf: 'end',
              justifySelf: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 10,
              paddingBottom: '12px'
            }}>
              <div
                onClick={() => setMainHeroIndex(0)}
                style={{
                  width: mainHeroIndex === 0 ? '28px' : '14px',
                  height: '5px',
                  borderRadius: '3px',
                  background: mainHeroIndex === 0 ? '#0f172a' : 'rgba(15, 23, 42, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
              <div
                onClick={() => setMainHeroIndex(1)}
                style={{
                  width: mainHeroIndex === 1 ? '28px' : '14px',
                  height: '5px',
                  borderRadius: '3px',
                  background: mainHeroIndex === 1 ? '#0f172a' : 'rgba(15, 23, 42, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            </div>
          </div>
        </div>
      </div>


      {/* Promo Cards Section */}
      <section style={{ padding: '40px 0 0', backgroundColor: 'var(--bg-primary)', overflowX: 'hidden' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px',
          overflowX: 'hidden'
        }}>


          {/* Card 3: 50% Off  */}
          <div className="promo-card bg-[var(--bg-elevated)] max-md:!bg-gradient-to-b max-md:!from-[olive] max-md:!to-[var(--bg-elevated)]" style={{
            borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>Up to 50% off | Deals</h3>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1
            }}>
              <Link to="/products?category=shoes" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/trending_look_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Shoes" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Premium Footwear</p>
              </Link>
              <Link to="/products?category=bags" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/offer_banner.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Bags" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Luxury Handbags</p>
              </Link>
              <Link to="/products?category=dresses" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/hero_banner_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Dresses" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Designer Dresses</p>
              </Link>
              <Link to="/products?category=accessories" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/hero_banner_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Watch" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Accessories</p>
              </Link>
            </div>
            <Link to="/offers?sort=-rating" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See all offers</Link>
          </div>

          {/* Card 4: Special Offers Grid */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>Buy 2 Get 1 Offers | upon some products</h3>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1
            }}>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/trending_look_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 1" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Premium Footwear</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_handbag.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 2" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Luxury Handbags</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/hero_banner_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 3" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Designer Dresses</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/trending_look_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 4" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Accessories</p>
              </Link>
            </div>
            <Link to="/offers?sort=-createdAt" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See all offers</Link>
          </div>
        </div>
      </section>

      {/* ═══ CONTINUE SHOPPING SECTION ═══ */}
      <section style={{ padding: '36px 0 24px 0', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginTop: '24px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>

          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
              margin: 0
            }}>
              CONTINUE SHOPPING
            </h2>
          </div>

          {/* Row 1: Horizontal Story Shortcut Cards */}
          <div style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: '10px',
            marginBottom: '22px'
          }}>
            {/* Story 1: UNDER ₹499 */}
            <div
              onClick={() => setCsStoryFilter(csStoryFilter === 'under499' ? 'all' : 'under499')}
              style={{
                flex: '0 0 115px',
                height: '115px',
                borderRadius: '20px',
                background: csStoryFilter === 'under499'
                  ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                  : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: csStoryFilter === 'under499' ? '2.5px solid #2563eb' : '1px solid #bbf7d0',
                boxShadow: csStoryFilter === 'under499' ? '0 6px 16px rgba(37,99,235,0.22)' : '0 2px 8px rgba(0,0,0,0.04)',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textAlign: 'center', lineHeight: '1.1' }}>
                UNDER<br/><span style={{ fontSize: '15px', fontWeight: 900, color: '#14532d' }}>₹499</span>
              </div>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', background: '#fef08a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.15)', fontSize: '20px', fontWeight: 900, color: '#854d0e'
              }}>
                ₹
              </div>
            </div>

            {/* Story 2: MEGA PRICE DROP */}
            <div
              onClick={() => setCsStoryFilter(csStoryFilter === 'megadrop' ? 'all' : 'megadrop')}
              style={{
                flex: '0 0 115px',
                height: '115px',
                borderRadius: '20px',
                background: csStoryFilter === 'megadrop'
                  ? 'linear-gradient(135deg, #fecdd3 0%, #fda4af 100%)'
                  : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                border: csStoryFilter === 'megadrop' ? '2.5px solid #e11d48' : '1px solid #7dd3fc',
                boxShadow: csStoryFilter === 'megadrop' ? '0 6px 16px rgba(225,29,72,0.22)' : '0 2px 8px rgba(0,0,0,0.04)',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#0369a1', textAlign: 'center', lineHeight: '1.15' }}>
                MEGA<br/>PRICE DROP
              </div>
              <div style={{ fontSize: '26px' }}>
                📉⚡
              </div>
            </div>

            {/* Story 3: WHAT'S NEW */}
            <div
              onClick={() => setCsStoryFilter(csStoryFilter === 'new' ? 'all' : 'new')}
              style={{
                flex: '0 0 115px',
                height: '115px',
                borderRadius: '20px',
                background: csStoryFilter === 'new'
                  ? 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)'
                  : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: csStoryFilter === 'new' ? '2.5px solid #ea580c' : '1px solid #bae6fd',
                boxShadow: csStoryFilter === 'new' ? '0 6px 16px rgba(234,88,12,0.22)' : '0 2px 8px rgba(0,0,0,0.04)',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', textAlign: 'center', lineHeight: '1.1' }}>
                WHAT'S<br/>NEW
              </div>
              <div style={{ fontSize: '26px' }}>
                🛍️✨
              </div>
            </div>

            {/* Story 4: AUTUMN-WINTER */}
            <div
              onClick={() => setCsStoryFilter(csStoryFilter === 'autumn' ? 'all' : 'autumn')}
              style={{
                flex: '0 0 115px',
                height: '115px',
                borderRadius: '20px',
                background: csStoryFilter === 'autumn'
                  ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)'
                  : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                border: csStoryFilter === 'autumn' ? '2.5px solid #334155' : '1px solid #cbd5e1',
                boxShadow: csStoryFilter === 'autumn' ? '0 6px 16px rgba(51,65,85,0.22)' : '0 2px 8px rgba(0,0,0,0.04)',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#1e293b', textAlign: 'center', lineHeight: '1.1' }}>
                AUTUMN-<br/>WINTER
              </div>
              <div style={{ fontSize: '26px' }}>
                🧥🍁
              </div>
            </div>

            {/* Story 5: EXPRESS */}
            <div
              onClick={() => setCsStoryFilter(csStoryFilter === 'express' ? 'all' : 'express')}
              style={{
                flex: '0 0 115px',
                height: '115px',
                borderRadius: '20px',
                background: csStoryFilter === 'express'
                  ? 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)'
                  : 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
                border: csStoryFilter === 'express' ? '2.5px solid #ca8a04' : '1px solid #fef08a',
                boxShadow: csStoryFilter === 'express' ? '0 6px 16px rgba(202,138,4,0.22)' : '0 2px 8px rgba(0,0,0,0.04)',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#854d0e', textAlign: 'center', lineHeight: '1.1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, background: '#eab308', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginBottom: '2px' }}>EXPRESS</span>
                10 MIN
              </div>
              <div style={{ fontSize: '26px' }}>
                🚚💨
              </div>
            </div>
          </div>

          {/* Row 2: Filter Chips Bar */}
          <div style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: '12px',
            marginBottom: '20px',
            alignItems: 'center'
          }}>
            {/* Gender Filter Chip */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setGenderDropdownOpen(!genderDropdownOpen); setCategoryDropdownOpen(false); setSortDropdownOpen(false); }}
                style={{
                  background: csGenderFilter !== 'all' ? '#0f172a' : '#ffffff',
                  color: csGenderFilter !== 'all' ? '#ffffff' : '#334155',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '24px',
                  padding: '9px 18px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}>
                Gender {csGenderFilter !== 'all' ? `: ${csGenderFilter.toUpperCase()}` : ''} <span style={{ fontSize: '10px', marginLeft: '2px' }}>∨</span>
              </button>
              {genderDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: '6px',
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '140px', padding: '6px 0'
                }}>
                  {['all', 'men', 'women', 'kids'].map(g => (
                    <div
                      key={g}
                      onClick={() => { setCsGenderFilter(g); setGenderDropdownOpen(false); }}
                      style={{
                        padding: '9px 18px', fontSize: '13px', fontWeight: csGenderFilter === g ? 800 : 500,
                        color: csGenderFilter === g ? '#2563eb' : '#334155', cursor: 'pointer',
                        background: csGenderFilter === g ? '#f0f6ff' : 'transparent'
                      }}>
                      {g === 'all' ? 'All Genders' : g.charAt(0).toUpperCase() + g.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories Filter Chip */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setCategoryDropdownOpen(!categoryDropdownOpen); setGenderDropdownOpen(false); setSortDropdownOpen(false); }}
                style={{
                  background: csCategoryFilter !== 'all' ? '#0f172a' : '#ffffff',
                  color: csCategoryFilter !== 'all' ? '#ffffff' : '#334155',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '24px',
                  padding: '9px 18px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}>
                Categories {csCategoryFilter !== 'all' ? `: ${csCategoryFilter.toUpperCase()}` : ''} <span style={{ fontSize: '10px', marginLeft: '2px' }}>∨</span>
              </button>
              {categoryDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: '6px',
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '160px', padding: '6px 0'
                }}>
                  {['all', 'shirt', 'tshirt', 'jeans', 'dress', 'jacket', 'trousers'].map(cat => (
                    <div
                      key={cat}
                      onClick={() => { setCsCategoryFilter(cat); setCategoryDropdownOpen(false); }}
                      style={{
                        padding: '9px 18px', fontSize: '13px', fontWeight: csCategoryFilter === cat ? 800 : 500,
                        color: csCategoryFilter === cat ? '#2563eb' : '#334155', cursor: 'pointer',
                        background: csCategoryFilter === cat ? '#f0f6ff' : 'transparent'
                      }}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Chip */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setSortDropdownOpen(!sortDropdownOpen); setGenderDropdownOpen(false); setCategoryDropdownOpen(false); }}
                style={{
                  background: csSortBy !== 'popular' ? '#0f172a' : '#ffffff',
                  color: csSortBy !== 'popular' ? '#ffffff' : '#334155',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '24px',
                  padding: '9px 18px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}>
                <span style={{ fontSize: '14px' }}>🎛️</span> Sort <span style={{ fontSize: '10px' }}>∨</span>
              </button>
              {sortDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: '6px',
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '170px', padding: '6px 0'
                }}>
                  {[
                    { id: 'popular', label: 'Most Popular' },
                    { id: 'price_low', label: 'Price: Low to High' },
                    { id: 'price_high', label: 'Price: High to Low' },
                    { id: 'rating', label: 'Top Rated' }
                  ].map(s => (
                    <div
                      key={s.id}
                      onClick={() => { setCsSortBy(s.id); setSortDropdownOpen(false); }}
                      style={{
                        padding: '9px 18px', fontSize: '13px', fontWeight: csSortBy === s.id ? 800 : 500,
                        color: csSortBy === s.id ? '#2563eb' : '#334155', cursor: 'pointer',
                        background: csSortBy === s.id ? '#f0f6ff' : 'transparent'
                      }}>
                      {s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Under ₹499 Chip */}
            <button
              onClick={() => setCsStoryFilter(csStoryFilter === 'under499' ? 'all' : 'under499')}
              style={{
                background: csStoryFilter === 'under499' ? '#2563eb' : '#ffffff',
                color: csStoryFilter === 'under499' ? '#ffffff' : '#334155',
                border: '1.5px solid #cbd5e1',
                borderRadius: '24px',
                padding: '9px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
              Under ₹499
            </button>
          </div>

          {/* Row 3: Product Feed Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '18px',
            marginTop: '10px'
          }}>
            {csFilteredProducts.map((p, idx) => {
              const isAd = p.isAd || idx % 3 === 0;
              const price = p.discountPrice || p.price || 499;
              const mrp = p.price || (price * 2);
              const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              const rating = p.rating || '4.1';
              const reviews = p.reviewsCount || (p.numReviews ? `${p.numReviews}` : '1.2k');

              return (
                <div
                  key={p._id || idx}
                  onClick={() => navigate(p._id && !p._id.startsWith('cs-') ? `/products/${p._id}` : '/products')}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, boxShadow 0.2s ease'
                  }}>
                  {/* Image Container */}
                  <div style={{
                    position: 'relative',
                    height: '270px',
                    background: '#f8fafc',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center'
                  }}>
                    <img
                      src={p.images?.[0] || '/images/placeholder.png'}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* AD badge top right */}
                    {isAd && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0, 0, 0, 0.45)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '3px 7px',
                        borderRadius: '6px',
                        letterSpacing: '0.5px',
                        backdropFilter: 'blur(4px)'
                      }}>
                        AD
                      </div>
                    )}

                    {/* Rating Pill overlay bottom left (matching reference image) */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '20px',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      backdropFilter: 'blur(6px)'
                    }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                        {rating}
                      </span>
                      <span style={{ color: '#16a34a', fontSize: '12px' }}>★</span>
                      <span style={{ color: '#cbd5e1', fontSize: '12px' }}>|</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                        {reviews}
                      </span>
                    </div>
                  </div>

                  {/* Details Below Image */}
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{
                      fontSize: '14px', fontWeight: 700, color: '#1e293b',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {p.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        ₹{price.toLocaleString()}
                      </span>
                      {discount > 0 && (
                        <>
                          <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                            ₹{mrp.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 800 }}>
                            {discount}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span>⚡ Express 10 Min Delivery</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══ Suggested For You ═══ */}
      <section style={{ padding: '15px 0 4px', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>

          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h2 style={{
              fontSize: '20px', fontWeight: 800, color: '#111827',
              fontFamily: 'var(--font-sans)', margin: 0
            }}>
              Suggested For You
            </h2>
          </div>

          {/* Products Horizontal Scroll */}
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '8px'
          }}>
            {(allProducts.length > 0 ? allProducts : Array.from({ length: 8 })).map((product, idx) => {
              const p = product || {};
              const price = p.discountPrice || p.price || 0;
              const mrp = p.price || 0;
              const discount = mrp && price < mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

              // Stable deterministic rating and review count per product ID (never changes automatically on re-render)
              const getStableRating = (id) => {
                if (!id) return '4.3';
                let hash = 0;
                for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
                return (4.0 + (Math.abs(hash) % 10) * 0.1).toFixed(1);
              };

              const getStableReviews = (id) => {
                if (!id) return 320;
                let hash = 0;
                for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
                return 150 + (Math.abs(hash) % 650);
              };

              const rating = p.rating || getStableRating(p._id);
              const reviewCount = p.numReviews || (p.reviews?.length > 0 ? p.reviews.length : getStableReviews(p._id));
              const img = p.images?.[0] || '/images/placeholder.png';
              const name = p.name || 'Fashion Product';

              return (
                <Link
                  key={p._id || idx}
                  to={p._id ? `/products/${p._id}` : '/products'}
                  style={{
                    flex: '0 0 168px',
                    scrollSnapAlign: 'start',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div style={{
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '280px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    cursor: 'pointer'
                  }}
                  >
                    {/* Image Area */}
                    <div style={{ position: 'relative', height: '160px', background: '#f8f8f8', flexShrink: 0 }}>
                      <img
                        src={img}
                        alt={name}
                        loading="lazy"
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'contain',
                          padding: '8px',
                          mixBlendMode: 'multiply'
                        }}
                      />
                    </div>

                    {/* Info Area */}
                    <div style={{ padding: '10px 10px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      {/* Product Name */}
                      <p style={{
                        fontSize: '12.5px', fontWeight: 500, color: '#212121',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4, margin: 0
                      }}>
                        {name}
                      </p>

                      {/* Price Row */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#212121' }}>
                          ₹{price.toLocaleString()}
                        </span>
                        {discount > 0 && (
                          <>
                            <span style={{ fontSize: '11px', color: '#878787', textDecoration: 'line-through' }}>
                              ₹{mrp.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '11px', color: '#388e3c', fontWeight: 700 }}>
                              {discount}% off
                            </span>
                          </>
                        )}
                      </div>

                      {/* Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '2px',
                          background: '#388e3c', color: '#fff',
                          fontSize: '10px', fontWeight: 700,
                          padding: '1px 6px', borderRadius: '3px'
                        }}>
                          {Number(rating).toFixed(1)} ★
                        </span>
                        <span style={{ fontSize: '10px', color: '#878787' }}>
                          ({reviewCount})
                        </span>
                      </div>

                      {/* UPI offer */}
                      <p style={{ fontSize: '10.5px', color: '#2874f0', fontWeight: 600, margin: 0 }}>
                        ₹{Math.round(price * 0.75).toLocaleString()} with UPI offer
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      <section style={{ padding: '12px 0 10px', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Card 5: Already Visited */}
          <div className="promo-card bg-[#ffffff] max-md:!bg-gradient-to-b max-md:!from-[orchid] max-md:!to-[#ffffff]" style={{
            borderRadius: '16px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '360px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: '#111827', fontFamily: 'var(--font-sans)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>view already visit products</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              {visitedProducts.map(p => (
                <Link key={p._id} to="/products" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ background: '#f3f4f6', borderRadius: '10px', overflow: 'hidden', height: '110px', width: '100%' }}>
                    <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{p.name}</p>
                </Link>
              ))}
            </div>
            <Link to="/products" style={{ color: '#007185', fontWeight: 600, fontSize: '13px', marginTop: '14px', textDecoration: 'none' }}>See your history</Link>
          </div>

          {/* Card 6: Pick up where left off */}
          <div className="promo-card" style={{
            background: '#ffffff', borderRadius: '16px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '360px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: '#111827', fontFamily: 'var(--font-sans)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>pick up where you left off</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              {leftOffProducts.map(p => (
                <Link key={p._id} to="/products" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ background: '#f3f4f6', borderRadius: '10px', overflow: 'hidden', height: '110px', width: '100%' }}>
                    <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{p.name}</p>
                </Link>
              ))}
            </div>
            <Link to="/cart" style={{ color: '#007185', fontWeight: 600, fontSize: '13px', marginTop: '14px', textDecoration: 'none' }}>Continue shopping</Link>
          </div>

          {/* Card 7: Under 300 */}
          <div className="promo-card" style={{
            background: '#ffffff', borderRadius: '16px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '360px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: '#111827', fontFamily: 'var(--font-sans)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>under 300 | bestsells of men's dresses.</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              {under300Men.map(p => (
                <Link key={p._id} to="/products" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ background: '#f3f4f6', borderRadius: '10px', overflow: 'hidden', height: '110px', width: '100%' }}>
                    <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{p.name}</p>
                </Link>
              ))}
            </div>
            <Link to="/offers?gender=men&maxPrice=300&sort=-rating" style={{ color: '#007185', fontWeight: 600, fontSize: '13px', marginTop: '14px', textDecoration: 'none' }}>See all bestsellers</Link>
          </div>

          {/* Card 8: Best from Best */}
          <div className="promo-card bg-[#ffffff] max-md:!bg-gradient-to-b max-md:!from-[cornflowerblue] max-md:!to-[#ffffff]" style={{
            borderRadius: '16px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '360px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: '#111827', fontFamily: 'var(--font-sans)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>choose your best from best.</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              {bestProducts.map(p => (
                <Link key={p._id} to="/products" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ background: '#f3f4f6', borderRadius: '10px', overflow: 'hidden', height: '110px', width: '100%' }}>
                    <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{p.name}</p>
                </Link>
              ))}
            </div>
            <Link to="/products" style={{ color: '#007185', fontWeight: 600, fontSize: '13px', marginTop: '14px', textDecoration: 'none' }}>Explore top collection</Link>
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      <section style={{ padding: '12px 0 10px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Trending Now</h2>

          <div className="trending-container" style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            padding: '10px 0px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('tech-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="tech-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 0',
                scrollSnapType: 'x mandatory'
              }}
            >
              {(featured.length > 0 ? featured : allProducts).slice(0, 10).map((item) => (
                <CarouselCard key={item._id} item={item} />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('tech-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section style={{ padding: '12px 0 10px', overflowX: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', overflowX: 'hidden' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>New Arrivals</h2>

          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            padding: '10px 0px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('arrival-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="arrival-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none',
                scrollSnapType: 'x mandatory'
              }}
            >
              {(latestProducts.length > 0 ? latestProducts : allProducts).slice(0, 10).map((item) => (
                <CarouselCard key={item._id} item={item} />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('arrival-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* New Promotional Grid Row */}
      <section style={{ padding: '12px 0 10px', overflowX: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', overflowX: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Best Sellers for Kids */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>{t('home.bestSellersKids')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.gender === 'kids' || p.category === 'kids').map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?category=kids" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>{t('home.seeAllKids')}</Link>
            </div>

            {/* Best Sellers for Women */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>{t('home.bestSellersWomen')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.gender === 'women').map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?category=women" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>{t('home.shopWomensBestsellers')}</Link>
            </div>

            {/* Up to 60% off | Kurti, Pajama, Scrab */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>{t('home.upTo60Kurti')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.discountPrice !== null).map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?gender=women" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>{t('home.seeMoreDeals')}</Link>
            </div>

            {/* Top Deals on | Men's Underwear */}
            <div className="bg-[#fff] max-md:!bg-gradient-to-b max-md:!from-rose-300 max-md:!to-[#fff]" style={{ padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>{t('home.topDealsMenUnderwear')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.gender === 'men' && p.discountPrice !== null).map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?category=men" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>{t('home.shopUnderwear')}</Link>
            </div>
          </div>
        </div>
      </section>
      {/* Quick Picks Section */}
      <section style={{ padding: '12px 0 10px', overflowX: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', overflowX: 'hidden' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>{t('home.quickPicks')}</h2>

          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            padding: '10px 0px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('quick-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="quick-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none',
                scrollSnapType: 'x mandatory'
              }}
            >
              {allProducts.slice(0, 10).map((item) => (
                <CarouselCard key={item._id} item={item} />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('quick-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Starting price at 199 | Men's T-shirts Section */}
      <section style={{ padding: '12px 0 10px', overflowX: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', overflowX: 'hidden' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Starting price at 199 | Men's T-shirts</h2>

          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            padding: '10px 0px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('tshirt-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="tshirt-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none',
                scrollSnapType: 'x mandatory'
              }}
            >
              {(allProducts.filter(p => p.category === 'tshirt' || p.name.toLowerCase().includes('tshirt')).length > 0 ? allProducts.filter(p => p.category === 'tshirt' || p.name.toLowerCase().includes('tshirt')) : allProducts).slice(0, 10).map((item) => (
                <CarouselCard key={item._id} item={item} />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('tshirt-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Lifestyle Promotional Grid Row */}
      <section style={{ padding: '12px 0 10px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Party Night */}
            <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Party Night</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.occasion && p.occasion.includes('party')).map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?occasion=party" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop party looks</Link>
            </div>

            {/* Office Wear */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Office Wear</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.occasion && p.occasion.includes('office')).map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?occasion=office" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>View formal collection</Link>
            </div>

            {/* Date Night */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Date Night</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.occasion && p.occasion.includes('date-night')).map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?occasion=date-night" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop romantic picks</Link>
            </div>

            {/* Festival */}
            <div className="bg-[#fff] max-md:!bg-gradient-to-b max-md:!from-[#d28e46] max-md:!to-[#fff]" style={{ padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Festival</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.occasion && p.occasion.includes('festival')).map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?occasion=festival" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop ethnic wear</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Up to 80% off | Kids dresses Section */}
      <section style={{ padding: '12px 0 10px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Up to 80% off | Kids dresses</h2>

          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', padding: '10px 0px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('kids-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="kids-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none',
                scrollSnapType: 'x mandatory'
              }}
            >
              {(allProducts.filter(p => p.category === 'kids' || p.gender === 'kids').length > 0 ? allProducts.filter(p => p.category === 'kids' || p.gender === 'kids') : allProducts).slice(0, 10).map((item) => (
                <CarouselCard key={item._id} item={item} />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('kids-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Brand Promotional Grid Row */}
      <section style={{ padding: '12px 0 10px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Zara */}
            <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Zara</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.brand && p.brand.toLowerCase() === 'zara').map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Explore Zara collection</Link>
            </div>

            {/* H&M */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>H&M</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.brand && p.brand.toLowerCase() === 'h&m').map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop H&M favorites</Link>
            </div>

            {/* Levi's */}
            <div className="bg-[#fff] max-md:!bg-gradient-to-b max-md:!from-[#e35335] max-md:!to-[#fff]" style={{ padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Levi's</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.brand && p.brand.toLowerCase() === "levi's").map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop denim & more</Link>
            </div>

            {/* Nike */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Nike</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.brand && p.brand.toLowerCase() === 'nike').map(p => (
                  <Link key={p._id} to="/products" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Explore Nike sport</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-banner-section" style={{
        background: 'linear-gradient(180deg, transparent, rgba(168, 85, 247, 0.05), transparent)'
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="ai-banner-card"
            style={{
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.08))',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                background: 'var(--accent-bg)', marginBottom: '20px',
                fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 700, color: 'var(--accent-light)',
                textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                <AutoAwesomeIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} /> AI-Powered
              </div>

              <motion.h2
                key={currentAiSentence}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="ai-banner-title"
                style={{
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.2
                }}
              >
                "{aiData[currentAiSentence].query}"
              </motion.h2>
              <p className="ai-banner-desc" style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}>
                Our AI understands context — occasion, weather, urgency, budget, and your personal style.
                It finds the perfect outfit and ensures it arrives before your event.
              </p>

              <div className="ai-features-list" style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { title: 'Occasion-First Search', desc: 'Describe your event, get perfect outfits', icon: '🎯' },
                  { title: 'Smart Fit Technology', desc: 'Tell us your brand sizes, we match perfectly', icon: '📏' },
                  { title: 'Flash-Bundle Deals', desc: 'AI-curated bundles with 15% discount', icon: '⚡' }
                ].map(f => (
                  <div key={f.title} className="ai-feature-item" style={{
                    display: 'flex', alignItems: 'center',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)'
                  }}>
                    <span className="ai-feature-emoji">{f.icon}</span>
                    <div>
                      <div className="ai-feature-title" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</div>
                      <div className="ai-feature-desc" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-chat-preview" style={{
              display: 'flex', flexDirection: 'column',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)'
            }}>
              {aiData[currentAiSentence].chat.map((msg, i) => (
                <motion.div
                  key={`${currentAiSentence}-${i}`}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="chat-bubble"
                  style={{
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-card)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%', fontSize: '13px', lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >{msg.text}</motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Deals */}
      {deals.length > 0 && (
        <section className="deals-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title" style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  🔥 Flash Deals
                </h2>
                <p className="section-subtitle" style={{ color: 'var(--text-muted)' }}>Limited time offers you don't want to miss</p>
              </div>
            </div>
            <div className="product-grid">
              {deals.slice(0, 4).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} linkTo="/products" hideAddToCart={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Occasion-First Quick Search */}
      <section className="occasions-section">
        <div className="container">
          <div style={{ textAlign: 'center' }} className="section-header section-header-centered">
            <div>
              <h2 className="section-title" style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                🎯 Shop by <span className="gradient-text">Occasion</span>
              </h2>
              <p className="section-subtitle" style={{ color: 'var(--text-muted)' }}>Tell us where you're going — we'll handle the rest</p>
            </div>
          </div>
          <div className="occasions-grid">
            {[
              { emoji: '💍', label: 'Wedding Guest', query: 'wedding' },
              { emoji: '🎉', label: 'Party Night', query: 'party' },
              { emoji: '💼', label: 'Office Wear', query: 'office' },
              { emoji: '🌹', label: 'Date Night', query: 'date-night' },
              { emoji: '☀️', label: 'Beach Day', query: 'beach' },
              { emoji: '🏋️', label: 'Gym / Sports', query: 'gym' },
              { emoji: '🎓', label: 'Graduation', query: 'graduation' },
              { emoji: '🎸', label: 'Festival', query: 'festival' },
            ].map((occ, i) => (
              <motion.div key={occ.query}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/products?occasion=${occ.query}`} className="occasion-card" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-base)'
                }}>
                  <span className="occasion-emoji">{occ.emoji}</span>
                  <span className="occasion-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {occ.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ── Responsive Styles ── */}
      <style>{`
        /* Arrow click animation */
        @keyframes arrowPulse {
          0% { transform: translateY(-50%) scale(1); }
          30% { transform: translateY(-50%) scale(0.85); }
          60% { transform: translateY(-50%) scale(1.12); }
          100% { transform: translateY(-50%) scale(1); }
        }

        /* ══════ FLIPKART STYLE CATEGORY BAR & MULTI-BANNER SLIDER ══════ */
        .fk-cat-section {
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 20;
        }
        .fk-cat-scroll {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: clamp(8px, 1.8vw, 24px);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 12px 24px;
          max-width: 1440px;
          margin: 0 auto;
        }
        .fk-cat-scroll::-webkit-scrollbar { display: none; }
        .fk-cat-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #333333;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          flex-shrink: 0;
          cursor: pointer;
        }
        .fk-cat-tab:hover {
          color: #1e4db7;
          transform: translateY(-2px);
        }
        .fk-cat-tab-active {
          color: #1e4db7;
          font-weight: 700;
          position: relative;
        }
        .fk-cat-tab-active::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 10%;
          width: 80%;
          height: 3px;
          background: #1e4db7;
          border-radius: 3px 3px 0 0;
        }
        .fk-cat-icon {
          font-size: clamp(20px, 2vw, 26px);
          margin-bottom: 4px;
          line-height: 1;
        }
        .fk-cat-label {
          font-size: clamp(11px, 1.1vw, 13px);
          white-space: nowrap;
          font-weight: 600;
        }

        /* ── Multi Banner Slider ── */
        .fk-hero-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 16px 24px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
        }
        .fk-nav-btn {
          position: absolute;
          top: 44%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 14px rgba(0,0,0,0.18);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fk-nav-btn:hover {
          background: #ffffff;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
        }
        .fk-nav-prev { left: 14px; }
        .fk-nav-next { right: 14px; }
        @media (max-width: 640px) {
          .fk-nav-btn {
            width: 34px;
            height: 34px;
            background: rgba(255, 255, 255, 0.95);
          }
          .fk-nav-prev { left: 6px; }
          .fk-nav-next { right: 6px; }
        }
        .fk-track {
          display: flex;
          gap: 16px;
          overflow-x: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 10px 0 20px 0;
          width: 100%;
          box-sizing: border-box;
          pointer-events: none; /* Disable manual scrolling interactions on track */
        }
        /* Re-enable pointer events on the cards themselves so they can be clicked */
        .fk-track > * {
          pointer-events: auto;
        }
        .fk-track::-webkit-scrollbar { display: none; }
        .fk-card {
          flex: 0 0 clamp(260px, 80vw, 680px);
          height: clamp(180px, 22vw, 240px);
          border-radius: 20px;
          overflow: hidden;
          isolation: isolate;
          -webkit-backface-visibility: hidden;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          clip-path: inset(0 round 20px);
          transform: translateZ(0);
          position: relative;
          scroll-snap-align: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          display: flex;
          justify-content: space-between;
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease;
        }
        .fk-card:hover {
          box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        }
        .fk-card-content {
          flex: 1;
          padding: clamp(14px, 1.8vw, 22px);
          color: #ffffff;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
        }
        .fk-card-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .fk-tag-brand {
          background: rgba(255,255,255,0.22);
          padding: 3px 9px;
          border-radius: 4px;
          font-size: clamp(9px, 0.9vw, 11px);
          font-weight: 700;
          letter-spacing: 0.5px;
          backdrop-filter: blur(6px);
          text-transform: uppercase;
        }
        .fk-tag-partner {
          background: #ffd700;
          color: #000000;
          padding: 3px 9px;
          border-radius: 4px;
          font-size: clamp(9px, 0.9vw, 11px);
          font-weight: 800;
          text-transform: uppercase;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        .fk-card-title {
          font-size: clamp(16px, 2vw, 24px);
          font-weight: 800;
          line-height: 1.15;
          margin: 4px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.25);
          font-family: var(--font-sans);
          letter-spacing: -0.2px;
        }
        .fk-card-subtitle {
          font-size: clamp(11px, 1.2vw, 14px);
          font-weight: 600;
          margin-bottom: 4px;
          opacity: 0.95;
        }
        .fk-card-desc {
          font-size: clamp(9px, 0.95vw, 12px);
          opacity: 0.85;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.35;
        }
        .fk-card-cta {
          background: #ffffff;
          color: #111827;
          border: none;
          padding: clamp(6px, 0.9vw, 9px) clamp(12px, 1.5vw, 18px);
          border-radius: 8px;
          font-weight: 700;
          font-size: clamp(10px, 0.9vw, 12px);
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .fk-card-cta:hover {
          transform: scale(1.05);
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        }
        .fk-card-ad {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0,0,0,0.5);
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.5px;
          zIndex: 3;
        }

        .fk-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
        }
        .fk-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fk-dot-active {
          width: 18px;
          height: 6px;
          border-radius: 3px;
          background: #383838;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }

        /* Responsive behavior for mobile */
        @media (max-width: 768px) {
          .fk-nav-btn {
            display: none;
          }
          .fk-hero-section {
            padding: 2px 0 10px;
          }
          .fk-hero-container {
            padding: 10px 14px 16px;
            margin-top: 21px;
          }
          .fk-track {
            gap: 12px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            touch-action: pan-x;
            -webkit-overflow-scrolling: touch;
            padding: 6px 0px 14px 0px;
            margin: 0;
            width: 100%;
            pointer-events: auto; /* Re-enable scroll for mobile */
          }
          .fk-card {
            flex: 0 0 85vw;
            height: clamp(170px, 48vw, 210px);
            border-radius: 24px;
            isolation: isolate;
          }
          .fk-card-content {
            padding: 10px 20px;
            justify-content: center;
          }
          .fk-card-tags {
            gap: 4px;
            margin-bottom: 3px;
          }
          .fk-tag-brand, .fk-tag-partner {
            padding: 2px 6px;
            font-size: 8px;
          }
          .fk-card-title {
            font-size: clamp(18px, 5vw, 24px);
            margin: 2px 0 4px;
          }
          .fk-card-image-wrapper {
            width: 50%;
            padding: 0;
          }
          .fk-card-image-wrapper img {
            border-top-left-radius: 50%;
            border-bottom-left-radius: 50%;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }
          .fk-card-subtitle {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .fk-card-desc {
            display: none;
          }
          .fk-card-cta {
            padding: 4px 10px;
            font-size: 10px;
            margin-top: 6px;
          }
          .fk-card-img {
            width: 36%;
            padding: 6px;
          }
          .fk-dots {
            margin-top: 6px;
          }
        }

        /* ══════ PROMO HERO BANNER ══════ */
        .promo-banner-container {
          position: relative;
          height: 380px;
          margin-bottom: 40px;
        }
        .promo-banner-inner {
          border-radius: 16px;
          padding: 40px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          position: relative;
          overflow: hidden;
          height: 100%;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }
        .promo-banner-content {
          position: relative;
          zIndex: 2;
          max-width: 60%;
        }
        .promo-banner-badge {
          font-size: 18px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 1px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .promo-banner-title {
          font-size: 56px;
          font-weight: 900;
          margin: 0 0 24px 0;
          line-height: 1.1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-family: var(--font-sans);
        }
        .promo-banner-cta {
          background: #E47911;
          color: #fff;
          padding: 14px 40px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 800;
          display: inline-block;
          box-shadow: 0 4px 12px rgba(228,121,17,0.4);
          transition: all 0.2s;
        }
        .promo-banner-countdown-wrapper {
          position: absolute;
          bottom: 40px;
          left: 60px;
          display: flex;
          gap: 12px;
          z-index: 2;
        }
        .promo-timer-box {
          background: #111;
          padding: 10px 16px;
          borderRadius: 6px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .timer-val {
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
          color: #fff;
        }
        .timer-label {
          font-size: 11px;
          color: #aaa;
          margin-top: 4px;
          fontWeight: 600;
        }
        .promo-banner-images {
          position: absolute;
          right: -40px;
          bottom: -40px;
          top: -40px;
          width: 50%;
          z-index: 1;
          display: flex;
          gap: 12px;
          transform: rotate(-5deg);
        }

        /* ══════ DESKTOP DEFAULTS ══════ */
        .hero-section { min-height: 100vh; }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }
        .hero-badge {
          padding: 6px 16px;
          margin-bottom: 24px;
          font-size: 13px;
        }
        .hero-title {
          font-size: clamp(36px, 5vw, 64px);
          margin-bottom: 24px;
        }
        .hero-description {
          font-size: 18px;
          margin-bottom: 36px;
          max-width: 500px;
        }
        .hero-cta-group { gap: 16px; }
        .hero-cta-btn { padding: 16px 32px; font-size: 15px; }
        .hero-stats { gap: 40px; margin-top: 48px; }
        .stat-value { font-size: 28px; }
        .stat-label { font-size: 13px; }

        /* Promo Cards */
        .promo-card {
          transition: box-shadow 0.3s ease;
        }
        .promo-card:hover {
          box-shadow: 0 12px 30px rgba(0,0,0,0.12) !important;
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .feature-item {
          padding: 28px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-right: 1px solid var(--border);
        }
        .feature-item:last-child { border-right: none; }
        .feature-icon { width: 48px; height: 48px; }
        .feature-title { font-size: 14px; }
        .feature-desc { font-size: 12px; }

        /* Hero Single Banner Responsive Architecture & Hardware Acceleration */
        .hero-single-banner {
          min-height: 270px;
          padding: 24px 32px;
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
        }
        .banner-title-text {
          font-size: clamp(20px, 2.5vw, 32px);
          line-height: 1.15;
          margin: 0 0 8px 0;
          font-weight: 900;
        }
        .banner-subtitle-text {
          font-size: clamp(14px, 1.6vw, 18px);
          margin: 0 0 8px 0;
          font-weight: 800;
        }
        .banner-desc-text {
          font-size: 13px;
          margin: 0 0 16px 0;
          display: block;
        }
        .banner-cta-button {
          padding: 10px 22px;
          font-size: 13px;
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease;
        }
        .banner-cta-button:hover {
          transform: scale(1.04);
          box-shadow: 0 6px 18px rgba(0,0,0,0.25) !important;
        }
        .banner-img-box {
          height: 240px;
        }

        /* Sections (Optimized Tight Spacing for Better UI/UX) */
        .categories-section { padding: 24px 0px; }
        .featured-section { padding: 0 0 24px; }
        .ai-banner-section { padding: 28px 0; }
        .deals-section { padding: 0 0 24px; }
        .occasions-section { padding: 0 0 24px; }
        .rent-teaser-section { padding: 28px 0; }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .section-header-centered {
          justify-content: center;
        }
        .section-title { font-size: clamp(22px, 3.5vw, 28px); margin-bottom: 6px; }
        .section-subtitle { font-size: clamp(13px, 1.8vw, 14px); }

        /* Categories */
        .categories-scroll-wrapper {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          padding-bottom: 16px;
          margin: 0 -24px;
          padding-left: 24px;
          padding-right: 24px;
          padding-top:16px;
        
        }
        .categories-scroll-wrapper::-webkit-scrollbar { display: none; }
        .categories-scroll-wrapper {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none;    /* Firefox */
        }
        .category-card {
          gap: 10px;
          padding: 20px 24px;
          min-width: 120px;
          width: 130px;
        }
        .category-card:hover {
          border-color: var(--accent) !important;
          background: var(--bg-elevated) !important;
          box-shadow: 0 8px 24px rgba(168, 85, 247, 0.15);
        }
        .category-emoji { font-size: 32px; line-height: 1; }
        .category-name { font-size: 13px; }
        .category-count { font-size: 11px; }

        /* Occasions */
        .occasions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .occasion-card { gap: 12px; padding: 28px 16px; }
        .occasion-card:hover {
          border-color: var(--accent) !important;
          background: var(--bg-elevated) !important;
          box-shadow: 0 8px 24px rgba(168, 85, 247, 0.15);
        }
        .occasion-emoji { font-size: 36px; }
        .occasion-label { font-size: 13px; }

        /* AI Banner */
        .ai-banner-card {
          padding: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }
        .ai-banner-title { font-size: 36px; margin-bottom: 16px; }
        .ai-banner-desc { font-size: 16px; margin-bottom: 32px; }
        .ai-features-list { gap: 16px; }
        .ai-feature-item { gap: 16px; padding: 16px; }
        .ai-feature-emoji { font-size: 24px; }
        .ai-feature-title { font-size: 14px; }
        .ai-feature-desc { font-size: 12px; }
        .ai-chat-preview { gap: 12px; padding: 24px; }
        .chat-bubble { padding: 14px 18px; font-size: 13px; }

        /* Rent */
        .rent-card { padding: 60px 48px; }
        .rent-title {
          font-size: clamp(28px, 4vw, 42px);
          margin-bottom: 16px;
        }
        .rent-desc { font-size: 17px; margin-bottom: 12px; }
        .rent-price-hint { font-size: 14px; margin-bottom: 36px; }
        .rent-cta-group { gap: 12px; }
        .rent-cta-btn { padding: 16px 36px; font-size: 15px; }
        .rent-stats { gap: 32px; margin-top: 40px; }

        .promo-card-controls {
          position: absolute;
          right: 12px;
          bottom: 80px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        /* ══════ LARGE TABLET (≤ 1024px) ══════ */
        @media (max-width: 1024px) {
          .hero-grid { gap: 40px; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .feature-item:nth-child(2) { border-right: none; }
          .ai-banner-card { padding: 40px; gap: 32px; }
          .rent-card { padding: 48px 36px; }
          .occasions-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
          
          .promo-banner-title { font-size: 44px; }
          .promo-banner-inner { padding: 30px 40px; }
        }

        /* ══════ TABLET (≤ 768px) ══════ */
        @media (max-width: 768px) {
          .hero-section { min-height: 49vh; }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px;
          }
          .hero-badge { padding: 5px 12px; font-size: 12px; margin-bottom: 18px; }
          .hero-title { margin-bottom: 18px; }
          .hero-description { font-size: 15px; margin-bottom: 28px; max-width: 100%; }
          .hero-cta-group { gap: 12px; }
          .hero-cta-btn { padding: 12px 24px; font-size: 14px; }
          .hero-stats { gap: 28px; margin-top: 36px; }
          .stat-value { font-size: 24px; }
          .stat-label { font-size: 12px; }

          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .feature-item {
            padding: 20px 16px;
            gap: 12px;
          }
          .feature-item:nth-child(2) { border-right: none; }
          .feature-icon { width: 40px; height: 40px; }
          .feature-title { font-size: 13px; }
          .feature-desc { font-size: 11px; }

          .categories-section { padding: 48px 0; }
          .featured-section { padding: 0 0 48px; }
          .ai-banner-section { padding: 48px 0; }
          .deals-section { padding: 0 0 48px; }
          .occasions-section { padding: 0 0 48px; }
          .rent-teaser-section { padding: 48px 0; }

          .section-header { margin-bottom: 28px; }
          .section-title { margin-bottom: 6px; }

          .categories-scroll-wrapper {
            gap: 10px;
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
          }
          .category-card {
            padding: 18px 20px;
            min-width: 110px;
            width: 120px;
          }

          .occasions-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
          .occasion-card { padding: 20px 12px; gap: 10px; }
          .occasion-emoji { font-size: 30px; }
          .occasion-label { font-size: 12px; }

          .ai-banner-card {
            grid-template-columns: 1fr !important;
            padding: 32px !important;
            gap: 28px;
          }
          .ai-banner-title { font-size: 26px; }
          .ai-banner-desc { font-size: 14px; margin-bottom: 24px; }
          .ai-feature-item { padding: 12px; gap: 12px; }
          .ai-feature-emoji { font-size: 20px; }
          .ai-feature-title { font-size: 13px; }
          .ai-feature-desc { font-size: 11px; }
          .ai-chat-preview { padding: 16px; gap: 10px; }
          .chat-bubble { padding: 10px 14px; font-size: 12px; }

          .rent-card { padding: 36px 24px; }
          .rent-desc { font-size: 15px; }
          .rent-price-hint { font-size: 13px; margin-bottom: 28px; }
          .rent-cta-group { gap: 10px; }
          .rent-cta-btn { padding: 12px 24px; font-size: 14px; }
          .rent-stats { gap: 24px; margin-top: 32px; }

          .promo-card-controls {
            right: auto;
            left: 24px;
            bottom: 110px;
          }

          .promo-banner-container { height: 320px; }
          .promo-banner-title { font-size: 32px; margin-bottom: 16px; }
          .promo-banner-badge { font-size: 14px; }
          .promo-banner-cta { padding: 10px 24px; font-size: 14px; }
          .promo-banner-images { width: 40%; right: -20px; }
          .promo-banner-countdown { left: 40px; bottom: 16px; }
        }

        /* ══════ SMALL PHONE (≤ 480px) ══════ */
        @media (max-width: 480px) {
          .hero-section { min-height: 80vh;}
          .hero-badge { padding: 4px 10px; font-size: 11px; margin-bottom: 14px; }
          .hero-title { margin-bottom: 14px; }
          .hero-description { font-size: 14px; margin-bottom: 22px; line-height: 1.6; }
          .hero-cta-group { gap: 10px; }
          .hero-cta-btn { padding: 10px 20px; font-size: 13px; }
          .hero-stats { gap: 20px; margin-top: 28px; }
          .stat-value { font-size: 20px; }
          .stat-label { font-size: 11px; }

          .features-grid { grid-template-columns: 1fr !important; }
          .feature-item {
            padding: 16px 14px;
            gap: 12px;
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
          .feature-item:last-child { border-bottom: none; }
          .feature-icon { width: 36px; height: 36px; }
          .feature-title { font-size: 12px; }
          .feature-desc { font-size: 11px; }

          .categories-section { padding: 36px 0; }
          .featured-section { padding: 0 0 36px; }
          .ai-banner-section { padding: 36px 0; }
          .deals-section { padding: 0 0 36px; }
          .occasions-section { padding: 0 0 36px; }
          .rent-teaser-section { padding: 36px 0; }

          .section-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
            margin-bottom: 20px;
          }
          .section-header-centered {
            align-items: center !important;
          }

          .categories-scroll-wrapper {
            gap: 8px;
            margin: 0 -12px;
            padding-left: 12px;
            padding-right: 12px;
            padding-bottom: 12px;
          }
          .category-card {
            padding: 14px 14px;
            min-width: 95px;
            width: 105px;
          }
          .category-emoji { font-size: 26px; }
          .category-name { font-size: 11px; }
          .category-count { font-size: 10px; }

          .occasions-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .occasion-card { padding: 18px 10px; gap: 8px; }
          .occasion-emoji { font-size: 26px; }
          .occasion-label { font-size: 11px; }

          .ai-banner-card { padding: 24px 16px !important; gap: 20px; }
          .ai-banner-title { font-size: 22px; margin-bottom: 12px; }
          .ai-banner-desc { font-size: 13px; margin-bottom: 18px; }
          .ai-features-list { gap: 10px; }

          .promo-banner-inner { 
            padding: 24px !important; 
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          .promo-banner-title { font-size: 28px !important; margin-bottom: 20px !important; }
          .promo-banner-images { display: none !important; }
          .promo-banner-content { 
            max-width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .promo-banner-countdown-wrapper {
            position: static !important;
            margin-top: 24px !important;
            gap: 10px !important;
          }
          .promo-timer-box {
            padding: 8px 12px !important;
          }
          .timer-val { font-size: 20px !important; }
          .promo-banner-cta {
            order: 2;
            margin-top: 10px;
          }
          .ai-feature-item { padding: 10px; gap: 10px; }
          .ai-feature-emoji { font-size: 18px; }
          .ai-feature-title { font-size: 12px; }
          .ai-feature-desc { font-size: 10px; }
          .ai-chat-preview { padding: 12px; gap: 8px; }
          .chat-bubble { padding: 8px 12px; font-size: 11px; }

          .rent-card { padding: 28px 16px; }
          .rent-title { margin-bottom: 12px; }
          .rent-desc { font-size: 14px; margin-bottom: 8px; }
          .rent-price-hint { font-size: 12px; margin-bottom: 24px; }
          .rent-cta-group { gap: 8px; }
          .rent-cta-btn { padding: 10px 20px; font-size: 13px; }
          .rent-stats { gap: 16px; margin-top: 28px; }
          .stat-value { font-size: 18px; }
          .stat-label { font-size: 10px; }

          .promo-banner-container { height: 380px; }
          .promo-banner-inner { padding: 16px; }
          .promo-banner-title { font-size: 26px; }
          .promo-banner-content { max-width: 100%; z-index: 5; }
          .promo-banner-images { opacity: 0.2; width: 60%; right: -20px; }
          .promo-banner-countdown { left: 16px; bottom: 70px; transform: scale(0.8); transform-origin: left bottom; }
          .promo-banner-cta { width: 100%; text-align: center; margin-top: 90px; padding: 10px; }

          .carousel-arrow { display: none !important; }
          .trending-container { padding: 10px !important; }
        }

        /* ══════ EXTRA SMALL (≤ 360px) ══════ */
        @media (max-width: 360px) {
    
          .hero-description { font-size: 15px; }
          .hero-cta-group { flex-direction: column; gap: 8px; }
          .hero-cta-btn { width: 100%; justify-content: center; }
          .hero-stats { gap: 16px; }
          .stat-value { font-size: 18px; }
          

          .category-card {
            padding: 12px 10x;
            min-width: 85px;
            width: 95px;
          }
          .category-emoji { font-size: 22px; }
          .category-name { font-size: 10px; }

          .occasions-grid { gap: 6px; }
          .occasion-card { padding: 14px 8px; }
          .occasion-emoji { font-size: 22px; }
          .occasion-label { font-size: 10px; }

          .rent-cta-group { flex-direction: column; }
          .rent-cta-btn { width: 100%; justify-content: center; }
          .rent-stats { flex-wrap: wrap; }

          .promo-banner-title { font-size: 24px; }
          .promo-banner-countdown { bottom: 100px; }
        }

        /* ══════ LARGE SCREEN ENHANCEMENT ══════ */
        @media (min-width: 768px) {
          #ai-stylist-fab {
            bottom: 24px !important;
            right: 24px !important;
          }
        }
        @media (min-width: 1200px) {
          .categories-scroll-wrapper {
            justify-content: center;
          }
        }
        @media (max-width: 360px) {
          #ai-stylist-fab {
            bottom: 95px !important;
            right: 15px !important;
            width: 48px !important;
            height: 48px !important;
          }
        }
      `}</style>

      {/* ═══ Fixed Mobile Bottom Navigation Bar (Flipkart Style) ═══ */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justify: 'space-around',
        alignItems: 'center',
        padding: '8px 0 6px 0',
        zIndex: 1000,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)'
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '18px', color: '#2563eb' }}>🏠</span>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>Home</span>
        </div>
        <div onClick={() => navigate('/rent')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '18px', color: '#64748b' }}>▶️</span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>Try-On</span>
        </div>
        <div onClick={() => navigate('/deals')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '18px', color: '#64748b' }}>🏷️</span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>Top Deals</span>
        </div>
        <div onClick={() => navigate('/profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '18px', color: '#64748b' }}>👤</span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>Account</span>
        </div>
        <div onClick={() => navigate('/cart')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
          <span style={{ fontSize: '18px', color: '#64748b' }}>🛒</span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>Cart</span>
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '4px',
            background: '#ef4444',
            color: '#ffffff',
            borderRadius: '50%',
            width: '15px',
            height: '15px',
            fontSize: '9px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            5
          </div>
        </div>
      </div>
    </div>
  );
}
