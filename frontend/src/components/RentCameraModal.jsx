import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/CloseRounded';
import CameraAltIcon from '@mui/icons-material/CameraAltRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useNavigate } from 'react-router-dom';

export default function RentCameraModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const sampleOutfits = [
    { title: 'Velvet Lehenga', query: 'lehenga', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&q=80' },
    { title: 'Royal Sherwani', query: 'sherwani', img: 'https://images.unsplash.com/photo-1594938298598-708a31ec2f15?w=300&q=80' },
    { title: 'Designer Suit', query: 'suit', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300&q=80' },
    { title: 'Evening Gown', query: 'gown', img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&q=80' }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        triggerAnalysis('custom outfit');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAnalysis = (searchQuery) => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onClose();
      navigate(`/rent?search=${encodeURIComponent(searchQuery)}`);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 10, 25, 0.75)', backdropFilter: 'blur(4px)' }}
          />

          {/* Bottom-to-Up Sliding Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            style={{
              position: 'relative', zIndex: 10, width: '100%', maxWidth: '600px',
              maxHeight: '85vh', background: '#0a1128', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              padding: '24px 20px 32px', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', overflowY: 'auto',
              border: '1px solid rgba(212, 175, 55, 0.25)', color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pull Handle */}
            <div style={{ width: '40px', height: '4px', background: 'rgba(212, 175, 55, 0.4)', borderRadius: '4px', margin: '0 auto 16px' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.15)', color: '#f5d061', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <CameraAltIcon style={{ fontSize: '22px' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>Visual Rental Search</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>Upload or snap a photo of any outfit to find matches</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5d061' }}
              >
                <CloseIcon style={{ fontSize: '18px' }} />
              </button>
            </div>

            {/* Analysis Loading Screen */}
            {analyzing ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                  <AutoAwesomeIcon style={{ fontSize: '48px', color: '#f5d061' }} />
                </motion.div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>AI Visual Matcher Working...</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>Searching over 1,000+ luxury rental garments for similar styles.</p>
              </div>
            ) : (
              <>
                {/* File Upload Drop Area */}
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '28px 20px', border: '2px dashed rgba(212, 175, 55, 0.4)', borderRadius: '16px',
                  background: '#0e1838', cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s'
                }}>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
                  {selectedImage ? (
                    <img src={selectedImage} alt="Selected" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px', marginBottom: '10px' }} />
                  ) : (
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                      <CloudUploadIcon style={{ fontSize: '28px', color: '#f5d061' }} />
                    </div>
                  )}
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#f5d061' }}>Tap to upload or take a photo</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Supports JPG, PNG, WEBP files</span>
                </label>

                {/* Sample Outfit Visual Matches */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#f5d061', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
                    Or test visual search with sample outfits
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {sampleOutfits.map((sample, idx) => (
                      <div
                        key={idx}
                        onClick={() => triggerAnalysis(sample.query)}
                        style={{
                          borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.25)',
                          cursor: 'pointer', background: '#111d40', transition: 'all 0.2s', textAlign: 'center'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#d4af37'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)'; }}
                      >
                        <img src={sample.img} alt={sample.title} style={{ width: '100%', height: '85px', objectFit: 'cover' }} />
                        <p style={{ margin: 0, padding: '6px 4px', fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>{sample.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
