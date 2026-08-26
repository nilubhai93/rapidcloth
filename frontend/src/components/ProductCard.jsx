import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import RemoveIcon from '@mui/icons-material/RemoveRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareRounded';

const ProductCard = memo(function ProductCard({ product, index = 0, showButtons = true, linkTo }) {
  const { addToCart, items, updateItem, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedSize, setSelectedSize] = useState('');
  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const sizeToUse = selectedSize || product.sizes?.find(s => s.stock > 0)?.size || product.sizes?.[0]?.size;
    if (!sizeToUse) return;
    setAdding(true);
    try {
      await addToCart(product._id, sizeToUse, product.colors?.[0], quantity, false, 0, product);
      window.alert("Your bag updated");
      setTimeout(() => setShowPopup(false), 600);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setTimeout(() => setAdding(false), 500);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/products/${product._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on RapidCloth!`,
          url: url,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      window.alert("Link copied to clipboard!");
    }
  };

  const fastDelivery = product.deliveryZones?.some(z => z.estimatedMinutes <= 30);

  const cartItem = items?.find(i => i.product?._id === product._id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  return (
    <>
      {/* DESKTOP VIEW */}
      <motion.div
        className="max-md:hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'all var(--transition-base)',
        position: 'relative'
      }}
      whileHover={{ borderColor: 'rgba(40, 116, 240, 0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      onMouseEnter={() => window.innerWidth > 768 && setShowPopup(true)}
      onMouseLeave={() => window.innerWidth > 768 && setShowPopup(false)}
    >
      <Link to={linkTo || `/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
          <img
            src={product.images?.[0] || 'https://placehold.co/300x400/1a1a25/9a9ab0?text=No+Image'}
            alt={product.name}
            loading='eager'
            style={{
              width: '100%', height: '100%', objectFit: 'cover'
            }}
          />

          {/* Badges */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            display: 'flex', flexDirection: 'column', gap: '6px'
          }}>
            {product.isAvailableForRent && (
              <span style={{
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                background: 'var(--gradient-secondary)',
                fontSize: '12px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: 'white'
              }}>Rent</span>
            )}
          </div>

          {/* Wishlist */}
          <motion.button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: liked ? '#ef4444' : 'white', border: 'none', cursor: 'pointer', zIndex: 5
            }}
          >
            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
          </motion.button>

          {/* Share */}
          <motion.button
            onClick={handleShare}
            style={{
              position: 'absolute', top: '56px', right: '12px',
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', border: 'none', cursor: 'pointer', zIndex: 5
            }}
          >
            <ShareOutlinedIcon sx={{ fontSize: 18 }} />
          </motion.button>

          {/* Quick Add Mobile Trigger (visible only on mobile) */}
          <motion.button
            className="md:hidden flex items-center justify-center"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPopup(true); }}
            style={{
              position: 'absolute', bottom: '12px', right: '12px',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)',
              color: '#2874f0', border: '1px solid rgba(40, 116, 240, 0.2)', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 5
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingBagOutlinedIcon sx={{ fontSize: 20 }} />
          </motion.button>
        </div>

        {/* Info */}
        <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontSize: '14px', fontWeight: 400, color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.4, marginBottom: '2px',
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{product.name}</h3>

          <p style={{
            fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px',
            whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}>{product.description}</p>

          <div className="max-md:hidden flex items-center" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', gap: '4px' }}>
            <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />
            <span>{fastDelivery ? 'Fast Delivery' : 'Standard Delivery'}</span>
          </div>

          {/* Star Rating Emojis */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F1111' }}>{product.rating || 4.8} ★</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({product.reviewCount || 0})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: 'auto' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
              ₹{(product.isAvailableForRent ? product.rentPricePerDay : price).toLocaleString()}
              {product.isAvailableForRent && <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>/ day</span>}
            </span>
            {!product.isAvailableForRent && hasDiscount && (
              <span style={{ fontSize: '13px', fontWeight: 400, color: '#878787', textDecoration: 'line-through' }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart & Buy Now */}
      {showButtons && (
        <div className="pc-action-buttons" style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              width: '100%', padding: '12px',
              borderRadius: '8px',
              background: adding ? '#22c55e' : 'linear-gradient(135deg, #1e4db7 0%, #14327a 100%)',
              color: 'white',
              fontSize: '14px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              border: 'none',
              cursor: adding ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 10px rgba(30, 77, 183, 0.3)',
              transition: 'background 0.2s ease, opacity 0.2s ease'
            }}
          >
            <ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />
            {adding ? 'Added!' : (product.isAvailableForRent ? 'Add to Rental' : 'Add to Bag')}
          </button>

          <motion.button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (qtyInCart === 0) {
                await handleAddToCart(e);
              }
              window.location.href = '/checkout';
            }}
            style={{
              width: '100%', padding: '12px',
              borderRadius: '8px',
              background: 'var(--buy-now)',
              color: 'white',
              fontSize: '14px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 10px var(--buy-now-shadow)'
            }}
          >
            {product.isAvailableForRent ? 'Rent Now' : 'Buy Now'}
          </motion.button>
        </div>
      )}

      {/* QUICK ADD SLIDE-UP POPUP OVERLAY */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              padding: '20px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', gap: '16px',
              zIndex: 50
            }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Quick Add</span>
              <button onClick={() => setShowPopup(false)} style={{ background: '#f1f5f9', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 700 }}>SELECT SIZE</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <button key={s.size} onClick={() => setSelectedSize(s.size)} style={{ padding: '6px 14px', borderRadius: '12px', border: selectedSize === s.size ? '2px solid #2874f0' : '1px solid #cbd5e1', background: selectedSize === s.size ? '#eff6ff' : '#ffffff', color: selectedSize === s.size ? '#2874f0' : '#334155', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedSize === s.size ? '0 2px 8px rgba(40,116,240,0.15)' : 'none' }}>{s.size}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>QUANTITY</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '32px', height: '32px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}><RemoveIcon sx={{ fontSize: 18 }} /></button>
                <span style={{ fontSize: '16px', fontWeight: 900, width: '20px', textAlign: 'center', color: '#0f172a' }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: '32px', height: '32px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}><AddIcon sx={{ fontSize: 18 }} /></button>
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={adding} style={{ width: '100%', padding: '14px', background: adding ? '#22c55e' : 'linear-gradient(135deg, #2874f0, #14327a)', color: '#ffffff', borderRadius: '14px', fontWeight: 800, fontSize: '14px', border: 'none', cursor: adding ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(40, 116, 240, 0.3)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' }}>
              <ShoppingBagOutlinedIcon sx={{ fontSize: 20 }} />
              {adding ? 'Added to Bag!' : (product.isAvailableForRent ? 'Add to Rental Bag' : 'Add to Bag')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>

      {/* MOBILE VIEW */}
      <motion.div
        className="md:hidden flex flex-col relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        style={{
          backgroundColor: index % 2 === 0 ? '#fedcc5' : '#ffffff',
          borderRadius: '16px',
          padding: '8px',
          height: '100%',
          boxShadow: index % 2 !== 0 ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
        }}
      >
        <Link to={linkTo || `/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', borderRadius: '12px', marginBottom: '10px' }}>
            <img
              src={product.images?.[0] || 'https://placehold.co/300x400/1a1a25/9a9ab0?text=No+Image'}
              alt={product.name}
              loading='eager'
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '0 4px' }}>
            <h3 style={{
              fontSize: '13px', fontWeight: 600, color: '#111',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.3, marginBottom: '6px',
              display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>{product.name}</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>
                ₹{(product.isAvailableForRent ? product.rentPricePerDay : price).toLocaleString()}
              </span>
              
              {product.reviewCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px', color: '#e09b76' }}>
                  {'★'.repeat(Math.round(product.rating || 5))}
                </div>
              )}
            </div>
          </div>
        </Link>
        
        <div style={{ padding: '0 4px 4px 4px', marginTop: 'auto' }}>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '999px',
              backgroundColor: adding ? '#22c55e' : '#bfd3f3',
              color: adding ? 'white' : '#1a2c4e',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: adding ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {adding ? 'Added' : 'Add to Bag'}
          </button>
        </div>
      </motion.div>
    </>
  );
});

export default ProductCard;
