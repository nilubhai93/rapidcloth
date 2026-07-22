import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const CarouselCard = ({ item }) => {
  const { addToCart, items } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const cartItem = items?.find(i => i.product?._id === item._id);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
       navigate('/register?redirect=' + encodeURIComponent(window.location.pathname));
       return;
     }
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
      <Link to={`/products/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
            <img src={item.images?.[0] || '/images/placeholder.png'} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>
          <div style={{ padding: '8px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F1111' }}>₹{(item.discountPrice || item.price || 85).toLocaleString()}</span>
              <span style={{ fontSize: '11px', color: '#555', display: 'flex', alignItems: 'center', gap: '2px', background: '#f8f8f8', padding: '2px 4px', borderRadius: '4px' }}>
                <span style={{ color: '#FFA41C' }}>★</span> {item.rating || 4.8}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <div style={{ fontSize: '11px', color: '#E47911', display: 'flex', alignItems: 'center', fontWeight: 600, gap: '2px', background: '#FFF6ED', padding: '2px 6px', borderRadius: '4px' }}>
                <LocalShippingOutlinedIcon sx={{ fontSize: 12 }} /> 10 Min
              </div>

              {cartItem ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/cart'); }}
                  style={{
                    background: '#22c55e',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(34,197,94,0.3)'
                  }}>
                  Go to Cart
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleQuickAdd}
                  style={{
                    background: adding ? '#22c55e' : '#E47911',
                    color: '#fff',
                    borderRadius: '6px',
                    width: adding ? 'auto' : '24px',
                    padding: adding ? '0 8px' : '0',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: adding ? '10px' : '18px',
                    fontWeight: adding ? 700 : 300,
                    boxShadow: adding ? '0 1px 3px rgba(34,197,94,0.3)' : '0 1px 3px rgba(228,121,17,0.3)',
                    cursor: 'pointer'
                  }}>
                  {adding ? 'Added' : '+'}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const adSlides = [
  {
    id: 1,
    image: '/images/hero_banner_1.png',
    title: 'Summer Sale',
    headline: 'Up to 60% Off',
    subtitle: 'On trending styles & top brands',
    cta: 'Shop Now',
    ctaLink: '/products',
    gradient: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)',
    accent: '#c9a96e',
    badge: 'Limited Time',
  },
  {
    id: 2,
    image: '/images/hero_banner_2.png',
    title: 'New Arrivals',
    headline: 'Premium Collection',
    subtitle: 'Luxury fashion delivered in 30 minutes',
    cta: 'Explore',
    ctaLink: '/products?sort=-createdAt',
    gradient: 'linear-gradient(to right, rgba(26,26,26,0.9) 0%, rgba(26,26,26,0.5) 45%, transparent 100%)',
    accent: '#dfc492',
    badge: 'Just Dropped',
  },
  {
    id: 3,
    image: '/images/offer_banner.png',
    title: 'Flash Deal',
    headline: 'Buy 2 Get 1 Free',
    subtitle: 'On all accessories — use code B2G1',
    cta: 'Grab Deal',
    ctaLink: '/products?category=accessory',
    gradient: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
    accent: '#4ade80',
    badge: 'Today Only',
  },
  {
    id: 4,
    image: '/images/trending_look_1.png',
    title: 'Trending Now',
    headline: 'Flat ₹500 Off',
    subtitle: 'First order? Use code FIRST500',
    cta: 'Shop Trends',
    ctaLink: '/products?sort=-rating',
    gradient: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)',
    accent: '#f472b6',
    badge: 'Exclusive',
  },
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

  // Ad carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [stylistVideoIndex, setStylistVideoIndex] = useState(0);
  const [policyIndex, setPolicyIndex] = useState(0);
  const [currentAiSentence, setCurrentAiSentence] = useState(0);
  const timerRef = useRef(null);
  const categoriesScrollRef = useRef(null);
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
      setCurrentAiSentence((prev) => (prev + 1) % aiData.length);
    }, 4000);
    return () => clearInterval(aiTimer);
  }, [aiData.length]);

  useEffect(() => {
    const policyTimer = setInterval(() => {
      setPolicyIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(policyTimer);
  }, []);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % adSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + adSlides.length) % adSlides.length);
  }, [currentSlide, goToSlide]);

  // Auto-play ad carousel
  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(timerRef.current);
  }, [nextSlide]);

  // Automatic category scroll
  useEffect(() => {
    const scrollContainer = categoriesScrollRef.current;
    if (!scrollContainer) return;

    const scrollInterval = setInterval(() => {
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 10) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ left: 150, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(scrollInterval);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/register');
    }
  }, [user, authLoading, navigate]);

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
      '--bg-primary': '#faf7f2',
      '--bg-secondary': '#f5f0eb',
      '--bg-card': 'rgba(255, 255, 255, 0.75)',
      '--bg-elevated': '#ffffff',
      '--border': '#e8e4df',
      '--text-primary': '#1a1a1a',
      '--text-secondary': '#8a8580',
      '--text-muted': '#a8b5a0',
      '--accent': '#1e4db7',
      '--accent-light': '#3a6bc5',
      '--accent-bg': 'rgba(30, 77, 183, 0.1)',
      '--gradient-primary': 'linear-gradient(135deg, #14327a 0%, #c9a96e 50%, #14327a 100%)',
      '--font-sans': '"Inter", sans-serif',
      '--font-display': '"Inter", sans-serif',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      minHeight: '100vh',
      paddingBottom: '40px'
    }}>
      {/* Quick Access & Promo Banner */}
      <section style={{ padding: '24px 0 0', backgroundColor: 'var(--bg-primary)', overflowX: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', overflowX: 'hidden' }}>

          <div className="promo-banner-container">
            {adSlides.map((slide, idx) => (
              <motion.div
                key={slide.id}
                initial={false}
                animate={{
                  opacity: idx === currentSlide ? 1 : 0,
                  x: idx === currentSlide ? '0%' : (idx < currentSlide ? '-100%' : '100%'),
                  scale: idx === currentSlide ? 1 : 0.95
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    nextSlide();
                  } else if (swipe > swipeConfidenceThreshold) {
                    prevSlide();
                  }
                }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: idx === currentSlide ? 1 : 0,
                  pointerEvents: idx === currentSlide ? 'auto' : 'none'
                }}
              >
                <Link to={slide.ctaLink} style={{ display: 'block', textDecoration: 'none', height: '100%' }}>
                  <div className="promo-banner-inner" style={{
                    background: idx % 2 === 0
                      ? 'linear-gradient(135deg, #0d328a 0%, #1e4db7 40%, #E47911 100%)'
                      : 'linear-gradient(135deg, #1a1a1a 0%, #333 40%, #c9a96e 100%)',
                  }}>
                    <div className="promo-banner-content">
                      <div className="promo-banner-badge">
                        {slide.badge.toUpperCase()}! <span style={{ fontSize: '24px' }}>⚡</span> {slide.title.toUpperCase()}
                      </div>
                      <h2 className="promo-banner-title">
                        {slide.headline.split(' ').map((word, i) => (
                          <span key={i}>
                            {i === 1 ? <><br />{word}</> : word + ' '}
                          </span>
                        ))}
                      </h2>
                      <div className="promo-banner-cta">
                        {slide.cta.toUpperCase()}
                      </div>
                    </div>

                    {/* Countdown timers visual */}
                    {(slide.badge.toLowerCase().includes('time') || slide.badge.toLowerCase().includes('only')) && (
                      <div className="promo-banner-countdown-wrapper">
                        <div className="promo-timer-box">
                          <div className="timer-val">09</div>
                          <div className="timer-label">MIN</div>
                        </div>
                        <div className="promo-timer-box">
                          <div className="timer-val">42</div>
                          <div className="timer-label">SEC</div>
                        </div>
                      </div>
                    )}

                    {/* Decorative elements or background imagery */}
                    <div className="promo-banner-images">
                      <div style={{ flex: 1, position: 'relative' }}>
                        <img src={slide.image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '6px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} alt="Model 1" />
                      </div>
                      <div className="desktop-only" style={{ flex: 1, position: 'relative', top: '80px' }}>
                        <img src={idx === 0 ? "/images/trending_look_2.png" : slide.image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '6px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} alt="Model 2" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Slider Dots */}
            <div style={{ position: 'absolute', bottom: '20px', right: '40px', display: 'flex', gap: '8px', zIndex: 10 }}>
              {adSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  style={{
                    width: i === currentSlide ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === currentSlide ? '#E47911' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

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
          {/* Card 1: Our Stylist (Video Carousel) */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '24px',
            position: 'relative', overflow: 'hidden', minHeight: '380px',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            {/* Video Carousel Background */}
            {[
              { src: '/videos/men_model.mp4', label: "Men's Styling" },
              { src: '/videos/women_model.mp4', label: "Women's Styling" },
              { src: '/videos/kids_model.mp4', label: "Kids' Styling" }
            ].map((media, vIdx) => (
              <video
                key={vIdx}
                src={media.src}
                title={media.label}
                autoPlay muted loop playsInline
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                  opacity: vIdx === stylistVideoIndex ? 1 : 0,
                  transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: vIdx === stylistVideoIndex ? 1 : 0,
                  backgroundColor: '#1a1a1a'
                }}
              />
            ))}

            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
              zIndex: 2
            }} />

            {/* Video Controls */}
            <div className="promo-card-controls">
              <button
                onClick={(e) => { e.preventDefault(); setStylistVideoIndex(prev => (prev === 0 ? 2 : prev - 1)); }}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                  border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 20 }} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setStylistVideoIndex(prev => (prev + 1) % 3); }}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                  border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Rental Collection</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '16px' }}>Premium designer outfits for rent.</p>
              <Link to="/rent" style={{ color: '#c9a96e', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Browse Now →</Link>
            </div>
          </div>

          {/* Card 2: Store Policies (Carousel) */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: 0,
            position: 'relative', overflow: 'hidden', minHeight: '380px',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            {[
              {
                src: '/images/policy_delivery.png',
                title: '30-Min Delivery',
                desc: 'From our hub to your door, fast.',
                link: '/orders',
                linkText: 'Track Now →',
                accent: 'var(--accent-light)'
              },
              {
                src: '/images/policy_returns.png',
                title: 'Easy Returns',
                desc: '7-day hassle-free return policy.',
                link: '/returns',
                linkText: 'Learn More →',
                accent: 'var(--info)'
              },
              {
                src: '/images/policy_authentic.png',
                title: '100% Authentic',
                desc: 'Guaranteed premium quality products.',
                link: '/about',
                linkText: 'Our Guarantee →',
                accent: 'var(--success)'
              }
            ].map((policy, idx) => (
              <div key={idx} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                opacity: idx === policyIndex ? 1 : 0,
                transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: idx === policyIndex ? 1 : 0,
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px'
              }}>
                <img src={policy.src} alt={policy.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)', zIndex: -1 }} />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{policy.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '16px' }}>{policy.desc}</p>
                  <Link to={policy.link} style={{ color: policy.accent, fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>{policy.linkText}</Link>
                </div>
              </div>
            ))}

            {/* Pagination Dots */}
            <div style={{ position: 'absolute', right: '24px', bottom: '24px', display: 'flex', gap: '6px', zIndex: 10 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: i === policyIndex ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === policyIndex ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s ease'
                }} />
              ))}
            </div>
          </div>

          {/* Card 3: 50% Off  */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
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

      {/* Personalized Offers Section */}
      <section style={{ padding: '40px 0 20px', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Card 5: Already Visited */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>view already visit products</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              {visitedProducts.map(p => (
                <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                </Link>
              ))}
            </div>
            <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See your history</Link>
          </div>

          {/* Card 6: Pick up where left off */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>pick up where you left off</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              {leftOffProducts.map(p => (
                <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                </Link>
              ))}
            </div>
            <Link to="/cart" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Continue shopping</Link>
          </div>

          {/* Card 7: Under 300 */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>under 300 | bestsells of men's dresses.</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              {under300Men.map(p => (
                <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                </Link>
              ))}
            </div>
            <Link to="/offers?gender=men&maxPrice=300&sort=-rating" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See all bestsellers</Link>
          </div>

          {/* Card 8: Best from Best */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>choose your best from best.</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              {bestProducts.map(p => (
                <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                </Link>
              ))}
            </div>
            <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Explore top collection</Link>
          </div>
        </div>
      </section> 

      {/* Trending Now Section */}
      <section style={{ padding: '40px 0 20px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Trending Now</h2>

          <div className="trending-container" style={{
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
      <section style={{ padding: '20px 0 20px', overflowX: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', overflowX: 'hidden' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>New Arrivals</h2>

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
      <section style={{ padding: '20px 0 20px', overflowX: 'hidden' }}>
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
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
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
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
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
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?gender=women" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>{t('home.seeMoreDeals')}</Link>
            </div>

            {/* Top Deals on | Men's Underwear */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>{t('home.topDealsMenUnderwear')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.gender === 'men' && p.discountPrice !== null).map(p => (
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
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
      <section style={{ padding: '20px 0 20px', overflowX: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', overflowX: 'hidden' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>{t('home.quickPicks')}</h2>

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
      <section style={{ padding: '20px 0 20px', overflowX: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', overflowX: 'hidden' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Starting price at 199 | Men's T-shirts</h2>

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
      <section style={{ padding: '20px 0 20px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Party Night */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Party Night</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.occasion && p.occasion.includes('party')).map(p => (
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
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
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
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
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products?occasion=date-night" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop romantic picks</Link>
            </div>

            {/* Festival */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Festival</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.occasion && p.occasion.includes('festival')).map(p => (
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
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
      <section style={{ padding: '20px 0 20px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Up to 80% off | Kids dresses</h2>

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
      <section style={{ padding: '20px 0 20px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Zara */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Zara</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.brand && p.brand.toLowerCase() === 'zara').map(p => (
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
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
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                      <img src={p.images?.[0] || '/images/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop H&M favorites</Link>
            </div>

            {/* Levi's */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Levi's</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                {getCardProducts(p => p.brand && p.brand.toLowerCase() === "levi's").map(p => (
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
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
                  <Link key={p._id} to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
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
                <ProductCard key={p._id} product={p} index={i} />
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
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .promo-card:hover {
          transform: translateY(-8px);
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

        /* Sections */
        .categories-section { padding: 80px 0px; }
        .featured-section { padding: 0 0 80px; }
        .ai-banner-section { padding: 80px 0; }
        .deals-section { padding: 0 0 80px; }
        .occasions-section { padding: 0 0 80px; }
        .rent-teaser-section { padding: 80px 0; }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .section-header-centered {
          justify-content: center;
        }
        .section-title { font-size: clamp(24px, 4vw, 32px); margin-bottom: 8px; }
        .section-subtitle { font-size: clamp(13px, 2vw, 15px); }

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
          transform: translateY(-4px);
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
          transform: translateY(-4px);
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
    </div>
  );
}
