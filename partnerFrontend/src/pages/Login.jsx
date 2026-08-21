import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';

export default function Login() {
  const { login, isAuthenticated, user, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/delivery');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (loginMethod === 'password') {
        await login(email, password);
        navigate('/delivery');
      } else {
        if (!otpSent) {
          await sendOtp(email);
          setOtpSent(true);
        } else {
          await verifyOtp(email, otp);
          navigate('/delivery');
        }
      }
    } catch (err) {
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      setError(serverMessage || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(255,84,0,0.08) 0%, transparent 60%)',
      boxSizing: 'border-box'
    }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: 'min(94vh, 850px)',
          overflowY: 'auto',
          padding: 'clamp(24px, 5vw, 40px) clamp(18px, 4vw, 36px)',
          borderRadius: '24px',
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1), 0 0 25px rgba(255, 84, 0, 0.06)',
          position: 'relative',
          boxSizing: 'border-box',
          scrollbarWidth: 'thin'
        }}>

        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/delivery')}
          aria-label="Close login"
          style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'var(--bg-secondary, #f1f5f9)',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted, #64748b)',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
        >
          <CloseIcon sx={{ fontSize: '18px' }} />
        </motion.button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'var(--gradient-primary, linear-gradient(135deg, #ff5400 0%, #ff6b00 100%))',
            margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 800, color: 'white',
            boxShadow: '0 8px 20px rgba(255, 84, 0, 0.25)'
          }}>P</div>
          <h1 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, fontFamily: 'var(--font-sans)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: 'clamp(13px, 2.5vw, 14px)', margin: 0 }}>
            {loginMethod === 'password' ? 'Sign in to partner dashboard' : (otpSent ? 'Enter the code sent to your email' : 'Sign in with a one-time code')}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            color: 'var(--error, #ef4444)', fontSize: '13px', fontWeight: 500, marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '6px', display: 'block' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="partner@example.com"
              required
              disabled={otpSent}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                background: 'var(--bg-elevated, #ffffff)', border: '1.5px solid var(--border, #e2e8f0)',
                color: 'var(--text-primary, #0f172a)', fontSize: '14px', outline: 'none',
                transition: 'all 0.2s', boxSizing: 'border-box'
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            {loginMethod === 'password' ? (
              <motion.div key="pw" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ position: 'relative' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '6px', display: 'block' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%', padding: '12px 44px 12px 16px', borderRadius: '12px',
                      background: 'var(--bg-elevated, #ffffff)', border: '1.5px solid var(--border, #e2e8f0)',
                      color: 'var(--text-primary, #0f172a)', fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', padding: '4px'
                    }}>
                    {showPw ? <VisibilityOffIcon sx={{ fontSize: '18px' }} /> : <VisibilityIcon sx={{ fontSize: '18px' }} />}
                  </button>
                </div>
              </motion.div>
            ) : otpSent && (
              <motion.div key="otp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '6px', display: 'block' }}>Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  required
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    background: 'var(--bg-elevated, #ffffff)', border: '1.5px solid var(--border, #e2e8f0)',
                    color: 'var(--text-primary, #0f172a)', fontSize: '16px', textAlign: 'center', letterSpacing: '4px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px 20px', borderRadius: '14px',
              background: 'var(--gradient-primary, linear-gradient(135deg, #ff5400 0%, #ff6b00 100%))', color: 'white',
              fontSize: '15px', fontWeight: 700, marginTop: '6px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1, boxShadow: '0 6px 20px var(--accent-glow, rgba(255, 84, 0, 0.3))'
            }}>
            {loading ? 'Processing...' : (loginMethod === 'password' ? 'Sign In to Partner App' : (otpSent ? 'Verify & Sign In' : 'Send One-Time Code'))}
          </motion.button>
        </form>

        <div style={{ marginTop: '18px', textAlign: 'center' }}>
          <button onClick={() => { setLoginMethod(loginMethod === 'password' ? 'otp' : 'password'); setOtpSent(false); setError(''); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-light, #ff6b00)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {loginMethod === 'password' ? 'Use OTP Login instead' : 'Use Password Login instead'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '22px', marginBottom: 0, fontSize: '13px', color: 'var(--text-muted, #64748b)' }}>
          Don't have a partner account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-light, #ff6b00)', fontWeight: 700, textDecoration: 'none' }}>
            Join as Partner
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
