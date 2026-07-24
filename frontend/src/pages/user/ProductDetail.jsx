import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
import NavigateNextIcon from '@mui/icons-material/NavigateNextRounded';

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
    category ? { category, limit: 8 } : { limit: 8 },
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
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '36px', height: '36px', border: '3px solid #14327a', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ fontSize: '20px', color: '#333' }}>Product not found</h3>
      <button onClick={() => navigate('/products')} style={{ marginTop: '16px', padding: '8px 18px', borderRadius: '6px', background: '#14327a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Back to Products</button>
    </div>
  );

  const totalStock = product.sizes?.reduce((acc, s) => acc + s.stock, 0) || 0;
  const currentStock = selectedSize ? (product.sizes?.find(s => s.size === selectedSize)?.stock || 0) : totalStock;
  const images = product.images?.length ? product.images : [product.image];

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 20px 50px' }}>
      
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
        <NavigateNextIcon sx={{ fontSize: '16px' }} />
        <Link to="/products" style={{ color: '#64748b', textDecoration: 'none' }}>Products</Link>
        {product.category && (
          <>
            <NavigateNextIcon sx={{ fontSize: '16px' }} />
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: '#64748b', textDecoration: 'none', textTransform: 'capitalize' }}>
              {product.category}
            </Link>
          </>
        )}
        <NavigateNextIcon sx={{ fontSize: '16px' }} />
        <span style={{ color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
          {product.name}
        </span>
      </div>

      {/* Main Product Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 440px) 1fr', gap: '36px', alignItems: 'start' }}>
        
        {/* Left Column: Image Gallery */}
        <div>
          <div style={{ position: 'relative', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', aspectRatio: '4/5', width: '100%', maxHeight: '480px' }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }}
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 2 }}
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: '14px', color: '#1e293b' }} />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 2 }}
                >
                  <ArrowForwardIosIcon sx={{ fontSize: '14px', color: '#1e293b' }} />
                </button>
              </>
            )}

            <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '6px' }}>
              <span style={{ background: '#14327a', padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 700 }}>New Season</span>
              {product.discountPercent > 0 && <span style={{ background: '#ef4444', padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 700 }}>-{product.discountPercent}%</span>}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  style={{ width: '64px', height: '76px', borderRadius: '8px', overflow: 'hidden', border: currentImageIndex === idx ? '2px solid #14327a' : '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, background: '#f8fafc' }}
                >
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div>
          {/* Brand & Category */}
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#14327a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            {product.brand || 'AI DESIGNER'}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '12px' }}>
            {product.name}
          </h1>

          {/* Rating & Verification */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', border: '1px solid #fef08a', padding: '2px 8px', borderRadius: '6px' }}>
              <StarIcon sx={{ color: '#f59e0b', fontSize: '16px' }} />
              <span style={{ fontWeight: 800, color: '#92400e', fontSize: '13px' }}>4.8</span>
            </div>
            <span style={{ color: '#64748b', fontSize: '13px' }}>2.4k Reviews</span>
            <div style={{ width: '1px', height: '14px', background: '#cbd5e1' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a' }}>
              <CheckCircleIcon sx={{ fontSize: '15px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Verified Item</span>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
              ₹{(product.discountPrice || product.price).toLocaleString()}
            </span>
            {product.discountPrice && (
              <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through' }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Choose Size */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '8px' }}>Choose Size</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {product.sizes?.map((s) => (
                <button
                  key={s.size}
                  disabled={s.stock === 0}
                  onClick={() => setSelectedSize(s.size)}
                  style={{
                    minWidth: '46px', height: '36px', padding: '0 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                    cursor: s.stock === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    background: selectedSize === s.size ? '#14327a' : s.stock === 0 ? '#f1f5f9' : '#white',
                    color: selectedSize === s.size ? 'white' : s.stock === 0 ? '#94a3b8' : '#1e293b',
                    border: selectedSize === s.size ? '2px solid #14327a' : '1px solid #cbd5e1',
                  }}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          {/* Availability & Occasion */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Availability</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStock > 5 ? '#16a34a' : '#dc2626' }} />
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{currentStock > 0 ? `${currentStock} In Stock` : 'Out of Stock'}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Occasion</div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', textTransform: 'capitalize' }}>
                {Array.isArray(product.occasion) && product.occasion.length > 0
                  ? product.occasion.join(', ')
                  : (product.occasion || 'Party Night, Festival')}
              </div>
            </div>
          </div>

          {/* Subtotal & Quantity Selector */}
          <div style={{ background: '#f1f5f9', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Subtotal</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                ₹{((product.discountPrice || product.price) * quantity).toLocaleString()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', borderRadius: '8px', padding: '4px', border: '1px solid #cbd5e1' }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RemoveIcon sx={{ fontSize: '16px', color: '#475569' }} />
              </button>
              <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AddIcon sx={{ fontSize: '16px', color: '#475569' }} />
              </button>
            </div>
          </div>

          {/* Virtual Try-On Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              const event = new CustomEvent('open-try-on', { detail: { product } });
              window.dispatchEvent(event);
            }}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)'
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: '18px' }} />
            Virtual Try-On (AI Mode) ✨
          </motion.button>

          {/* Action Buttons: Add to Bag & Buy Now */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
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
              style={{
                flex: 1, height: '46px', borderRadius: '10px', border: 'none',
                background: added ? '#16a34a' : (totalStock === 0 || (selectedSize && currentStock === 0)) ? '#f1f5f9' : '#14327a',
                color: (totalStock === 0 || (selectedSize && currentStock === 0)) ? '#94a3b8' : 'white',
                fontWeight: 700, fontSize: '14px',
                cursor: (totalStock === 0 || (selectedSize && currentStock === 0)) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {added ? <CheckCircleIcon sx={{ fontSize: '18px' }} /> : (totalStock === 0 ? null : <ShoppingBagOutlinedIcon sx={{ fontSize: '18px' }} />)}
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
              style={{
                flex: 1, height: '46px', borderRadius: '10px',
                border: (totalStock === 0 || (selectedSize && currentStock === 0)) ? '1px solid #cbd5e1' : '2px solid #14327a',
                background: 'transparent',
                color: (totalStock === 0 || (selectedSize && currentStock === 0)) ? '#94a3b8' : '#14327a',
                fontWeight: 700, fontSize: '14px',
                cursor: (totalStock === 0 || (selectedSize && currentStock === 0)) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {totalStock === 0 ? null : <BoltIcon sx={{ fontSize: '18px' }} />}
              {totalStock === 0 ? 'Out of Stock' : 'Buy Now'}
            </motion.button>
          </div>

          {/* Seller Card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img
                src={product.sellerId?.avatar || "/images/man_avatar.png"}
                alt="Seller Avatar"
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                  {product.sellerId?.name || "Premium Seller"}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {product.sellerId?.sellerProfile?.storeName || "Elite Seller"} · 1.2k Sales
                </div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>
              "{product.sellerId?.sellerProfile?.storeDescription || "Professional curator specializing in high-end luxury fashion. Every item in my collection is verified for authenticity and pristine condition."}"
            </p>
          </div>

          {/* Delivery & Guarantee Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LocalShippingIcon sx={{ color: '#14327a', fontSize: '18px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Free Delivery</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Order above ₹999</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircleIcon sx={{ color: '#16a34a', fontSize: '18px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>7 Days Return</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Hassle-free process</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* For Your Need / Related Products Section */}
      <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
          For Your Need
        </h2>
        {categoryLoading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '320px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : forYourNeedProducts.length > 0 ? (
          <div className="product-grid">
            {forYourNeedProducts.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} showButtons={false} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '13px' }}>No related products found in this category.</p>
        )}
      </div>

    </div>
  );
}
