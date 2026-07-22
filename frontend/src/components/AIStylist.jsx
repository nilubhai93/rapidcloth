import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { aiAPI, tryOnAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SendIcon from '@mui/icons-material/SendRounded';
import ImageIcon from '@mui/icons-material/ImageRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUploadRounded';
import DownloadIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';

export default function AIStylist() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat'); // 'chat' or 'try-on'
  
  // Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Stylist ✨ Tell me about your occasion, mood, or upload a photo of something you own — I'll find the perfect match!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Try-On State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [bodyType, setBodyType] = useState('Average');
  const [userPhoto, setUserPhoto] = useState(null); // base64 string
  const [generating, setGenerating] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [loadingText, setLoadingText] = useState("Stitching your virtual outfit...");

  // Socket State
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);

  // Loading texts array to cycle through
  const loadingTexts = [
    "Stitching your virtual outfit...",
    "Adjusting garment fit...",
    "Analyzing body dimensions...",
    "Draping fabric textures...",
    "Optimizing lighting & shadows...",
    "Finalizing try-on details..."
  ];

  // Socket.io initialization
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';

    const s = io(socketUrl, {
      autoConnect: false,
      reconnectionAttempts: 5
    });

    s.on('connect', () => {
      console.log('🔌 Connected to socket server. ID:', s.id);
      setSocketId(s.id);
    });

    s.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setSocketId(null);
    });

    s.on('try-on-result', (data) => {
      console.log('✨ Received try-on result:', data);
      setGenerating(false);
      if (data.success) {
        setResultImage(data.imageUrl);
      } else {
        alert(data.error || 'Failed to stitch outfit. Please try again.');
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Connect socket when panel is open
  useEffect(() => {
    if (socket) {
      if (open) {
        socket.connect();
      } else {
        socket.disconnect();
      }
    }
  }, [open, socket]);

  // Load saved user metrics when Try-On panel is opened
  useEffect(() => {
    if (isAuthenticated && open && tab === 'try-on') {
      tryOnAPI.getMetrics()
        .then(res => {
          if (res.data) {
            setHeight(res.data.height || '');
            setWeight(res.data.weight || '');
            setAge(res.data.age || '');
            setBodyType(res.data.bodyType || 'Average');
          }
        })
        .catch(err => {
          console.log('No pre-saved metrics found:', err.message);
        });
    }
  }, [isAuthenticated, open, tab]);

  // Listen to open-try-on custom event from other pages (e.g. ProductDetail)
  useEffect(() => {
    const handleOpenTryOn = (e) => {
      const { product } = e.detail;
      setSelectedProduct(product);
      setResultImage(null);
      setUserPhoto(null); // Clear previous uploaded photo automatically
      setInput('');       // Clear previous text input automatically
      setTab('try-on');
      setOpen(true);
    };

    window.addEventListener('open-try-on', handleOpenTryOn);
    return () => window.removeEventListener('open-try-on', handleOpenTryOn);
  }, []);

  // Cycle loading messages during VTON generation
  useEffect(() => {
    let interval;
    if (generating) {
      let index = 0;
      setLoadingText(loadingTexts[0]);
      interval = setInterval(() => {
        index = (index + 1) % loadingTexts.length;
        setLoadingText(loadingTexts[index]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [generating]);

  // Close AI stylist when clicking on categories or products in the main shop
  useEffect(() => {
    if (open) {
      const handleNav = () => setOpen(false);
      window.addEventListener('popstate', handleNav);
      return () => window.removeEventListener('popstate', handleNav);
    }
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('ai') === 'true') {
      setOpen(true);
    }
  }, [location.search]);

  // Chat message submission
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Optimize by sending product context if styling is active
      const messageWithContext = selectedProduct 
        ? `${userMsg} (in context of styling item: ${selectedProduct.name} by ${selectedProduct.brand || 'brand'}, category: ${selectedProduct.category || 'clothes'})`
        : userMsg;

      const res = await aiAPI.recommend({ message: messageWithContext });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.message || "Here are some suggestions for you!",
        products: res.data.products,
        sizeMapping: res.data.sizeMapping,
        bundle: res.data.bundle
      }]);
      if (res.data.products?.length) setProducts(res.data.products);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Try one of these quick queries: 'party outfit', 'office wear', or 'casual weekend look'!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      setMessages(prev => [...prev, {
        role: 'user',
        content: '📸 Uploaded an image for style matching',
        isImage: true
      }]);
      setLoading(true);

      try {
        const res = await aiAPI.recommend({
          message: 'What matches this outfit piece?',
          imageBase64: base64
        });
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.data.message || "Here's what I found to match your item!",
          products: res.data.products,
          imageAnalysis: res.data.imageAnalysis
        }]);
      } catch {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I couldn't analyze that image right now. Try describing the item instead!"
        }]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Try-on photo upload handler
  const handleTryOnPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUserPhoto(reader.result); // Base64 string including mime type
    };
    reader.readAsDataURL(file);
  };

  // Submit try-on request
  const handleTryOnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !userPhoto || !height || !weight || !age || !bodyType) {
      alert('Please fill in all physical dimensions and upload your photo.');
      return;
    }

    setGenerating(true);
    setResultImage(null);

    const garmentUrl = selectedProduct.images?.[0] || selectedProduct.image;

    try {
      await tryOnAPI.generate({
        garmentUrl,
        userPhoto,
        height: Number(height),
        weight: Number(weight),
        age: Number(age),
        bodyType,
        socketId: socketId || socket?.id
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to start outfit stitching. Please try again.');
      setGenerating(false);
    }
  };

  // Download generated virtual try-on outfit
  const handleDownloadImage = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapidcloth-virtual-outfit-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Direct download failed due to CORS, opening image in new window:', err);
      window.open(resultImage, '_blank');
    }
  };

  const getQuickPrompts = () => {
    if (selectedProduct) {
      return [
        `🎨 What colors match this ${selectedProduct.name}?`,
        `👜 Suggest matching items for this ${selectedProduct.category || 'outfit'}`,
        `👟 What shoes match this?`,
        `👔 Is this suitable for ${selectedProduct.occasion?.[0] || 'formal events'}?`
      ];
    }
    return [
      "🎉 Party outfit for tonight",
      "💼 Office wear under ₹3000",
      "🌧️ Rainy day outfit",
      "💍 Wedding guest look",
      "👟 Casual weekend",
      "I wear Levi's 32 jeans"
    ];
  };

  if (location.pathname === '/') return null;

  return (
    <>
      {/* FAB Button */}
      <motion.button
        id="ai-stylist-fab"
        onClick={() => setOpen(!open)}
        animate={{ 
          boxShadow: open ? 'none' : '0 0 30px rgba(168, 85, 247, 0.4)',
          y: open ? 0 : [0, -5, 0]
        }}
        transition={{ y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
        style={{
          position: 'fixed',
          bottom: '100px', right: '20px',
          width: '56px', height: '56px',
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          color: 'white',
          display: open ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 1001,
          cursor: 'pointer',
          border: 'none',
          boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4)'
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />
      </motion.button>

      {/* Main Panel and Overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Click-away Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'transparent'
              }}
            />
            {/* Chat/Try-On Panel */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                width: tab === 'try-on' ? '500px' : '400px'
              }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22, stiffness: 120 }}
              style={{
                position: 'fixed',
                bottom: '100px', right: '20px',
                maxWidth: 'calc(100vw - 40px)',
                height: '630px', maxHeight: 'calc(100vh - 120px)',
                borderRadius: '24px',
                background: '#fcf8f2',
                border: '1px solid #ebdcd0',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 1001,
                boxShadow: '0 25px 60px rgba(90,18,58,0.15)'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #4d1033 0%, #9d1752 100%)',
                borderBottom: '1px solid #ebdcd0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Gold Star Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ebd09e, #c59d5f)',
                    display: 'flex', alignItems: 'center', justify: 'center',
                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}>
                    <AutoAwesomeIcon sx={{ fontSize: 18, color: '#4d1033' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>
                      AI Stylist & Try-On
                    </div>
                    <div style={{ fontSize: '11px', color: '#a3f3a8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a3f3a8' }} />
                      Try-On Engine Active
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => { setMessages([messages[0]]); setProducts([]); }}
                    style={{ border: 'none', cursor: 'pointer', background: 'transparent', outline: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: '18px' }} />
                  </button>
                  <button onClick={() => setOpen(false)}
                    style={{ border: 'none', cursor: 'pointer', background: 'transparent', outline: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}
                  >
                    <CloseIcon sx={{ fontSize: '18px' }} />
                  </button>
                </div>
              </div>

              {/* Tabs Toggle (Outside Header) */}
              <div style={{
                padding: '16px 20px 8px',
                background: '#fcf8f2'
              }}>
                <div style={{
                  display: 'flex',
                  background: '#f0e2ec',
                  padding: '4px',
                  borderRadius: '12px',
                  border: '1px solid #ebdbe4',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <button 
                    onClick={() => setTab('chat')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontSize: '12px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: tab === 'chat' ? '#5c1642' : 'transparent',
                      color: tab === 'chat' ? 'white' : '#7a4b67',
                      boxShadow: tab === 'chat' ? '0 4px 12px rgba(90,18,58,0.25)' : 'none'
                    }}
                  >
                    ✦ Style Chat
                  </button>
                  <button 
                    onClick={() => setTab('try-on')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontSize: '12px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: tab === 'try-on' ? '#5c1642' : 'transparent',
                      color: tab === 'try-on' ? 'white' : '#7a4b67',
                      boxShadow: tab === 'try-on' ? '0 4px 12px rgba(90,18,58,0.25)' : 'none'
                    }}
                  >
                    👗 Virtual Try-On
                  </button>
                </div>
              </div>

              {/* Chat View Tab */}
              {tab === 'chat' && (
                <>
                  {/* Styling Context Bar */}
                  {selectedProduct && (
                    <div style={{
                      margin: '12px 16px 0',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'white',
                      border: '1.5px solid #ebdcd0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      color: '#2e0b1d'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5c1642', animation: 'pulse 1s infinite alternate' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Styling: <strong style={{ color: '#5c1642', fontWeight: 800 }}>{selectedProduct.name}</strong>
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                        <button 
                          onClick={() => setTab('try-on')}
                          style={{ color: '#5c1642', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '11px' }}
                        >
                          Try On 👗
                        </button>
                        <button 
                          onClick={() => setSelectedProduct(null)}
                          style={{ color: '#9c8e96', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '11px' }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div style={{
                    flex: 1, overflowY: 'auto', padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: '12px'
                  }}>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '85%'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          gap: '4px'
                        }}>
                          {msg.role === 'assistant' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#c59d5f', marginLeft: '4px', marginBottom: '2px' }}>
                              <AutoAwesomeIcon sx={{ fontSize: 12, color: '#5c1642' }} /> AI STYLIST
                            </div>
                          )}
                          <div style={{
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user'
                              ? '16px 16px 4px 16px'
                              : '16px 16px 16px 4px',
                            background: msg.role === 'user'
                              ? 'linear-gradient(135deg, #5c1642 0%, #801d59 100%)'
                              : 'white',
                            border: msg.role === 'user' ? 'none' : '1px solid #ebdcd0',
                            color: msg.role === 'user' ? 'white' : '#2e0b1d',
                            fontSize: '13px', lineHeight: 1.5,
                            boxShadow: msg.role === 'user' ? '0 4px 15px rgba(92, 22, 66, 0.15)' : 'none'
                          }}>
                            {msg.content}
                          </div>
                        </div>

                        {/* Inline Product Cards */}
                        {msg.products?.length > 0 && (
                          <div style={{
                            marginTop: '8px',
                            display: 'flex', gap: '10px',
                            overflowX: 'auto', paddingBottom: '6px'
                          }}>
                            {msg.products.slice(0, 4).map(p => (
                              <div
                                key={p._id}
                                style={{
                                  width: '140px',
                                  display: 'flex', flexDirection: 'column',
                                  borderRadius: '12px',
                                  border: '1.5px solid #ebdcd0',
                                  background: 'white',
                                  overflow: 'hidden',
                                  flexShrink: 0
                                }}
                              >
                                <a href={`/products/${p._id}`}>
                                  <img
                                    src={p.images?.[0] || 'https://placehold.co/120x120/1a1a25/9a9ab0?text=No+Image'}
                                    alt={p.name}
                                    style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                  />
                                </a>
                                <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{
                                      fontSize: '9px',
                                      fontWeight: 800,
                                      display: 'inline-block',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: p.matchScore === 100 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                      color: p.matchScore === 100 ? '#22c55e' : '#eab308',
                                      marginBottom: '4px'
                                    }}>
                                      {p.matchScore}% {p.matchScore === 100 ? 'Match' : 'Similar'}
                                    </div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2e0b1d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {p.name}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#5c1642' }}>
                                      ₹{p.discountPrice || p.price}
                                    </span>
                                    <button 
                                      onClick={() => {
                                        setSelectedProduct(p);
                                        setResultImage(null);
                                        setTab('try-on');
                                      }}
                                      style={{
                                        fontSize: '9px',
                                        fontWeight: 800,
                                        color: '#5c1642',
                                        background: '#f0e2ec',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        cursor: 'pointer'
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = '#ecdbe5'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f0e2ec'; }}
                                    >
                                      Try On 👗
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Size Mapping Result */}
                        {msg.sizeMapping?.found && (
                          <div style={{
                            marginTop: '8px', padding: '12px',
                            borderRadius: '12px',
                            background: 'rgba(34, 197, 94, 0.08)',
                            border: '1.5px solid rgba(34, 197, 94, 0.2)',
                            fontSize: '12px', color: '#15803d',
                            lineHeight: 1.5
                          }}>
                            <strong>Smart Fit Recommendation:</strong><br />
                            {msg.sizeMapping.referenceBrand} {msg.sizeMapping.referenceSize} → Recommended: <strong style={{ textDecoration: 'underline' }}>{msg.sizeMapping.ourSize}</strong><br />
                            <span style={{ color: '#166534', fontSize: '11px' }}>{msg.sizeMapping.fitNotes}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {loading && (
                      <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '6px', padding: '16px' }}>
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                            style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: '#5c1642'
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Prompts */}
                  {messages.length <= 2 && (
                    <div style={{
                      padding: '0 16px 8px',
                      display: 'flex', flexWrap: 'wrap', gap: '6px'
                    }}>
                      {getQuickPrompts().map(prompt => (
                        <button key={prompt} onClick={() => {
                          setInput(prompt);
                          setTimeout(() => {
                            document.getElementById('ai-send-btn')?.click();
                          }, 50);
                        }}
                          style={{
                            padding: '6px 12px', borderRadius: '9999px',
                            background: 'white', border: '1.5px solid #ebdcd0',
                            color: '#5a4f56', fontSize: '11px', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5c1642'; e.currentTarget.style.color = '#5c1642'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ebdcd0'; e.currentTarget.style.color = '#5a4f56'; }}
                        >{prompt}</button>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid #ebdcd0',
                    display: 'flex', gap: '8px', alignItems: 'center',
                    background: 'white'
                  }}>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden
                      onChange={handleImageUpload} />
                    <button onClick={() => fileInputRef.current?.click()} style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#7a5e6d', background: '#f5f0eb',
                      border: 'none', cursor: 'pointer', flexShrink: 0
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#ecdbe5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#f5f0eb'}
                    >
                      <ImageIcon sx={{ fontSize: '20px', color: '#5c1642' }} />
                    </button>
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Ask about matching items, fit size, styling details..."
                      style={{
                        flex: 1, padding: '10px 16px',
                        borderRadius: '9999px',
                        background: '#fcf8f2', border: '1.5px solid #ebdcd0',
                        color: '#2e0b1d', fontSize: '12px', outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      className="chat-input"
                    />
                    <motion.button
                      id="ai-send-btn"
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: input.trim() ? 'linear-gradient(135deg, #5c1642 0%, #801d59 100%)' : '#f5f0eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: input.trim() ? 'white' : '#9c8e96', flexShrink: 0,
                        border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                        boxShadow: input.trim() ? '0 4px 10px rgba(92, 22, 66, 0.2)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <SendIcon sx={{ fontSize: '16px', color: input.trim() ? 'white' : '#9c8e96' }} />
                    </motion.button>
                  </div>
                </>
              )}

              {/* Try-On View Tab */}
              {tab === 'try-on' && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fcf8f2',
                  color: '#2e0b1d',
                  overflowY: 'auto'
                }}>
                  {!selectedProduct ? (
                    /* No Garment Selected State */
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '40px 24px',
                      height: '100%'
                    }}>
                      <div style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        border: '2px dashed #c59d5f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        background: '#faf4eb'
                      }}>
                        <div style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #fcece3, #ebd4c5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <AutoAwesomeIcon sx={{ fontSize: 28, color: '#5c1642' }} />
                        </div>
                      </div>
                      
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#2e0b1d',
                        margin: '0 0 10px 0'
                      }}>
                        No Garment Selected
                      </h3>
                      
                      <p style={{
                        fontSize: '12px',
                        color: '#7a5e6d',
                        maxWidth: '260px',
                        margin: '0 0 24px 0',
                        lineHeight: 1.6
                      }}>
                        Browse our collections and tap the <strong style={{ color: '#5c1642' }}>Try On 👗</strong> button on any item to visualize it on yourself instantly.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          window.location.href = '/shop';
                        }}
                        style={{
                          backgroundColor: '#5c1642',
                          backgroundImage: 'linear-gradient(135deg, #5c1642 0%, #801d59 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '13px',
                          padding: '12px 28px',
                          borderRadius: '9999px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(92, 22, 66, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        🔍 Explore Shop
                      </button>
                    </div>
                  ) : generating ? (
                    /* Stitch Loading State */
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px',
                      height: '100%',
                      gap: '24px'
                    }}>
                      <div style={{ position: 'relative', width: '96px', height: '96px' }}>
                        {/* Shimmer/Pulse Ambient Ring */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          border: '4px solid rgba(92, 22, 66, 0.08)',
                          animation: 'pulse 1.8s infinite ease-in-out'
                        }} />
                        {/* Rotating Spinner */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          border: '4px solid transparent',
                          borderTopColor: '#5c1642',
                          borderRightColor: '#c59d5f',
                          animation: 'spin 1s infinite linear'
                        }} />
                        {/* Sparkle Centered */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <AutoAwesomeIcon sx={{ fontSize: 28, color: '#ebd09e', animation: 'pulse 1s infinite alternate' }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          color: '#2e0b1d',
                          letterSpacing: '0.3px',
                          margin: 0
                        }}>
                          {loadingText}
                        </h4>
                        <p style={{
                          fontSize: '11px',
                          color: '#7a5e6d',
                          maxWidth: '280px',
                          lineHeight: 1.6,
                          margin: '0 auto'
                        }}>
                          Our AI stitching algorithm is rendering this garment onto your model photo. This takes approximately 15-20 seconds...
                        </p>
                      </div>
                    </div>
                  ) : resultImage ? (
                    /* Try-On Result Side-by-Side View */
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '20px',
                      gap: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#eefcf0',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #d1fad7'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 16 }} />
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>
                            Outfit stitched successfully!
                          </span>
                        </div>
                        <button 
                          onClick={() => setResultImage(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            color: '#5c1642',
                            fontWeight: 800,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#7a1e58'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#5c1642'}
                        >
                          <RefreshIcon sx={{ fontSize: 14 }} /> Adjust Fit
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#7a5e6d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Original Garment
                          </span>
                          <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1.5px solid #ebdcd0',
                            backgroundColor: 'white',
                            aspectRatio: '3/4',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                          }}>
                            <img 
                              src={selectedProduct.images?.[0] || selectedProduct.image} 
                              alt="Original garment" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#5c1642', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Your Try-On
                          </span>
                          <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '2px solid #5c1642',
                            backgroundColor: 'white',
                            aspectRatio: '3/4',
                            boxShadow: '0 4px 15px rgba(92,22,66,0.15)'
                          }}>
                            <img 
                              src={resultImage} 
                              alt="Generated fit" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', paddingTop: '10px' }}>
                        <button
                          onClick={() => {
                            setSelectedProduct(null);
                            setResultImage(null);
                          }}
                          style={{
                            flex: 1,
                            padding: '12px 0',
                            fontSize: '12px',
                            fontWeight: 700,
                            borderRadius: '12px',
                            border: '1.5px solid #ebdcd0',
                            backgroundColor: 'white',
                            color: '#5a4f56',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5c1642'; e.currentTarget.style.color = '#5c1642'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ebdcd0'; e.currentTarget.style.color = '#5a4f56'; }}
                        >
                          Try Another Product
                        </button>
                        <button
                          onClick={handleDownloadImage}
                          style={{
                            flex: 1,
                            padding: '12px 0',
                            fontSize: '12px',
                            fontWeight: 700,
                            borderRadius: '12px',
                            border: 'none',
                            backgroundImage: 'linear-gradient(135deg, #5c1642 0%, #801d59 100%)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(92, 22, 66, 0.2)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 16px rgba(92, 22, 66, 0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 22, 66, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <DownloadIcon sx={{ fontSize: 16 }} /> Download Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Try-On Form */
                    <form onSubmit={handleTryOnSubmit} style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      padding: '20px'
                    }}>
                      {/* Selected Product Card */}
                      <div style={{
                        display: 'flex',
                        gap: '14px',
                        padding: '12px',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1.5px solid #ebdcd0',
                        alignItems: 'center'
                      }}>
                        <img 
                          src={selectedProduct.images?.[0] || selectedProduct.image} 
                          alt={selectedProduct.name} 
                          style={{
                            width: '56px',
                            height: '70px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #ebdcd0'
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#c59d5f', letterSpacing: '0.5px' }}>
                            {selectedProduct.brand?.toUpperCase() || 'LUXURY APPAREL'}
                          </span>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#2e0b1d', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedProduct.name}
                          </h4>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#5c1642', marginTop: '4px' }}>
                            ₹{selectedProduct.discountPrice || selectedProduct.price}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(null)}
                          style={{
                            padding: '6px',
                            borderRadius: '50%',
                            color: '#9c8e96',
                            background: '#f7f2ee',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            border: 'none',
                            outline: 'none'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#5c1642'; e.currentTarget.style.background = '#ecdbe5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#9c8e96'; e.currentTarget.style.background = '#f7f2ee'; }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>

                      {/* Selfie Upload */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: '#7a5e6d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Your Photo
                        </label>
                        {userPhoto ? (
                          <div style={{
                            position: 'relative',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1.5px solid #ebdcd0',
                            backgroundColor: 'white',
                            height: '140px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img 
                              src={userPhoto} 
                              alt="User model" 
                              style={{ height: '100%', objectFit: 'contain' }}
                            />
                            <button
                              type="button"
                              onClick={() => setUserPhoto(null)}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                border: 'none',
                                borderRadius: '50%',
                                padding: '6px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
                            >
                              <CloseIcon sx={{ fontSize: 14 }} />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => document.getElementById('tryon-photo-picker').click()}
                            className="upload-area"
                          >
                            <CloudUploadIcon sx={{ fontSize: 28, color: '#c59d5f', marginBottom: '8px' }} />
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#2e0b1d', margin: 0 }}>Upload selfie / portrait</p>
                              <p style={{ fontSize: '10px', color: '#9c8e96', margin: '2px 0 0 0' }}>Ensure good lighting & front-facing view</p>
                            </div>
                            <input 
                              id="tryon-photo-picker"
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={handleTryOnPhotoUpload}
                            />
                          </div>
                        )}
                      </div>

                      {/* Dimensions Form Grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: '#7a5e6d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Physical Dimensions
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#7a5e6d', fontWeight: 600 }}>Height (cm)</span>
                            <input 
                              type="number"
                              required
                              min="50"
                              max="280"
                              value={height}
                              onChange={e => setHeight(e.target.value)}
                              placeholder="e.g. 175"
                              className="premium-input"
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#7a5e6d', fontWeight: 600 }}>Weight (kg)</span>
                            <input 
                              type="number"
                              required
                              min="10"
                              max="300"
                              value={weight}
                              onChange={e => setWeight(e.target.value)}
                              placeholder="e.g. 70"
                              className="premium-input"
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#7a5e6d', fontWeight: 600 }}>Age</span>
                            <input 
                              type="number"
                              required
                              min="1"
                              max="120"
                              value={age}
                              onChange={e => setAge(e.target.value)}
                              placeholder="e.g. 25"
                              className="premium-input"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Body Type Pill Selection */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: '#7a5e6d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Body Type
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['Thin', 'Athletic', 'Average', 'Heavy'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setBodyType(t)}
                              style={{
                                flex: 1,
                                padding: '8px 0',
                                fontSize: '11px',
                                fontWeight: 700,
                                borderRadius: '8px',
                                border: '1.5px solid',
                                borderColor: bodyType === t ? '#5c1642' : '#ebdcd0',
                                background: bodyType === t ? '#5c1642' : 'white',
                                color: bodyType === t ? 'white' : '#7a5e6d',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                              onMouseEnter={(e) => {
                                if (bodyType !== t) e.currentTarget.style.borderColor = '#5c1642';
                              }}
                              onMouseLeave={(e) => {
                                if (bodyType !== t) e.currentTarget.style.borderColor = '#ebdcd0';
                              }}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div style={{ paddingTop: '10px' }}>
                        <button
                          type="submit"
                          className="btn-stitch"
                        >
                          <AutoAwesomeIcon sx={{ fontSize: 16 }} /> Stitch Virtual Outfit ✨
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) {
          #ai-stylist-fab {
            bottom: 24px !important;
          }
        }

        .chat-input:focus {
          border-color: #5c1642 !important;
          background-color: white !important;
          box-shadow: 0 0 0 3px rgba(92, 22, 66, 0.08) !important;
        }

        .premium-input {
          width: 100%;
          background-color: white;
          border: 1.5px solid #ebdcd0;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12px;
          color: #2e0b1d;
          font-weight: 600;
          outline: none;
          transition: all 0.2s ease;
        }
        .premium-input:focus {
          border-color: #5c1642;
          box-shadow: 0 0 0 3px rgba(92, 22, 66, 0.12);
        }
        .premium-input:hover {
          border-color: #c59d5f;
        }
        
        .upload-area {
          height: 140px;
          border-radius: 12px;
          border: 2px dashed #ebdcd0;
          background-color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 16px;
        }
        .upload-area:hover {
          border-color: #5c1642;
          background-color: #fdfaf7;
        }
        
        .btn-stitch {
          width: 100%;
          padding: 14px 20px;
          font-size: 12px;
          font-weight: 800;
          color: white;
          background: linear-gradient(135deg, #5c1642 0%, #901f66 100%);
          border-radius: 12px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(92, 22, 66, 0.2);
        }
        .btn-stitch:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(92, 22, 66, 0.3);
          background: linear-gradient(135deg, #7a1e58 0%, #b02b7d 100%);
        }
        .btn-stitch:active {
          transform: translateY(1px);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
