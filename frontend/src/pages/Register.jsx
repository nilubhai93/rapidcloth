import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import CloseIcon from '@mui/icons-material/CloseRounded';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffRounded';

export default function Register() {
  const { register, login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cardRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role') || 'user';
  const redirect = queryParams.get('redirect');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate(redirect || '/');
    }
  }, [isAuthenticated, user, navigate, redirect]);

  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleBackdropClick = useCallback((e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      handleClose();
    }
  }, [handleClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(name, email, password, role, { phone, vehicleType, vehicleNumber });
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (res.user.role === 'delivery') {
        navigate('/delivery');
      } else {
        navigate(redirect || '/');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        try {
          const loginRes = await login(email, password);
          if (loginRes.user.role === 'admin') {
            navigate('/admin');
          } else if (loginRes.user.role === 'delivery') {
            navigate('/delivery');
          } else {
            navigate(redirect || '/');
          }
          return;
        } catch (loginErr) {
          navigate(`/login?email=${encodeURIComponent(email)}&conflict=1${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`);
          return;
        }
      }
      let errMsg = err.response?.data?.error || 'Registration failed.';
      if (err.response?.data?.details) {
        errMsg = err.response.data.details.map(d => d.message).join(', ');
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: 'clamp(13px, 2.5vw, 16px)', outline: 'none'
  };

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        background: role === 'admin' ? 'radial-gradient(ellipse at 50% 30%, rgba(255,107,107,0.1) 0%, transparent 60%)' :
          role === 'seller' ? 'radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.1) 0%, transparent 60%)' :
            role === 'delivery' ? 'radial-gradient(ellipse at 50% 30%, rgba(41,255,198,0.1) 0%, transparent 60%)' :
              'radial-gradient(ellipse at 50% 30%, rgba(236,72,153,0.08) 0%, transparent 60%)'
      }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        ref={cardRef}
        style={{
          width: '100%', maxWidth: '440px', padding: '48px 40px',
          borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
          position: 'relative', cursor: 'default'
        }}>

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: role === 'admin' ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' :
              role === 'delivery' ? 'linear-gradient(135deg, #0cebeb 0%, #29ffc6 100%)' : 'var(--gradient-primary)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'white'
          }}>{role === 'admin' ? 'A' : role === 'delivery' ? 'D' : role === 'seller' ? 'S' : 'F'}</div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 32px)', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            {role === 'admin' ? 'Admin Registration' : role === 'delivery' ? 'Join as Partner' : role === 'seller' ? 'Register as Seller' : 'Create Account'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>
            {role === 'admin' ? 'Create your admin account to manage the platform' :
              role === 'delivery' ? 'Deliver fashion and earn your way.' :
                role === 'seller' ? 'Open your online store with rapidCloth' :
                  'Join rapidCloth and get styled by AI'}
          </p>
        </div>

        {error && <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: 'clamp(12px, 2.5vw, 14px)', marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
          </div>

          {role === 'delivery' && (
            <>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 982 567 8900" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Vehicle Type</label>
                  <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Bike">Bike</option>
                    <option value="Scooty">Scooty</option>
                    <option value="EV">EV</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Vehicle No.</label>
                  <input type="text" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} placeholder="XYZ-1234" required style={inputStyle} />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} style={{ ...inputStyle, paddingRight: '48px' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', padding: 0
                }}>
                {showPw ? <VisibilityOffIcon sx={{ fontSize: '20px' }} /> : <VisibilityIcon sx={{ fontSize: '20px' }} />}
              </button>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
              background: role === 'delivery' ? 'linear-gradient(135deg, #0cebeb 0%, #29ffc6 100%)' : 'var(--gradient-primary)',
              color: role === 'delivery' ? '#000' : 'white',
              fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: 800, marginTop: '8px',
              opacity: loading ? 0.7 : 1, boxShadow: role === 'delivery' ? '0 4px 20px rgba(41, 255, 198, 0.3)' : '0 4px 20px var(--accent-glow)'
            }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: 'clamp(13px, 2.5vw, 14px)', color: 'var(--text-muted)' }}>
          Already have an account? <Link to={role && role !== 'user' ? `/login?role=${role}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}` : `/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
