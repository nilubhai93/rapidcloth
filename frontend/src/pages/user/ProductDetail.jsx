import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductDetailsQuery, useGetProductsQuery } from '../../store/apiSlice';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import StarIcon from '@mui/icons-material/StarRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import BoltIcon from '@mui/icons-material/BoltRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import RemoveIcon from '@mui/icons-material/RemoveRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIosRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import SecurityIcon from '@mui/icons-material/SecurityRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ width: '40px', height: '40px', border: '3px solid #14327a', borderTopColor: 'transparent', borderRadius: '50%' }}
      />
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>Product not found</h3>
      <p style={{ color: '#64748b', marginTop: '6px' }}>The requested item may have been moved or removed.</p>
      <button onClick={() => navigate('/products')} style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '10px', background: '#14327a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
        Back to Products
      </button>
    </div>
  );

  const totalStock = product.sizes?.reduce((acc, s) => acc + s.stock, 0) || 0;
  const currentStock = selectedSize ? (product.sizes?.find(s => s.size === selectedSize)?.stock || 0) : totalStock;
  const images = product.images?.length ? product.images : [product.image];

  return (
    <div className="pd-wrapper">
      <div className="pd-main-container">
        
        {/* Main Product Grid */}
        <div className="pd-grid">
          
          {/* Left Column: Image Gallery */}
          <div className="pd-gallery-col">
            <div className="pd-main-image-card">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="pd-main-img"
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button 
                    className="pd-nav-arrow pd-nav-left"
                    onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  >
                    <ArrowBackIosNewIcon sx={{ fontSize: '14px', color: '#1e293b' }} />
                  </button>
                  <button 
                    className="pd-nav-arrow pd-nav-right"
                    onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: '14px', color: '#1e293b' }} />
                  </button>
                </>
              )}

              <div className="pd-badge-container">
                <span className="pd-badge pd-badge-new">New Season</span>
                {product.discountPercent > 0 && (
                  <span className="pd-badge pd-badge-discount">-{product.discountPercent}% OFF</span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="pd-thumbs-strip">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`pd-thumb-box ${currentImageIndex === idx ? 'active' : ''}`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Buying Actions */}
          <div className="pd-info-col">
            
            {/* Brand & Category Pill */}
            <div className="pd-brand-pill">
              {product.brand || 'AI DESIGNER'}
            </div>

            {/* Title */}
            <h1 className="pd-title">
              {product.name}
            </h1>

            {/* Rating & Social Proof */}
            <div className="pd-rating-row">
              <div className="pd-star-badge">
                <StarIcon sx={{ color: '#f59e0b', fontSize: '16px' }} />
                <span>4.8</span>
              </div>
              <span className="pd-reviews-count">2.4k Reviews</span>
              <div className="pd-divider-v" />
              <div className="pd-verified-badge">
                <CheckCircleIcon sx={{ fontSize: '16px' }} />
                <span>Verified Item</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="pd-price-card">
              <div className="pd-price-main">
                <span className="pd-price-current">
                  ₹{(product.discountPrice || product.price).toLocaleString()}
                </span>
                {product.discountPrice && (
                  <span className="pd-price-original">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>
              {product.discountPercent > 0 && (
                <span className="pd-save-badge">
                  Save ₹{(product.price - product.discountPrice).toLocaleString()}
                </span>
              )}
            </div>

            {/* Size Selector */}
            <div className="pd-section-box">
              <div className="pd-section-label">
                <span>Choose Size</span>
                {selectedSize && <span className="pd-selected-val">Selected: {selectedSize}</span>}
              </div>
              <div className="pd-sizes-grid">
                {product.sizes?.map((s) => (
                  <button
                    key={s.size}
                    disabled={s.stock === 0}
                    onClick={() => setSelectedSize(s.size)}
                    className={`pd-size-btn ${selectedSize === s.size ? 'active' : ''} ${s.stock === 0 ? 'disabled' : ''}`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability & Occasion Card */}
            <div className="pd-meta-grid">
              <div>
                <div className="pd-meta-title">Availability</div>
                <div className="pd-meta-value">
                  <div className={`pd-status-dot ${currentStock > 0 ? 'in-stock' : 'out-stock'}`} />
                  <span>{currentStock > 0 ? `${currentStock} In Stock` : 'Out of Stock'}</span>
                </div>
              </div>
              <div>
                <div className="pd-meta-title">Occasion</div>
                <div className="pd-meta-value capitalize">
                  {Array.isArray(product.occasion) && product.occasion.length > 0
                    ? product.occasion.join(', ')
                    : (product.occasion || 'Party Night, Festival')}
                </div>
              </div>
            </div>

            {/* Quantity Stepper & Subtotal Box */}
            <div className="pd-qty-card">
              <div>
                <div className="pd-qty-sub-label">Subtotal</div>
                <div className="pd-qty-sub-price">
                  ₹{((product.discountPrice || product.price) * quantity).toLocaleString()}
                </div>
              </div>
              <div className="pd-stepper">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="pd-stepper-btn">
                  <RemoveIcon sx={{ fontSize: '16px' }} />
                </button>
                <span className="pd-stepper-val">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="pd-stepper-btn">
                  <AddIcon sx={{ fontSize: '16px' }} />
                </button>
              </div>
            </div>

            {/* Virtual Try-On Button (AI Mode) */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                const event = new CustomEvent('open-try-on', { detail: { product } });
                window.dispatchEvent(event);
              }}
              className="pd-ai-tryon-btn"
            >
              <AutoAwesomeIcon sx={{ fontSize: '18px' }} />
              Virtual Try-On (AI Mode) ✨
            </motion.button>

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div className="pd-actions-row">
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
                className={`pd-action-btn pd-add-btn ${added ? 'added' : ''}`}
              >
                {added ? <CheckCircleIcon sx={{ fontSize: '18px' }} /> : (totalStock === 0 ? null : <ShoppingBagOutlinedIcon sx={{ fontSize: '18px' }} />)}
                {added ? 'Added to Bag!' : (totalStock === 0 ? 'Sold Out' : 'Add to Bag')}
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
                className="pd-action-btn pd-buy-btn"
              >
                {totalStock === 0 ? null : <BoltIcon sx={{ fontSize: '18px' }} />}
                {totalStock === 0 ? 'Out of Stock' : 'Buy Now'}
              </motion.button>
            </div>

            {/* Seller Card */}
            <div className="pd-seller-card">
              <div className="pd-seller-header">
                <img
                  src={product.sellerId?.avatar || "/images/man_avatar.png"}
                  alt="Seller Avatar"
                  className="pd-seller-avatar"
                />
                <div>
                  <div className="pd-seller-name">
                    {product.sellerId?.name || "Premium Seller"}
                  </div>
                  <div className="pd-seller-sub">
                    {product.sellerId?.sellerProfile?.storeName || "Elite Seller"} · 1.2k Sales
                  </div>
                </div>
              </div>
              <p className="pd-seller-quote">
                "{product.sellerId?.sellerProfile?.storeDescription || "Professional curator specializing in high-end luxury fashion. Every item in my collection is verified for authenticity and pristine condition."}"
              </p>
            </div>

            {/* Delivery & Guarantee Badges */}
            <div className="pd-trust-grid">
              <div className="pd-trust-box">
                <div className="pd-trust-icon pd-trust-icon-indigo">
                  <LocalShippingIcon sx={{ fontSize: '18px' }} />
                </div>
                <div>
                  <div className="pd-trust-title">Free Fast Delivery</div>
                  <div className="pd-trust-desc">Order above ₹999</div>
                </div>
              </div>
              <div className="pd-trust-box">
                <div className="pd-trust-icon pd-trust-icon-green">
                  <RefreshIcon sx={{ fontSize: '18px' }} />
                </div>
                <div>
                  <div className="pd-trust-title">7 Days Easy Return</div>
                  <div className="pd-trust-desc">Hassle-free process</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* For Your Need / Related Products Section */}
        <div className="pd-related-section">
          <h2 className="pd-related-title">
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
            <p style={{ color: '#64748b', fontSize: '14px' }}>No related products found in this category.</p>
          )}
        </div>

      </div>

      {/* Styled JSX for Responsive Layout */}
      <style>{`
        .pd-wrapper {
          background-color: var(--bg-primary, #faf7f2);
          min-height: 100vh;
          padding-bottom: 60px;
        }
        .pd-main-container {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 24px 60px;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .pd-main-container {
            padding: 24px 16px 40px;
          }
        }
        .pd-breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
          margin-bottom: 24px;
        }
        .pd-breadcrumb a {
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s;
        }
        .pd-breadcrumb a:hover {
          color: #14327a;
        }
        .pd-breadcrumb-active {
          color: #0f172a;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 240px;
        }
        .pd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .pd-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
        .pd-gallery-col {
          position: sticky;
          top: 90px;
        }
        @media (max-width: 960px) {
          .pd-gallery-col {
            position: static;
          }
        }
        .pd-main-image-card {
          position: relative;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid var(--border, #e2e8f0);
          overflow: hidden;
          aspect-ratio: 4/5;
          width: 100%;
          max-height: 540px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-main-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 16px;
        }
        .pd-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 2;
          transition: all 0.2s;
        }
        .pd-nav-arrow:hover {
          background: #ffffff;
          transform: translateY(-50%) scale(1.08);
        }
        .pd-nav-left { left: 14px; }
        .pd-nav-right { right: 14px; }
        .pd-badge-container {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          gap: 8px;
        }
        .pd-badge {
          padding: 5px 12px;
          border-radius: 20px;
          color: white;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .pd-badge-new { background: #14327a; }
        .pd-badge-discount { background: #ef4444; }

        .pd-thumbs-strip {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .pd-thumb-box {
          width: 72px;
          height: 84px;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
          cursor: pointer;
          flex-shrink: 0;
          background: #ffffff;
          transition: all 0.2s;
        }
        .pd-thumb-box.active {
          border-color: #14327a;
          box-shadow: 0 0 0 2px rgba(20, 50, 122, 0.2);
        }
        .pd-thumb-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pd-info-col {
          display: flex;
          flex-direction: column;
        }
        .pd-brand-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          color: #14327a;
          text-transform: uppercase;
          letterSpacing: 1px;
          background: rgba(20, 50, 122, 0.08);
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 8px;
          align-self: flex-start;
        }
        .pd-title {
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 800;
          color: #0f172a;
          line-height: 1.3;
          margin-bottom: 12px;
          font-family: var(--font-display, inherit);
        }
        .pd-rating-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .pd-star-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #fffbeb;
          border: 1px solid #fef08a;
          padding: 3px 10px;
          border-radius: 8px;
          font-weight: 800;
          color: #92400e;
          font-size: 13px;
        }
        .pd-reviews-count {
          color: #64748b;
          font-size: 13px;
        }
        .pd-divider-v {
          width: 1px;
          height: 14px;
          background: #cbd5e1;
        }
        .pd-verified-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #16a34a;
          font-size: 13px;
          font-weight: 600;
        }

        .pd-price-card {
          background: #ffffff;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .pd-price-main {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }
        .pd-price-current {
          font-size: 28px;
          font-weight: 900;
          color: #0f172a;
        }
        .pd-price-original {
          font-size: 18px;
          color: #94a3b8;
          text-decoration: line-through;
        }
        .pd-save-badge {
          background: #fef2f2;
          color: #dc2626;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }

        .pd-section-box {
          margin-bottom: 20px;
        }
        .pd-section-label {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 13px;
          color: #334155;
          margin-bottom: 10px;
        }
        .pd-selected-val {
          color: #14327a;
        }
        .pd-sizes-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .pd-size-btn {
          min-width: 50px;
          height: 40px;
          padding: 0 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
        }
        .pd-size-btn.active {
          background: #14327a;
          color: white;
          border-color: #14327a;
          box-shadow: 0 4px 12px rgba(20, 50, 122, 0.25);
        }
        .pd-size-btn.disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
          border-color: #e2e8f0;
        }

        .pd-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 14px 18px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }
        .pd-meta-title {
          font-size: 11px;
          color: #64748b;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .pd-meta-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 13px;
          color: #0f172a;
        }
        .pd-meta-value.capitalize { text-transform: capitalize; }
        .pd-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .pd-status-dot.in-stock { background: #16a34a; }
        .pd-status-dot.out-stock { background: #dc2626; }

        .pd-qty-card {
          background: #ffffff;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pd-qty-sub-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
        }
        .pd-qty-sub-price {
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
        }
        .pd-stepper {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border-radius: 8px;
          padding: 4px;
          border: 1px solid #cbd5e1;
        }
        .pd-stepper-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          background: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .pd-stepper-val {
          width: 32px;
          text-align: center;
          font-weight: 800;
          font-size: 14px;
          color: #0f172a;
        }

        .pd-ai-tryon-btn {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #4f46e5 0%, #a855f7 100%);
          color: white;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 14px;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
          transition: all 0.2s;
        }

        .pd-actions-row {
          display: flex;
          gap: 14px;
          margin-bottom: 24px;
        }
        .pd-action-btn {
          flex: 1;
          height: 50px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .pd-add-btn {
          border: none;
          background: #14327a;
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(20, 50, 122, 0.3);
        }
        .pd-add-btn.added {
          background: #16a34a;
        }
        .pd-buy-btn {
          border: 2px solid #14327a;
          background: transparent;
          color: #14327a;
          cursor: pointer;
        }

        .pd-seller-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 20px;
        }
        .pd-seller-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .pd-seller-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
        }
        .pd-seller-name {
          font-weight: 800;
          font-size: 14px;
          color: #0f172a;
        }
        .pd-seller-sub {
          font-size: 12px;
          color: #64748b;
        }
        .pd-seller-quote {
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
          font-style: italic;
        }

        .pd-trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .pd-trust-box {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 14px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .pd-trust-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pd-trust-icon-indigo { background: #e0e7ff; color: #14327a; }
        .pd-trust-icon-green { background: #dcfce7; color: #16a34a; }
        .pd-trust-title { font-size: 12px; font-weight: 800; color: #0f172a; }
        .pd-trust-desc { font-size: 11px; color: #64748b; }

        .pd-related-section {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid #e2e8f0;
        }
        .pd-related-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 24px;
          font-family: var(--font-display, inherit);
        }
      `}</style>

    </div>
  );
}
