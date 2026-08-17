import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../../../api';
import ProductCard from '../../../components/ProductCard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/SearchRounded';
import CameraAltIcon from '@mui/icons-material/CameraAltRounded';
import MicIcon from '@mui/icons-material/MicRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import RentAddressDrawer from '../../../components/RentAddressDrawer';
import RentCameraModal from '../../../components/RentCameraModal';
import RentVoiceSearchModal from '../../../components/RentVoiceSearchModal';
import CheckroomIcon from '@mui/icons-material/CheckroomRounded';
import DiamondIcon from '@mui/icons-material/DiamondRounded';
import CelebrationIcon from '@mui/icons-material/CelebrationRounded';
import StarsIcon from '@mui/icons-material/StarsRounded';
import WineBarIcon from '@mui/icons-material/WineBarRounded';
import ChildCareIcon from '@mui/icons-material/ChildCareRounded';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcardRounded';
import CakeIcon from '@mui/icons-material/CakeRounded';
import LocalFloristIcon from '@mui/icons-material/LocalFloristRounded';
import WcIcon from '@mui/icons-material/WcRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useCart } from '../../../context/CartContext';

// --- BOTTOM SHEET COMPONENT (Left-to-Right on Desktop, Bottom-to-Up on Mobile) ---
function RentalBottomSheet({ isOpen, onClose, product }) {
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [selectedSize, setSelectedSize] = useState('');
  const [hasInsurance, setInsurance] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!product) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const calculateTotal = () => {
    let base = product.rentPricePerDay * selectedDuration;
    let cleaning = 0;
    let insurance = hasInsurance ? 300 : 0;
    let deposit = 1500;
    return base + cleaning + insurance + deposit;
  };

  const initialMotion = isMobile ? { y: '100%' } : { x: '-100%' };
  const animateMotion = isMobile ? { y: 0 } : { x: 0 };
  const exitMotion = isMobile ? { y: '100%' } : { x: '-100%' };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(5, 10, 25, 0.75)', zIndex: 99999,
            display: 'flex',
            justifyContent: isMobile ? 'flex-end' : 'flex-start',
            alignItems: isMobile ? 'flex-end' : 'stretch',
            backdropFilter: 'blur(4px)'
          }}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={initialMotion}
            animate={animateMotion}
            exit={exitMotion}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              background: '#0a1128',
              width: '100%',
              maxWidth: isMobile ? '100%' : '480px',
              height: isMobile ? 'auto' : '100vh',
              maxHeight: isMobile ? '88vh' : '100vh',
              borderTopLeftRadius: isMobile ? '24px' : '0px',
              borderTopRightRadius: '24px',
              borderBottomRightRadius: isMobile ? '0px' : '24px',
              borderBottomLeftRadius: '0px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.6)' : '10px 0 40px rgba(0,0,0,0.6)',
              borderRight: isMobile ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
              borderTop: isMobile ? '1px solid rgba(212, 175, 55, 0.3)' : 'none',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: 'var(--font-sans)',
              color: '#ffffff'
            }}
          >
            {/* Top Navigation */}
            <div style={{
              flexShrink: 0,
              background: '#0b132b',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Rent Outfit</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212, 175, 55, 0.15)', color: '#f5d061', padding: '4px 10px', borderRadius: '20px', fontWeight: 800, fontSize: '11px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <BoltRoundedIcon sx={{ fontSize: '14px', color: '#f5d061' }} /> 45 mins delivery
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close popup"
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#f5d061'
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: '20px' }} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px 0' }}>
              {/* Hero Media */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', background: '#0e1838' }}>
                <img
                  src={product.images?.[0] || 'https://placehold.co/600x800'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(10, 17, 40, 0.85)', backdropFilter: 'blur(5px)', padding: '6px 12px', borderRadius: '8px', color: '#f5d061', fontSize: '11px', fontWeight: 700, border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  Model is 5'8" wearing Size S
                </div>
              </div>

              <div style={{ padding: '24px 20px' }}>
                {/* Product Identity */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>{product.name}</h2>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500 }}>{product.brand || 'Premium Collection'}</p>
                  </div>
                  <div style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#f5d061', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, border: '1px solid rgba(212, 175, 55, 0.3)' }}>Available Now</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'rgba(212, 175, 55, 0.15)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                  <AccessTimeRoundedIcon sx={{ color: '#f5d061', fontSize: '18px' }} />
                  <span style={{ fontSize: '13px', color: '#f5d061', fontWeight: 700 }}>Only 2 left in your local dark store!</span>
                </div>

                {/* Size Selector */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f5d061', marginBottom: '12px' }}>1. Select Size</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {['S', 'M', 'L', 'XL'].map(size => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size} onClick={() => setSelectedSize(size)}
                          style={{
                            flex: '1 1 calc(25% - 12px)', padding: '12px', borderRadius: '12px',
                            border: isSelected ? '2px solid #d4af37' : '1px solid rgba(212, 175, 55, 0.3)',
                            background: isSelected ? 'linear-gradient(135deg, #f5d061, #d4af37)' : '#0e1838',
                            color: isSelected ? '#0a1128' : '#ffffff',
                            fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 2px 10px rgba(212, 175, 55, 0.3)' : 'none'
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#f5d061', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    <CheckroomRoundedIcon sx={{ fontSize: '16px', color: '#f5d061' }} /> Find Your Fit Quiz
                  </button>
                </div>

                {/* Duration Picker */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f5d061', marginBottom: '12px' }}>2. Rental Duration</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[3, 5, 7].map(days => {
                      const isSelected = selectedDuration === days;
                      return (
                        <button
                          key={days} onClick={() => setSelectedDuration(days)}
                          style={{
                            flex: 1, padding: '12px', borderRadius: '12px',
                            border: isSelected ? '2px solid #d4af37' : '1px solid rgba(212, 175, 55, 0.25)',
                            background: isSelected ? 'rgba(212, 175, 55, 0.15)' : '#0e1838',
                            color: isSelected ? '#f5d061' : '#cbd5e1',
                            fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                          }}
                        >
                          <span>{days} Days</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '4px', color: isSelected ? '#f5d061' : '#94a3b8' }}>₹{product.rentPricePerDay * days}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Peace of Mind */}
                <div style={{ background: '#0e1838', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VerifiedUserRoundedIcon sx={{ color: '#f5d061', fontSize: '20px' }} /> Peace of Mind Guarantee
                  </h3>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.5 }}>
                    Professionally dry-cleaned and sanitized before every delivery. Arrives in a sealed, premium garment bag.
                  </p>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#111d40', padding: '12px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.3)', cursor: 'pointer' }}>
                    <input
                      type="checkbox" checked={hasInsurance} onChange={(e) => setInsurance(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#d4af37' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Add Spill & Tear Protection (+₹300)</span>
                      <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Minor damage insurance for peace of mind.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Fixed Footer Action Bar */}
            <div style={{
              flexShrink: 0,
              background: '#0b132b',
              borderTop: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '16px 20px',
              boxShadow: '0 -4px 15px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#f5d061' }}>₹{calculateTotal()}</span>
                <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Includes ₹1,500 deposit</span>
              </div>
              <button
                style={{
                  background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128', padding: '14px 32px', borderRadius: '12px',
                  fontSize: '15px', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Book Rental Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
// --- END BOTTOM SHEET ---


// --- BALLOON CATEGORIES STYLES ---
const balloonColors = [
  { grad: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', solid: '#ff758c' },
  { grad: 'linear-gradient(135deg, #17ebd2 0%, #11a9f0 100%)', solid: '#17ebd2' },
  { grad: 'linear-gradient(135deg, #b19ffb 0%, #7e5bf6 100%)', solid: '#b19ffb' },
  { grad: 'linear-gradient(135deg, #fce38a 0%, #f38181 100%)', solid: '#fce38a' },
  { grad: 'linear-gradient(135deg, #abecd6 0%, #11998e 100%)', solid: '#abecd6' },
  { grad: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', solid: '#f857a6' },
  { grad: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', solid: '#4facfe' },
  { grad: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', solid: '#ff9a9e' },
  { grad: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', solid: '#30cfd0' },
  { grad: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', solid: '#f093fb' }
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

export default function Rent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items } = useCart();

  const rentalItemCount = items
    .filter(item => item.isRental)
    .reduce((acc, item) => acc + item.quantity, 0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRentalProduct, setSelectedRentalProduct] = useState(null);

  const [activeTab, setActiveTab] = useState('rent');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addressOpen, setAddressOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Ad carousel state & logic
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState(1);
  const timerRef = useRef(null);

  const getAdSlides = () => {
    switch (activeCategory) {
      case 'women':
        return [
          { id: 1, image: 'https://images.unsplash.com/photo-1515347619362-7935764d2625?w=1200&q=80', title: 'AI STYLIST', headline: 'Spring Summer \'26', subtitle: 'Exclusive Women Collection' },
          { id: 2, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80', title: 'TRENDING', headline: 'Designer Lehengas', subtitle: 'Rent the best looks' }
        ];
      case 'men':
        return [
          { id: 1, image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80', title: 'AI STYLIST', headline: 'Men\'s Groom Collection', subtitle: 'Sharp & Elegant' },
          { id: 2, image: 'https://images.unsplash.com/photo-1594938298598-708a31ec2f15?w=1200&q=80', title: 'TRENDING', headline: 'Sherwani Sets', subtitle: 'Perfect for weddings' }
        ];
      case 'kids':
        return [
          { id: 1, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80', title: 'AI STYLIST', headline: 'Kids Party Wear', subtitle: 'Cute & Comfortable' },
          { id: 2, image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1200&q=80', title: 'TRENDING', headline: 'Festive Angrakha', subtitle: 'For the little ones' }
        ];
      case 'all':
      default:
        return [
          { id: 1, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80', title: 'AI STYLIST', headline: 'Virtual Try-On', subtitle: 'See how it looks on you' },
          { id: 2, image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80', title: 'NEW ARRIVALS', headline: 'Premium Collection', subtitle: 'Min 40% Off on Rentals' },
          { id: 3, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80', title: 'FAMILY', headline: 'Complete Sets', subtitle: 'Matching outfits for all' },
          { id: 4, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80', title: 'FESTIVE', headline: 'Wedding Season', subtitle: 'Shine on your big day' },
          { id: 5, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80', title: 'EXCLUSIVE', headline: 'Designer Wear', subtitle: 'Curated by top stylists' }
        ];
    }
  };

  const adSlides = getAdSlides();

  useEffect(() => {
    setCurrentSlide(0);
  }, [activeCategory]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setSlideDirection(1);
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === adSlides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, adSlides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setSlideDirection(-1);
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? adSlides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, adSlides.length]);

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 4000);
    return () => clearInterval(timerRef.current);
  }, [nextSlide]);

  const subCategories = {
    women: [
      { name: 'Bridal lehenga', icon: DiamondIcon },
      { name: 'Wedding gown', icon: StarsIcon },
      { name: 'Saree (silk/banarasi/kanjeevaram)', icon: CheckroomIcon },
      { name: 'Anarkali suit', icon: CheckroomIcon },
      { name: 'Sharara set', icon: CheckroomIcon },
      { name: 'Gharara set', icon: CheckroomIcon },
      { name: 'Ghagra choli', icon: CheckroomIcon },
      { name: 'Cocktail gown', icon: WineBarIcon },
      { name: 'Evening gown', icon: StarsIcon },
      { name: 'Party wear saree', icon: CelebrationIcon },
      { name: 'Designer lehenga choli', icon: AutoAwesomeIcon },
      { name: 'Indo-western gown', icon: WcIcon },
      { name: 'Mermaid gown', icon: CheckroomIcon },
      { name: 'Reception gown', icon: CameraAltIcon },
      { name: 'Engagement gown', icon: DiamondIcon }
    ],
    men: [
      { name: 'Sherwani', icon: CheckroomIcon },
      { name: 'Bandhgala suit (jodhpuri suit)', icon: CheckroomIcon },
      { name: 'Wedding tuxedo', icon: StarsIcon },
      { name: 'Designer kurta set', icon: AutoAwesomeIcon },
      { name: 'Nehru jacket with kurta', icon: CheckroomIcon },
      { name: 'Dhoti kurta (traditional ceremonies)', icon: CheckroomIcon },
      { name: 'Achkan', icon: CheckroomIcon },
      { name: 'Pathani suit (festive)', icon: CelebrationIcon },
      { name: "Groom's sherwani set", icon: DiamondIcon },
      { name: 'Formal wedding suit', icon: CheckroomIcon },
      { name: 'Silk kurta pajama', icon: StarsIcon }
    ],
    kids: [
      { name: 'Kids sherwani set (boys)', icon: ChildCareIcon },
      { name: 'Kids lehenga choli (girls)', icon: ChildCareIcon },
      { name: 'Kids gown/party frock', icon: CelebrationIcon },
      { name: 'Flower girl dress', icon: LocalFloristIcon },
      { name: 'Ring bearer suit', icon: DiamondIcon },
      { name: 'Kids tuxedo', icon: StarsIcon },
      { name: 'Kids kurta pajama (festive)', icon: CheckroomIcon },
      { name: 'Baby shower/naming ceremony dress', icon: CardGiftcardIcon },
      { name: 'Birthday party gown', icon: CakeIcon },
      { name: 'Festive angrakha set', icon: AutoAwesomeIcon }
    ]
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { isAvailableForRent: true };
      if (activeCategory !== 'all') {
        params.gender = activeCategory;
      }
      const res = await productAPI.getAll(params);

      let fetchedProducts = res.data.products || [];
      const backendFiltered = fetchedProducts.every(p => p.isAvailableForRent);
      if (!backendFiltered) {
        fetchedProducts = fetchedProducts.filter(p => p.isAvailableForRent);
      }

      setProducts(fetchedProducts);
    } catch (e) {
      console.error('Fetch rent products error:', e);
    } finally {
      setLoading(false);
    }
  };

  const activeColor = '#111827';
  const inactiveBg = '#f3f4f6';
  const inactiveColor = '#6b7280';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a1128', color: '#ffffff', fontFamily: 'var(--font-sans)' }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#0a1128',
        position: 'relative'
      }}>
      {/* Responsive Mixed-Shape Grid Styles */}
      <style>{`
        .men-formal-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: auto auto;
        }
        .men-formal-grid .card-square {
          grid-column: span 1;
          grid-row: span 1;
          aspect-ratio: 1 / 1;
        }
        .men-formal-grid .card-wide {
          grid-column: span 2;
          grid-row: span 1;
          aspect-ratio: 2 / 1;
        }
        @media (max-width: 1024px) {
          .men-formal-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .men-formal-grid .card-wide {
            grid-column: span 2;
          }
        }
        @media (max-width: 640px) {
          .men-formal-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .men-formal-grid .card-wide {
            grid-column: span 2;
            aspect-ratio: 16 / 7;
          }
          .men-formal-grid .card-square {
            aspect-ratio: 1 / 1;
          }
        }
        @media (max-width: 400px) {
          .men-formal-grid {
            grid-template-columns: 1fr;
          }
          .men-formal-grid .card-wide,
          .men-formal-grid .card-square {
            grid-column: span 1;
            aspect-ratio: 16 / 7;
          }
        }
        .formal-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          border: 1px solid rgba(212, 175, 55, 0.25);
          transition: all 0.3s ease;
        }
        .formal-card:hover {
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          border-color: #d4af37;
          transform: translateY(-3px);
        }
        .formal-card img {
          width: 100%; height: 100%; object-fit: cover;
          display: block;
        }
        .formal-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,17,40,0.92) 0%, rgba(10,17,40,0.3) 55%, transparent 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 18px;
        }
        .formal-card-tag {
          display: inline-block;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(212, 175, 55, 0.2); backdrop-filter: blur(6px);
          border: 1px solid rgba(212, 175, 55, 0.4);
          font-size: 10px; font-weight: 800; color: #f5d061;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 8px; width: fit-content;
        }
        .formal-card-title {
          font-size: clamp(14px, 2vw, 18px); font-weight: 800;
          color: #ffffff; line-height: 1.2; margin: 0 0 4px;
        }
        .formal-card-sub {
          font-size: 12px; color: #cbd5e1; font-weight: 500; margin: 0;
        }
        .formal-card-btn {
          margin-top: 10px;
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #f5d061 0%, #d4af37 100%); border: none;
          color: #0a1128;
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
          transition: transform 0.2s;
          width: fit-content;
        }
        .formal-card-btn:hover { transform: scale(1.05); }
      `}</style>

      {/* NAVBAR SECTION */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b132b', borderBottom: '1px solid rgba(212, 175, 55, 0.25)' }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/shop')}
              style={{
                padding: '8px 24px', borderRadius: '12px', border: activeTab === 'buy' ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                background: activeTab === 'buy' ? 'linear-gradient(135deg, #f5d061 0%, #d4af37 100%)' : '#0e1838',
                color: activeTab === 'buy' ? '#0a1128' : '#cbd5e1',
                fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: activeTab === 'buy' ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none'
              }}
            >Buy</button>
            <button
              onClick={() => navigate('/rent')}
              style={{
                padding: '8px 24px', borderRadius: '12px', border: activeTab === 'rent' ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                background: activeTab === 'rent' ? 'linear-gradient(135deg, #f5d061 0%, #d4af37 100%)' : '#0e1838',
                color: activeTab === 'rent' ? '#0a1128' : '#cbd5e1',
                fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: activeTab === 'rent' ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none'
              }}
            >Rent</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} style={{ padding: '16px 24px', background: '#0b132b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div 
              onClick={() => setAddressOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0e1838', padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #d4af37', minWidth: '200px', flex: '1 1 250px', cursor: 'pointer' }}
            >
              <LocationOnOutlinedIcon sx={{ color: '#f5d061', fontSize: '20px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery to</span>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedAddress ? (selectedAddress.type === 'pincode' ? selectedAddress.zip : `${selectedAddress.city || 'Saved'} - ${selectedAddress.zip}`) : 'Home - 400001, Mumbai'}
                </span>
              </div>
              <ExpandMoreRoundedIcon sx={{ color: '#f5d061', fontSize: '20px', transform: addressOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#0e1838', padding: '2px 8px 2px 4px', borderRadius: '14px', flex: '2 1 400px', border: '1.5px solid #d4af37' }}>
              <div style={{ padding: '8px 10px', color: '#f5d061', display: 'flex', alignItems: 'center' }}><SearchIcon /></div>
              <input type="text" placeholder="Search for designer lehengas, suits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: '14px', color: '#ffffff', outline: 'none', fontWeight: 500 }} />
              <button onClick={() => setCameraOpen(true)} title="Visual Search" className="rent-mobile-search-btn" style={{ border: 'none', background: 'transparent', padding: '6px', cursor: 'pointer', color: '#f5d061', alignItems: 'center' }}>
                <CameraAltIcon sx={{ fontSize: 20 }} />
              </button>
              <button onClick={() => setVoiceOpen(true)} title="Voice Search" className="rent-mobile-search-btn" style={{ border: 'none', background: 'transparent', padding: '6px', cursor: 'pointer', color: '#f5d061', alignItems: 'center' }}>
                <MicIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Desktop Only Account & Cart (Hidden on Mobile) */}
            <div className="rent-desktop-only-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
              <button onClick={() => navigate('/rent/profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f5d061' }}>
                <PersonOutlineIcon sx={{ fontSize: '26px', color: '#f5d061' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>Account</span>
              </button>
              <button onClick={() => navigate('/rent/cart')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f5d061', position: 'relative' }}>
                {rentalItemCount > 0 && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128', fontSize: '10px', fontWeight: 900, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                    {rentalItemCount}
                  </div>
                )}
                <ShoppingBagOutlinedIcon sx={{ fontSize: '26px', color: '#f5d061' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#f5d061' }}>Cart</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10, 17, 40, 0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)'
        }}>
          <div style={{ height: '1px', background: 'rgba(212, 175, 55, 0.15)', width: '100%' }} />
          <div style={{ padding: '16px 24px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
              {['All', 'Men', 'Women', 'Kids'].map((cat) => {
                const isSelected = activeCategory === cat.toLowerCase();
                return (
                  <button
                    key={cat} onClick={() => setActiveCategory(cat.toLowerCase())}
                    style={{
                      padding: '10px 28px', borderRadius: '10px',
                      background: isSelected ? 'linear-gradient(135deg, #f5d061 0%, #d4af37 100%)' : '#0e1838',
                      color: isSelected ? '#0a1128' : '#cbd5e1',
                      border: isSelected ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                      fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: isSelected ? '0 4px 12px rgba(212, 175, 55, 0.35)' : '0 2px 6px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat === 'All' && <CheckroomIcon sx={{ fontSize: '18px' }} />}
                    {cat}
                  </button>
                )
              })}
            </div>

            <AnimatePresence>
              {activeCategory !== 'all' && (
                <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 16 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ height: '2px', background: 'rgba(212, 175, 55, 0.25)', width: '100%', marginBottom: '0px' }} />
                  <div className="hide-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                    {subCategories[activeCategory].map((subCat, index) => {
                      const Icon = subCat.icon;
                      const colorPair = balloonColors[index % balloonColors.length];
                      return (
                        <motion.div
                          key={subCat.name}
                          animate={{
                            rotate: [0, -3, 3, -3, 0],
                            x: [0, -1.5, 1.5, -1.5, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 3.5 + (index % 3) * 0.7,
                            ease: "easeInOut"
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flexShrink: 0,
                            transformOrigin: 'top center',
                            marginTop: '2px'
                          }}
                        >
                          {/* Hanging Rope */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 20 }}
                            transition={{ delay: index * 0.03, duration: 0.3 }}
                            style={{
                              width: '2px',
                              background: 'linear-gradient(to bottom, #d4af37 0%, rgba(212, 175, 55, 0.3) 100%)',
                              opacity: 0.7
                            }}
                          />

                          {/* Balloon Button Wrapper */}
                          <div style={{ position: 'relative' }}>
                            {/* Triangular Knot */}
                            <div style={{
                              width: 0,
                              height: 0,
                              borderLeft: '5px solid transparent',
                              borderRight: '5px solid transparent',
                              borderBottom: `6px solid ${colorPair.solid}`,
                              position: 'absolute',
                              top: '-6px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              zIndex: 2
                            }} />

                            {/* Swaying Balloon Category Button */}
                            <motion.button
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.03 + 0.1 }}
                              whileHover={{ scale: 1.08 }}
                              style={{
                                padding: '10px 18px',
                                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                                background: colorPair.grad,
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                                position: 'relative',
                                zIndex: 1,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {Icon && <Icon sx={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)' }} />}
                              {subCat.name}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div style={{ height: '8px' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ height: '1px', background: 'rgba(212, 175, 55, 0.25)', width: '100%' }} />
        </div>
      </div>

      {/* SLIDER SECTION */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <div style={{ padding: '24px', background: 'transparent', overflow: 'hidden' }}>
          <div
            style={{
              position: 'relative', width: '100%', height: '320px', borderRadius: '20px',
              overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              border: '1px solid rgba(212, 175, 55, 0.25)'
            }}
          >
            <AnimatePresence initial={false} custom={slideDirection}>
              <motion.div
                key={currentSlide}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -50) {
                    nextSlide();
                  } else if (info.offset.x > 50) {
                    prevSlide();
                  }
                }}
                style={{ position: 'absolute', inset: 0, background: '#0a1128', cursor: 'grab' }}
                whileTap={{ cursor: 'grabbing' }}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden' }}>
                  {/* Background Image */}
                  <img
                    src={adSlides[currentSlide]?.image || undefined}
                    alt="Ad"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                    draggable="false"
                  />
                  
                  {/* Gradient Overlay for Text Readability (left side) */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to right, rgba(10, 17, 40, 0.95) 0%, rgba(10, 17, 40, 0.65) 45%, transparent 100%)',
                    pointerEvents: 'none'
                  }} />

                  {/* Text Content */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '60%', padding: '0 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10 }}>
                    {/* Title (Tag) */}
                    {adSlides[currentSlide]?.title && (
                      <div style={{ 
                        background: 'rgba(212, 175, 55, 0.2)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '8px', 
                        fontSize: '11px', fontWeight: 800, letterSpacing: '1px', display: 'inline-block', marginBottom: '16px', 
                        color: '#f5d061', width: 'fit-content', textTransform: 'uppercase', border: '1px solid rgba(212, 175, 55, 0.4)'
                      }}>
                        {adSlides[currentSlide].title}
                      </div>
                    )}
                    
                    {/* Headline (Font like 2nd picture) */}
                    <h2 style={{ 
                      fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, marginBottom: '12px', lineHeight: 1.1, 
                      color: '#ffffff', fontFamily: '"Playfair Display", "Georgia", serif' 
                    }}>
                      {adSlides[currentSlide]?.headline || ''}
                    </h2>
                    
                    {/* Subtitle */}
                    <p style={{ fontSize: '18px', color: '#cbd5e1', fontWeight: 500, marginBottom: '32px', maxWidth: '400px' }}>
                      {adSlides[currentSlide]?.subtitle || ''}
                    </p>
                    
                    {/* Explore Button */}
                    <button
                      style={{
                        padding: '14px 32px', background: 'linear-gradient(135deg, #f5d061 0%, #d4af37 100%)', color: '#0a1128',
                        border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 900, cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)', pointerEvents: 'auto', width: 'fit-content',
                        transition: 'transform 0.2s, background 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      Explore Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Left Arrow Button */}
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(10, 17, 40, 0.7)',
                backdropFilter: 'blur(8px)', border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#f5d061', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10, transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(10, 17, 40, 0.7)'}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: '24px' }} />
            </button>

            {/* Right Arrow Button */}
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              style={{
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(10, 17, 40, 0.7)',
                backdropFilter: 'blur(8px)', border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#f5d061', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10, transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(10, 17, 40, 0.7)'}
            >
              <ChevronRightRoundedIcon sx={{ fontSize: '24px' }} />
            </button>

            {/* Carousel Dots */}
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
              {adSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (i !== currentSlide) {
                      setSlideDirection(i > currentSlide ? 1 : -1);
                      setCurrentSlide(i);
                    }
                  }}
                  style={{
                    width: i === currentSlide ? '24px' : '8px', height: '8px',
                    borderRadius: '4px', background: i === currentSlide ? '#f5d061' : 'rgba(212, 175, 55, 0.35)',
                    transition: 'all 0.3s ease', border: 'none', padding: 0, cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN PAGE SECTION */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {/* Men — Party, Formal & Special Occasions Section */}
        {(activeCategory === 'men' || activeCategory === 'all') && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: '32px 24px', background: 'transparent' }}
          >
            {/* Section Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '50px',
                padding: '5px 14px', marginBottom: '12px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#f5d061', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  🎩 Men's Formal Collection
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, color: '#ffffff',
                margin: 0, lineHeight: 1.2,
                fontFamily: '"Playfair Display", "Georgia", serif'
              }}>
                Party, Formal &amp;{' '}
                <span style={{
                  backgroundImage: 'linear-gradient(135deg, #f5d061, #d4af37)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>Special Occasions</span>
              </h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '8px', margin: '8px 0 0' }}>
                Dress sharp for every milestone — from boardrooms to black-tie galas
              </p>
            </div>

            <div className="men-formal-grid">

              {/* Card 1 — Square: Tuxedo */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Tuxedo')}>
                <img src="/tuxedo.png" alt="Tuxedo" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Black Tie</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Tuxedo</h3>
                  <p className="formal-card-sub">Classic elegance for galas &amp; weddings</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 2 — Wide Rectangle: Three-Piece Suit */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Three-Piece Suit')}>
                <img src="/three-piece-suit.png" alt="Three-Piece Suit" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Power Dressing</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Three-Piece Suit</h3>
                  <p className="formal-card-sub">Complete sophistication — jacket, vest &amp; trousers</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 3 — Square: Blazer / Sport Coat */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Blazer')}>
                <img src="/blazer.png" alt="Blazer" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Smart Casual</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Blazer / Sport Coat</h3>
                  <p className="formal-card-sub">Effortless style for any occasion</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 4 — Wide Rectangle: Velvet Dinner Jacket */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Velvet Dinner Jacket')}>
                <img src="/velvet-jacket.png" alt="Velvet Dinner Jacket" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Evening Wear</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Velvet Dinner Jacket</h3>
                  <p className="formal-card-sub">Luxuriously rich fabric for premium evenings</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 5 — Square: Double-Breasted Suit */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Double-Breasted Suit')}>
                <img src="/double-breasted.png" alt="Double-Breasted Suit" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Executive Look</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Double-Breasted Suit</h3>
                  <p className="formal-card-sub">Bold structured silhouette, timeless authority</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

            </div>

            {/* Traditional & Festive Wear Header */}
            <div style={{ marginTop: '48px', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '50px',
                padding: '5px 14px', marginBottom: '12px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#f5d061', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  🕌 Heritage Collection
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, color: '#ffffff',
                margin: 0, lineHeight: 1.2,
                fontFamily: '"Playfair Display", "Georgia", serif'
              }}>
                Traditional &amp;{' '}
                <span style={{
                  backgroundImage: 'linear-gradient(135deg, #f5d061, #d4af37)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>Festive Wear</span>
              </h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '8px', margin: '8px 0 0' }}>
                Embrace your roots with exquisite cultural ensembles
              </p>
            </div>

            {/* 6-Item Heritage Grid */}
            <div className="men-formal-grid">

              {/* Card 1 — Wide Rectangle: Sherwani */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Sherwani')}>
                <img src="/sherwani.png" alt="Sherwani" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Royal Weddings</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Sherwani</h3>
                  <p className="formal-card-sub">Opulent embroidery for the grandest occasions</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 2 — Square: Kurta Pajama */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Kurta Pajama')}>
                <img src="/velvet-jacket.png" alt="Kurta Pajama" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Festive Casual</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Kurta Pajama</h3>
                  <p className="formal-card-sub">Lightweight elegance for pujas &amp; festivals</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 3 — Square: Nehru / Modi Jacket */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Nehru Jacket')}>
                <img src="/blazer.png" alt="Nehru Jacket" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Layered Style</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Nehru / Modi Jacket</h3>
                  <p className="formal-card-sub">Sleeveless sophistication for day events</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 4 — Square: Bandhgala / Jodhpuri Suit */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Bandhgala')}>
                <img src="/double-breasted.png" alt="Bandhgala" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Aristocratic</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Bandhgala / Jodhpuri Suit</h3>
                  <p className="formal-card-sub">Structured princely charm for receptions</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 5 — Wide Rectangle: Thobe / Kandura */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Thobe')}>
                <img src="/three-piece-suit.png" alt="Thobe / Kandura" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Middle Eastern</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Thobe / Kandura</h3>
                  <p className="formal-card-sub">Pristine flowing grace for eid &amp; gatherings</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 6 — Square: Kilt */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Kilt')}>
                <img src="/tuxedo.png" alt="Kilt" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Celtic Tradition</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Kilt</h3>
                  <p className="formal-card-sub">Authentic tartan heritage for special events</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Women — Party, Evening & Special Occasions Section */}
        {(activeCategory === 'women' || activeCategory === 'all') && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: '32px 24px', background: 'transparent' }}
          >
            {/* Section Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '50px',
                padding: '5px 14px', marginBottom: '12px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#f5d061', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  ✨ Women's Luxury Collection
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, color: '#ffffff',
                margin: 0, lineHeight: 1.2,
                fontFamily: '"Playfair Display", "Georgia", serif'
              }}>
                Party, Evening &amp;{' '}
                <span style={{
                  backgroundImage: 'linear-gradient(135deg, #f5d061, #d4af37)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>Special Occasions</span>
              </h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '8px', margin: '8px 0 0' }}>
                Stunning silhouettes for gala nights, cocktail soirées, and red carpet moments
              </p>
            </div>

            {/* 6-Item Women's Grid */}
            <div className="men-formal-grid">

              {/* Card 1 — Square: Ball Gown */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Ball Gown')}>
                <img src="/ball_gown.png" alt="Ball Gown" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Red Carpet</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Ball Gown</h3>
                  <p className="formal-card-sub">Majestic and sweeping royal silhouettes</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 2 — Wide Rectangle: Cocktail Dress */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Cocktail Dress')}>
                <img src="/cocktail_dress.png" alt="Cocktail Dress" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Soirée Elegance</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Cocktail Dress</h3>
                  <p className="formal-card-sub">Chic, sophisticated shorter silhouettes</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 3 — Square: Bodycon Dress */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Bodycon Dress')}>
                <img src="/bodycon_dress.png" alt="Bodycon Dress" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Glamour Fit</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Bodycon Dress</h3>
                  <p className="formal-card-sub">Sleek figure-hugging evening styles</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 4 — Wide Rectangle: Slip Dress */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Slip Dress')}>
                <img src="/slip_dress.png" alt="Slip Dress" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Minimalist Luxe</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Slip Dress</h3>
                  <p className="formal-card-sub">Effortless silk &amp; satin fluid silhouettes</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 5 — Square: Mermaid Gown */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Mermaid Gown')}>
                <img src="/mermaid_gown.png" alt="Mermaid Gown" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Gala Night</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Mermaid Gown</h3>
                  <p className="formal-card-sub">Dramatic flared hem contours</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 6 — Square: Jumpsuit */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Jumpsuit')}>
                <img src="/jumpsuit.png" alt="Jumpsuit" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Modern Alternative</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Jumpsuit</h3>
                  <p className="formal-card-sub">Contemporary tailored luxury one-pieces</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Women — Traditional & Festive Wear Section */}
        {(activeCategory === 'women' || activeCategory === 'all') && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: '32px 24px', background: 'transparent' }}
          >
            {/* Section Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '50px',
                padding: '5px 14px', marginBottom: '12px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#f5d061', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  ✨ Women's Heritage Collection
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, color: '#ffffff',
                margin: 0, lineHeight: 1.2,
                fontFamily: '"Playfair Display", "Georgia", serif'
              }}>
                Traditional &amp;{' '}
                <span style={{
                  backgroundImage: 'linear-gradient(135deg, #f5d061, #d4af37)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>Festive Wear</span>
              </h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '8px', margin: '8px 0 0' }}>
                Timeless elegance and cultural grace for festivals, weddings, and traditional celebrations
              </p>
            </div>

            {/* 6-Item Women's Traditional Grid */}
            <div className="men-formal-grid">

              {/* Card 1 — Square: Saree */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Saree')}>
                <img src="/saree.png" alt="Saree" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Traditional</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Saree</h3>
                  <p className="formal-card-sub">Six yards of pure elegance and heritage</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 2 — Wide Rectangle: Lehenga Choli */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Lehenga Choli')}>
                <img src="/lehenga_choli.png" alt="Lehenga Choli" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Royal Festive</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Lehenga Choli</h3>
                  <p className="formal-card-sub">Graceful bridal and celebratory ethnic ensembles</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 3 — Square: Anarkali Suit */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Anarkali Suit')}>
                <img src="/anarkali_suit.png" alt="Anarkali Suit" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Royal Grace</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Anarkali Suit</h3>
                  <p className="formal-card-sub">Regal flared silhouettes for festive elegance</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 4 — Wide Rectangle: Salwar Kameez */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Salwar Kameez')}>
                <img src="/salwar_kameez.png" alt="Salwar Kameez" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Classic Modest</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Salwar Kameez</h3>
                  <p className="formal-card-sub">Timeless comfort combined with ethnic beauty</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 5 — Square: Kimono */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Kimono')}>
                <img src="/kimono.png" alt="Kimono" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Cultural Heritage</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Kimono</h3>
                  <p className="formal-card-sub">Exquisite Japanese silk robe for unique grace</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 6 — Square: Abaya */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Abaya')}>
                <img src="/abaya.png" alt="Abaya" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Elegant Modesty</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Abaya</h3>
                  <p className="formal-card-sub">Contemporary modest designs with premium embroidery</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Kids — Party, Formal & Special Occasions Section */}
        {(activeCategory === 'kids' || activeCategory === 'all') && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: '32px 24px', background: 'transparent' }}
          >
            {/* Section Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '50px',
                padding: '5px 14px', marginBottom: '12px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#f5d061', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  🧸 Kids' Collection
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, color: '#ffffff',
                margin: 0, lineHeight: 1.2,
                fontFamily: '"Playfair Display", "Georgia", serif'
              }}>
                Party, Formal &amp;{' '}
                <span style={{
                  backgroundImage: 'linear-gradient(135deg, #f5d061, #d4af37)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>Special Occasions</span>
              </h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '8px', margin: '8px 0 0' }}>
                Adorable &amp; comfortable party wear for your little ones
              </p>
            </div>

            <div className="men-formal-grid">

              {/* Card 1 — Square: Kids Tuxedo */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Kids Tuxedo')}>
                <img src="/tuxedo.png" alt="Kids Tuxedo" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Little Gentlemen</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Kids Tuxedo</h3>
                  <p className="formal-card-sub">Classic elegance for the little ones</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 2 — Wide Rectangle: Kids Sherwani */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Kids Sherwani')}>
                <img src="/sherwani.png" alt="Kids Sherwani" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Festive Wear</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Kids Sherwani</h3>
                  <p className="formal-card-sub">Royal traditional wear for boys</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 3 — Square: Kids Lehenga */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Kids Lehenga')}>
                <img src="/lehenga_choli.png" alt="Kids Lehenga" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Ethnic Grace</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Kids Lehenga</h3>
                  <p className="formal-card-sub">Beautiful ethnic wear for girls</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 4 — Wide Rectangle: Kids Gown */}
              <div className="formal-card card-wide" onClick={() => navigate('/rent/category?name=Kids Gown')}>
                <img src="/ball_gown.png" alt="Kids Gown" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Princess Look</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Kids Party Gown</h3>
                  <p className="formal-card-sub">Fairy tale gowns for special occasions</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

              {/* Card 5 — Square: Kids Kurta Pajama */}
              <div className="formal-card card-square" onClick={() => navigate('/rent/category?name=Kids Kurta Pajama')}>
                <img src="/kurta_pajama.png" alt="Kids Kurta Pajama" />
                <div className="formal-card-overlay">
                  <span className="formal-card-tag">Casual Festive</span>
                  <h3 className="formal-card-title" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Kurta Pajama</h3>
                  <p className="formal-card-sub">Comfortable festive wear</p>
                  <button className="formal-card-btn">Rent Now →</button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Product Grid Area - Temporarily Removed as requested */}
        {/* 
      <div className="container" style={{ padding: '32px 24px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>
            {activeCategory === 'all' ? 'Trending Rentals' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Collection`}
          </h2>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
            {products.length} Items Available
          </span>
        </div>

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="skeleton" style={{ height: '420px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard 
                key={p._id} product={p} index={i} hideActions={true} 
                onClickOverride={() => setSelectedRentalProduct(p)} 
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👗</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>No rental items found</h3>
            <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>We couldn't find any items available for rent in this category.</p>
          </div>
        )}
      </div> 
      */}
      </div>

      <RentalBottomSheet
        isOpen={!!selectedRentalProduct}
        onClose={() => setSelectedRentalProduct(null)}
        product={selectedRentalProduct}
      />

      <RentAddressDrawer addressOpen={addressOpen} setAddressOpen={setAddressOpen} selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} />
      <RentCameraModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} />
      <RentVoiceSearchModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} onQuerySubmit={(q) => setSearchQuery(q)} />
      
      <style>{`
        .rent-mobile-search-btn {
          display: none !important;
        }
        @media (max-width: 768px) {
          .rent-desktop-only-actions { display: none !important; }
          .rent-mobile-search-btn { display: flex !important; }
        }
      `}</style>
      </div>
    </div>
  );
}
