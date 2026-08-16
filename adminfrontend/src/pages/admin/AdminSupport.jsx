import { motion } from 'framer-motion';
import SupportAgentIcon from '@mui/icons-material/SupportAgentRounded';

export default function AdminSupport() {
  const tickets = [
    { id: 'T-001', user: 'Priya Sharma', subject: 'Order not delivered', status: 'open', date: '2026-04-16' },
    { id: 'T-002', user: 'Rajesh Kumar', subject: 'Wrong product received', status: 'in-progress', date: '2026-04-15' },
    { id: 'T-003', user: 'Anita Desai', subject: 'Refund not processed', status: 'open', date: '2026-04-15' },
    { id: 'T-004', user: 'Vikram Singh', subject: 'Account access issue', status: 'resolved', date: '2026-04-14' },
    { id: 'T-005', user: 'Meera Patel', subject: 'Delivery partner complaint', status: 'resolved', date: '2026-04-13' },
  ];

  const getStatusStyle = (status) => {
    const map = {
      open: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
      'in-progress': { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
      resolved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    };
    return map[status] || map.open;
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SupportAgentIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
          Support Center
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
          Manage user support tickets and customer inquiries
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        {[
          { label: 'Open Tickets', value: '12', color: '#f59e0b' },
          { label: 'In Progress', value: '5', color: '#3b82f6' },
          { label: 'Resolved Today', value: '8', color: '#10b981' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '10px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tickets Table */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '70px 1.5fr 2fr 1fr 1fr',
          padding: '8px 12px', background: 'var(--bg-elevated)',
          fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px'
        }}>
          <span>ID</span>
          <span>User</span>
          <span>Subject</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {tickets.map((ticket, i) => {
          const s = getStatusStyle(ticket.status);
          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'grid', gridTemplateColumns: '70px 1.5fr 2fr 1fr 1fr',
                padding: '8px 12px', borderTop: '1px solid var(--border)',
                alignItems: 'center', fontSize: '11px', cursor: 'pointer',
                transition: 'background 0.15s'
              }}
            >
              <span style={{ fontWeight: 700, color: '#FF6B6B', fontSize: '11px' }}>{ticket.id}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ticket.user}</span>
              <span style={{ color: 'var(--text-muted)' }}>{ticket.subject}</span>
              <span style={{
                padding: '2px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 800,
                background: s.bg, color: s.color, textTransform: 'uppercase', width: 'fit-content'
              }}>
                {ticket.status}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{ticket.date}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
