import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../../api';
import ProductCard from '../../components/ProductCard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/SearchRounded';
import CheckroomIcon from '@mui/icons-material/CheckroomRounded';
import DiamondIcon from '@mui/icons-material/DiamondRounded';
import CelebrationIcon from '@mui/icons-material/CelebrationRounded';
import StarsIcon from '@mui/icons-material/StarsRounded';
import WineBarIcon from '@mui/icons-material/WineBarRounded';
import CameraAltIcon from '@mui/icons-material/CameraAltRounded';
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
import { useCart } from '../../context/CartContext';

// --- BOTTOM SHEET COMPONENT (INLINE FOR SIMPLICITY) ---
function RentalBottomSheet({ isOpen, onClose, product }) {
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [selectedSize, setSelectedSize] = useState('');
  const [hasInsurance, setInsurance] = useState(false);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
          }}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              background: '#fff', width: '100%', maxWidth: '800px', margin: '0 auto',
              borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', position: 'relative'
            }}
          >
            {/* Top Navigation */}
            <div style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', zIndex: 10, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <CloseRoundedIcon sx={{ fontSize: '20px', color: '#475569' }} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '12px' }}>
                <BoltRoundedIcon sx={{ fontSize: '14px' }} /> Deliver to Home - In 45 mins
              </div>
              <button style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ShareRoundedIcon sx={{ fontSize: '18px', color: '#475569' }} />
              </button>
            </div>

            <div style={{ padding: '0 0 100px 0' }}>
              {/* Hero Media */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', background: '#f8fafc' }}>
                <img
                  src={product.images?.[0] || 'https://placehold.co/600x800'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', padding: '6px 12px', borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: 600 }}>
                  Model is 5'8" wearing Size S
                </div>
              </div>

              <div style={{ padding: '24px 20px' }}>
                {/* Product Identity */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{product.name}</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>{product.brand || 'Premium Collection'}</p>
                  </div>
                  <div style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>Available Now</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: '#fef2f2', padding: '10px 14px', borderRadius: '10px' }}>
                  <AccessTimeRoundedIcon sx={{ color: '#ef4444', fontSize: '18px' }} />
                  <span style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 600 }}>Only 2 left in your local dark store!</span>
                </div>

                {/* Size Selector */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>1. Select Size</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {['S', 'M', 'L', 'XL'].map(size => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size} onClick={() => setSelectedSize(size)}
                          style={{
                            flex: '1 1 calc(25% - 12px)', padding: '12px', borderRadius: '12px',
                            border: isSelected ? '2px solid #111827' : '1px solid #e2e8f0',
                            background: isSelected ? '#111827' : '#fff', color: isSelected ? '#fff' : '#475569',
                            fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#4f46e5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    <CheckroomRoundedIcon sx={{ fontSize: '16px' }} /> Find Your Fit Quiz
                  </button>
                </div>

                {/* Duration Picker */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>2. Rental Duration</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[3, 5, 7].map(days => {
                      const isSelected = selectedDuration === days;
                      return (
                        <button
                          key={days} onClick={() => setSelectedDuration(days)}
                          style={{
                            flex: 1, padding: '12px', borderRadius: '12px',
                            border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                            background: isSelected ? '#eef2ff' : '#fff', color: isSelected ? '#4f46e5' : '#475569',
                            fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                          }}
                        >
                          <span>{days} Days</span>
                          <span style={{ fontSize: '11px', fontWeight: 500, marginTop: '4px' }}>₹{product.rentPricePerDay * days}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Peace of Mind */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VerifiedUserRoundedIcon sx={{ color: '#10b981', fontSize: '20px' }} /> Peace of Mind Guarantee
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                    Professionally dry-cleaned and sanitized before every delivery. Arrives in a sealed, premium garment bag.
                  </p>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <input
                      type="checkbox" checked={hasInsurance} onChange={(e) => setInsurance(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Add Spill & Tear Protection (+₹300)</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Minor damage insurance for peace of mind.</span>
                    </div>
                  </label>
                </div>

                {/* Return Logistics */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Return Logistics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 800 }}>1</div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Wear & Enjoy</h4>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Keep it for your selected {selectedDuration} days.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 800 }}>2</div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Pack It Up</h4>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Place it back in the provided reusable QR-coded bag (no washing required!).</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 800 }}>3</div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Instant Pickup</h4>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>A delivery rider will pick it up automatically on Day {selectedDuration}.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Bar */}
            <div style={{
              position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: '800px', background: '#fff', borderTop: '1px solid #f1f5f9',
              padding: '16px 20px', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>₹{calculateTotal()}</span>
                <span style={{ fontSize: '11px', color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>View Price Breakdown</span>
              </div>
              <button
                style={{
                  background: 'linear-gradient(135deg, #111827 0%, #334155 100%)', color: '#fff', padding: '14px 32px', borderRadius: '12px',
                  fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
                }}
              >
                Rent Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #044b58 0%, #01151a 100%)', fontFamily: 'var(--font-sans)' }}>
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
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .formal-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
        }
        .formal-card img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }
        .formal-card:hover img {
          transform: scale(1.06);
        }
        .formal-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, transparent 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 18px;
        }
        .formal-card-tag {
          display: inline-block;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(255,255,255,0.15); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.25);
          font-size: 10px; font-weight: 700; color: #fff;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 8px; width: fit-content;
        }
        .formal-card-title {
          font-size: clamp(14px, 2vw, 18px); font-weight: 800;
          color: #fff; line-height: 1.2; margin: 0 0 4px;
        }
        .formal-card-sub {
          font-size: 12px; color: rgba(255,255,255,0.75); font-weight: 500; margin: 0;
        }
        .formal-card-btn {
          margin-top: 10px;
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(8px); color: #fff;
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 700; cursor: pointer;
          transition: background 0.2s;
          width: fit-content;
        }
        .formal-card-btn:hover { background: rgba(255,255,255,0.3); }
      `}</style>

      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/shop')}
            style={{
              padding: '8px 24px', borderRadius: '12px', border: activeTab === 'buy' ? 'none' : '1px solid #cbd5e1',
              background: activeTab === 'buy' ? 'linear-gradient(135deg, #0047ab 0%, #002f75 100%)' : '#f8fafc',
              color: activeTab === 'buy' ? '#ffffff' : '#475569',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === 'buy' ? '0 4px 12px rgba(0, 71, 171, 0.2)' : 'none'
            }}
          >Buy</button>
          <button
            onClick={() => navigate('/rent')}
            style={{
              padding: '8px 24px', borderRadius: '12px', border: activeTab === 'rent' ? 'none' : '1px solid #cbd5e1',
              background: activeTab === 'rent' ? 'linear-gradient(135deg, #0047ab 0%, #002f75 100%)' : '#f8fafc',
              color: activeTab === 'rent' ? '#ffffff' : '#475569',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === 'rent' ? '0 4px 12px rgba(0, 71, 171, 0.2)' : 'none'
            }}
          >Rent</button>
        </div>

        <button
          onClick={() => setSearchParams({ ai: 'true' })}
          style={{
            padding: '8px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            color: '#ffffff', fontWeight: 700, fontSize: '14px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(236,72,153,0.3)'
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: '18px' }} />
          AI Styles
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 16px', borderRadius: '12px', border: '2px solid #0047ab', minWidth: '200px', flex: '1 1 250px' }}>
            <LocationOnOutlinedIcon sx={{ color: '#ec4899', fontSize: '20px' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery to</span>
              <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Home - 400001, Mumbai</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '2px 4px', borderRadius: '14px', flex: '2 1 400px', border: '2px solid #0047ab' }}>
            <div style={{ padding: '8px 12px', color: '#94a3b8' }}><SearchIcon /></div>
            <input type="text" placeholder="Search for designer lehengas, suits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: '14px', color: '#334155', outline: 'none', fontWeight: 500 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
            <button onClick={() => navigate('/rent/profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569' }}>
              <PersonOutlineIcon sx={{ fontSize: '26px' }} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Account</span>
            </button>
            <button onClick={() => navigate('/rent/cart')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4f46e5', position: 'relative' }}>
              {rentalItemCount > 0 && (
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  {rentalItemCount}
                </div>
              )}
              <ShoppingBagOutlinedIcon sx={{ fontSize: '26px' }} />
              <span style={{ fontSize: '11px', fontWeight: 700 }}>Cart</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        background: 'rgba(4, 75, 88, 0.85)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', width: '100%' }} />
        <div style={{ padding: '16px 24px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {['All', 'Men', 'Women', 'Kids'].map((cat) => {
              const isSelected = activeCategory === cat.toLowerCase();
              return (
                <button
                  key={cat} onClick={() => setActiveCategory(cat.toLowerCase())}
                  style={{
                    padding: '10px 28px', borderRadius: '10px',
                    background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    border: isSelected ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    backdropFilter: 'blur(4px)',
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
                <div style={{ height: '2px', background: '#e2e8f0', width: '100%', marginBottom: '0px' }} />
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
                            background: 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)',
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
                              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
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
        <div style={{ height: '1px', background: '#e5e7eb', width: '100%' }} />
      </div>

      {/* Ad Carousel Section */}
      <div style={{ padding: '24px', background: '#fafafb', overflow: 'hidden' }}>
        <div
          style={{
            position: 'relative', width: '100%', height: '320px', borderRadius: '20px',
            overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
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
              style={{ position: 'absolute', inset: 0, background: '#1e293b', cursor: 'grab' }}
              whileTap={{ cursor: 'grabbing' }}
            >
              <img
                src={adSlides[currentSlide].image}
                alt="Ad"
                className="w-full h-full object-cover object-top"
                draggable="false"
              />
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                  pointerEvents: 'none'
                }}
              />

              <div style={{ position: 'absolute', top: '40px', left: '40px', color: '#fff', maxWidth: '50%', pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
                  {adSlides[currentSlide].title}
                </div>
                <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', lineHeight: 1.1 }}>
                  {adSlides[currentSlide].headline}
                </h2>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  {adSlides[currentSlide].subtitle}
                </p>
                <button
                  style={{
                    marginTop: '24px', padding: '12px 28px', background: '#fff', color: '#000',
                    border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255,255,255,0.2)', pointerEvents: 'auto'
                  }}
                >
                  Explore Now
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left Arrow Button */}
          <button
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            style={{
              position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
              width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <ChevronLeftRoundedIcon sx={{ fontSize: '24px' }} />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            style={{
              position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
              width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
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
                  borderRadius: '4px', background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s ease', border: 'none', padding: 0, cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
      </div>

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
              background: 'linear-gradient(135deg, rgba(17,24,39,0.06), rgba(99,102,241,0.08))',
              border: '1px solid rgba(17,24,39,0.1)', borderRadius: '50px',
              padding: '5px 14px', marginBottom: '12px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#111827', letterSpacing: '1px', textTransform: 'uppercase' }}>
                🎩 Men's Formal Collection
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, color: '#0f172a',
              margin: 0, lineHeight: 1.2,
              fontFamily: '"Playfair Display", "Georgia", serif'
            }}>
              Party, Formal &amp;{' '}
              <span style={{
                background: 'linear-gradient(135deg, #111827, #6366f1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>Special Occasions</span>
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', margin: '8px 0 0' }}>
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
              background: 'linear-gradient(135deg, rgba(17,24,39,0.06), rgba(99,102,241,0.08))',
              border: '1px solid rgba(17,24,39,0.1)', borderRadius: '50px',
              padding: '5px 14px', marginBottom: '12px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#111827', letterSpacing: '1px', textTransform: 'uppercase' }}>
                🕌 Heritage Collection
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, color: '#0f172a',
              margin: 0, lineHeight: 1.2,
              fontFamily: '"Playfair Display", "Georgia", serif'
            }}>
              Traditional &amp;{' '}
              <span style={{
                background: 'linear-gradient(135deg, #111827, #6366f1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>Festive Wear</span>
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', margin: '8px 0 0' }}>
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
              background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(99,102,241,0.08))',
              border: '1px solid rgba(236,72,153,0.2)', borderRadius: '50px',
              padding: '5px 14px', marginBottom: '12px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#f43f5e', letterSpacing: '1px', textTransform: 'uppercase' }}>
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
                background: 'linear-gradient(135deg, #f43f5e, #a855f7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>Special Occasions</span>
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', margin: '8px 0 0' }}>
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
              background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(99,102,241,0.08))',
              border: '1px solid rgba(236,72,153,0.2)', borderRadius: '50px',
              padding: '5px 14px', marginBottom: '12px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#f43f5e', letterSpacing: '1px', textTransform: 'uppercase' }}>
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
                background: 'linear-gradient(135deg, #f43f5e, #a855f7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>Festive Wear</span>
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', margin: '8px 0 0' }}>
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

      <RentalBottomSheet
        isOpen={!!selectedRentalProduct}
        onClose={() => setSelectedRentalProduct(null)}
        product={selectedRentalProduct}
      />

    </div>
  );
}
