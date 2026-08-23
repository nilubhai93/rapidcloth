import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SupportAgentIcon from '@mui/icons-material/SupportAgentRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import PendingIcon from '@mui/icons-material/HourglassEmptyRounded';
import SyncIcon from '@mui/icons-material/SyncRounded';
import CancelIcon from '@mui/icons-material/CancelRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import PhoneIcon from '@mui/icons-material/PhoneRounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import CircularProgress from '@mui/material/CircularProgress';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [actionStatus, setActionStatus] = useState('Resolved');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSupportTickets();
      if (res.data?.tickets) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('Fetch support tickets error:', err);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      await adminAPI.updateSupportTicketStatus(selectedTicket._id, {
        status: actionStatus,
        adminReply: adminReplyText
      });
      toast.success(`Ticket #${selectedTicket._id.slice(-6).toUpperCase()} updated to ${actionStatus}!`);
      setSelectedTicket(null);
      setAdminReplyText('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filterStatus === 'ALL' || t.status?.toUpperCase() === filterStatus.toUpperCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      t.partnerName?.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query) ||
      t.issueDescription?.toLowerCase().includes(query) ||
      t.zone?.toLowerCase().includes(query) ||
      t.partnerPhone?.includes(query);
    return matchesStatus && matchesQuery;
  });

  const counts = {
    all: tickets.length,
    pending: tickets.filter(t => t.status === 'Pending').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    rejected: tickets.filter(t => t.status === 'Rejected').length,
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Pending':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', icon: <PendingIcon sx={{ fontSize: 14 }} /> };
      case 'In Progress':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', icon: <SyncIcon sx={{ fontSize: 14 }} /> };
      case 'Resolved':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> };
      case 'Rejected':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', icon: <CancelIcon sx={{ fontSize: 14 }} /> };
      default:
        return { bg: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', icon: null };
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SupportAgentIcon sx={{ fontSize: 26, color: '#ff5400' }} />
            Delivery Partner Support & Activity Desk
          </h1>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '13px', margin: '4px 0 0', fontWeight: 600 }}>
            Monitor and resolve partner issues, order earnings, incentives, and delivery activity tickets
          </p>
        </div>
        <button
          onClick={fetchTickets}
          style={{
            padding: '8px 16px', borderRadius: '12px', background: 'var(--bg-elevated, #f1f5f9)',
            border: '1px solid var(--border, #cbd5e1)', color: 'var(--text-primary, #0f172a)',
            fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <SyncIcon sx={{ fontSize: 16 }} /> Refresh Desk
        </button>
      </div>

      {/* 4 Summary Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Partner Tickets', value: counts.all, color: '#ff5400', icon: <LocalShippingIcon /> },
          { label: 'Pending Admin Review', value: counts.pending, color: '#f59e0b', icon: <PendingIcon /> },
          { label: 'In Progress Action', value: counts.inProgress, color: '#3b82f6', icon: <SyncIcon /> },
          { label: 'Resolved Tickets', value: counts.resolved, color: '#10b981', icon: <CheckCircleIcon /> },
        ].map((s, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '16px', padding: '16px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '6px', fontWeight: 700 }}>{s.label}</div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '20px', padding: '16px 20px', marginBottom: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
      }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: `All (${counts.all})`, status: 'ALL' },
            { label: `Pending (${counts.pending})`, status: 'Pending' },
            { label: `In Progress (${counts.inProgress})`, status: 'In Progress' },
            { label: `Resolved (${counts.resolved})`, status: 'Resolved' },
            { label: `Rejected (${counts.rejected})`, status: 'Rejected' },
          ].map(tab => (
            <button
              key={tab.status}
              onClick={() => setFilterStatus(tab.status)}
              style={{
                padding: '8px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
                border: filterStatus === tab.status ? '1.5px solid #ff5400' : '1px solid var(--border, #e2e8f0)',
                background: filterStatus === tab.status ? 'rgba(255, 84, 0, 0.12)' : 'var(--bg-elevated, #f8fafc)',
                color: filterStatus === tab.status ? '#ff5400' : 'var(--text-primary, #0f172a)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <SearchIcon sx={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px' }} />
          <input
            type="text"
            placeholder="Search partner, zone, issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 40px', borderRadius: '12px',
              border: '1px solid var(--border, #cbd5e1)', background: 'var(--bg-elevated, #f8fafc)',
              color: 'var(--text-primary, #0f172a)', fontSize: '13px', fontWeight: 600, outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Tickets List / Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <CircularProgress size={32} sx={{ color: '#ff5400' }} />
          <p style={{ marginTop: '12px', fontWeight: 700, fontSize: '14px' }}>Loading partner support tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div style={{
          background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border, #e2e8f0)',
          borderRadius: '20px', padding: '50px 20px', textAlign: 'center', color: '#64748b'
        }}>
          <SupportAgentIcon sx={{ fontSize: 48, color: '#cbd5e1', marginBottom: '10px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: '0 0 6px' }}>No Support Tickets Found</h3>
          <p style={{ fontSize: '13px', margin: 0, fontWeight: 600 }}>No partner tickets match the selected filter or search query.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredTickets.map((t) => {
            const st = getStatusBadgeStyle(t.status);
            return (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar: Ticket ID & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#ff5400', background: 'rgba(255, 84, 0, 0.1)', padding: '4px 10px', borderRadius: '10px', letterSpacing: '0.5px' }}>
                      #TICKET-{t._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800,
                      background: st.bg, color: st.color, border: st.border
                    }}>
                      {st.icon} {t.status}
                    </span>
                  </div>

                  {/* Partner Name & Details */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary, #0f172a)' }}>
                      {t.partnerName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', fontSize: '12px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PhoneIcon sx={{ fontSize: 14, color: '#ff5400' }} /> {t.partnerPhone || 'N/A'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LocationOnIcon sx={{ fontSize: 14, color: '#3b82f6' }} /> {t.zone || 'General Zone'}
                      </span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div style={{
                    fontSize: '13px', fontWeight: 800, color: '#ff5400',
                    background: 'rgba(255, 84, 0, 0.08)', padding: '8px 12px', borderRadius: '12px',
                    marginBottom: '12px', borderLeft: '3px solid #ff5400'
                  }}>
                    Category: {t.category}
                  </div>

                  {/* Issue Description Box */}
                  <div style={{
                    background: 'var(--bg-elevated, #f8fafc)', border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '14px', padding: '12px 14px', marginBottom: '14px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Partner Issue Description:
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary, #1e293b)', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                      "{t.issueDescription}"
                    </p>
                  </div>

                  {/* Existing Admin Reply Note */}
                  {t.adminReply && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '14px', padding: '12px 14px', marginBottom: '14px'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#047857', textTransform: 'uppercase', marginBottom: '2px' }}>
                        ✅ Admin Resolution Note:
                      </div>
                      <p style={{ fontSize: '12px', color: '#065f46', margin: 0, fontWeight: 700 }}>
                        {t.adminReply}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer: Date & Take Action Button */}
                <div style={{ borderTop: '1px solid var(--border, #e2e8f0)', paddingTop: '12px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                    Submitted: {new Date(t.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTicket(t);
                      setActionStatus(t.status === 'Pending' ? 'Resolved' : t.status);
                      setAdminReplyText(t.adminReply || '');
                    }}
                    style={{
                      padding: '8px 16px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ff5400 0%, #ff6b00 100%)',
                      color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: 900,
                      cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 84, 0, 0.3)'
                    }}
                  >
                    Take Action / Resolve ➔
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* TAKE ACTION & RESOLUTION MODAL */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'var(--bg-card, #ffffff)', borderRadius: '24px', padding: '28px',
                maxWidth: '460px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                    Resolve Partner Issue #{selectedTicket._id.slice(-6).toUpperCase()}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#ff5400', fontWeight: 800, marginTop: '2px' }}>
                    {selectedTicket.partnerName} · {selectedTicket.category}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <CloseIcon sx={{ color: '#475569', fontSize: '18px' }} />
                </button>
              </div>

              {/* Original Issue Snippet */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>ORIGINAL PARTNER ISSUE:</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>"{selectedTicket.issueDescription}"</div>
              </div>

              {/* Status Selector */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', display: 'block', marginBottom: '8px' }}>
                  SET TICKET STATUS:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['In Progress', 'Resolved', 'Rejected'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setActionStatus(st)}
                      style={{
                        padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 800,
                        border: actionStatus === st ? '2px solid #ff5400' : '1px solid #cbd5e1',
                        background: actionStatus === st ? 'rgba(255,84,0,0.12)' : '#f8fafc',
                        color: actionStatus === st ? '#ff5400' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Reply Note Textarea */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', display: 'block', marginBottom: '6px' }}>
                  ADMIN RESOLUTION REPLY NOTE FOR PARTNER:
                </label>
                <textarea
                  rows={3}
                  placeholder="Type resolution instructions, order payout adjustment note, or partner response..."
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '14px', border: '1.5px solid #cbd5e1',
                    fontSize: '13px', fontWeight: 600, color: '#0f172a', outline: 'none', resize: 'none'
                  }}
                />
              </div>

              {/* Submit CTA */}
              <button
                disabled={updating}
                onClick={handleUpdateTicket}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ff5400 0%, #ff6b00 100%)',
                  color: '#ffffff', border: 'none', fontSize: '15px', fontWeight: 900,
                  cursor: updating ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(255,84,0,0.4)',
                  opacity: updating ? 0.7 : 1
                }}
              >
                {updating ? 'Saving Changes...' : `Update Ticket Status to ${actionStatus}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
