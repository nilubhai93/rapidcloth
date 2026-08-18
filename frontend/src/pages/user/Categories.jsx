import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { productAPI } from '../../api';
import SearchIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useNavigate } from 'react-router-dom';

export default function Categories() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products to populate the grids
    productAPI.getAll({ limit: 20 }).then(res => {
      setProducts(res.data.products || []);
    }).catch(console.error);
  }, []);

  const dressTypes = [
    { name: 'T-Shirts', img: '/images/trending_look_1.png', link: '/products?category=tshirts' },
    { name: 'Shirts', img: '/images/hero_banner_2.png', link: '/products?category=shirts' },
    { name: 'Jeans', img: '/images/trending_look_2.png', link: '/products?category=jeans' },
    { name: 'Dresses', img: '/images/hero_banner_1.png', link: '/products?category=dresses' },
    { name: 'Sarees', img: '/images/offer_banner.png', link: '/products?category=sarees' },
    { name: 'Kids Wear', img: '/images/product_handbag.png', link: '/products?category=kids' },
    { name: 'Winter', img: '/images/trending_look_1.png', link: '/products?category=winter' },
    { name: 'Shoes', img: '/images/hero_banner_2.png', link: '/products?category=shoes' },
  ];

  const genders = [
    { name: 'Men', img: '/images/trending_look_1.png', link: '/products?gender=men', color: 'from-blue-600 to-blue-400' },
    { name: 'Women', img: '/images/hero_banner_1.png', link: '/products?gender=women', color: 'from-pink-600 to-rose-400' },
    { name: 'Kids', img: '/images/product_handbag.png', link: '/products?gender=kids', color: 'from-green-500 to-emerald-400' },
  ];

  const sections = [
    { title: '1. For You', items: products.slice(0, 4) },
    { title: '2. Trending Items', items: products.slice(4, 8) },
    { title: '3. Special Deals Items', items: products.slice(8, 12) },
    { title: '4. Special Discount Items', items: products.slice(12, 16) }
  ];

  return (
    <div className="bg-[#f0f2f5] min-h-screen pb-[80px] w-full font-sans">
      
      {/* Top Navbar */}
      <div className="bg-[#f0f2f5] px-4 pt-4 pb-2 sticky top-0 z-50 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-black/5 flex-shrink-0 transition-colors">
          <ArrowBackRoundedIcon className="text-slate-800" />
        </button>
        <div className="bg-white rounded-full flex items-center px-4 py-2.5 shadow-sm flex-1 border border-slate-200">
          <SearchIcon className="text-slate-400 mr-2" fontSize="small" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="bg-transparent border-none outline-none flex-1 text-[13px] font-medium text-slate-700 placeholder-slate-400 w-full"
          />
        </div>
        <Link to="/cart" className="p-2 -mr-2 rounded-full hover:bg-black/5 flex-shrink-0 transition-colors relative">
          <ShoppingCartOutlinedIcon className="text-slate-800" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#f0f2f5]"></span>
        </Link>
      </div>

      <div className="px-4 py-6 flex flex-col gap-8">
        
        {/* Dress Types - Small Boxes Grid */}
        <section>
          <h2 className="text-[16px] font-bold text-slate-800 mb-4">Dress Types</h2>
          <div className="grid grid-cols-4 gap-3">
            {dressTypes.map((type, idx) => (
              <Link key={idx} to={type.link} className="flex flex-col items-center gap-2 text-decoration-none group">
                <div className="w-[70px] h-[70px] rounded-2xl bg-white shadow-sm overflow-hidden border border-slate-100 group-hover:shadow-md transition-shadow relative">
                  <img src={type.img} alt={type.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">{type.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Gender Selection - Single Row */}
        <section>
          <h2 className="text-[16px] font-bold text-slate-800 mb-4">Shop by Gender</h2>
          <div className="grid grid-cols-3 gap-3">
            {genders.map((gender, idx) => (
              <Link key={idx} to={gender.link} className="text-decoration-none">
                <div className="h-[120px] rounded-xl overflow-hidden relative shadow-sm">
                  <img src={gender.img} alt={gender.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${gender.color} opacity-80 mix-blend-multiply`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-lg tracking-wide drop-shadow-md">{gender.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Product Sections (2-column Grids) */}
        {sections.map((section, idx) => (
          <section key={idx}>
            <div className="bg-white rounded-[12px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col min-h-[380px]">
              <h2 className="text-[18px] font-bold mb-4 text-slate-900">{section.title}</h2>
              
              <div className="grid grid-cols-2 gap-3 flex-1">
                {section.items && section.items.length > 0 ? (
                  section.items.map(product => (
                    <Link key={product._id} to={`/products/${product._id}`} className="text-decoration-none block">
                      <div className="bg-[#f8f8f8] rounded-md overflow-hidden h-[110px] relative">
                        <img 
                          src={product.images?.[0] || '/images/placeholder.png'} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                        {product.name}
                      </p>
                      <p className="text-[12px] font-bold text-slate-800">
                        ₹{product.discountPrice || product.price}
                      </p>
                    </Link>
                  ))
                ) : (
                  /* Fallback Static Cards if API fails or is slow */
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="block">
                      <div className="bg-slate-100 rounded-md overflow-hidden h-[110px] animate-pulse"></div>
                      <div className="h-3 bg-slate-200 rounded w-3/4 mt-2 animate-pulse"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2 mt-1 animate-pulse"></div>
                    </div>
                  ))
                )}
              </div>
              
              <Link to="/products" className="text-blue-600 font-semibold text-[13px] mt-4 text-decoration-none">
                Explore more →
              </Link>
            </div>
          </section>
        ))}

      </div>
    </div>
  );
}
