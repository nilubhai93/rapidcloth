import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import toast from 'react-hot-toast';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, sendOtp, verifyOtp, register } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoginModalOpen) {
      setError('');
      setLoading(false);
      setOtpSent(false);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (loginMethod === 'password') {
          await login(email, password);
          toast.success('Successfully logged in!');
          closeLoginModal();
        } else {
          if (!otpSent) {
            await sendOtp(email);
            setOtpSent(true);
            toast.success('OTP sent to your email');
          } else {
            await verifyOtp(email, otp);
            toast.success('Successfully verified & logged in!');
            closeLoginModal();
          }
        }
      } else {
        await register(name, email, password, 'user');
        toast.success('Account created successfully!');
        closeLoginModal();
      }
    } catch (err) {
      const data = err.response?.data;
      let errMsg = 'Authentication failed. Please check details.';
      if (data) {
        if (Array.isArray(data.details) && data.details.length > 0) {
          errMsg = data.details.map(d => d.message).join('. ');
        } else {
          errMsg = data.error || data.message || errMsg;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginMethod = () => {
    setError('');
    if (loginMethod === 'password') {
      setLoginMethod('otp');
    } else {
      setLoginMethod('password');
      setOtpSent(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeLoginModal}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(6px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box'
        }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '92%',
            maxWidth: '390px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.22)',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '28px 24px',
            position: 'relative',
            boxSizing: 'border-box',
            margin: 'auto',
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={closeLoginModal}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
          >
            <CloseIcon sx={{ fontSize: '18px' }} />
          </button>

          {/* Logo Badge & Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #d97706 100%)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)'
            }}>
              F
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
              {mode === 'login' ? 'Welcome Back User' : 'Create an Account'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px', margin: 0, fontWeight: 500 }}>
              {mode === 'login'
                ? (loginMethod === 'password' ? 'Sign in to your account' : (otpSent ? 'Enter code sent to your email' : 'Sign in with a one-time code'))
                : 'Join RapidCloth to start shopping'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#dc2626',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px', display: 'block' }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '12px',
                    background: '#f8fafc', border: '1px solid #cbd5e1',
                    color: '#0f172a', fontSize: '13px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px', display: 'block' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                disabled={loginMethod === 'otp' && otpSent}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '12px',
                  background: (loginMethod === 'otp' && otpSent) ? '#e2e8f0' : '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a', fontSize: '13px', outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>

            {mode === 'login' && loginMethod === 'otp' && otpSent ? (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px', display: 'block' }}>Verification Code (OTP)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  required
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '12px',
                    background: '#f8fafc', border: '1px solid #cbd5e1',
                    color: '#0f172a', fontSize: '16px', textAlign: 'center', letterSpacing: '4px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            ) : (
              (mode === 'register' || loginMethod === 'password') && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px', display: 'block' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%', padding: '11px 40px 11px 14px', borderRadius: '12px',
                        background: '#f8fafc', border: '1px solid #cbd5e1',
                        color: '#0f172a', fontSize: '13px', outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={e => e.target.style.borderColor = '#2563eb'}
                      onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer'
                      }}
                    >
                      {showPw ? <VisibilityOffIcon sx={{ fontSize: '18px' }} /> : <VisibilityIcon sx={{ fontSize: '18px' }} />}
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Main Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                marginTop: '4px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : (
                mode === 'register'
                  ? 'Sign Up'
                  : (loginMethod === 'otp' ? (otpSent ? 'Verify & Sign In' : 'Send Code') : 'Sign In')
              )}
            </motion.button>
          </form>

          {/* Footer Action Links */}
          <div style={{ marginTop: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mode === 'login' && (
              <button
                type="button"
                onClick={toggleLoginMethod}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#2563eb', fontSize: '12px', fontWeight: 600
                }}
              >
                {loginMethod === 'password' ? 'Use OTP Login' : 'Use Password Login'}
              </button>
            )}

            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: 700 }}
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: 700 }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
