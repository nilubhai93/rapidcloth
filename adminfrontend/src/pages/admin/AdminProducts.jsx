import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/SearchRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import api from '../../api/index';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.products || res.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CategoryIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
            Product Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
            Review all products available on the platform
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <SearchIcon sx={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--text-muted)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              padding: '5px 8px 5px 28px', borderRadius: '6px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '11px', outline: 'none', width: '200px'
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '30px 16px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <CategoryIcon sx={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: '6px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>No products found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {filtered.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              {product.images?.[0] && (
                <div style={{ height: '110px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                  <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '10px 12px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.name}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#FF6B6B' }}>₹{product.price}</span>
                  <span style={{
                    padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                    background: 'var(--bg-elevated)', color: 'var(--text-muted)', textTransform: 'capitalize'
                  }}>
                    {product.category}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Stock: {product.stock ?? 'N/A'} • Seller: {product.sellerId?.name || 'Unknown'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
