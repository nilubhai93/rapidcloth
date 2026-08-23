import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import CloseIcon from '@mui/icons-material/CloseRounded';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffRounded';
import TwoWheelerIcon from '@mui/icons-material/TwoWheelerRounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import EmailIcon from '@mui/icons-material/EmailRounded';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphoneRounded';
import LockIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const INDIAN_STATES = [
  'West Bengal',
  'Maharashtra',
  'Karnataka',
  'Delhi',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'Uttar Pradesh',
  'Rajasthan',
  'Kerala',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Andhra Pradesh',
  'Madhya Pradesh',
  'Assam',
  'Jharkhand',
  'Uttarakhand',
  'Goa'
];

export default function Register() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedState, setSelectedState] = useState('West Bengal');
  const [selectedZoneId, setSelectedZoneId] = useState('');

  // UI States
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [allZones, setAllZones] = useState([]);

  const role = 'delivery';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/delivery');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch available operational zones
  useEffect(() => {
    let isMounted = true;
    const fetchZones = async () => {
      try {
        setZonesLoading(true);
        const res = await authAPI.getZones();
        if (isMounted && res.data?.zones) {
          const zones = res.data.zones;
          setAllZones(zones);

          // Initial zone auto-select for default state
          const defaultStateZones = zones.filter(
            z => (z.state || '').toLowerCase() === 'west bengal' || 
                 (!z.state && (z.city || '').toLowerCase().includes('barrackpore'))
          );
          if (defaultStateZones.length > 0) {
            setSelectedZoneId(defaultStateZones[0]._id);
          } else if (zones.length > 0) {
            setSelectedZoneId(zones[0]._id);
          }
        }
      } catch (err) {
        console.warn('Could not fetch zones dynamically:', err);
      } finally {
        if (isMounted) setZonesLoading(false);
      }
    };
    fetchZones();
    return () => { isMounted = false; };
  }, []);

  // Filter zones whenever state changes
  const filteredZones = useMemo(() => {
    if (!selectedState) return allZones;
    const matched = allZones.filter(z => {
      if (z.state && z.state.toLowerCase() === selectedState.toLowerCase()) return true;
      if (!z.state && selectedState === 'West Bengal' && (z.city || '').toLowerCase().includes('barrackpore')) return true;
      return false;
    });
    return matched;
  }, [selectedState, allZones]);

  // Update selected zone when state changes
  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    const matched = allZones.filter(z => {
      if (z.state && z.state.toLowerCase() === stateName.toLowerCase()) return true;
      if (!z.state && stateName === 'West Bengal' && (z.city || '').toLowerCase().includes('barrackpore')) return true;
      return false;
    });
    if (matched.length > 0) {
      setSelectedZoneId(matched[0]._id);
    } else {
      setSelectedZoneId('');
    }
  };

  const handleClose = useCallback(() => {
    navigate('/delivery');
  }, [navigate]);

  const handleBackdropClick = useCallback((e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      handleClose();
    }
  }, [handleClose]);

  const activeZoneObj = useMemo(() => {
    return allZones.find(z => z._id === selectedZoneId);
  }, [allZones, selectedZoneId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role, {
        phone,
        vehicleType,
        vehicleNumber,
        state: selectedState,
        zone: selectedZoneId || undefined,
        zoneId: selectedZoneId || undefined
      });
      navigate('/delivery');
    } catch (err) {
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      setError(serverMessage || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const inputContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-elevated, #ffffff)',
    border: '1.5px solid var(--border, #e2e8f0)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    overflow: 'hidden'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '36px'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted, #64748b)',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted, #94a3b8)',
    fontSize: '20px',
    pointerEvents: 'none'
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(41,255,198,0.12) 0%, rgba(15,23,42,0.02) 70%)',
        cursor: 'pointer',
        boxSizing: 'border-box'
      }}>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: 'min(94vh, 900px)',
          overflowY: 'auto',
          padding: 'clamp(24px, 5vw, 36px) clamp(18px, 4vw, 32px)',
          borderRadius: '24px',
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1), 0 0 25px rgba(41, 255, 198, 0.08)',
          position: 'relative',
          cursor: 'default',
          boxSizing: 'border-box',
          scrollbarWidth: 'thin'
        }}>

        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          type="button"
          aria-label="Close register modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--bg-secondary, #f1f5f9)',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted, #64748b)',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}>
          <CloseIcon sx={{ fontSize: '18px' }} />
        </motion.button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0cebeb 0%, #29ffc6 100%)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(41, 255, 198, 0.35)',
              color: '#0f172a'
            }}>
            <TwoWheelerIcon sx={{ fontSize: '28px' }} />
          </motion.div>

          <h1 style={{
            fontSize: 'clamp(22px, 4.5vw, 26px)',
            fontWeight: 800,
            color: 'var(--text-primary, #0f172a)',
            marginBottom: '4px',
            letterSpacing: '-0.02em'
          }}>
            Join as Delivery Partner
          </h1>
          <p style={{
            color: 'var(--text-muted, #64748b)',
            fontSize: 'clamp(13px, 2.5vw, 14px)',
            margin: 0
          }}>
            Deliver fashion & earn with instant payouts
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--error, #ef4444)',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px'
              }}>
              <InfoOutlinedIcon sx={{ fontSize: '18px', flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Full Name */}
          <div>
            <label style={labelStyle}>
              Full Name <span style={{ color: 'var(--accent, #f59e0b)' }}>*</span>
            </label>
            <div style={inputContainerStyle}>
              <PersonIcon sx={iconStyle} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>
              Email Address <span style={{ color: 'var(--accent, #f59e0b)' }}>*</span>
            </label>
            <div style={inputContainerStyle}>
              <EmailIcon sx={iconStyle} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label style={labelStyle}>
              Mobile Number <span style={{ color: 'var(--accent, #f59e0b)' }}>*</span>
            </label>
            <div style={inputContainerStyle}>
              <PhoneIphoneIcon sx={iconStyle} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* State & Zone Section (Cascading Selection) */}
          <div style={{
            background: 'var(--bg-secondary, #f8fafc)',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LocationOnIcon sx={{ fontSize: '18px', color: '#0cebeb' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                Operating Location & Zone
              </span>
            </div>

            {/* Responsive Grid for State and Zone */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              {/* Select State */}
              <div>
                <label style={labelStyle}>
                  Select State <span style={{ color: 'var(--accent, #f59e0b)' }}>*</span>
                </label>
                <div style={inputContainerStyle}>
                  <LocationOnIcon sx={iconStyle} />
                  <select
                    value={selectedState}
                    onChange={e => handleStateChange(e.target.value)}
                    required
                    style={selectStyle}>
                    {INDIAN_STATES.map(st => {
                      const count = allZones.filter(z => (z.state || '').toLowerCase() === st.toLowerCase()).length;
                      return (
                        <option key={st} value={st}>
                          {st} {count > 0 ? `(${count} Active ${count === 1 ? 'Zone' : 'Zones'})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Select Zone */}
              <div>
                <label style={labelStyle}>
                  Operating Zone <span style={{ color: 'var(--accent, #f59e0b)' }}>*</span>
                </label>
                <div style={inputContainerStyle}>
                  <LocationOnIcon sx={iconStyle} />
                  <select
                    value={selectedZoneId}
                    onChange={e => setSelectedZoneId(e.target.value)}
                    required
                    disabled={zonesLoading}
                    style={selectStyle}>
                    {filteredZones.length > 0 ? (
                      filteredZones.map(z => (
                        <option key={z._id} value={z._id}>
                          {z.name} ({z.code || z.city})
                        </option>
                      ))
                    ) : (
                      allZones.length > 0 ? (
                        <>
                          <option value="">-- No direct zone (Select Hub) --</option>
                          {allZones.map(z => (
                            <option key={z._id} value={z._id}>
                              {z.name} - {z.city} ({z.state || 'Active'})
                            </option>
                          ))}
                        </>
                      ) : (
                        <option value="">Default Central Hub</option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Zone Live Badge */}
            {activeZoneObj && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'rgba(41, 255, 198, 0.1)',
                  borderRadius: '10px',
                  border: '1px solid rgba(41, 255, 198, 0.25)',
                  fontSize: '12px',
                  color: 'var(--text-secondary, #334155)'
                }}>
                <CheckCircleRoundedIcon sx={{ fontSize: '16px', color: '#10b981' }} />
                <span>
                  Assigned to <strong>{activeZoneObj.name}</strong> ({activeZoneObj.city}, {activeZoneObj.state || selectedState})
                </span>
              </motion.div>
            )}

            {filteredZones.length === 0 && allZones.length > 0 && (
              <div style={{
                fontSize: '11.5px',
                color: 'var(--text-muted, #64748b)',
                fontStyle: 'italic',
                lineHeight: 1.4
              }}>
                ℹ️ Direct zone for {selectedState} will auto-assign when expanded. You are mapped to the closest operating hub.
              </div>
            )}
          </div>

          {/* Vehicle Information (Responsive Grid) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {/* Vehicle Type */}
            <div>
              <label style={labelStyle}>
                Vehicle Type <span style={{ color: 'var(--accent, #f59e0b)' }}>*</span>
              </label>
              <div style={inputContainerStyle}>
                <TwoWheelerIcon sx={iconStyle} />
                <select
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value)}
                  style={selectStyle}>
                  <option value="Bike">Motorcycle / Bike</option>
                  <option value="Scooty">Scooty / Scooter</option>
                  <option value="EV">Electric 2-Wheeler (EV)</option>
                  <option value="Bicycle">Bicycle / Cycle</option>
                </select>
              </div>
            </div>

            {/* Vehicle Registration No */}
            <div>
              <label style={labelStyle}>
                Vehicle Reg. No. <span style={{ color: 'var(--accent, #f59e0b)' }}>*</span>
              </label>
              <div style={inputContainerStyle}>
                <TwoWheelerIcon sx={iconStyle} />
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. WB-02-AB-1234"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>
              Create Password <span style={{ color: 'var(--accent, #f59e0b)' }}>*</span>
            </label>
            <div style={inputContainerStyle}>
              <LockIcon sx={iconStyle} />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '6px'
                }}>
                {showPw ? (
                  <VisibilityOffIcon sx={{ fontSize: '18px' }} />
                ) : (
                  <VisibilityIcon sx={{ fontSize: '18px' }} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              color: '#0a1128',
              fontSize: '15px',
              fontWeight: 800,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '6px',
              opacity: loading ? 0.75 : 1,
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.01em'
            }}>
            {loading ? (
              <span>Creating Partner Account...</span>
            ) : (
              <>
                <span>Register as Partner</span>
                <CheckCircleRoundedIcon sx={{ fontSize: '18px' }} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Link to Login */}
        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          marginBottom: 0,
          fontSize: '13px',
          color: 'var(--text-muted, #64748b)'
        }}>
          Already have a partner account?{' '}
          <Link
            to="/login"
            style={{
              color: '#0cebeb',
              fontWeight: 700,
              textDecoration: 'none'
            }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
