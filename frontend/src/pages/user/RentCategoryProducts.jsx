import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { productAPI } from '../../api';
import RentNavbar from '../../components/RentNavbar';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/CloseRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import ShareIcon from '@mui/icons-material/ShareRounded';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserRounded';
import BoltIcon from '@mui/icons-material/BoltRounded';
import CheckroomIcon from '@mui/icons-material/CheckroomRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/SearchRounded';
import toast from 'react-hot-toast';

// --- RENTAL BOTTOM SHEET ---
function RentalBottomSheet({ isOpen, onClose, product, onConfirm }) {
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [selectedSize, setSelectedSize] = useState('M');
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

  const calculateTotal = () => {
    let base = product.rentPricePerDay * selectedDuration;
    let insurance = hasInsurance ? 300 : 0;
    let deposit = 1500;
    return base + insurance + deposit;
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
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              background: '#fff', width: '100%', maxWidth: '600px', margin: '0 auto',
              borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', position: 'relative',
              paddingBottom: '100px', color: '#1a1a1a', fontFamily: 'var(--font-sans)'
            }}
          >
            {/* Top Navigation */}
            <div style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', zIndex: 10, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <CloseIcon sx={{ fontSize: '20px', color: '#475569' }} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '12px' }}>
                <BoltIcon sx={{ fontSize: '14px' }} /> Deliver in 45 mins
              </div>
              <button style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ShareIcon sx={{ fontSize: '18px', color: '#475569' }} />
              </button>
            </div>

            <div style={{ padding: '24px 20px' }}>
              {/* Product Identity */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{product.name}</h2>
                  <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>{product.brand || 'Premium Collection'}</p>
                </div>
                <div style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>Available</div>
              </div>

              {/* Size Selector */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>1. Select Size</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {['S', 'M', 'L', 'XL'].map(size => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size} onClick={() => setSelectedSize(size)}
                        style={{
                          flex: '1 1 calc(25% - 12px)', padding: '12px', borderRadius: '12px',
                          border: isSelected ? '2px solid #231b1c' : '1px solid #e2e8f0',
                          background: isSelected ? '#231b1c' : '#fff', color: isSelected ? '#fff' : '#475569',
                          fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
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
                          border: isSelected ? '2px solid #8b1e2f' : '1px solid #e2e8f0',
                          background: isSelected ? '#fdf2f2' : '#fff', color: isSelected ? '#8b1e2f' : '#475569',
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
                  <VerifiedUserIcon sx={{ color: '#10b981', fontSize: '20px' }} /> Peace of Mind Guarantee
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  <input
                    type="checkbox" checked={hasInsurance} onChange={(e) => setInsurance(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#8b1e2f' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Add Spill & Tear Protection (+₹300)</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Minor damage insurance for peace of mind.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Sticky Action Bar */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0,
              width: '100%', background: '#fff', borderTop: '1px solid #f1f5f9',
              padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>₹{calculateTotal()}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Includes ₹1,500 refundable deposit</span>
              </div>
              <button
                onClick={() => onConfirm(selectedSize, selectedDuration)}
                style={{
                  background: '#231b1c', color: '#fff', padding: '14px 32px', borderRadius: '12px',
                  fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
                }}
              >
                Book Rental Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- MOCK DATABASE PRODUCTS FOR FALLBACKS ---
const MOCK_COLLECTIONS = {
  // Men's Formal
  'Tuxedo': [
    { _id: 'tux-1', name: 'Classic Midnight Silk Tuxedo', brand: 'TUXEDO', material: 'SILK & SATIN', rentPricePerDay: 580, rating: 5.0, numReviews: 41, sizes: ['S', 'M', 'L'] },
    { _id: 'tux-2', name: 'Tailored Velvet Dinner Tuxedo', brand: 'TUXEDO', material: 'VELVET', rentPricePerDay: 620, rating: 4.9, numReviews: 24, sizes: ['M', 'L', 'XL'] },
    { _id: 'tux-3', name: 'Slim Fit Peak Lapel Tuxedo', brand: 'TUXEDO', material: 'PREMIUM WOOL', rentPricePerDay: 490, rating: 4.8, numReviews: 18, sizes: ['S', 'M', 'L', 'XL'] }
  ],
  'Three-Piece Suit': [
    { _id: '3ps-1', name: 'Royal Navy Wool Three-Piece', brand: 'TAILORED', material: 'MERINO WOOL', rentPricePerDay: 450, rating: 4.9, numReviews: 88, sizes: ['M', 'L', 'XL'] },
    { _id: '3ps-2', name: 'Charcoal Herringbone Tweed Suit', brand: 'HERITAGE', material: 'TWEED WOOL', rentPricePerDay: 480, rating: 4.7, numReviews: 32, sizes: ['S', 'M', 'L'] }
  ],
  'Blazer': [
    { _id: 'blz-1', name: 'Italian Linen Classic Blazer', brand: 'CASUAL', material: 'ITALIAN LINEN', rentPricePerDay: 320, rating: 4.7, numReviews: 54, sizes: ['S', 'M', 'L', 'XL'] },
    { _id: 'blz-2', name: 'Double-Breasted Navy Blazer', brand: 'TAILORED', material: 'COTTON BLEND', rentPricePerDay: 350, rating: 4.8, numReviews: 42, sizes: ['M', 'L'] }
  ],
  'Velvet Dinner Jacket': [
    { _id: 'vdj-1', name: 'Burgundy Premium Velvet Blazer', brand: 'LUXURY', material: 'ROYAL VELVET', rentPricePerDay: 520, rating: 5.0, numReviews: 19, sizes: ['M', 'L', 'XL'] },
    { _id: 'vdj-2', name: 'Emerald Green Dinner Jacket', brand: 'LUXURY', material: 'ROYAL VELVET', rentPricePerDay: 550, rating: 4.9, numReviews: 27, sizes: ['S', 'M', 'L'] }
  ],
  'Double-Breasted Suit': [
    { _id: 'dbs-1', name: 'Classic Pinstripe Double Suit', brand: 'OFFICE', material: 'WORSTED WOOL', rentPricePerDay: 480, rating: 4.8, numReviews: 15, sizes: ['M', 'L', 'XL'] }
  ],

  // Men's Traditional
  'Sherwani': [
    { _id: 'shw-1', name: 'Royal Ivory Embroidered Sherwani', brand: 'HERITAGE', material: 'RAW SILK', rentPricePerDay: 750, rating: 5.0, numReviews: 64, sizes: ['M', 'L', 'XL'] },
    { _id: 'shw-2', name: 'Midnight Blue Velvet Sherwani', brand: 'LUXURY', material: 'VELVET', rentPricePerDay: 820, rating: 4.9, numReviews: 42, sizes: ['S', 'M', 'L'] }
  ],
  'Kurta Pajama': [
    { _id: 'kp-1', name: 'Lucknowi Chikankari Kurta Set', brand: 'FESTIVE', material: 'COTTON', rentPricePerDay: 250, rating: 4.8, numReviews: 104, sizes: ['S', 'M', 'L', 'XL'] },
    { _id: 'kp-2', name: 'Raw Silk Jacquard Kurta Pajama', brand: 'FESTIVE', material: 'RAW SILK', rentPricePerDay: 290, rating: 4.7, numReviews: 53, sizes: ['M', 'L', 'XL'] }
  ],
  'Nehru Jacket': [
    { _id: 'nj-1', name: 'Peach Tussar Silk Nehru Jacket', brand: 'FESTIVE', material: 'TUSSAR SILK', rentPricePerDay: 200, rating: 4.8, numReviews: 76, sizes: ['S', 'M', 'L', 'XL'] }
  ],
  'Bandhgala': [
    { _id: 'bdg-1', name: 'Jodhpuri Velvet Bandhgala Suit', brand: 'ROYAL', material: 'ROYAL VELVET', rentPricePerDay: 680, rating: 4.9, numReviews: 29, sizes: ['M', 'L', 'XL'] }
  ],
  'Thobe': [
    { _id: 'thb-1', name: 'Pristine White Emirati Kandura', brand: 'TRADITIONAL', material: 'COTTON', rentPricePerDay: 300, rating: 5.0, numReviews: 12, sizes: ['M', 'L', 'XL'] }
  ],
  'Kilt': [
    { _id: 'klt-1', name: 'Royal Stewart Highland Tartan Kilt', brand: 'CELTIC', material: 'PURE WOOL', rentPricePerDay: 380, rating: 4.9, numReviews: 8, sizes: ['S', 'M', 'L'] }
  ],

  // Women's Formal
  'Ball Gown': [
    { _id: 'bg-1', name: 'Midnight Sparkle Princess Gown', brand: 'EVENING', material: 'TULLE & SEQUIN', rentPricePerDay: 650, rating: 4.9, numReviews: 145, sizes: ['S', 'M', 'L'] },
    { _id: 'bg-2', name: 'Ruby Crimson Off-Shoulder Gown', brand: 'EVENING', material: 'SILK TAFFETA', rentPricePerDay: 680, rating: 5.0, numReviews: 92, sizes: ['S', 'M'] }
  ],
  'Cocktail Dress': [
    { _id: 'cd-1', name: 'Aubergine Bias-Cut Satin Gown', brand: 'EVENING', material: 'SILK & SATIN', rentPricePerDay: 45, rating: 4.9, numReviews: 132, sizes: ['XS', 'S', 'M', 'L'] },
    { _id: 'cd-2', name: 'Sage Green Tiered Midi Dress', brand: 'GARDEN PARTY', material: 'FINE COTTON', rentPricePerDay: 32, rating: 4.7, numReviews: 88, sizes: ['S', 'M', 'L'] },
    { _id: 'cd-3', name: 'Rosewood Wrap Cocktail Dress', brand: 'COCKTAIL', material: 'PREMIUM VELVET', rentPricePerDay: 58, rating: 5.0, numReviews: 41, sizes: ['XS', 'S', 'M'] }
  ],
  'Bodycon Dress': [
    { _id: 'bcd-1', name: 'Sleek Black Knit Ruched Bodycon', brand: 'PARTY', material: 'STRETCH KNIT', rentPricePerDay: 180, rating: 4.6, numReviews: 67, sizes: ['S', 'M'] },
    { _id: 'bcd-2', name: 'Golden Sequin Glam Bodycon', brand: 'PARTY', material: 'SEQUIN BLEND', rentPricePerDay: 220, rating: 4.8, numReviews: 53, sizes: ['S', 'M', 'L'] }
  ],
  'Slip Dress': [
    { _id: 'spd-1', name: 'Emerald Fluid Silk Slip Dress', brand: 'LUXURY', material: 'PURE MULL SILK', rentPricePerDay: 280, rating: 4.9, numReviews: 76, sizes: ['S', 'M', 'L'] }
  ],
  'Mermaid Gown': [
    { _id: 'mg-1', name: 'Sapphire Off-Shoulder Mermaid Gown', brand: 'GALA', material: 'SATIN CREPE', rentPricePerDay: 590, rating: 4.9, numReviews: 38, sizes: ['S', 'M', 'L'] }
  ],
  'Jumpsuit': [
    { _id: 'jmp-1', name: 'Tailored Crepe Wide-Leg Jumpsuit', brand: 'MODERN', material: 'CREPE GEORGETTE', rentPricePerDay: 240, rating: 4.7, numReviews: 31, sizes: ['S', 'M', 'L'] }
  ],

  // Women's Traditional
  'Saree': [
    { _id: 'sar-1', name: 'Royal Crimson Banarasi Silk Saree', brand: 'HERITAGE', material: 'BANARASI SILK', rentPricePerDay: 480, rating: 5.0, numReviews: 124, sizes: ['One Size'] },
    { _id: 'sar-2', name: 'Classic Kanjeevaram Gold Saree', brand: 'HERITAGE', material: 'KANJEEVARAM SILK', rentPricePerDay: 520, rating: 4.9, numReviews: 86, sizes: ['One Size'] },
    { _id: 'sar-3', name: 'Emerald Embroidered Organza Saree', brand: 'LUXURY', material: 'ORGANZA SILK', rentPricePerDay: 380, rating: 4.8, numReviews: 45, sizes: ['One Size'] }
  ],
  'Lehenga Choli': [
    { _id: 'lhg-1', name: 'Bridal Maroon Embroidered Lehenga', brand: 'ROYAL', material: 'VELVET & SILK', rentPricePerDay: 950, rating: 5.0, numReviews: 72, sizes: ['S', 'M', 'L'] },
    { _id: 'lhg-2', name: 'Pastel Floral Festive Lehenga', brand: 'FESTIVE', material: 'ORGANZA', rentPricePerDay: 620, rating: 4.8, numReviews: 39, sizes: ['S', 'M', 'L'] }
  ],
  'Anarkali Suit': [
    { _id: 'ak-1', name: 'Ivory Zardozi Flared Anarkali', brand: 'ROYAL', material: 'GEORGETTE', rentPricePerDay: 420, rating: 4.9, numReviews: 63, sizes: ['S', 'M', 'L', 'XL'] },
    { _id: 'ak-2', name: 'Deep Peach Silk Anarkali Set', brand: 'FESTIVE', material: 'RAW SILK', rentPricePerDay: 450, rating: 4.8, numReviews: 47, sizes: ['M', 'L', 'XL'] }
  ],
  'Salwar Kameez': [
    { _id: 'sk-1', name: 'Lucknowi Georgette Chikankari Suit', brand: 'FESTIVE', material: 'GEORGETTE', rentPricePerDay: 220, rating: 4.7, numReviews: 95, sizes: ['S', 'M', 'L', 'XL'] },
    { _id: 'sk-2', name: 'Classic Velvet Patiala Suit', brand: 'FESTIVE', material: 'ROYAL VELVET', rentPricePerDay: 280, rating: 4.8, numReviews: 34, sizes: ['M', 'L'] }
  ],
  'Kimono': [
    { _id: 'kmn-1', name: 'Vintage Red Sakura Silk Kimono', brand: 'CELTIC', material: 'CHIRIMEN SILK', rentPricePerDay: 420, rating: 4.9, numReviews: 12, sizes: ['One Size'] }
  ],
  'Abaya': [
    { _id: 'aby-1', name: 'Black Georgette Embroidered Abaya', brand: 'MODEST', material: 'NIDA GEORGETTE', rentPricePerDay: 280, rating: 4.9, numReviews: 54, sizes: ['S', 'M', 'L', 'XL'] }
  ]
};

// Default generic product if matching fails
const DEFAULT_PRODUCT = {
  _id: 'default-rental',
  name: 'Premium Rental Outfit',
  brand: 'LUXURY',
  material: 'FINE FABRIC',
  rentPricePerDay: 150,
  rating: 4.9,
  numReviews: 24,
  sizes: ['S', 'M', 'L']
};

export default function RentCategoryProducts() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const categoryName = searchParams.get('name') || 'Rental Outfit';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const rentalItemCount = (items || []).filter(item => item.isRental).reduce((acc, item) => acc + item.quantity, 0);

  // --- Dynamic Search Placeholder Rotation ---
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const term = categoryName.toLowerCase();
  const ending = term.endsWith('s') ? '' : 's';
  const placeholders = [
    `Search for designer ${term}${ending}...`,
    `Rent premium ${term}${ending} for events...`,
    `Find perfect fitting ${term}${ending}...`,
    `Order express 45-min delivery ${term}${ending}...`,
    `Browse luxury ${term} style options...`
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [categoryName]);

  // --- Sidebar Filters States ---
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedFit, setSelectedFit] = useState('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState(1000);
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [isAssuredOnly, setIsAssuredOnly] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState([]);

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    gender: true,
    brand: true,
    fabric: true,
    fit: true,
    size: true,
    price: true,
    ratings: true,
    offers: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryName]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { isAvailableForRent: true };
      const res = await productAPI.getAll(params);
      const allFetched = res.data.products || [];

      const matches = allFetched.filter(p => 
        p.isAvailableForRent && (
          p.name.toLowerCase().includes(categoryName.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(categoryName.toLowerCase())) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(categoryName.toLowerCase())))
        )
      );

      if (matches.length > 0) {
        setProducts(matches);
      } else {
        const mocks = MOCK_COLLECTIONS[categoryName] || [
          { ...DEFAULT_PRODUCT, name: `Premium ${categoryName} Design 1` },
          { ...DEFAULT_PRODUCT, name: `Premium ${categoryName} Design 2`, rentPricePerDay: 180 },
          { ...DEFAULT_PRODUCT, name: `Premium ${categoryName} Design 3`, rentPricePerDay: 220 }
        ];
        setProducts(mocks);
      }
    } catch (e) {
      console.error('Error loading category products:', e);
      setProducts(MOCK_COLLECTIONS[categoryName] || []);
    } finally {
      setLoading(false);
    }
  };

  // --- Real-time Filter Processing ---
  const filteredProducts = products.filter(p => {
    // 1. Text Search Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesText = p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q));
      if (!matchesText) return false;
    }

    // 2. Gender Filter
    if (selectedGender !== 'all') {
      if (p.gender && p.gender.toLowerCase() !== selectedGender.toLowerCase()) {
        return false;
      }
    }

    // 3. Brand/Collection Filter
    if (selectedBrand !== 'all') {
      if (p.brand && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }
    }

    // 4. Fabric/Material Filter
    if (selectedFabrics.length > 0) {
      const mat = p.material ? p.material.toLowerCase() : '';
      const matchesFabric = selectedFabrics.some(f => mat.includes(f.toLowerCase()));
      if (!matchesFabric) return false;
    }

    // 5. Fit Filter
    if (selectedFit !== 'all') {
      const fitVal = p.name.toLowerCase() + ' ' + (p.material ? p.material.toLowerCase() : '');
      if (!fitVal.includes(selectedFit.toLowerCase())) {
        return false;
      }
    }

    // 6. Size Filter
    if (selectedSizes.length > 0) {
      const sizesArray = p.sizes || [];
      const hasSize = sizesArray.some(s => selectedSizes.includes(s));
      if (!hasSize) return false;
    }

    // 7. Price Filter
    if (p.rentPricePerDay > maxPriceFilter) {
      return false;
    }

    // 8. Ratings Filter
    if (minRatingFilter > 0) {
      const ratingVal = p.rating || 4.9;
      if (ratingVal < minRatingFilter) {
        return false;
      }
    }

    // 9. rapidCloth Assured Filter
    if (isAssuredOnly) {
      // Mock match: royal/premium/midnight collections or high rated designs
      const isHighQuality = (p.rating >= 4.9) || p.name.includes("Royal") || p.name.includes("Classic") || p.name.includes("Midnight");
      if (!isHighQuality) return false;
    }

    return true;
  });

  const handleBookNow = async (size, duration) => {
    if (!selectedProduct) return;
    try {
      await addToCart(selectedProduct._id, size, 'default', 1, true, duration);
      toast.success(`${selectedProduct.name} added to your Rental Bag!`);
      setSelectedProduct(null);
    } catch (e) {
      toast.error(e.message || 'Failed to add item to bag.');
    }
  };

  const renderSilhouette = (category, index) => {
    const fillStyle = 'white';

    if (['saree', 'lehenga choli', 'abaya', 'kimono'].some(t => category.toLowerCase().includes(t))) {
      return (
        <svg width="60" height="120" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M35 30 C45 35 55 25 65 30 L60 90 L75 180 L25 180 L40 90 Z" fill={fillStyle} />
          <path d="M32 30 C45 60 55 120 75 180" stroke="#8b1e2f" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <circle cx="50" cy="15" r="5" fill={fillStyle} />
        </svg>
      );
    }

    if (['tuxedo', 'suit', 'blazer', 'jacket', 'sherwani', 'bandhgala', 'thobe', 'kilt', 'kurta'].some(t => category.toLowerCase().includes(t))) {
      return (
        <svg width="60" height="120" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 30 L50 45 L60 30 Z" fill="#8b1e2f" />
          <path d="M30 30 L35 90 L25 180 L75 180 L65 90 L70 30 Z" fill={fillStyle} />
          <path d="M35 30 L50 80 L65 30" stroke="#f1f5f9" strokeWidth="2" />
          <circle cx="50" cy="100" r="3" fill="#2b2d2f" />
          <circle cx="50" cy="120" r="3" fill="#2b2d2f" />
          <circle cx="50" cy="15" r="5" fill={fillStyle} />
        </svg>
      );
    }

    return (
      <svg width="60" height="120" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 20 C50 20 42 28 35 30 L65 30 C58 28 50 20 50 20 Z" fill={fillStyle} />
        <circle cx="50" cy="15" r="5" fill={fillStyle} />
        <path d="M35 30 L40 80 L25 180 L75 180 L60 80 L65 30 Z" fill={fillStyle} />
        <rect x="38" y="70" width="24" height="4" fill="#8b1e2f" opacity="0.3" />
      </svg>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#eae7e2', color: '#2b2927', fontFamily: 'var(--font-sans)' }}>
      {/* Dusty Rose Custom Navbar (matching the third picture card color) */}
      <div style={{
        background: '#c39a9c',
        color: '#231b1c',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Top bar with Rent toggle & AI styles */}
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(35, 27, 28, 0.08)'
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/rent')}
              style={{
                padding: '8px 24px', borderRadius: '12px', border: 'none',
                background: '#231b1c',
                color: '#ffffff',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(35, 27, 28, 0.2)'
              }}
            >Rent</button>
          </div>

          <button
            onClick={() => navigate('/rent?ai=true')}
            style={{
              padding: '8px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: '#ffffff', fontWeight: 700, fontSize: '14px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(236,72,153,0.3)'
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: '18px' }} />
            AI Styles
          </button>
        </div>

        {/* Sub-bar with Delivery, Search, Account, Cart */}
        <div style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 16px', borderRadius: '12px', minWidth: '200px', flex: '1 1 250px', border: '2px solid #231b1c' }}>
              <LocationOnOutlinedIcon sx={{ color: '#8b1e2f', fontSize: '20px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery to</span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Home - 400001, Mumbai</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '2px 4px', borderRadius: '14px', flex: '2 1 400px', border: '2px solid #231b1c' }}>
              <div style={{ padding: '8px 12px', color: '#94a3b8' }}><SearchIcon /></div>
              <input
                type="text"
                placeholder={placeholders[placeholderIndex]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/rent?search=${encodeURIComponent(searchQuery)}`)}
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: '14px', color: '#334155', outline: 'none', fontWeight: 500 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
              <button onClick={() => navigate('/rent/profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#231b1c' }}>
                <PersonOutlineIcon sx={{ fontSize: '26px', color: '#231b1c' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#231b1c' }}>Account</span>
              </button>
              <button onClick={() => navigate('/rent/cart')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b1e2f', position: 'relative' }}>
                {rentalItemCount > 0 && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    {rentalItemCount}
                  </div>
                )}
                <ShoppingBagOutlinedIcon sx={{ fontSize: '26px', color: '#8b1e2f' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#8b1e2f' }}>Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', maxWidth: '1400px', margin: '0 auto', padding: '24px 24px 80px', alignItems: 'flex-start' }}>
          
          {/* LEFT SIDEBAR FILTERS (matches first picture styling) */}
          <div style={{
            width: '280px',
            flexShrink: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #e8e5e0',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            overflow: 'hidden'
          }}>
            {/* Header: Filters */}
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Filters</span>
              <button 
                onClick={() => {
                  setSelectedSizes([]);
                  setSelectedFabrics([]);
                  setSelectedGender('all');
                  setSelectedBrand('all');
                  setSelectedFit('all');
                  setMaxPriceFilter(1000);
                  setMinRatingFilter(0);
                  setIsAssuredOnly(false);
                }}
                style={{ background: 'transparent', border: 'none', color: '#8b1e2f', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Clear All
              </button>
            </div>

            {/* CATEGORIES Accordion */}
            <div style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div 
                onClick={() => toggleSection('categories')}
                style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
              >
                <span>Categories</span>
                <span>{expandedSections.categories ? '▲' : '▼'}</span>
              </div>
              {expandedSections.categories && (
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => navigate('/rent')}>
                    <span>‹</span> Clothing and Accesso...
                  </div>
                  <div style={{ fontSize: '13px', color: '#2b2927', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '8px' }}>
                    <span>‹</span> {categoryName}
                  </div>
                </div>
              )}
            </div>

            {/* GENDER Accordion */}
            <div style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div 
                onClick={() => toggleSection('gender')}
                style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
              >
                <span>Gender</span>
                <span>{expandedSections.gender ? '▲' : '▼'}</span>
              </div>
              {expandedSections.gender && (
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['all', 'men', 'women', 'kids'].map(gender => (
                    <label key={gender} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="genderFilter"
                        checked={selectedGender === gender} 
                        onChange={() => setSelectedGender(gender)}
                        style={{ accentColor: '#8b1e2f' }}
                      />
                      {gender === 'all' ? 'All Genders' : gender}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* PRICE Accordion */}
            <div style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div 
                onClick={() => toggleSection('price')}
                style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
              >
                <span>Price (per day)</span>
                <span>{expandedSections.price ? '▲' : '▼'}</span>
              </div>
              {expandedSections.price && (
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    <span>Min: ₹0</span>
                    <span>Max: ₹{maxPriceFilter}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="1500" 
                    step="10"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#8b1e2f', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select 
                      value={maxPriceFilter}
                      onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: 'white' }}
                    >
                      <option value={200}>₹200</option>
                      <option value={500}>₹500</option>
                      <option value={800}>₹800</option>
                      <option value={1000}>₹1000</option>
                      <option value={1500}>₹1500</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* SIZE Accordion */}
            <div style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div 
                onClick={() => toggleSection('size')}
                style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
              >
                <span>Size</span>
                <span>{expandedSections.size ? '▲' : '▼'}</span>
              </div>
              {expandedSections.size && (
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['S', 'M', 'L', 'XL'].map(size => (
                    <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedSizes.includes(size)} 
                        onChange={() => {
                          setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
                        }}
                        style={{ width: '16px', height: '16px', accentColor: '#8b1e2f' }}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* FABRIC Accordion */}
            <div style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div 
                onClick={() => toggleSection('fabric')}
                style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
              >
                <span>Fabric / Material</span>
                <span>{expandedSections.fabric ? '▲' : '▼'}</span>
              </div>
              {expandedSections.fabric && (
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Silk', 'Velvet', 'Cotton', 'Linen', 'Satin', 'Georgette', 'Organza'].map(fabric => (
                    <label key={fabric} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedFabrics.includes(fabric)} 
                        onChange={() => {
                          setSelectedFabrics(prev => prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric]);
                        }}
                        style={{ width: '16px', height: '16px', accentColor: '#8b1e2f' }}
                      />
                      {fabric}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* CUSTOMER RATINGS Accordion */}
            <div style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div 
                onClick={() => toggleSection('ratings')}
                style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
              >
                <span>Customer Ratings</span>
                <span>{expandedSections.ratings ? '▲' : '▼'}</span>
              </div>
              {expandedSections.ratings && (
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[4, 3].map(rating => (
                    <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="ratingFilter"
                        checked={minRatingFilter === rating}
                        onChange={() => setMinRatingFilter(rating)}
                        style={{ accentColor: '#8b1e2f' }}
                      />
                      {rating}★ & above
                    </label>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="ratingFilter"
                      checked={minRatingFilter === 0}
                      onChange={() => setMinRatingFilter(0)}
                      style={{ accentColor: '#8b1e2f' }}
                    />
                    Any Rating
                  </label>
                </div>
              )}
            </div>

            {/* Assured Flag */}
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="checkbox" 
                id="assuredCheck"
                checked={isAssuredOnly} 
                onChange={(e) => setIsAssuredOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#8b1e2f', cursor: 'pointer' }}
              />
              <label htmlFor="assuredCheck" style={{ fontSize: '13px', fontWeight: 700, color: '#2b2927', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🛡️ rapidCloth Assured
              </label>
            </div>
          </div>

          {/* RIGHT PRODUCTS LIST CONTAINER */}
          <div style={{ flexGrow: 1 }}>
            {/* Title and breadcrumbs right above the products grid */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#8c8a87', fontWeight: 600, marginBottom: '6px' }}>
                Home &gt; Rentals &gt; <span style={{ color: '#2b2927' }}>{categoryName}</span>
              </div>
              <h1 style={{
                fontFamily: '"Playfair Display", "Georgia", serif',
                fontSize: '28px',
                fontWeight: 800,
                color: '#231b1c',
                margin: '0 0 4px'
              }}>
                {categoryName} Collection
              </h1>
              <p style={{ fontSize: '13px', color: '#8c8a87', margin: 0 }}>
                Premium rentals selected for ultimate style and comfort
              </p>
            </div>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: '480px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid #e8e5e0' }} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {filteredProducts.map((product, index) => {
                  const bgColors = ['#c39a9c', '#9ab097', '#d1b886'];
                  const cardBg = bgColors[index % bgColors.length];

                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e8e5e0',
                        padding: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div 
                        onClick={() => navigate(`/rent/product/${product._id}`)}
                        style={{
                          aspectRatio: '3/4',
                          borderRadius: '12px',
                          background: cardBg,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                      >
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute', top: '12px', left: '12px',
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'white', border: 'none', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 5
                          }}
                        >
                          <FavoriteBorderIcon sx={{ fontSize: '18px', color: '#8b1e2f' }} />
                        </button>

                        <div style={{
                          position: 'absolute', top: '12px', right: '12px',
                          background: '#8b1e2f', color: 'white', padding: '6px 12px',
                          borderRadius: '4px', transform: 'rotate(2deg)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 5,
                          display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 800 }}>₹{product.rentPricePerDay}</span>
                          <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>/ DAY</span>
                        </div>

                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                          />
                        ) : (
                          renderSilhouette(categoryName, index)
                        )}

                        <div style={{
                          position: 'absolute', bottom: '12px', left: '12px',
                          background: index % 2 === 0 ? '#8b1e2f' : '#2b2d2f',
                          color: 'white', padding: '4px 8px', borderRadius: '4px',
                          fontSize: '9px', fontWeight: 800, textTransform: 'uppercase',
                          letterSpacing: '0.5px', zIndex: 5
                        }}>
                          {index % 2 === 0 ? 'ONLY 1 LEFT' : 'AVAILABLE'}
                        </div>
                      </div>

                      <div style={{ padding: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#8c8a87', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          {product.brand || 'PREMIUM COLLECTION'} · {product.material || 'SILK'}
                        </div>
                        <h3 
                          onClick={() => navigate(`/rent/product/${product._id}`)}
                          style={{
                            fontFamily: '"Playfair Display", "Georgia", serif',
                            fontSize: '18px', fontWeight: 700, color: '#2b2927',
                            margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
                            cursor: 'pointer'
                          }}
                        >
                          {product.name}
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                          <span style={{ color: '#8b1e2f', fontWeight: 700 }}>
                            ★ {product.rating || '4.9'} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({product.numReviews || 36})</span>
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            Sizes {product.sizes ? product.sizes.join('-') : 'S-XL'}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedProduct(product)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: '#231b1c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '12px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            marginTop: '8px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#3c2e30'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#231b1c'}
                        >
                          RENT THIS OUTFIT
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #e8e5e0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👗</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#2b2927', marginBottom: '8px' }}>No matches found</h3>
                <p style={{ color: '#64748b' }}>Try clearing some filters or searching for another outfit.</p>
              </div>
            )}
          </div>
        </div>

      <RentalBottomSheet
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onConfirm={handleBookNow}
      />
    </div>
  );
}
