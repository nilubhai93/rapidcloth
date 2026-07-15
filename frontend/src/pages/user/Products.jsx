import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetProductsQuery, useGetFeaturedProductsQuery } from '../../store/apiSlice';
import ProductCard from '../../components/ProductCard';
import TuneIcon from '@mui/icons-material/TuneRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    tags: searchParams.get('tags') || '',
    occasion: searchParams.get('occasion') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page')) || 1,
  });

  // Sync state when URL params change (e.g. from Navbar links)
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: searchParams.get('category') || '',
      gender: searchParams.get('gender') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      tags: searchParams.get('tags') || '',
      occasion: searchParams.get('occasion') || '',
      search: searchParams.get('search') || '',
      sort: searchParams.get('sort') || prev.sort,
      page: parseInt(searchParams.get('page')) || 1,
    }));
  }, [searchParams]);

  // Build clean parameters for the query
  const params = {};
  Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });

  const { data, isFetching } = useGetProductsQuery(params);
  const products = data?.products || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  // Fetch recommendations only when search returns empty list and not loading
  const showRecommendations = !isFetching && products.length === 0;
  const { data: featuredData } = useGetFeaturedProductsQuery(undefined, {
    skip: !showRecommendations
  });
  const recommendations = featuredData?.products || [];
  const loading = isFetching;

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', gender: '', minPrice: '', maxPrice: '', tags: '', occasion: '', search: '', sort: '-createdAt', page: 1 });
    setSearchParams({});
  };

  const categories = ['dress', 'shirt', 'jeans', 'tshirt', 'jacket', 'shoes', 'bag', 'jewelry', 'skirt', 'shorts', 'sweater', 'outerwear'];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-rating', label: 'Top Rated' },
  ];

  const occasions = ['wedding', 'party', 'office', 'date-night', 'casual', 'beach', 'gym', 'festival', 'graduation'];
  const activeFilterCount = Object.values(filters).filter(v => v && v !== '-createdAt' && v !== 1).length;

  return (
    <div className="container" style={{ padding: '10px 24px 60px', marginTop: '10px' }}>
      {/* Product Grid starts directly */}

      {/* Expanded Filters */}
      {filtersOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            marginBottom: '24px',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}
        >
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Gender</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['women', 'men', 'kids', 'unisex'].map(g => (
                <button key={g} onClick={() => updateFilter('gender', filters.gender === g ? '' : g)}
                  style={{
                    padding: '8px 16px', borderRadius: 'var(--radius-md)',
                    background: filters.gender === g ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                    color: filters.gender === g ? 'var(--accent-light)' : 'var(--text-muted)',
                    border: `1px solid ${filters.gender === g ? 'var(--accent)' : 'transparent'}`,
                    fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer'
                  }}>{g}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Price Range</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                style={{
                  width: '100px', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 'clamp(13px, 2.5vw, 16px)', outline: 'none'
                }} />
              <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>—</span>
              <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                style={{
                  width: '100px', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 'clamp(13px, 2.5vw, 16px)', outline: 'none'
                }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Style</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['casual', 'formal', 'party', 'trendy', 'streetwear', 'minimalist'].map(tag => (
                <button key={tag} onClick={() => updateFilter('tags', filters.tags === tag ? '' : tag)}
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                    background: filters.tags === tag ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                    color: filters.tags === tag ? 'var(--accent-light)' : 'var(--text-muted)',
                    border: `1px solid ${filters.tags === tag ? 'var(--accent)' : 'transparent'}`,
                    fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer'
                  }}>{tag}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Occasion</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {occasions.map(occ => (
                <button key={occ} onClick={() => updateFilter('occasion', filters.occasion === occ ? '' : occ)}
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                    background: filters.occasion === occ ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                    color: filters.occasion === occ ? 'var(--accent-light)' : 'var(--text-muted)',
                    border: `1px solid ${filters.occasion === occ ? 'var(--accent)' : 'transparent'}`,
                    fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer'
                  }}>{occ}</button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="skeleton" style={{ height: '420px' }} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: 'clamp(24px, 5vw, 48px)', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            We couldn't find matches for your search
          </h3>
          <p style={{ marginBottom: '40px' }}>But you might like these featured items instead:</p>
          
          {recommendations.length > 0 && (
            <div className="product-grid">
              {recommendations.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '8px',
          marginTop: '48px'
        }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setFilters(prev => ({ ...prev, page: p }))}
              style={{
                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                background: p === pagination.page ? 'var(--gradient-primary)' : 'var(--bg-card)',
                color: p === pagination.page ? 'white' : 'var(--text-muted)',
                border: `1px solid ${p === pagination.page ? 'transparent' : 'var(--border)'}`,
                fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, cursor: 'pointer'
              }}
            >{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
