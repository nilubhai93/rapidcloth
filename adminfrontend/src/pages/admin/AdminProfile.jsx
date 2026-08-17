import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailRounded';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityRounded';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneRounded';

export default function AdminProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (updateProfile) {
        await updateProfile({ name: formData.name, phone: formData.phone });
      }
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PersonOutlineIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
          Admin Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
          Manage your personal information and platform security settings.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            flex: '1 1 300px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 800, color: '#fff',
            marginBottom: '10px', boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
          }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          
          {isEditing ? (
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              style={{ fontSize: '14px', fontWeight: 700, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', color: 'var(--text-primary)', outline: 'none', textAlign: 'center', marginBottom: '2px' }} 
            />
          ) : (
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
              {user?.name || 'Administrator'}
              <VerifiedUserIcon sx={{ color: '#10b981', fontSize: '16px' }} />
            </h2>
          )}
          <p style={{ color: '#FF6B6B', fontWeight: 700, fontSize: '11px', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            Super Admin
          </p>

          <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '12px 0' }} />

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmailOutlinedIcon sx={{ color: 'var(--text-secondary)', fontSize: 15 }} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Email Address</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.email || 'admin@rapidCloth.com'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneOutlinedIcon sx={{ color: 'var(--text-secondary)', fontSize: 15 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Contact Number</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    style={{ width: '100%', fontSize: '11px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 6px', color: 'var(--text-primary)', outline: 'none', marginTop: '2px' }}
                  />
                ) : (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.phone || '+1 (555) 000-0000'}</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SecurityOutlinedIcon sx={{ color: 'var(--text-secondary)', fontSize: 15 }} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Account Level</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Full Access (Level 5)</div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '14px' }}>
            {isEditing && (
              <button onClick={() => { setIsEditing(false); setFormData({ name: user?.name || '', phone: user?.phone || '' }); }} style={{
                flex: 1, padding: '6px 10px', borderRadius: '6px',
                background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                fontSize: '11px', fontWeight: 700, cursor: 'pointer'
              }}>
                Cancel
              </button>
            )}
            <button onClick={isEditing ? handleSave : () => setIsEditing(true)} disabled={loading} style={{
              flex: isEditing ? 1 : 2, padding: '6px 10px', borderRadius: '6px',
              background: isEditing ? '#FF6B6B' : 'rgba(255, 107, 107, 0.1)', 
              color: isEditing ? '#ffffff' : '#FF6B6B', 
              border: isEditing ? 'none' : '1px solid rgba(255, 107, 107, 0.2)',
              fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Saving...' : isEditing ? 'Save Details' : 'Edit Profile Details'}
            </button>
          </div>
        </motion.div>

        {/* Security / System Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            flex: '2 1 350px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', margin: 0 }}>Security Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Password</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Last changed 3 months ago</div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}>Update</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '10px', color: '#10b981' }}>Enabled via Authenticator App</div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}>Manage</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Login Sessions</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>2 active sessions currently</div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}>Revoke All</button>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', margin: 0 }}>Platform Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Account Created</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Jan 12, 2024</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Login</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Today, 10:45 AM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Actions Performed</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>1,248</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
