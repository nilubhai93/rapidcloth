import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { productAPI } from '../../api';
import toast from 'react-hot-toast';

// Icons
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/CloseRounded';
import ShareIcon from '@mui/icons-material/ShareRounded';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserRounded';
import BoltIcon from '@mui/icons-material/BoltRounded';
import CheckroomIcon from '@mui/icons-material/CheckroomRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/SearchRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- MOCK DATABASE PRODUCTS FOR FALLBACKS ---
const MOCK_COLLECTIONS = {
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

const DEFAULT_PRODUCT = {
  _id: 'default-rental',
  name: 'Premium Rental Outfit',
  brand: 'LUXURY',
  material: 'FINE FABRIC',
  rentPricePerDay: 150,
  rating: 4.9,
  numReviews: 24,
  sizes: ['XS', 'S', 'M', 'L', 'XL']
};

export default function RentProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Selection States
  const [selectedSize, setSelectedSize] = useState('S');
  const [selectedDuration, setSelectedDuration] = useState(4); // default 4 nights
  const [selectedDate, setSelectedDate] = useState('Fri 10');
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);
  const [activeViewTab, setActiveViewTab] = useState('dress'); // 'dress' or 'selfie'

  // Accordion Expand States
  const [accordions, setAccordions] = useState({
    fabric: true,
    included: false,
    returns: false
  });

  const toggleAccordion = (sec) => {
    setAccordions(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Rotating placeholder for navbar search
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = [
    `Search for designer rental outfits...`,
    `Rent premium gowns for events...`,
    `Find perfect fitting sizes...`,
    `Order express 45-min delivery...`,
    `Browse luxury traditional wear...`
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const rentalItemCount = (items || []).filter(item => item.isRental).reduce((acc, item) => acc + item.quantity, 0);

  // Fetch product from DB or fallback mock collections
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getById(id);
        if (res.data && res.data.product) {
          setProduct(res.data.product);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log("Product not found in DB, searching mock collections.");
      }

      // Check mock collections
      let found = null;
      for (const catName in MOCK_COLLECTIONS) {
        const match = MOCK_COLLECTIONS[catName].find(p => p._id === id);
        if (match) {
          found = { ...match, category: catName };
          break;
        }
      }

      if (found) {
        setProduct(found);
      } else {
        setProduct({ ...DEFAULT_PRODUCT, _id: id });
      }
      setLoading(false);
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eae7e2' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '4px solid #8b1e2f', borderTopColor: 'transparent', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eae7e2' }}>
        <h2>Rental Product not found</h2>
        <button onClick={() => navigate('/rent')} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', background: '#231b1c', color: 'white', border: 'none', cursor: 'pointer' }}>Back to Rentals</button>
      </div>
    );
  }

  const categoryName = product.category || 'Rental Outfit';
  const basePrice = product.rentPricePerDay;

  // Calculate pricing based on duration
  const getDurationPrice = (days) => {
    if (days === 4) return basePrice;
    if (days === 8) return Math.round(basePrice * 1.45);
    return Math.round(basePrice * 3.5); // "Keep it" buyout price
  };

  const currentRentPrice = getDurationPrice(selectedDuration);

  // Background colors matching categories
  const bgColors = ['#c39a9c', '#9ab097', '#d1b886'];
  const baseColor = bgColors[Math.abs(id.charCodeAt(0) || 0) % bgColors.length];

  // Make 4 vertical gallery thumbnails
  const thumbnails = [
    { bg: baseColor, opacity: 1 },
    { bg: baseColor, opacity: 0.8 },
    { bg: baseColor, opacity: 0.6 },
    { bg: baseColor, opacity: 0.4 }
  ];

  const renderDetailSilhouette = (category) => {
    const fillStyle = '#ffffff';

    if (['saree', 'lehenga choli', 'abaya', 'kimono'].some(t => category.toLowerCase().includes(t))) {
      return (
        <svg width="150" height="300" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M35 30 C45 35 55 25 65 30 L60 90 L75 180 L25 180 L40 90 Z" fill={fillStyle} />
          <path d="M32 30 C45 60 55 120 75 180" stroke="#8b1e2f" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <circle cx="50" cy="15" r="5" fill={fillStyle} />
        </svg>
      );
    }

    if (['tuxedo', 'suit', 'blazer', 'jacket', 'sherwani', 'bandhgala', 'thobe', 'kilt', 'kurta'].some(t => category.toLowerCase().includes(t))) {
      return (
        <svg width="150" height="300" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <svg width="150" height="300" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 20 C50 20 42 28 35 30 L65 30 C58 28 50 20 50 20 Z" fill={fillStyle} />
        <circle cx="50" cy="15" r="5" fill={fillStyle} />
        <path d="M35 30 L40 80 L25 180 L75 180 L60 80 L65 30 Z" fill={fillStyle} />
        <rect x="38" y="70" width="24" height="4" fill="#8b1e2f" opacity="0.3" />
      </svg>
    );
  };

  const handleBooking = async () => {
    try {
      await addToCart(product._id, selectedSize, 'default', 1, true, selectedDuration);
      toast.success(`${product.name} successfully added to your Rental Bag!`);
    } catch (e) {
      toast.error(e.message || 'Failed to add item.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#eae7e2', color: '#2b2927', fontFamily: 'var(--font-sans)' }}>
      {/* Dusty Rose Custom Navbar (matching the category navbar) */}
      <div style={{
        background: '#c39a9c',
        color: '#231b1c',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Top bar with Rent toggle & AI styles */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(35, 27, 28, 0.08)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/rent')}
              style={{
                padding: '8px 24px', borderRadius: '12px', border: 'none',
                background: '#231b1c', color: '#ffffff',
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
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: '14px', color: '#334155', outline: 'none', fontWeight: 500 }}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/rent?search=${encodeURIComponent(e.target.value)}`)}
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

      {/* Main product detail content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 100px' }}>
        
        {/* Breadcrumb & Back Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: 'white', border: '1px solid #e8e5e0', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
          >
            <ArrowBackIcon sx={{ fontSize: '18px', color: '#2b2927' }} />
          </button>
          <div style={{ fontSize: '12px', color: '#8c8a87', fontWeight: 600 }}>
            Rentals &gt; {categoryName} &gt; <span style={{ color: '#2b2927' }}>{product.name}</span>
          </div>
        </div>

        {/* Dual Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '48px', alignItems: 'flex-start' }}>
          
          {/* Left Column: Vertical Thumbnails & Main Hanging Container */}
          <div style={{ display: 'flex', gap: '20px' }}>
            
            {/* Vertical thumbnails */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '70px', flexShrink: 0 }}>
              {thumbnails.map((thumb, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveThumbnailIndex(idx)}
                  style={{
                    aspectRatio: '3/4',
                    borderRadius: '8px',
                    backgroundColor: thumb.bg,
                    opacity: thumb.opacity,
                    cursor: 'pointer',
                    border: activeThumbnailIndex === idx ? '2px solid #231b1c' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    transition: 'all 0.2s',
                    overflow: 'hidden'
                  }}
                >
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', opacity: 0.7 }}>
                      {renderDetailSilhouette(categoryName)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Main Hanging Image Frame */}
            <div style={{
              flexGrow: 1,
              aspectRatio: '3/4',
              backgroundColor: thumbnails[activeThumbnailIndex].bg,
              opacity: thumbnails[activeThumbnailIndex].opacity,
              borderRadius: '24px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
              overflow: 'visible',
              transition: 'opacity 0.2s'
            }}>
              {/* Tab Selector: Dress / AI Selfie */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                padding: '4px',
                borderRadius: '30px',
                display: 'flex',
                gap: '4px',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.04)',
                boxSizing: 'border-box'
              }}>
                <button
                  onClick={() => setActiveViewTab('dress')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: activeViewTab === 'dress' ? '#3c483f' : 'transparent',
                    color: activeViewTab === 'dress' ? 'white' : '#8c8a87',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <CheckroomIcon sx={{ fontSize: '14px', color: 'inherit' }} /> DRESS
                </button>
                <button
                  onClick={() => setActiveViewTab('selfie')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: activeViewTab === 'selfie' ? '#3c483f' : 'transparent',
                    color: activeViewTab === 'selfie' ? 'white' : '#8c8a87',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  AI SELFIE
                </button>
              </div>

              {activeViewTab === 'dress' ? (
                <>
                  {/* Wooden / Dark Hanger Hook and triangle at top of frame */}
                  <div style={{ position: 'absolute', top: '8%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Loop hook */}
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2.5px solid #3c3836', borderBottomColor: 'transparent', transform: 'rotate(25deg)' }} />
                    {/* Triangle hanger */}
                    <svg width="120" height="30" viewBox="0 0 100 25" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: '-4px' }}>
                      <path d="M50 0 L5 25 L95 25 Z" stroke="#3c3836" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Main SVG/Image Silhouette hanging from triangle */}
                  <div style={{ marginTop: '20%', display: 'flex', justifyContent: 'center' }}>
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                    ) : (
                      renderDetailSilhouette(categoryName)
                    )}
                  </div>

                  {/* Paper Price Tag Sticker pinned on side */}
                  <div style={{
                    position: 'absolute',
                    top: '32%',
                    right: '10%',
                    background: '#ffffff',
                    padding: '12px 14px',
                    borderRadius: '4px',
                    boxShadow: '2px 4px 15px rgba(0, 0, 0, 0.08)',
                    transform: 'rotate(8deg)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    fontFamily: 'var(--font-sans)',
                    color: '#231b1c',
                    maxWidth: '120px',
                    zIndex: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ fontSize: '7px', fontWeight: 800, letterSpacing: '1px', color: '#8c8a87', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', paddingBottom: '3px' }}>
                      Loanera rent
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#8b1e2f' }}>
                      ₹{product.rentPricePerDay}
                      <span style={{ fontSize: '7px', fontWeight: 500, color: '#8c8a87' }}>/rental</span>
                    </div>
                    <div style={{ fontSize: '7px', color: '#8c8a87', fontWeight: 600, marginTop: '2px' }}>
                      Tap to see rental dates →
                    </div>
                  </div>
                </>
              ) : (
                /* AI Selfie Mode - Upload panel */
                <div style={{
                  width: '85%',
                  height: '80%',
                  border: '2px dashed rgba(255, 255, 255, 0.7)',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px', opacity: 0.9 }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <h3 style={{
                    fontFamily: '"Playfair Display", "Georgia", serif',
                    fontSize: '22px',
                    fontWeight: 800,
                    margin: '0 0 8px 0',
                    color: '#ffffff'
                  }}>
                    See it on you
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    lineHeight: 1.5,
                    margin: '0 0 16px 0',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500
                  }}>
                    Upload a clear, front-facing photo.<br />
                    We'll fit this dress to it digitally —<br />
                    no changing room needed.
                  </p>
                  <button style={{
                    backgroundColor: '#ffffff',
                    color: '#3c483f',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '20px',
                    fontWeight: 800,
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Upload Photo
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Reservation form Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Category / Occasion Heading */}
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#8b1e2f', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              OCCASIONWEAR · {categoryName}
            </div>

            {/* Main Title */}
            <h1 style={{
              fontFamily: '"Playfair Display", "Georgia", serif',
              fontSize: '38px',
              fontWeight: 900,
              color: '#231b1c',
              lineHeight: 1.1,
              margin: '0 0 6px 0'
            }}>
              {product.name}
            </h1>

            {/* Sub-brand author info */}
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, marginBottom: '16px' }}>
              by {product.brand || 'Marisol Home'} · {product.material || 'Premium Fabric'}
            </div>

            {/* Ratings & Tap Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#64748b' }}>
              <span style={{ color: '#d97706', fontWeight: 700 }}>
                ★★★★★ 4.9
              </span>
              <span>({product.numReviews || 62} users tapped)</span>
            </div>

            {/* Price Line */}
            <div style={{ borderBottom: '1px solid #e8e5e0', paddingBottom: '24px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#231b1c' }}>
                  ₹{product.rentPricePerDay}
                </span>
                <span style={{ fontSize: '14px', color: '#8c8a87', fontWeight: 600 }}>
                  / night rent · 4-night rental minimum, Insurance Included
                </span>
              </div>
            </div>

            {/* SIZE Selector */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#231b1c', letterSpacing: '1px' }}>SIZE</span>
                <button style={{ background: 'none', border: 'none', borderBottom: '1px solid #8c8a87', padding: 0, color: '#8c8a87', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  SIZE GUIDE
                </button>
              </div>

              {/* Sizes list (M is disabled/crossed out) */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {['XS', 'S', 'M', 'L', 'XL'].map((sz) => {
                  const isM = sz === 'M';
                  const isSelected = selectedSize === sz;
                  
                  return (
                    <button
                      key={sz}
                      onClick={() => !isM && setSelectedSize(sz)}
                      disabled={isM}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: isSelected ? '2.5px solid #231b1c' : '1px solid #e2e8f0',
                        background: isSelected ? '#231b1c' : 'white',
                        color: isSelected ? 'white' : '#231b1c',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: isM ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        opacity: isM ? 0.35 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      {sz}
                      {/* Crossed out line for M */}
                      {isM && (
                        <span style={{
                          position: 'absolute',
                          top: '50%',
                          left: '10%',
                          right: '10%',
                          height: '1.5px',
                          backgroundColor: '#231b1c',
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'center'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RENTAL LENGTH SELECTOR */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#231b1c', letterSpacing: '1px', marginBottom: '12px' }}>
                RENTAL LENGTH
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { label: '4 nights', val: 4, labelPrice: `₹${getDurationPrice(4)}` },
                  { label: '8 nights', val: 8, labelPrice: `₹${getDurationPrice(8)}` },
                  { label: 'Keep it', val: 99, labelPrice: `₹${getDurationPrice(99)}` }
                ].map((len) => {
                  const isSelected = selectedDuration === len.val;
                  return (
                    <button
                      key={len.val}
                      onClick={() => setSelectedDuration(len.val)}
                      style={{
                        flex: 1,
                        padding: '16px 12px',
                        borderRadius: '12px',
                        border: isSelected ? '2.5px solid #231b1c' : '1px solid #cbd5e1',
                        backgroundColor: 'white',
                        color: '#231b1c',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        boxShadow: isSelected ? '0 4px 12px rgba(35, 27, 28, 0.05)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 800 }}>{len.label}</span>
                      <span style={{ fontSize: '11px', color: '#8c8a87', fontWeight: 600 }}>{len.labelPrice}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DELIVERY DATE SELECTOR */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#231b1c', letterSpacing: '1px' }}>DELIVERY BY</span>
                <span style={{ fontSize: '11px', color: '#8c8a87', fontWeight: 600 }}>For events after Jul 12</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                {[
                  { day: 'Wed', date: '08' },
                  { day: 'Thu', date: '09' },
                  { day: 'Fri', date: '10' },
                  { day: 'Sat', date: '11' },
                  { day: 'Sun', date: '12' },
                  { day: 'Mon', date: '13' }
                ].map((item, idx) => {
                  const dateStr = `${item.day} ${item.date}`;
                  const isSelected = selectedDate === dateStr;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(dateStr)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #231b1c' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#231b1c' : 'white',
                        color: isSelected ? 'white' : '#231b1c',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        minWidth: '55px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', opacity: isSelected ? 0.8 : 0.6 }}>{item.day}</span>
                      <span style={{ fontSize: '15px', fontWeight: 900 }}>{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buttons reservation */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
              <button
                onClick={handleBooking}
                style={{
                  flexGrow: 1,
                  padding: '16px 20px',
                  background: '#231b1c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(35, 27, 28, 0.15)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3c2e30'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#231b1c'}
              >
                RESERVE FOR ₹{currentRentPrice} +
              </button>
              <button style={{ width: '52px', height: '52px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <FavoriteBorderIcon sx={{ color: '#8b1e2f', fontSize: '20px' }} />
              </button>
            </div>

            <div style={{ fontSize: '11px', color: '#8c8a87', fontWeight: 600, textAlign: 'center', marginBottom: '32px' }}>
              Free returns · Backup size ships automatically if it doesn't fit
            </div>

            {/* Accordions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: '#e8e5e0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8e5e0', marginBottom: '40px' }}>
              
              {/* Fabric & Fit Accordion */}
              <div style={{ backgroundColor: 'white' }}>
                <div 
                  onClick={() => toggleAccordion('fabric')}
                  style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#231b1c' }}
                >
                  <span>Fabric & fit</span>
                  <span>{accordions.fabric ? '−' : '+'}</span>
                </div>
                {accordions.fabric && (
                  <div style={{ padding: '0 20px 20px 20px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                    Premium {product.material || 'Silk-blend'} construction with structured details. Designed for a formal drape, standard fit. If between sizes, we recommend sizing up. Model is 5'9" wearing size S.
                  </div>
                )}
              </div>

              {/* What's included Accordion */}
              <div style={{ backgroundColor: 'white' }}>
                <div 
                  onClick={() => toggleAccordion('included')}
                  style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#231b1c' }}
                >
                  <span>What's included</span>
                  <span>{accordions.included ? '−' : '+'}</span>
                </div>
                {accordions.included && (
                  <div style={{ padding: '0 20px 20px 20px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                    Rental package includes the outfit in clean condition, a high-quality protective garment bag, and a pre-paid return shipping label. Dry cleaning is covered by us.
                  </div>
                )}
              </div>

              {/* Delivery & returns Accordion */}
              <div style={{ backgroundColor: 'white' }}>
                <div 
                  onClick={() => toggleAccordion('returns')}
                  style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#231b1c' }}
                >
                  <span>Delivery & returns</span>
                  <span>{accordions.returns ? '−' : '+'}</span>
                </div>
                {accordions.returns && (
                  <div style={{ padding: '0 20px 20px 20px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                    Your rental will be delivered on or before the selected date. When your rental period is up, simply place the item back in the garment bag, apply the pre-paid return label, and drop it off at any pickup point.
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Service Icons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: '#8c8a87' }}>
                🧼 Dry clean only
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: '#8c8a87' }}>
                ✔️ Quality checked
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: '#8c8a87' }}>
                🔄 Free returns
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
