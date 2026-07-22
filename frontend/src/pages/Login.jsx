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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role');
  const redirect = queryParams.get('redirect');

  const [email, setEmail] = useState(queryParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(queryParams.get('conflict') ? 'Email already registered. Please sign in.' : '');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate(redirect || '/');
    }
  }, [isAuthenticated, user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (loginMethod === 'password') {
        const result = await login(email, password);
        navigateByRole(result.user.role);
      } else {
        if (!otpSent) {
          await sendOtp(email);
          setOtpSent(true);
        } else {
          const result = await verifyOtp(email, otp);
          navigateByRole(result.user.role);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateByRole = (userRole) => {
    if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'delivery') navigate('/delivery');
    else navigate(redirect || '/');
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp(email);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.1) 0%, transparent 60%)'
    }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%', maxWidth: '420px', padding: '48px 40px',
          borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)',
          position: 'relative'
        }}>

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'var(--gradient-primary)', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 800, color: 'white'
          }}>F</div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Welcome Back User</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            {loginMethod === 'password' ? 'Sign in to your account' : (otpSent ? 'Enter the code sent to your email' : 'Sign in with a one-time code')}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--error)', fontSize: '14px', marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              disabled={otpSent}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <AnimatePresence mode="wait">
            {loginMethod === 'password' ? (
              <motion.div key="pw" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ position: 'relative' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%', padding: '14px 48px 14px 18px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: '15px', outline: 'none'
                    }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                    }}>
                    {showPw ? <VisibilityOffIcon sx={{ fontSize: '20px' }} /> : <VisibilityIcon sx={{ fontSize: '20px' }} />}
                  </button>
                </div>
              </motion.div>
            ) : otpSent && (
              <motion.div key="otp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  required
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: '18px', textAlign: 'center', letterSpacing: '4px', outline: 'none'
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-primary)', color: 'white',
              fontSize: '16px', fontWeight: 700, marginTop: '8px',
              opacity: loading ? 0.7 : 1, boxShadow: '0 4px 20px var(--accent-glow)'
            }}>
            {loading ? 'Processing...' : (loginMethod === 'password' ? 'Sign In' : (otpSent ? 'Verify & Sign In' : 'Send Code'))}
          </motion.button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button onClick={() => { setLoginMethod(loginMethod === 'password' ? 'otp' : 'password'); setOtpSent(false); setError(''); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-light)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            {loginMethod === 'password' ? 'Use OTP Login' : 'Use Password Login'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to={role ? `/register?role=${role}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}` : `/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Create account</Link>
        </p>
      </motion.div>
    </div>
  );
}

