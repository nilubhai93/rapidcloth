import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductDetailsQuery } from '../../store/apiSlice';
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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const { data, isFetching } = useGetProductDetailsQuery(id);
  const product = data?.product || null;
  const loading = isFetching;

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
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setAdding(true);
    try {
      await addToCart(product._id, selectedSize, selectedColor, quantity);
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
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    try {
      await addToCart(product._id, selectedSize, selectedColor, quantity);
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: '#fcfcfd' }}>
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
  );
}
