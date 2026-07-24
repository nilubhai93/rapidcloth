import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';

const ProductCard = memo(function ProductCard({ product, index = 0, showButtons = true }) {
  const { addToCart, items, updateItem, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedSize, setSelectedSize] = useState('');
  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(false);

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
      await addToCart(product._id, sizeToUse, product.colors?.[0], 1, false, 0, product);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setTimeout(() => setAdding(false), 500);
    }
  };

  const fastDelivery = product.deliveryZones?.some(z => z.estimatedMinutes <= 30);

  const cartItem = items?.find(i => i.product?._id === product._id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  return (
    <motion.div
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
      whileHover={{ y: -4, borderColor: 'rgba(20, 50, 122, 0.5)' }}
    >
      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
          <img
            src={product.images?.[0] || 'https://placehold.co/300x400/1a1a25/9a9ab0?text=No+Image'}
            alt={product.name}
            loading='eager'
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform var(--transition-slow)'
            }}
            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.target.style.transform = 'scale(1)'}
          />

          {/* Badges */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            display: 'flex', flexDirection: 'column', gap: '6px'
          }}>
            {hasDiscount && (
              <span style={{
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                background: '#ff6b6b',
                fontSize: '12px', fontWeight: 800, color: 'white'
              }}>-{discountPercent}%</span>
            )}
            {product.isAvailableForRent && (
              <span style={{
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                background: 'var(--gradient-secondary)',
                fontSize: '12px', fontWeight: 800, color: 'white'
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
              color: liked ? '#ef4444' : 'white', border: 'none', cursor: 'pointer'
            }}
          >
            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
          </motion.button>
        </div>

        {/* Info */}
        <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)',
            lineHeight: 1.4, marginBottom: '4px',
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{product.name}</h3>

          <p style={{
            fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{product.description}</p>

          {/* Sizes Chips */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
              Select Size: <span style={{ color: 'var(--accent)', fontWeight: 900 }}>{selectedSize}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {product.sizes?.map(s => (
                <button
                  key={s.size}
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (s.stock > 0) setSelectedSize(s.size);
                  }}
                  disabled={s.stock <= 0}
                  style={{
                    minWidth: '30px', height: '24px', padding: '0 4px',
                    borderRadius: '4px', border: `1px solid ${selectedSize === s.size ? 'var(--accent)' : 'var(--border)'}`,
                    background: selectedSize === s.size ? 'var(--accent-bg)' : 'white',
                    color: selectedSize === s.size ? 'var(--accent)' : s.stock > 0 ? 'var(--text-primary)' : '#ccc',
                    fontSize: '10px', fontWeight: 700,
                    cursor: s.stock > 0 ? 'pointer' : 'not-allowed',
                    opacity: s.stock <= 0 ? 0.5 : 1,
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {s.size}
                </button>
              )) || <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Free Size</span>}
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />
            <span>{fastDelivery ? 'Fast Delivery' : 'Standard Delivery'}</span>
          </div>

          {/* Star Rating Emojis */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '12px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ fontSize: '14px', opacity: i < Math.floor(product.rating || 4) ? 1 : 0.2 }}>⭐</span>
            ))}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>({product.reviewCount || 0})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: 'auto' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>
              ₹{(product.isAvailableForRent ? product.rentPricePerDay : price).toLocaleString()}
              {product.isAvailableForRent && <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>/ day</span>}
            </span>
            {!product.isAvailableForRent && hasDiscount && (
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
            {!product.isAvailableForRent && hasDiscount && (
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff6b6b' }}>
                ({discountPercent}% OFF)
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart & Buy Now */}
      {showButtons && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {qtyInCart > 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(20,50,122,0.08), rgba(201,169,110,0.08))', borderRadius: 'var(--radius-md)',
              padding: '4px', border: '1px solid rgba(20,50,122,0.3)'
            }}>
              <button
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  if (qtyInCart > 1) updateItem(cartItem._id, qtyInCart - 1);
                  else removeItem(cartItem._id);
                }}
                style={{
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'white', color: '#111',
                  border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontSize: '16px', fontWeight: 'bold'
                }}
              >-</button>
              <span style={{ fontWeight: 800, color: '#111', fontSize: '13px' }}>
                {qtyInCart} in {product.isAvailableForRent ? 'Rental' : 'Bag'}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  updateItem(cartItem._id, qtyInCart + 1);
                }}
                style={{
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'white', color: '#111',
                  border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontSize: '16px', fontWeight: 'bold'
                }}
              >+</button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={adding}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '8px',
                background: adding ? '#22c55e' : 'linear-gradient(135deg, #14327a 0%, #c9a96e 100%)',
                color: 'white',
                fontSize: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                border: 'none',
                cursor: adding ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 10px rgba(20, 50, 122, 0.4)'
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />
              {adding ? 'Added!' : (product.isAvailableForRent ? 'Add to Rental' : 'Add to Bag')}
            </motion.button>
          )}

          {qtyInCart > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = '/cart'; }}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                fontSize: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                border: '1px solid #22c55e',
                cursor: 'pointer'
              }}
            >
              Go to Cart
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
    </motion.div>
  );
});

export default ProductCard;
