import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/index';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import Inventory2Icon from '@mui/icons-material/Inventory2Rounded';
import StyleIcon from '@mui/icons-material/StyleRounded';
import SellIcon from '@mui/icons-material/SellRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import TableChartIcon from '@mui/icons-material/TableChartRounded';
import toast from 'react-hot-toast';

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: '',
    gender: 'unisex',
    description: '',
    listingType: 'sale',
    rentPricePerDay: '',
    discountPercent: '',
  });

  const [colorList, setColorList] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [colorMedia, setColorMedia] = useState({}); // { "Blue": [File, File] }
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedWeather, setSelectedWeather] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizeStocks, setSizeStocks] = useState({}); // { 'S': 10, 'M': 5 }
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [existingProduct, setExistingProduct] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef(null);
  const { id } = useParams();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'

  const initialBulkRows = [
    { id: 1, name: 'Classic T-Shirt', sku: 'BLK-TS-S', category: 'shirt', price: '29.99', stock: '50', description: 'Premium cotton classic t-shirt' },
    { id: 2, name: 'Classic T-Shirt', sku: 'BLK-TS-M', category: 'shirt', price: '29.99', stock: '50', description: 'Premium cotton classic t-shirt' },
    { id: 3, name: 'Denim Jacket', sku: 'DNM-JK-L', category: 'jacket', price: '79.99', stock: '25', description: 'Vintage wash denim jacket' },
    { id: 4, name: 'Slim Fit Jeans', sku: 'SLM-JN-32', category: 'jeans', price: '49.99', stock: '40', description: 'Stretch denim slim fit jeans' },
    { id: 5, name: 'Leather Belt', sku: 'LTH-BLT-01', category: 'accessory', price: '19.99', stock: '100', description: 'Genuine leather belt' },
  ];

  const [bulkRows, setBulkRows] = useState(initialBulkRows);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkRowChange = (rowId, field, value) => {
    setBulkRows(prev => prev.map(row => row.id === rowId ? { ...row, [field]: value } : row));
  };

  const handleAddBulkRow = () => {
    const newId = bulkRows.length > 0 ? Math.max(...bulkRows.map(r => r.id)) + 1 : 1;
    setBulkRows(prev => [
      ...prev,
      { id: newId, name: '', sku: `SKU-${Date.now().toString().slice(-4)}`, category: 'shirt', price: '', stock: '10', description: '' }
    ]);
  };

  const handleDeleteBulkRow = (rowId) => {
    if (bulkRows.length <= 1) {
      toast.error('At least one row is required');
      return;
    }
    setBulkRows(prev => prev.filter(r => r.id !== rowId));
  };

  const handleResetBulk = () => {
    setBulkRows(initialBulkRows);
    toast.success('Form reset to initial state');
  };

  const handleSaveBulk = async () => {
    const validProducts = bulkRows.filter(r => r.name.trim() !== '' && !isNaN(parseFloat(r.price)));
    if (validProducts.length === 0) {
      toast.error('Please enter at least one valid product with name and price');
      return;
    }

    setBulkLoading(true);
    try {
      const res = await api.post('/seller/dashboard/products/bulk', { products: validProducts });
      toast.success(res.data.message || 'Products created successfully!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to bulk save products');
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEdit) {
      const loadProduct = async () => {
        setFetching(true);
        try {
          const res = await api.get(`/seller/dashboard/products/${id}`);
          const p = res.data.product;
          setExistingProduct(p);
          setFormData({
            name: p.name || '',
            brand: p.brand || '',
            category: p.category || '',
            price: p.price || '',
            discountPrice: p.discountPrice || '',
            stock: p.sizes?.reduce((a, s) => a + s.stock, 0) || 0,
            gender: p.gender || 'unisex',
            description: p.description || '',
            listingType: p.listingType || (p.isAvailableForRent ? 'sale_and_rent' : 'sale'),
            rentPricePerDay: p.rentPricePerDay || '',
            discountPercent: p.price && p.discountPrice 
              ? Math.round(((p.price - p.discountPrice) / p.price) * 100) 
              : '',
          });
          setColorList(p.colors || []);
          const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
          const filteredSizes = p.sizes?.filter(s => standardSizes.includes(s.size)) || [];
          setSelectedSizes(filteredSizes.map(s => s.size));
          setSelectedTags(p.tags || []);
          setSelectedOccasions(p.occasion || []);
          setSelectedWeather(p.weather || []);
          
          const stocks = {};
          filteredSizes.forEach(s => {
            stocks[s.size] = s.stock;
          });
          setSizeStocks(stocks);

          const media = {};
          p.colors?.forEach(c => media[c] = []);
          setColorMedia(media);
        } catch (err) {
          setError('Failed to load product for editing');
        } finally {
          setFetching(false);
        }
      };
      loadProduct();
    }
  }, [id]);

  function handleManualColorAdd() {
    if (colorInput.trim()) {
      const newColor = colorInput.trim();
      if (!colorList.includes(newColor)) {
        setColorList([...colorList, newColor]);
        setColorMedia({ ...colorMedia, [newColor]: [] });
      }
      setColorInput('');
    }
  }

  function handleColorAdd(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualColorAdd();
    }
  }

  const removeColor = (color) => {
    setColorList(colorList.filter(c => c !== color));
    const newMedia = { ...colorMedia };
    delete newMedia[color];
    setColorMedia(newMedia);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7); // 70% quality
        };
      };
    });
  };

  const handleColorMediaChange = async (color, e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const compressedFiles = await Promise.all(newFiles.map(file => compressImage(file)));
      
      setColorMedia({
        ...colorMedia,
        [color]: [...(colorMedia[color] || []), ...compressedFiles].slice(0, 4)
      });
    }
  };

  const removeColorFile = (color, index) => {
    const updatedFiles = [...colorMedia[color]];
    updatedFiles.splice(index, 1);
    setColorMedia({ ...colorMedia, [color]: updatedFiles });
  };

  const allClothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = ['6', '7', '8', '9', '10', '11', '12'];
  const jeansSizes = ['28', '30', '32', '34', '36', '38', '40'];
  const accessorySizes = ['One Size'];
  
  const getActiveSizes = () => {
    const cat = formData.category?.toLowerCase();
    if (cat === 'shoes') return shoeSizes;
    if (cat === 'jeans') return jeansSizes;
    if (cat === 'accessory' || cat === 'bag' || cat === 'jewelry') return accessorySizes;
    return allClothingSizes;
  };
  const activeSizes = getActiveSizes();
  const allTags = ['casual', 'formal', 'party', 'wedding', 'sporty', 'bohemian', 'streetwear', 'vintage', 'minimalist', 'trendy', 'classic', 'layering', 'semi-formal'];
  const allOccasions = ['office', 'wedding', 'party', 'date-night', 'casual', 'gym', 'beach', 'festival', 'interview'];
  const allWeather = ['hot', 'cold', 'mild', 'rainy', 'all-season'];

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(prev => prev.filter(s => s !== size));
      const newStocks = { ...sizeStocks };
      delete newStocks[size];
      setSizeStocks(newStocks);
    } else {
      setSelectedSizes(prev => [...prev, size]);
      setSizeStocks(prev => ({ ...prev, [size]: '' }));
    }
  };

  // Clear sizes if category changes between standard, shoes, jeans, and accessories
  useEffect(() => {
    const cat = formData.category?.toLowerCase();
    const isShoes = cat === 'shoes';
    const isJeans = cat === 'jeans';
    const isOneSize = cat === 'accessory' || cat === 'bag' || cat === 'jewelry';
    
    const hasClothing = selectedSizes.some(s => allClothingSizes.includes(s));
    const hasShoes = selectedSizes.some(s => shoeSizes.includes(s));
    const hasJeans = selectedSizes.some(s => jeansSizes.includes(s));
    const hasOneSize = selectedSizes.some(s => accessorySizes.includes(s));

    const mismatch = (isShoes && (hasClothing || hasJeans || hasOneSize)) ||
                     (isJeans && (hasClothing || hasShoes || hasOneSize)) ||
                     (isOneSize && (hasClothing || hasShoes || hasJeans)) ||
                     (!isShoes && !isJeans && !isOneSize && (hasShoes || hasJeans || hasOneSize));

    if (mismatch) {
      if (!fetching) {
        setSelectedSizes([]);
        setSizeStocks({});
      }
    }
  }, [formData.category]);

  const handleSizeStockChange = (size, value) => {
    setSizeStocks(prev => ({ ...prev, [size]: value }));
  };

  const toggleArrayItem = (item, setter) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === 'price' || name === 'discountPercent') {
      const basePrice = name === 'price' ? parseFloat(value) : parseFloat(formData.price);
      const percent = name === 'discountPercent' ? parseFloat(value) : parseFloat(formData.discountPercent);

      if (!isNaN(basePrice) && !isNaN(percent)) {
        const salePrice = basePrice - (basePrice * (percent / 100));
        newFormData.discountPrice = salePrice.toFixed(2);
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (colorList.length === 0) {
      setError('Please add at least one color variant.');
      return;
    }
    
    setLoading(true);
    setError('');

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    submitData.append('colors', JSON.stringify(colorList));
    submitData.append('tags', JSON.stringify(selectedTags));
    submitData.append('occasion', JSON.stringify(selectedOccasions));
    submitData.append('weather', JSON.stringify(selectedWeather));

    if (selectedSizes.length > 0) {
      const sizesData = selectedSizes.map(size => ({
        size,
        stock: parseInt(sizeStocks[size]) || 0
      }));
      submitData.append('sizes', JSON.stringify(sizesData));
    }

    // Append color-specific images
    colorList.forEach(color => {
      const filesForColor = colorMedia[color] || [];
      filesForColor.forEach(file => {
        submitData.append(`colorMedia_${color}`, file);
      });
    });

    try {
      if (isEdit) {
        await api.put(`/seller/dashboard/products/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Masterpiece updated successfully!');
      } else {
        await api.post('/seller/dashboard/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Masterpiece published successfully!');
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const inputStyles = {
    container: { display: 'grid', gap: '8px' },
    label: { fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginLeft: '4px' },
    field: {
      width: '100%', padding: '14px 18px', borderRadius: 'var(--radius-lg)',
      background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
      color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
      transition: 'all 0.3s ease',
    }
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: '0 clamp(12px, 3vw, 24px) 60px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '16px', marginTop: '0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-bg)', color: 'var(--accent-light)', fontSize: '9px', fontWeight: 800, marginBottom: '4px', letterSpacing: '0.5px' }}>
            <AutoAwesomeIcon sx={{ fontSize: 12 }} /> SELLER STUDIO
          </div>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '16px', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {isEdit ? 'Refine Your Product' : (activeTab === 'bulk' ? 'Bulk Quick-Add Catalog' : 'List Your Masterpiece')}
          </h1>

          {/* Top Product Mode Tabs (Matching Image 1) */}
          {!isEdit && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)', padding: '5px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)', flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  style={{
                    padding: '8px 18px', borderRadius: 'var(--radius-full)', border: 'none',
                    background: activeTab === 'single' ? 'var(--accent)' : 'transparent',
                    color: activeTab === 'single' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Add New Product
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bulk')}
                  style={{
                    padding: '8px 18px', borderRadius: 'var(--radius-full)', border: 'none',
                    background: activeTab === 'bulk' ? 'var(--accent)' : 'transparent',
                    color: activeTab === 'bulk' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <TableChartIcon sx={{ fontSize: 16 }} />
                  Bulk Quick-Add Grid {activeTab === 'bulk' && <span style={{ fontSize: '11px', opacity: 0.9 }}>(Active)</span>}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tab 1: Single Product Form (Image 2) */}
        {activeTab === 'single' && (
          <form onSubmit={handleSubmit} className="add-product-form">
            {/* Left Column: Media & Quick Stats */}
            <div className="add-product-media-col">
              {colorList.length === 0 ? (
                <motion.div variants={itemVariants} className="glass add-product-card-padding" style={{ borderRadius: 'var(--radius-xl)', textAlign: 'center', border: '2px dashed var(--border)' }}>
                  <Inventory2Icon sx={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Add colors to unlock media uploads</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Images are organized by color variant</p>
                </motion.div>
              ) : (
                colorList.map(color => (
                  <motion.div key={color} variants={itemVariants} className="glass add-product-card-padding" style={{ borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color.toLowerCase(), border: '1px solid var(--border)' }} />
                        <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{color} MEDIA</h3>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{colorMedia[color]?.length || 0}/4 IMAGES</span>
                    </div>

                    <div
                      onClick={() => document.getElementById(`file-input-${color}`).click()}
                      style={{
                        border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                        padding: '30px 10px', textAlign: 'center', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.01)', transition: 'all 0.3s',
                        marginBottom: '16px'
                      }}
                      className="hover-accent"
                    >
                      <input 
                        type="file" 
                        id={`file-input-${color}`}
                        onChange={(e) => handleColorMediaChange(color, e)} 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                        multiple 
                      />
                      <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: 'var(--accent-light)', marginBottom: '8px' }} />
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Upload for {color}</p>
                    </div>

                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: '8px' }}>
                      <AnimatePresence mode="popLayout">
                        {/* Show existing images from database */}
                        {existingProduct?.colorImages?.find(ci => ci.color === color)?.images?.map((url, i) => (
                          <motion.div key={`existing-${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', aspectRatio: '1', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '2px', left: '2px', background: 'var(--accent)', color: 'white', fontSize: '8px', padding: '2px 4px', borderRadius: '4px', fontWeight: 900 }}>EXISTING</div>
                          </motion.div>
                        ))}
                        
                        {/* Show new uploads */}
                        {(colorMedia[color] || []).map((file, i) => (
                          <motion.div key={`new-${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', aspectRatio: '1', overflow: 'hidden', border: '2px solid var(--accent)' }}>
                            <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => removeColorFile(color, i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                              <CloseIcon sx={{ fontSize: 10 }} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              )}

              <motion.div variants={itemVariants} className="glass add-product-card-padding" style={{ borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <AutoAwesomeIcon style={{ color: 'var(--accent)', fontSize: '20px' }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>AI-Ready Listing</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                      Your styling tags and weather data will help the AI Stylist recommend this product to the right customers.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Form Sections */}
            <div style={{ display: 'grid', gap: '30px', minWidth: 0 }}>
              {error && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '16px 24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '14px', fontWeight: 600 }}>
                  ⚠️ {error}
                </motion.div>
              )}

              {/* Section 1: Core Identity */}
              <motion.div variants={itemVariants} className="glass add-product-card-padding" style={{ borderRadius: 'var(--radius-xl)', position: 'relative', zIndex: isCategoryOpen ? 40 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                  <Inventory2Icon style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>PRODUCT IDENTITY</h3>
                </div>

                <div style={{ display: 'grid', gap: '24px' }}>
                  <div style={inputStyles.container}>
                    <label style={inputStyles.label}>Product Title</label>
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Midnight Silk Gala Gown" style={inputStyles.field} className="premium-input" />
                  </div>

                  <div className="add-product-grid-2col">
                    <div style={inputStyles.container}>
                      <label style={inputStyles.label}>Brand Name</label>
                      <input required name="brand" value={formData.brand} onChange={handleChange} placeholder="LUXEMODE" style={inputStyles.field} />
                    </div>
                    <div style={inputStyles.container}>
                      <label style={inputStyles.label}>Category Segment</label>
                      <div ref={categoryRef} style={{ position: 'relative', zIndex: 100 }}>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          required
                          tabIndex={-1}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                          onChange={() => {}}
                        />
                        <div
                          onClick={() => setIsCategoryOpen(prev => !prev)}
                          style={{
                            ...inputStyles.field,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none',
                            borderColor: isCategoryOpen ? 'var(--accent)' : 'var(--border)',
                            boxShadow: isCategoryOpen ? '0 0 0 2px rgba(201, 169, 110, 0.2)' : 'none',
                          }}
                        >
                          <span style={{ color: formData.category ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: formData.category ? 600 : 400 }}>
                            {formData.category
                              ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1)
                              : 'Select Category'}
                          </span>
                          <ExpandMoreIcon
                            style={{
                              fontSize: '20px',
                              color: isCategoryOpen ? 'var(--accent)' : 'var(--text-muted)',
                              transform: isCategoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease, color 0.3s ease',
                            }}
                          />
                        </div>

                        <AnimatePresence>
                          {isCategoryOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 6, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                background: '#ffffff',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
                                maxHeight: '220px',
                                overflowY: 'auto',
                                padding: '6px'
                              }}
                            >
                              {['dress', 'shirt', 'jeans', 'jacket', 'shoes', 'accessory', 'bag', 'jewelry'].map(c => {
                                const isSelected = formData.category === c;
                                return (
                                  <div
                                    key={c}
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, category: c }));
                                      setIsCategoryOpen(false);
                                    }}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: 'var(--radius-md)',
                                      fontSize: '13px',
                                      fontWeight: isSelected ? 700 : 500,
                                      color: isSelected ? 'white' : 'var(--text-primary)',
                                      background: isSelected ? 'var(--accent)' : 'transparent',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginBottom: '2px'
                                    }}
                                    onMouseEnter={e => {
                                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-secondary, #f5f0eb)';
                                    }}
                                    onMouseLeave={e => {
                                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                                    }}
                                  >
                                    <span>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                                    {isSelected && <CheckIcon sx={{ fontSize: 16, color: 'white' }} />}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="add-product-price-grid">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={inputStyles.container}>
                        <label style={inputStyles.label}>Base Price (₹)</label>
                        <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" style={inputStyles.field} />
                      </div>
                      <div style={inputStyles.container}>
                        <label style={inputStyles.label}>Discount (%)</label>
                        <input type="number" name="discountPercent" value={formData.discountPercent} onChange={handleChange} placeholder="0" style={inputStyles.field} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                      <div style={inputStyles.container}>
                        <label style={inputStyles.label}>Sale Price (₹)</label>
                        <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} placeholder="Auto-calculated" style={inputStyles.field} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Section 2: AI & Styling */}
              <motion.div variants={itemVariants} className="glass add-product-card-padding" style={{ borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                  <StyleIcon style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>STYLING ATTRIBUTES</h3>
                </div>

                <div style={{ display: 'grid', gap: '32px' }}>
                  <div style={inputStyles.container}>
                    <label style={inputStyles.label}>Product Variants (Colors)</label>
                    <div className="add-product-variant-input">
                      <input 
                        value={colorInput} 
                        onChange={(e) => setColorInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleManualColorAdd())}
                        placeholder="e.g. Navy, Silver, Gold" 
                        style={inputStyles.field} 
                      />
                      <button 
                        type="button"
                        onClick={handleManualColorAdd}
                        style={{ 
                          padding: '0 20px', borderRadius: 'var(--radius-md)', 
                          background: 'var(--accent-bg)', border: '1px solid rgba(168,85,247,0.3)', 
                          color: 'var(--accent-light)', fontWeight: 700, cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ADD VARIANT
                      </button>
                    </div>
                    
                    {colorList.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {colorList.map(color => (
                          <motion.span 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            key={color} 
                            style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '6px', 
                              padding: '6px 12px', borderRadius: 'var(--radius-md)', 
                              background: 'var(--accent-bg)', color: 'var(--accent-light)',
                              fontSize: '12px', fontWeight: 700, border: '1px solid var(--accent)'
                            }}
                          >
                            {color}
                            <CloseIcon 
                              onClick={() => removeColor(color)} 
                              sx={{ fontSize: 14, cursor: 'pointer', '&:hover': { color: 'white' } }} 
                            />
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={inputStyles.label}>Target Style Tags</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {allTags.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleArrayItem(tag, setSelectedTags)}
                          style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600,
                            background: selectedTags.includes(tag) ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.03)',
                            color: selectedTags.includes(tag) ? 'white' : 'var(--text-muted)',
                            border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: selectedTags.includes(tag) ? '0 4px 12px var(--accent-glow)' : 'none'
                          }}>{tag}</button>
                      ))}
                    </div>
                  </div>

                  <div className="add-product-grid-2col">
                    <div>
                      <label style={inputStyles.label}>Best Occasions</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {allOccasions.map(occ => (
                          <button key={occ} type="button" onClick={() => toggleArrayItem(occ, setSelectedOccasions)}
                            style={{
                              padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '11px', fontWeight: 600,
                              background: selectedOccasions.includes(occ) ? 'var(--accent-bg)' : 'transparent',
                              color: selectedOccasions.includes(occ) ? 'var(--accent-light)' : 'var(--text-muted)',
                              border: `1px solid ${selectedOccasions.includes(occ) ? 'var(--accent)' : 'var(--border)'}`,
                              cursor: 'pointer'
                            }}>{occ}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={inputStyles.label}>Weather Suitability</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {allWeather.map(w => (
                          <button key={w} type="button" onClick={() => toggleArrayItem(w, setSelectedWeather)}
                            style={{
                              padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '11px', fontWeight: 600,
                              background: selectedWeather.includes(w) ? 'var(--accent-bg)' : 'transparent',
                              color: selectedWeather.includes(w) ? 'var(--accent-light)' : 'var(--text-muted)',
                              border: `1px solid ${selectedWeather.includes(w) ? 'var(--accent)' : 'var(--border)'}`,
                              cursor: 'pointer'
                            }}>{w}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Section 3: Availability & Narrative */}
              <motion.div variants={itemVariants} className="glass add-product-card-padding" style={{ borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                  <SellIcon style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>LISTING LOGISTICS</h3>
                </div>

                <div style={{ display: 'grid', gap: '24px' }}>
                  <div className="add-product-grid-2col">
                    <div>
                      <label style={inputStyles.label}>Audience Segment</label>
                      <div className="add-product-toggle-group" style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', padding: '4px', border: '1px solid var(--border)', marginTop: '8px' }}>
                        {['men', 'women', 'kids', 'unisex'].map(g => (
                          <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })} style={{ flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: formData.gender === g ? 'var(--gradient-primary)' : 'transparent', color: formData.gender === g ? 'white' : 'var(--text-muted)', transition: 'all 0.2s', textTransform: 'uppercase' }}>{g}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={inputStyles.label}>Listing Model</label>
                      <div className="add-product-toggle-group" style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', padding: '4px', border: '1px solid var(--border)', marginTop: '8px' }}>
                        <button type="button" onClick={() => setFormData({ ...formData, listingType: 'sale' })} style={{ flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: formData.listingType === 'sale' ? 'var(--gradient-primary)' : 'transparent', color: formData.listingType === 'sale' ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>SALE ONLY</button>
                        <button type="button" onClick={() => setFormData({ ...formData, listingType: 'rent' })} style={{ flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: formData.listingType === 'rent' ? 'var(--gradient-primary)' : 'transparent', color: formData.listingType === 'rent' ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>RENT ONLY</button>
                        <button type="button" onClick={() => setFormData({ ...formData, listingType: 'sale_and_rent' })} style={{ flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: formData.listingType === 'sale_and_rent' ? 'var(--gradient-primary)' : 'transparent', color: formData.listingType === 'sale_and_rent' ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>SALE & RENT</button>
                      </div>

                      <AnimatePresence>
                        {(formData.listingType === 'rent' || formData.listingType === 'sale_and_rent') && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={inputStyles.container}>
                              <label style={inputStyles.label}>Rent Price Per Day (₹)</label>
                              <input type="number" name="rentPricePerDay" value={formData.rentPricePerDay} onChange={handleChange} placeholder="e.g. 499" style={inputStyles.field} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div style={inputStyles.container}>
                    <label style={inputStyles.label}>
                      Select Available {formData.category?.toLowerCase() === 'shoes' ? 'Footwear' : formData.category?.toLowerCase() === 'jeans' ? 'Waist' : 'Standard'} Sizes
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {activeSizes.map(size => (
                        <button key={size} type="button" onClick={() => toggleSize(size)} style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', background: selectedSizes.includes(size) ? 'var(--accent)' : 'rgba(255, 255, 255, 0.03)', color: selectedSizes.includes(size) ? 'white' : 'var(--text-primary)', border: `1px solid ${selectedSizes.includes(size) ? 'var(--accent)' : 'var(--border)'}`, fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>{size}</button>
                      ))}
                    </div>

                    {selectedSizes.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Set Stock for Selected Sizes</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--accent-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-light)' }}>TOTAL UNITS:</span>
                            <span style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>
                              {Object.values(sizeStocks).reduce((a, b) => a + (parseInt(b) || 0), 0)}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '12px' }}>
                          {selectedSizes.map(size => (
                            <div key={size} style={inputStyles.container}>
                              <label style={{ ...inputStyles.label, fontSize: '10px' }}>{size} Units</label>
                              <input 
                                type="number" 
                                value={sizeStocks[size] || ''} 
                                onChange={(e) => handleSizeStockChange(size, e.target.value)}
                                placeholder="0"
                                style={{ ...inputStyles.field, padding: '8px 10px', fontSize: '13px' }}
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div style={inputStyles.container}>
                    <label style={inputStyles.label}>Product Narrative</label>
                    <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Describe the soul of this piece... Fabric, fit, and feeling." rows="5" style={{ ...inputStyles.field, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="add-product-actions">
                <button type="button" onClick={() => navigate('/seller/products')} className="btn btn-outline" style={{ flex: 1, padding: '16px' }}>Discard Draft</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, padding: '16px', fontSize: '15px' }}>
                  {loading ? 'Processing Masterpiece...' : (isEdit ? 'Update Masterpiece' : 'Publish to Collection')}
                </button>
              </motion.div>
            </div>
          </form>
        )}

        {/* Tab 2: Bulk Quick-Add Grid (Image 1) */}
        {activeTab === 'bulk' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Bulk Quick-Add Grid</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Enter multiple products at once and save all in a single click.</p>
                </div>
              </div>

              {/* Editable Table Matching Image 1 */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: '#ffffff', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Product Name</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', width: '140px' }}>SKU</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', width: '150px' }}>Category</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', width: '110px' }}>Price (₹)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', width: '90px' }}>Stock</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Description</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#ef4444', width: '70px' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.map((row) => {
                      const isFilled = row.name.trim() !== '';
                      return (
                        <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <input
                              type="text"
                              value={row.name}
                              onChange={e => handleBulkRowChange(row.id, 'name', e.target.value)}
                              placeholder="e.g. Classic T-Shirt"
                              style={{
                                width: '100%', padding: '8px 12px', borderRadius: '8px',
                                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                                background: isFilled ? '#f0fdf4' : '#ffffff',
                                color: '#0f172a', transition: 'all 0.2s'
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <input
                              type="text"
                              value={row.sku}
                              onChange={e => handleBulkRowChange(row.id, 'sku', e.target.value)}
                              placeholder="SKU"
                              style={{
                                width: '100%', padding: '8px 12px', borderRadius: '8px',
                                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                                background: '#ffffff', color: '#0f172a'
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <select
                              value={row.category}
                              onChange={e => handleBulkRowChange(row.id, 'category', e.target.value)}
                              style={{
                                width: '100%', padding: '8px 12px', borderRadius: '8px',
                                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                                background: '#f8fafc', color: '#0f172a'
                              }}
                            >
                              {['shirt', 'dress', 'jeans', 'jacket', 'shoes', 'accessory', 'bag', 'jewelry'].map(c => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <input
                              type="number"
                              value={row.price}
                              onChange={e => handleBulkRowChange(row.id, 'price', e.target.value)}
                              placeholder="0.00"
                              style={{
                                width: '100%', padding: '8px 12px', borderRadius: '8px',
                                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                                background: isFilled ? '#f0fdf4' : '#ffffff', color: '#0f172a'
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <input
                              type="number"
                              value={row.stock}
                              onChange={e => handleBulkRowChange(row.id, 'stock', e.target.value)}
                              placeholder="0"
                              style={{
                                width: '100%', padding: '8px 12px', borderRadius: '8px',
                                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                                background: '#ffffff', color: '#0f172a'
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <input
                              type="text"
                              value={row.description}
                              onChange={e => handleBulkRowChange(row.id, 'description', e.target.value)}
                              placeholder="Enter your product description here"
                              style={{
                                width: '100%', padding: '8px 12px', borderRadius: '8px',
                                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                                background: '#ffffff', color: '#0f172a'
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteBulkRow(row.id)}
                              style={{
                                background: 'transparent', border: 'none', color: '#ef4444',
                                cursor: 'pointer', padding: '6px', borderRadius: '6px',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                              }}
                              title="Delete Row"
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Actions matching Image 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleSaveBulk}
                  disabled={bulkLoading}
                  style={{
                    padding: '12px 24px', borderRadius: '8px', border: 'none',
                    background: 'var(--accent)', color: '#ffffff', fontWeight: 700,
                    fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px var(--accent-glow)',
                    transition: 'all 0.2s', opacity: bulkLoading ? 0.7 : 1
                  }}
                >
                  {bulkLoading ? 'Saving Products...' : 'Save All Products'}
                </button>

                <button
                  type="button"
                  onClick={handleAddBulkRow}
                  style={{
                    padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--border)',
                    background: '#ffffff', color: 'var(--text-primary)', fontWeight: 700,
                    fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    gap: '6px', transition: 'all 0.2s'
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                  Add Another Row
                </button>

                <button
                  type="button"
                  onClick={handleResetBulk}
                  style={{
                    padding: '12px 16px', borderRadius: '8px', border: 'none',
                    background: 'transparent', color: 'var(--accent)', fontWeight: 600,
                    fontSize: '13px', cursor: 'pointer', textDecoration: 'underline'
                  }}
                >
                  Reset Form
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </motion.div>

      <style>{`
        .glass {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }
        .add-product-form {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 40px;
          align-items: start;
        }
        .add-product-media-col {
          display: grid;
          gap: 30px;
          position: sticky;
          top: 100px;
          max-height: 80vh;
          overflow-y: auto;
          padding-right: 10px;
        }
        .add-product-card-padding {
          padding: 40px;
        }
        .add-product-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .add-product-price-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .add-product-variant-input {
          display: flex;
          gap: 10px;
        }
        .add-product-actions {
          display: flex;
          gap: 20px;
          padding-top: 20px;
        }
        .premium-input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 20px var(--accent-glow) !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .hover-accent:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 0 30px var(--accent-glow);
        }
        @media (max-width: 1024px) {
          .add-product-form {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .add-product-media-col {
            position: relative !important;
            top: 0 !important;
            max-height: none !important;
            padding-right: 0 !important;
          }
        }
        @media (max-width: 768px) {
          .add-product-card-padding {
            padding: 24px !important;
          }
          .add-product-grid-2col {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 550px) {
          .add-product-card-padding {
            padding: 16px !important;
          }
          .add-product-price-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .add-product-variant-input {
            flex-direction: column !important;
          }
          .add-product-variant-input button {
            width: 100% !important;
            padding: 12px !important;
          }
          .add-product-actions {
            flex-direction: column-reverse !important;
            gap: 12px !important;
          }
          .add-product-actions button {
            width: 100% !important;
            flex: none !important;
          }
        }
      `}</style>
    </div>
  );
}
