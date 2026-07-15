import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/PersonRounded';
import BlockIcon from '@mui/icons-material/BlockRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessIcon from '@mui/icons-material/ExpandLessRounded';
import PhoneIcon from '@mui/icons-material/PhoneRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import CalendarTodayIcon from '@mui/icons-material/CalendarTodayRounded';
import api from '../../api/index';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersRes, appsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/sellers')
        ]);
        
        const allUsers = usersRes.data.users || [];
        const apps = appsRes.data.applications || [];
        
        // Find users with pending seller applications
        const pendingUserIds = apps
          .filter(a => a.status === 'pending')
          .map(a => a.userId?._id || a.userId);
        
        const enhancedUsers = allUsers.map(u => ({
          ...u,
          isPendingSeller: pendingUserIds.includes(u._id)
        }));

        setUsers(enhancedUsers);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    (u.role === 'user' || u.role === 'seller') &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const getRoleBadge = (user) => {
    const { role, isPendingSeller } = user;
    if (role === 'user' && isPendingSeller) {
      return (
        <span style={{
          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
          background: 'rgba(59,130,246,0.15)', color: '#3b82f6', textTransform: 'uppercase'
        }}>
          user/seller
        </span>
      );
    }

    const colors = {
      admin: { bg: 'rgba(255,107,107,0.15)', text: '#FF6B6B' },
      seller: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
      delivery: { bg: 'rgba(41,255,198,0.15)', text: '#29ffc6' },
      user: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    };
    const c = colors[role] || colors.user;
    return (
      <span style={{
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
        background: c.bg, color: c.text, textTransform: 'uppercase'
      }}>
        {role}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)' }}>Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage all registered users</p>
        </div>
        <div style={{ position: 'relative' }}>
          <SearchIcon sx={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-muted)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{
              padding: '10px 16px 10px 40px', borderRadius: '10px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none', width: '240px'
            }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr',
          padding: '14px 24px', background: 'var(--bg-elevated)',
          fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
          <span></span>
        </div>

        {/* Rows */}
        {filteredUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No users found.
          </div>
        ) : (
          filteredUsers.map((u, i) => (
            <div key={u._id} style={{ borderTop: i !== 0 ? '1px solid var(--border)' : 'none' }}>
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 40px',
                  padding: '14px 24px',
                  alignItems: 'center', fontSize: '14px', cursor: 'pointer'
                }}
                onClick={() => setExpandedUserId(expandedUserId === u._id ? null : u._id)}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{u.email}</span>
                <span>{getRoleBadge(u)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--text-muted)' }}>
                  {expandedUserId === u._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </span>
              </div>

              {/* Expanded Details */}
              <motion.div
                initial={false}
                animate={{ height: expandedUserId === u._id ? 'auto' : 0, opacity: expandedUserId === u._id ? 1 : 0 }}
                style={{ overflow: 'hidden', background: 'var(--bg-secondary)' }}
              >
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', borderTop: '1px dashed var(--border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Contact Information</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '13px', marginTop: '8px' }}>
                      <PhoneIcon sx={{ fontSize: '16px', color: '#FF6B6B' }} />
                      {u.phone || 'Not provided'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Residential Address</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '13px', marginTop: '8px' }}>
                      <HomeIcon sx={{ fontSize: '16px', color: '#3b82f6' }} />
                      {u.address || 'No address saved'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Account Details</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '13px', marginTop: '8px' }}>
                      <CalendarTodayIcon sx={{ fontSize: '16px', color: '#a855f7' }} />
                      Registered on {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button style={{ 
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', 
                      background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                    }}>
                      View History
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
