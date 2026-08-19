import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductsQuery, useGetFeaturedProductsQuery } from '../../store/apiSlice';
import ProductCard from '../../components/ProductCard';
import TuneIcon from '@mui/icons-material/TuneRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownwardRounded';
import PercentIcon from '@mui/icons-material/PercentRounded';
import FilterListIcon from '@mui/icons-material/FilterListRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Sync state when URL params change
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

  // Lock body scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [sidebarOpen]);

  // Build parameters for API request
  const params = { limit: 1000 };
  Object.entries(filters).forEach(([k, v]) => { if (v && k !== 'page') params[k] = v; });

  const { data, isFetching } = useGetProductsQuery(params);
  const products = data?.products || [];

  const { data: featuredData } = useGetFeaturedProductsQuery();
  const recommendations = featuredData?.products || [];
  const loading = isFetching;

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && k !== 'page' && v !== '-createdAt') {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ category: '', gender: '', minPrice: '', maxPrice: '', tags: '', occasion: '', search: '', sort: '-createdAt', page: 1 });
    setSearchParams({});
  };

  const categories = [
    { id: '', label: 'All Items' },
    { id: 'saree', label: 'Sarees & Ethnic' },
    { id: 'dress', label: 'Dresses' },
    { id: 'shirt', label: 'Shirts' },
    { id: 'tshirt', label: 'T-Shirts' },
    { id: 'jeans', label: 'Jeans' },
    { id: 'jacket', label: 'Jackets' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'bag', label: 'Bags' },
    { id: 'kids', label: 'Kids Wear' },
  ];

  const sortItems = [
    { id: '-createdAt', label: 'Latest Trends', icon: <LocalFireDepartmentIcon sx={{ fontSize: '16px', color: '#f59e0b' }} /> },
    { id: '-rating', label: 'Top Rated', icon: <StarIcon sx={{ fontSize: '16px', color: '#eab308' }} /> },
    { id: 'price', label: 'Price: Low to High', icon: <ArrowUpwardIcon sx={{ fontSize: '16px' }} /> },
    { id: '-price', label: 'Price: High to Low', icon: <ArrowDownwardIcon sx={{ fontSize: '16px' }} /> },
    { id: '-discountPrice', label: 'Deals & Offers', icon: <PercentIcon sx={{ fontSize: '16px', color: '#ef4444' }} /> },
  ];

  const occasions = ['wedding', 'party', 'office', 'date-night', 'casual', 'festival', 'graduation'];
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort' && k !== 'page').length;

  return (
    <div className="products-page-container" style={{ maxWidth: '1440px', margin: '30px auto' }}>

      {/* 1. RESULTS TITLE HEADER */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0', letterSpacing: '-0.3px' }}>
          {filters.search ? `Results for "${filters.search}"` : filters.category ? `${filters.category.toUpperCase()} Collection` : 'Explore Fashion'}
        </h1>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
          {loading ? 'Searching products...' : `${products.length} ${products.length === 1 ? 'item' : 'items'} found`}
        </p>
      </div>

      {/* 2. MOBILE & DESKTOP SLIDE-OVER FILTER SIDEBAR / DRAWER */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                zIndex: 1000
              }}
            />

            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '100%', maxWidth: '380px',
                background: '#ffffff', zIndex: 1001,
                display: 'flex', flexDirection: 'column',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.15)'
              }}
            >
              {/* Drawer Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FilterListIcon sx={{ color: '#14327a', fontSize: '20px' }} />
                  <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>Filter Options</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshIcon sx={{ fontSize: '14px' }} /> Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setSidebarOpen(false)}
                    style={{ background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <CloseIcon sx={{ fontSize: '18px', color: '#334155' }} />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Gender */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Gender</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {[
                      { id: '', label: 'All Genders' },
                      { id: 'women', label: 'Women' },
                      { id: 'men', label: 'Men' },
                      { id: 'kids', label: 'Kids' }
                    ].map(g => {
                      const isActive = filters.gender === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => updateFilter('gender', g.id)}
                          style={{
                            padding: '10px', borderRadius: '8px',
                            background: isActive ? '#14327a' : '#f8fafc',
                            color: isActive ? '#ffffff' : '#334155',
                            border: `1.5px solid ${isActive ? '#14327a' : '#cbd5e1'}`,
                            fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'center'
                          }}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Category</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {categories.map(cat => {
                      const isActive = (filters.category || '').toLowerCase() === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => updateFilter('category', cat.id)}
                          style={{
                            padding: '6px 12px', borderRadius: '16px',
                            background: isActive ? '#14327a' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#475569',
                            border: `1px solid ${isActive ? '#14327a' : 'transparent'}`,
                            fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Price Range (₹)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                    <input
                      type="number" placeholder="Min ₹" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                    <span style={{ color: '#94a3b8' }}>—</span>
                    <input
                      type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Under ₹500', min: '', max: '500' },
                      { label: '₹500 - ₹1000', min: '500', max: '1000' },
                      { label: '₹1000 - ₹2500', min: '1000', max: '2500' },
                      { label: 'Above ₹2500', min: '2500', max: '' }
                    ].map(p => (
                      <button
                        key={p.label}
                        onClick={() => { updateFilter('minPrice', p.min); updateFilter('maxPrice', p.max); }}
                        style={{
                          padding: '4px 10px', borderRadius: '12px',
                          background: (filters.minPrice === p.min && filters.maxPrice === p.max) ? '#e0e7ff' : '#f8fafc',
                          color: (filters.minPrice === p.min && filters.maxPrice === p.max) ? '#14327a' : '#64748b',
                          border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Occasion</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {occasions.map(occ => {
                      const isActive = filters.occasion === occ;
                      return (
                        <button
                          key={occ}
                          onClick={() => updateFilter('occasion', isActive ? '' : occ)}
                          style={{
                            padding: '6px 12px', borderRadius: '16px',
                            background: isActive ? '#14327a' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#475569',
                            border: `1px solid ${isActive ? '#14327a' : 'transparent'}`,
                            fontSize: '12px', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer'
                          }}
                        >
                          {occ}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Style Tags</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['casual', 'formal', 'party', 'trendy', 'streetwear', 'minimalist'].map(tag => {
                      const isActive = filters.tags === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => updateFilter('tags', isActive ? '' : tag)}
                          style={{
                            padding: '6px 12px', borderRadius: '16px',
                            background: isActive ? '#14327a' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#475569',
                            border: `1px solid ${isActive ? '#14327a' : 'transparent'}`,
                            fontSize: '12px', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer'
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '10px',
                    background: '#14327a', color: '#ffffff', border: 'none',
                    fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 4px 14px rgba(20, 50, 122, 0.3)'
                  }}
                >
                  <CheckIcon sx={{ fontSize: '18px' }} /> Apply Filters ({products.length} Items)
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. PRODUCT GRID DISPLAY */}
      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="skeleton" style={{ height: '340px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} showButtons={false} />
          ))}
        </div>
      ) : (
        /* Empty Search Matches Handler - Two Separate Divs */
        <>
          {/* DIV 1: Empty Search Alert Card */}
          <div style={{
            textAlign: 'center',
            padding: '32px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: '28px'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              We couldn't find exact matches for "{filters.search || filters.category || 'your search'}"
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              Try checking spelling, clearing active filters, or check out these trending items below:
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={clearFilters} style={{ padding: '10px 18px', borderRadius: '8px', background: '#14327a', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                Clear All Filters
              </button>
              <button onClick={() => updateFilter('sort', '-createdAt')} style={{ padding: '10px 18px', borderRadius: '8px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                View Latest Trends
              </button>
            </div>
          </div>

          {/* DIV 2: Featured & Trending Items Section */}
          {recommendations.length > 0 && (
            <div style={{ marginTop: '8px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Featured & Trending Items
              </h3>
              <div className="product-grid">
                {recommendations.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} showButtons={false} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
        {/* 4. PICTURE 2: EXPLORE MORE RECOMMENDATIONS SECTION */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Explore More Recommendations
            </h2>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#2874f0', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: '16px' }}>
              CURATED FOR YOU ✨
            </span>
          </div>

          <div className="product-grid">
            {recommendations.map((p, i) => (
              <ProductCard key={`random-card-${p._id}-${i}`} product={p} index={i} showButtons={false} />
            ))}
          </div>
        </div>
      )}

      {/* 5. PICTURE 1: CATEGORIES CHIPS BAR (RENDERED DIRECTLY AFTER PICTURE 2 RECOMMENDATIONS) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        paddingBottom: '10px',
        marginTop: '16px',
        marginBottom: '16px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>

        {categories.map(cat => {
          const isActive = (filters.category || '').toLowerCase() === cat.id || (cat.id === 'saree' && (filters.search || '').toLowerCase().includes('saree'));
          return (
            <button
              key={`after-pic2-cat-${cat.id}`}
              onClick={() => updateFilter('category', cat.id)}
              style={{
                padding: '6px 14px', borderRadius: '18px',
                background: isActive ? '#14327a' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                border: `1.5px solid ${isActive ? '#14327a' : '#cbd5e1'}`,
                fontSize: '12px', fontWeight: isActive ? 800 : 600,
                cursor: 'pointer', flexShrink: 0,
                boxShadow: isActive ? '0 2px 8px rgba(20,50,122,0.25)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 6. CATEGORY FILTERED PRODUCTS DISPLAY SECTION (PRODUCTS AFTER CLICKING ANY CATEGORY) */}
      {products.length > 0 && (
        <div style={{ marginTop: '12px', marginBottom: '10px' }}>
          {filters.category && (
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                {categories.find(c => c.id === filters.category)?.label || filters.category.toUpperCase()} Collection ({products.length})
              </h3>
              <button
                onClick={() => updateFilter('category', '')}
                style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer' }}
              >
                Clear Category ✕
              </button>
            </div>
          )}
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={`filtered-cat-prod-${p._id}-${i}`} product={p} index={i} showButtons={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
