import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
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
          padding: '2px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 800,
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
        padding: '2px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 800,
        background: c.bg, color: c.text, textTransform: 'uppercase'
      }}>
        {role}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0 }}>Users Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>Manage registered platform shoppers and accounts</p>
        </div>
        <div style={{ position: 'relative' }}>
          <SearchIcon sx={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--text-muted)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{
              padding: '5px 8px 5px 28px', borderRadius: '6px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '11px', outline: 'none', width: '200px'
            }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 30px',
          padding: '8px 12px', background: 'var(--bg-elevated)',
          fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px'
        }}>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
          <span></span>
        </div>

        {/* Rows */}
        {filteredUsers.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
            No users found.
          </div>
        ) : (
          filteredUsers.map((u, i) => (
            <div key={u._id} style={{ borderTop: i !== 0 ? '1px solid var(--border)' : 'none' }}>
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 30px',
                  padding: '8px 12px',
                  alignItems: 'center', fontSize: '11px', cursor: 'pointer'
                }}
                onClick={() => setExpandedUserId(expandedUserId === u._id ? null : u._id)}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{u.email}</span>
                <span>{getRoleBadge(u)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--text-muted)' }}>
                  {expandedUserId === u._id ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                </span>
              </div>

              {/* Expanded Details */}
              <motion.div
                initial={false}
                animate={{ height: expandedUserId === u._id ? 'auto' : 0, opacity: expandedUserId === u._id ? 1 : 0 }}
                style={{ overflow: 'hidden', background: 'var(--bg-secondary)' }}
              >
                <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', borderTop: '1px dashed var(--border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Contact Information</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '11px', marginTop: '2px' }}>
                      <PhoneIcon sx={{ fontSize: '13px', color: '#FF6B6B' }} />
                      {u.phone || 'Not provided'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Residential Address</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '11px', marginTop: '2px' }}>
                      <HomeIcon sx={{ fontSize: '13px', color: '#3b82f6' }} />
                      {u.address || 'No address saved'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Account Details</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '11px', marginTop: '2px' }}>
                      <CalendarTodayIcon sx={{ fontSize: '13px', color: '#a855f7' }} />
                      Registered on {new Date(u.createdAt).toLocaleDateString()}
                    </div>
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
