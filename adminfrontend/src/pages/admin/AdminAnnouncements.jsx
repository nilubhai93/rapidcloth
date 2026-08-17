import { useState } from 'react';
import { motion } from 'framer-motion';
import SendIcon from '@mui/icons-material/SendRounded';
import CampaignIcon from '@mui/icons-material/CampaignRounded';

export default function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [sent, setSent] = useState(false);

  const announcements = [
    { title: 'Flash Sale Weekend', message: 'All products 20% off this weekend!', target: 'users', date: '2026-04-15' },
    { title: 'New Delivery Guidelines', message: 'Updated packing and delivery protocols.', target: 'delivery', date: '2026-04-12' },
    { title: 'Seller Fee Update', message: 'Commission rates updated effective May 1st.', target: 'sellers', date: '2026-04-10' },
  ];

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); setTitle(''); setMessage(''); }, 2000);
  };

  const inputStyle = {
    width: '100%', padding: '6px 10px', borderRadius: '6px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '11px', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CampaignIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
          Announcements
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
          Broadcast messages to users, sellers, or delivery partners
        </p>
      </div>

      {/* Compose */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '12px 14px', marginBottom: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          New Announcement
        </h2>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" required style={inputStyle} />
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message..." required rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={target} onChange={e => setTarget(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
              <option value="all">All Users</option>
              <option value="users">Customers Only</option>
              <option value="sellers">Sellers Only</option>
              <option value="delivery">Delivery Partners</option>
            </select>
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 14px', borderRadius: '6px',
                background: sent ? '#10b981' : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                color: '#fff', fontWeight: 700, fontSize: '11px',
                border: 'none', cursor: 'pointer', marginLeft: 'auto'
              }}
            >
              <SendIcon sx={{ fontSize: '14px' }} />
              {sent ? 'Sent!' : 'Send Announcement'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* History */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', margin: 0 }}>Previous Announcements</h2>
        {announcements.map((a, i) => (
          <div key={i} style={{
            padding: '8px 0', borderBottom: i < announcements.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>{a.title}</span>
              <span style={{
                padding: '1px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', textTransform: 'uppercase'
              }}>{a.target}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, marginBottom: '2px' }}>{a.message}</p>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{a.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
