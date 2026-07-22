import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductDetailsQuery, useGetProductsQuery } from '../../store/apiSlice';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import StarIcon from '@mui/icons-material/StarRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import BoltIcon from '@mui/icons-material/BoltRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import RemoveIcon from '@mui/icons-material/RemoveRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIosRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';

// --- EDITED FILTER SIDEBAR COMPONENT (MATCHING PICTURE 1) ---
function ProductFilterSidebar({ product, onFilterChange }) {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState('all');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('any');
  const [isAssured, setIsAssured] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    gender: true,
    price: true,
    size: true,
    fabric: true,
    ratings: true,
  });

  const toggleSection = (sec) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleClearAll = () => {
    setSelectedGender('all');
    setMaxPrice(1000);
    setSelectedSizes([]);
    setSelectedFabrics([]);
    setRatingFilter('any');
    setIsAssured(false);
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleFabric = (fabric) => {
    setSelectedFabrics(prev => 
      prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric]
    );
  };

  const categoryName = product?.category || 'Three-Piece Suit';

  return (
    <div style={{
      width: '280px',
      flexShrink: 0,
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      alignSelf: 'flex-start',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Filters</span>
        <button 
          onClick={handleClearAll}
          style={{ background: 'transparent', border: 'none', color: '#8b1e2f', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
        >
          Clear All
        </button>
      </div>

      {/* CATEGORIES Accordion */}
      <div style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div 
          onClick={() => toggleSection('categories')}
          style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
        >
          <span>CATEGORIES</span>
          <span style={{ fontSize: '10px', color: '#0f172a' }}>{expandedSections.categories ? '▲' : '▼'}</span>
        </div>
        {expandedSections.categories && (
          <div style={{ padding: '0 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div 
              style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => navigate('/rent')}
            >
              <span>‹</span> Clothing and Accesso...
            </div>
            <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 700, paddingLeft: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>‹</span> {categoryName}
            </div>
          </div>
        )}
      </div>

      {/* GENDER Accordion */}
      <div style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div 
          onClick={() => toggleSection('gender')}
          style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
        >
          <span>GENDER</span>
          <span style={{ fontSize: '10px', color: '#0f172a' }}>{expandedSections.gender ? '▲' : '▼'}</span>
        </div>
        {expandedSections.gender && (
          <div style={{ padding: '0 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'all', label: 'All Genders' },
              { id: 'men', label: 'Men' },
              { id: 'women', label: 'Women' },
              { id: 'kids', label: 'Kids' }
            ].map(item => (
              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', fontWeight: 500, cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="productGenderFilter"
                  checked={selectedGender === item.id}
                  onChange={() => setSelectedGender(item.id)}
                  style={{ accentColor: '#8b1e2f', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                {item.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* PRICE (PER DAY) Accordion */}
      <div style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div 
          onClick={() => toggleSection('price')}
          style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
        >
          <span>PRICE (PER DAY)</span>
          <span style={{ fontSize: '10px', color: '#0f172a' }}>{expandedSections.price ? '▲' : '▼'}</span>
        </div>
        {expandedSections.price && (
          <div style={{ padding: '0 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              <span>Min: ₹0</span>
              <span>Max: ₹{maxPrice}</span>
            </div>
            <input 
              type="range"
              min="0"
              max="5000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#8b1e2f', cursor: 'pointer' }}
            />
            <div style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1e293b',
              background: '#fff'
            }}>
              <span>₹{maxPrice}</span>
              <span style={{ fontSize: '12px', color: '#0f172a' }}>▼</span>
            </div>
          </div>
        )}
      </div>

      {/* SIZE Accordion */}
      <div style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div 
          onClick={() => toggleSection('size')}
          style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
        >
          <span>SIZE</span>
          <span style={{ fontSize: '10px', color: '#0f172a' }}>{expandedSections.size ? '▲' : '▼'}</span>
        </div>
        {expandedSections.size && (
          <div style={{ padding: '0 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['S', 'M', 'L', 'XL'].map(sz => (
              <label key={sz} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', fontWeight: 500, cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={selectedSizes.includes(sz)}
                  onChange={() => toggleSize(sz)}
                  style={{ accentColor: '#8b1e2f', width: '16px', height: '16px', borderRadius: '4px', cursor: 'pointer' }}
                />
                {sz}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* FABRIC / MATERIAL Accordion */}
      <div style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div 
          onClick={() => toggleSection('fabric')}
          style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
        >
          <span>FABRIC / MATERIAL</span>
          <span style={{ fontSize: '10px', color: '#0f172a' }}>{expandedSections.fabric ? '▲' : '▼'}</span>
        </div>
        {expandedSections.fabric && (
          <div style={{ padding: '0 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['Silk', 'Velvet', 'Cotton', 'Linen', 'Satin', 'Georgette', 'Organza'].map(mat => (
              <label key={mat} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', fontWeight: 500, cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={selectedFabrics.includes(mat)}
                  onChange={() => toggleFabric(mat)}
                  style={{ accentColor: '#8b1e2f', width: '16px', height: '16px', borderRadius: '4px', cursor: 'pointer' }}
                />
                {mat}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* CUSTOMER RATINGS Accordion */}
      <div style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div 
          onClick={() => toggleSection('ratings')}
          style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}
        >
          <span>CUSTOMER RATINGS</span>
          <span style={{ fontSize: '10px', color: '#0f172a' }}>{expandedSections.ratings ? '▲' : '▼'}</span>
        </div>
        {expandedSections.ratings && (
          <div style={{ padding: '0 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: '4', label: '4★ & above' },
              { id: '3', label: '3★ & above' },
              { id: 'any', label: 'Any Rating' }
            ].map(r => (
              <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', fontWeight: 500, cursor: 'pointer' }}>
                <input 
                  type="radio"
                  name="ratingFilterVal"
                  checked={ratingFilter === r.id}
                  onChange={() => setRatingFilter(r.id)}
                  style={{ accentColor: '#8b1e2f', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                {r.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* rapidCloth Assured Footer */}
      <div style={{ padding: '16px 20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
          <input 
            type="checkbox"
            checked={isAssured}
            onChange={(e) => setIsAssured(e.target.checked)}
            style={{ accentColor: '#8b1e2f', width: '16px', height: '16px', borderRadius: '4px', cursor: 'pointer' }}
          />
          <VerifiedIcon sx={{ color: '#3b82f6', fontSize: '18px' }} />
          <span>rapidCloth Assured</span>
        </label>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const { data, isFetching } = useGetProductDetailsQuery(id);
  const product = data?.product || null;
  const loading = isFetching;

  const category = product?.category || '';
  const { data: categoryData, isFetching: categoryLoading } = useGetProductsQuery(
    category ? { category, limit: 12 } : { limit: 12 },
    { skip: !product }
  );
  const forYourNeedProducts = (categoryData?.products || []).filter(p => p._id !== product?._id);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (product) {
      if (product.colors?.length) setSelectedColor(product.colors[0]);
      const firstInStock = product.sizes?.find(s => s.stock > 0);
      if (firstInStock) setSelectedSize(firstInStock.size);
    }
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAdd = async () => {
    if (!selectedSize) return;
    setAdding(true);
    try {
      await addToCart(product._id, selectedSize, selectedColor, quantity, false, 0, product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize) return;
    try {
      await addToCart(product._id, selectedSize, selectedColor, quantity, false, 0, product);
      navigate('/checkout');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '4px solid #14327a', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2>Product not found</h2>
      <button onClick={() => navigate('/shop')} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', background: '#14327a', color: 'white', border: 'none', cursor: 'pointer' }}>Back to Shop</button>
    </div>
  );

  const totalStock = product.sizes?.reduce((acc, s) => acc + s.stock, 0) || 0;
  const currentStock = selectedSize ? (product.sizes?.find(s => s.size === selectedSize)?.stock || 0) : totalStock;
  const images = product.images?.length ? product.images : [product.image];

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px 24px 60px' }}>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        
        {/* Attached Filter Sidebar (Picture 1 edited for Product Details) */}
        <ProductFilterSidebar product={product} />

        {/* Main Product Container (Picture 2 content) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="product-detail-container">

            {/* Left: Image Gallery */}
            <div className="product-image-gallery">
              <div className="image-main-container" style={{ position: 'relative', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', aspectRatio: '4/5' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 2 }}>
                      <ArrowBackIosNewIcon sx={{ fontSize: '18px' }} />
                    </button>
                    <button onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 2 }}>
                      <ArrowForwardIosIcon sx={{ fontSize: '18px' }} />
                    </button>
                  </>
                )}

                <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', gap: '8px' }}>
                  <div style={{ background: '#14327a', padding: '6px 14px', borderRadius: '30px', color: 'white', fontSize: '12px', fontWeight: 700 }}>New Season</div>
                  {product.discountPercent > 0 && <div style={{ background: '#ef4444', padding: '6px 14px', borderRadius: '30px', color: 'white', fontSize: '12px', fontWeight: 700 }}>-{product.discountPercent}%</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', overflowX: 'auto', padding: '4px' }}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="thumbnail-item"
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{ width: '80px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: currentImageIndex === idx ? '2px solid #14327a' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }}>
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Details */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '8px', color: '#14327a', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '13px' }}>{product.brand}</div>
              <h1 className="product-title" style={{ fontSize: '42px', fontWeight: 900, color: '#111', lineHeight: 1.1, marginBottom: '16px' }}>{product.name}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', padding: '4px 10px', borderRadius: '8px' }}>
                  <StarIcon sx={{ color: '#f59e0b', fontSize: '20px' }} />
                  <span style={{ fontWeight: 800, color: '#92400e' }}>4.8</span>
                </div>
                <span style={{ color: '#666', fontSize: '14px' }}>2.4k Reviews</span>
                <div style={{ width: '1px', height: '16px', background: '#ddd' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e' }}>
                  <CheckCircleIcon sx={{ fontSize: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Verified Item</span>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span className="product-price" style={{ fontSize: '36px', fontWeight: 900, color: '#111' }}>₹{(product.discountPrice || product.price).toLocaleString()}</span>
                  {product.discountPrice && (
                    <span style={{ fontSize: '18px', color: '#999', textDecoration: 'line-through' }}>₹{product.price.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '16px' }}>Choose Size</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {product.sizes?.map((s) => (
                    <button
                      key={s.size}
                      disabled={s.stock === 0}
                      onClick={() => setSelectedSize(s.size)}
                      style={{
                        minWidth: '60px', height: '48px', padding: '0 16px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: s.stock === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                        background: selectedSize === s.size ? '#14327a' : s.stock === 0 ? '#f3f4f6' : 'white',
                        color: selectedSize === s.size ? 'white' : s.stock === 0 ? '#999' : '#111',
                        border: selectedSize === s.size ? '2px solid #14327a' : '2px solid #e5e7eb',
                      }}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', marginBottom: '32px' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Availability</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentStock > 5 ? '#22c55e' : '#ef4444' }} />
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{currentStock > 0 ? `${currentStock} In Stock` : 'Out of Stock'}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Occasion</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#111', textTransform: 'capitalize' }}>
                    {Array.isArray(product.occasion) && product.occasion.length > 0
                      ? product.occasion.join(', ')
                      : (product.occasion || 'Everyday Luxury')}
                  </div>
                </div>
              </div>

              <div className="subtotal-container" style={{ background: '#f3f4f6', padding: '24px', borderRadius: '20px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: 700, marginBottom: '4px' }}>Subtotal</div>
                    <div style={{ fontSize: '24px', fontWeight: 900 }}>₹{((product.discountPrice || product.price) * quantity).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', borderRadius: '12px', padding: '6px', border: '1px solid #e5e7eb' }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#f9fafb', cursor: 'pointer' }}><RemoveIcon sx={{ fontSize: '18px' }} /></button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: 800, fontSize: '16px' }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#f9fafb', cursor: 'pointer' }}><AddIcon sx={{ fontSize: '18px' }} /></button>
                  </div>
                </div>
              </div>

              {/* Virtual Try-On trigger button */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const event = new CustomEvent('open-try-on', { detail: { product } });
                  window.dispatchEvent(event);
                }}
                style={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: '20px' }} />
                Virtual Try-On (AI Mode) ✨
              </motion.button>

              <div className="action-buttons-container" style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!selectedSize && totalStock > 0) {
                      alert('Please select a size first!');
                      return;
                    }
                    handleAdd();
                  }}
                  disabled={adding || (selectedSize && currentStock === 0) || totalStock === 0}
                  className="action-button"
                  style={{
                    flex: 1.2, height: '56px', borderRadius: '16px', border: 'none',
                    background: added ? '#22c55e' : (totalStock === 0 || (selectedSize && currentStock === 0)) ? '#f3f4f6' : '#14327a',
                    color: (totalStock === 0 || (selectedSize && currentStock === 0)) ? '#9ca3af' : 'white',
                    fontWeight: 800, fontSize: '16px',
                    cursor: (totalStock === 0 || (selectedSize && currentStock === 0)) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                  }}>
                  {added ? <CheckCircleIcon /> : (totalStock === 0 ? null : <ShoppingBagOutlinedIcon />)}
                  {added ? 'Added!' : (totalStock === 0 ? 'Sold Out' : 'Add to Bag')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!selectedSize && totalStock > 0) {
                      alert('Please select a size first!');
                      return;
                    }
                    handleBuyNow();
                  }}
                  disabled={(selectedSize && currentStock === 0) || totalStock === 0}
                  className="action-button"
                  style={{
                    flex: 1, height: '56px', borderRadius: '16px',
                    border: (totalStock === 0 || (selectedSize && currentStock === 0)) ? '2px solid #e5e7eb' : '2px solid #14327a',
                    background: 'transparent',
                    color: (totalStock === 0 || (selectedSize && currentStock === 0)) ? '#9ca3af' : '#14327a',
                    fontWeight: 800, fontSize: '16px',
                    cursor: (totalStock === 0 || (selectedSize && currentStock === 0)) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                  }}>
                  {totalStock === 0 ? null : <BoltIcon />}
                  {totalStock === 0 ? 'Out of Stock' : 'Buy Now'}
                </motion.button>
              </div>

              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '24px', padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={product.sellerId?.avatar || "./images/man_avatar.png"}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px' }}>
                        {product.sellerId?.name || "Premium Seller"}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {product.sellerId?.sellerProfile?.storeName || "Elite Seller"} · 1.2k Sales
                      </div>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                  "{product.sellerId?.sellerProfile?.storeDescription || "Professional curator specializing in high-end luxury fashion. Every item in my collection is verified for authenticity and pristine condition."}"
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocalShippingIcon sx={{ color: '#14327a' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800 }}>Free Delivery</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Order above ₹999</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800 }}>7 Days Return</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Hassle-free process</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Your Need Section (Full Width across page below sidebar and product card) */}
      <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111', marginBottom: '24px', fontFamily: 'var(--font-sans)' }}>
          For Your Need
        </h2>
        {categoryLoading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : forYourNeedProducts.length > 0 ? (
          <div className="product-grid">
            {forYourNeedProducts.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} showButtons={false} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', fontSize: '14px' }}>No related products found in this category.</p>
        )}
      </div>
    </div>
  );
}
