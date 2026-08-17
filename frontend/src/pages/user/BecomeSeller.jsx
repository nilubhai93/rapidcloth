import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import CircularProgress from '@mui/material/CircularProgress';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import MapIcon from '@mui/icons-material/MapRounded';
import api from '../../api/index';
import { useAuth } from '../../context/AuthContext';

export default function BecomeSeller() {
  const navigate = useNavigate();
  const { user, setUser, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    address: '',
    categories: '',
    businessPhone: '',
    documentType: '',
    zone: ''
  });
  const [file, setFile] = useState(null);
  const [zones, setZones] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [existingApp, setExistingApp] = useState(null);

  useEffect(() => {
    // Fetch available operational zones
    api.get('/seller/zones')
      .then(res => setZones(res.data.zones || []))
      .catch(err => console.error('Failed to load operational zones:', err));

    const checkStatus = async () => {
      try {
        const res = await api.get('/seller/status');
        if (res.data.application) {
          setExistingApp(res.data.application);
          setFormData({
            storeName: res.data.application.storeName || '',
            description: res.data.application.description || '',
            address: res.data.application.address || '',
            categories: res.data.application.categories || '',
            businessPhone: res.data.application.businessPhone || '',
            documentType: res.data.application.documentType || '',
            zone: res.data.application.zone?._id || res.data.application.zone || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch application status:', err);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    if (user) checkStatus();
    else setIsLoadingStatus(false);
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (file) data.append('document', file);

      await api.post('/seller/apply', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingStatus) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <CircularProgress size={32} sx={{ color: '#2563eb' }} />
      </div>
    );
  }

  const appData = isSuccess ? formData : (existingApp || formData);
  const isApproved = existingApp?.status === 'approved';
  const isRejected = existingApp?.status === 'rejected';

  // Find zone details object
  const selectedZoneObj = zones.find(z => z._id === (appData.zone?._id || appData.zone)) || appData.zone;

  const theme = {
    bg: '#f8fafc',
    bgCard: '#ffffff',
    accent: '#2563eb',
    accentGrad: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    border: '#e2e8f0',
    fontDisplay: '"Outfit", "Inter", sans-serif',
    fontSans: '"Inter", sans-serif'
  };

  const responsiveStyles = (
    <style>{`
      .become-seller-wrapper {
        min-height: 100vh;
        padding: 40px 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.05) 0%, #f8fafc 70%);
        font-family: ${theme.fontSans};
        box-sizing: border-box;
      }
      .glass-card {
        display: grid;
        grid-template-columns: 360px 1fr;
        width: 100%;
        max-width: 1060px;
        background: #ffffff;
        border-radius: 24px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
        overflow: hidden;
      }
      .branding-col {
        padding: 40px 32px;
        background: linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%);
        border-right: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .form-col {
        padding: 40px 36px;
      }
      .form-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 860px) {
        .become-seller-wrapper {
          padding: 16px 12px;
        }
        .glass-card {
          grid-template-columns: 1fr !important;
          border-radius: 16px;
        }
        .branding-col {
          border-right: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 24px 18px !important;
        }
        .form-col {
          padding: 24px 18px !important;
        }
        .form-grid-2 {
          grid-template-columns: 1fr !important;
          gap: 12px;
        }
      }
    `}</style>
  );

  // --- STATUS / APPLICATION SUBMITTED VIEW ---
  if (isSuccess || existingApp) {
    return (
      <>
        {responsiveStyles}
        <div className="become-seller-wrapper">
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Left Column: Status Overview */}
            <div className="branding-col">
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 14 }}
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: isApproved ? 'rgba(16, 185, 129, 0.1)' : isRejected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                    border: `2px solid ${isApproved ? '#10b981' : isRejected ? '#ef4444' : theme.accent}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                  }}
                >
                  {isApproved ? <CheckCircleOutlineIcon sx={{ fontSize: 42, color: '#10b981' }} /> :
                    isRejected ? <CloseIcon sx={{ fontSize: 42, color: '#ef4444' }} /> :
                      <ScheduleIcon sx={{ fontSize: 42, color: theme.accent }} />}
                </motion.div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: theme.textPrimary, marginBottom: '8px', fontFamily: theme.fontDisplay }}>
                  {isSuccess ? 'Application Submitted' : 'Application Status'}
                </h2>

                <div style={{
                  display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
                  background: isApproved ? 'rgba(16, 185, 129, 0.1)' : isRejected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                  color: isApproved ? '#10b981' : isRejected ? '#ef4444' : theme.accent,
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px',
                  border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.2)' : isRejected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(37, 99, 235, 0.2)'}`
                }}>
                  {existingApp?.status || 'Under Curation'}
                </div>

                <p style={{ color: theme.textSecondary, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  {isSuccess
                    ? "Your seller application has been received and is under review by our admin team."
                    : existingApp?.status === 'pending'
                      ? "Your business credentials are currently being reviewed."
                      : isApproved 
                        ? "Congratulations! Your seller application has been approved."
                        : "Unfortunately, your application was not approved."}
                </p>
              </div>

              <button
                onClick={async () => {
                  if (isApproved) {
                    try {
                      const res = await api.get('/auth/profile');
                      if (res.data?.user && setUser) setUser(res.data.user);
                    } catch (e) {}
                    navigate('/seller');
                  } else {
                    navigate('/shop');
                  }
                }}
                style={{ 
                  width: '100%', padding: '14px', marginTop: '24px', fontWeight: 700,
                  background: theme.accentGrad, color: '#ffffff', border: 'none', borderRadius: '12px',
                  cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: `0 4px 14px rgba(37, 99, 235, 0.3)`,
                  fontSize: '13px'
                }}
              >
                {isApproved ? 'Enter Seller Portal' : 'Return to Shop'}
              </button>
            </div>

            {/* Right Column: Submission Details */}
            <div className="form-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                Submission Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', margin: 0, marginBottom: '4px' }}>Store Name</p>
                  <p style={{ color: theme.textPrimary, fontSize: '15px', fontWeight: 800, margin: 0, fontFamily: theme.fontDisplay }}>{appData.storeName}</p>
                </div>

                <div style={{ padding: '12px 14px', background: 'rgba(37, 99, 235, 0.04)', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.15)' }}>
                  <p style={{ color: theme.accent, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', margin: 0, marginBottom: '4px' }}>Applied Operational Zone</p>
                  <p style={{ color: theme.textPrimary, fontSize: '14px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapIcon sx={{ fontSize: 16, color: theme.accent }} />
                    {selectedZoneObj?.name || (typeof selectedZoneObj === 'string' ? selectedZoneObj : 'Default Zone')}
                  </p>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', margin: 0, marginBottom: '4px' }}>Category</p>
                  <p style={{ color: theme.textPrimary, fontSize: '13px', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>{appData.categories}</p>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', margin: 0, marginBottom: '4px' }}>Verified Via</p>
                  <p style={{ color: theme.textPrimary, fontSize: '13px', fontWeight: 700, margin: 0 }}>{appData.documentType}</p>
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', margin: 0, marginBottom: '4px' }}>Headquarters & Address</p>
                <p style={{ color: theme.textPrimary, fontSize: '12px', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{appData.address}</p>
              </div>

              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', margin: 0, marginBottom: '4px' }}>Brand Story</p>
                <p style={{ color: theme.textSecondary, fontSize: '12px', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>"{appData.description}"</p>
              </div>

              {isRejected && (
                <div style={{ 
                  padding: '12px 14px', background: 'rgba(239, 68, 68, 0.05)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px'
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', margin: 0, marginBottom: '4px' }}>Feedback Reason</p>
                  <p style={{ color: theme.textPrimary, fontSize: '12px', fontWeight: 500, margin: 0 }}>{existingApp?.rejectionReason || "Please verify credentials and resubmit."}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // --- FORM VIEW ---
  return (
    <>
      {responsiveStyles}
      <div className="become-seller-wrapper">
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Left Column: Branding & Overview */}
          <div className="branding-col">
            <div>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: theme.accentGrad, color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)'
              }}>
                <StorefrontOutlinedIcon sx={{ fontSize: 28 }} />
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: theme.textPrimary, letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '12px', fontFamily: theme.fontDisplay }}>
                Launch Your <br /><span style={{ color: theme.accent }}>Seller Account</span>
              </h1>
              <p style={{ color: theme.textSecondary, fontSize: '13px', lineHeight: 1.5, marginBottom: '28px' }}>
                Partner with RapidCloth to reach thousands of local shoppers across assigned operational zones.
              </p>

              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  { step: '01', title: 'Store Details', text: 'Define your store name, category & target zone.' },
                  { step: '02', title: 'Verification', text: 'Upload ID proof for quick admin approval.' },
                  { step: '03', title: 'Start Selling', text: 'Manage inventory & orders via seller portal.' }
                ].map(item => (
                  <div key={item.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: theme.accent, padding: '2px 6px', background: 'rgba(37, 99, 235, 0.08)', borderRadius: '4px' }}>{item.step}</span>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, margin: 0, marginBottom: '2px' }}>{item.title}</h4>
                      <p style={{ fontSize: '11px', color: theme.textMuted, margin: 0, lineHeight: 1.4 }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: '20px' }}>
              <p style={{ fontSize: '11px', color: theme.textMuted, margin: 0 }}>
                Need help? <span style={{ color: theme.accent, fontWeight: 700 }}>support@rapidCloth.com</span>
              </p>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="form-col">
            {error && (
              <div style={{ padding: '10px 14px', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderRadius: '10px', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Store Name</label>
                  <input
                    required name="storeName" value={formData.storeName} onChange={handleChange}
                    placeholder="e.g., TrendZone Fashion"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Business Contact</label>
                  <input
                    required name="businessPhone" value={formData.businessPhone} onChange={handleChange}
                    placeholder="e.g., +91 98765 43210"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Fashion Category</label>
                  <select
                    required name="categories" value={formData.categories} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '12px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    <option value="" disabled>Select category</option>
                    <option value="clothing">Clothing & Apparel</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                    <option value="jewelry">Jewelry & Watches</option>
                  </select>
                </div>

                {/* Apply for Operational Zone Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapIcon sx={{ fontSize: 14 }} />
                    Apply for Zone
                  </label>
                  <select
                    required name="zone" value={formData.zone} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.03)', border: '1px solid rgba(37, 99, 235, 0.3)', color: theme.textPrimary, fontSize: '12px', fontWeight: 600, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    <option value="" disabled>Select target zone</option>
                    {zones.length === 0 ? (
                      <option value="default">Barrackpore Zone (101)</option>
                    ) : (
                      zones.map(z => (
                        <option key={z._id} value={z._id}>
                          {z.name} ({z.zoneId || z.code}) - {z.city}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Brand Description</label>
                <textarea
                  required name="description" value={formData.description} onChange={handleChange}
                  placeholder="Share a short description of your store and products..."
                  rows="2"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '12px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.border}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Business Headquarters / Address</label>
                <input
                  required name="address" value={formData.address} onChange={handleChange}
                  placeholder="Full store/office address"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.border}
                />
              </div>

              <div className="form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Identity Verification Document</label>
                  <select
                    required name="documentType" value={formData.documentType} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '12px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    <option value="" disabled>Select document type</option>
                    <option value="Aadhar Card">Aadhar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Passport">International Passport</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Proof of Identity Document</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
                  style={{ border: `1.5px dashed ${theme.border}`, borderRadius: '12px', padding: '18px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: '#f8fafc' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = 'rgba(37, 99, 235, 0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0])} style={{ display: 'none' }} accept=".pdf,.jpg,.png" />
                  
                  {file ? (
                    <div style={{ color: theme.textPrimary }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 28, color: '#10b981', marginBottom: '4px' }} />
                      <p style={{ fontWeight: 700, fontSize: '12px', margin: 0, fontFamily: theme.fontDisplay }}>{file.name}</p>
                      <p style={{ color: theme.textMuted, fontSize: '10px', margin: 0 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div style={{ color: theme.textMuted }}>
                      <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: theme.accent, marginBottom: '4px' }} />
                      <p style={{ fontWeight: 700, fontSize: '12px', color: theme.textPrimary, margin: 0, fontFamily: theme.fontDisplay }}>Upload Official Document</p>
                      <p style={{ fontSize: '10px', margin: 0, marginTop: '2px' }}>PDF, PNG, or JPG (max. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit" disabled={isSubmitting || !file}
                style={{ 
                  width: '100%', padding: '12px', marginTop: '6px', fontWeight: 700,
                  background: theme.accentGrad, color: '#ffffff', border: 'none', borderRadius: '10px',
                  cursor: (isSubmitting || !file) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !file) ? 0.6 : 1,
                  transition: 'all 0.2s ease', boxShadow: `0 4px 14px rgba(37, 99, 235, 0.3)`,
                  fontSize: '13px'
                }}
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Seller Application'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
