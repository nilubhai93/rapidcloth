import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import LaunchIcon from '@mui/icons-material/LaunchRounded';
import api from '../../api/index';

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const rejectionReasons = [
    'Wrong or Invalid Document',
    'Unclear/Blurry Document Image',
    'Service not available in your Pincode',
    'Business details do not match ID proof',
    'Suspicious or Fraudulent activity',
    'Incomplete application information',
    'Custom'
  ];

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admin/sellers');
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load applications. Make sure you are an admin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      const finalReason = reason === 'Custom' ? customReason : reason;
      await api.put(`/admin/sellers/${id}`, { status, rejectionReason: finalReason });
      setRejectingApp(null);
      setRejectionReason('');
      setCustomReason('');
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const getFileUrl = (path) => {
    if (!path) return '';
    const safePath = path.replace(/\\/g, '/');
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}/${safePath}`;
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
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0 }}>
          Seller Approvals
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px', margin: 0, fontWeight: 500 }}>
          Manage user seller applications and store approvals
        </p>
      </div>

      {error ? (
        <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
          {error}
        </div>
      ) : applications.length === 0 ? (
        <div style={{ padding: '30px 16px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>No seller applications currently found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {applications.map((app, i) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{app.storeName}</h2>
                    <span style={{
                      padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px',
                      background: app.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: app.status === 'approved' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : '#f59e0b',
                      border: `1px solid ${app.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}>
                      {app.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px', margin: 0 }}>
                    Applied by: <strong style={{ color: 'var(--text-primary)' }}>{app.userId?.name}</strong> <span style={{ opacity: 0.7 }}>({app.userId?.email})</span>
                  </p>
                </div>

                {app.documentPath && (
                  <a
                    href={getFileUrl(app.documentPath)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600,
                      color: '#FF6B6B', background: 'rgba(255, 107, 107, 0.08)', padding: '5px 10px',
                      borderRadius: '6px', border: '1px solid rgba(255, 107, 107, 0.2)', textDecoration: 'none'
                    }}
                  >
                    <LaunchIcon sx={{ fontSize: 14 }} /> View Document
                  </a>
                )}
              </div>

              <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '10px', background: 'var(--bg-elevated)', padding: '10px 12px', 
                borderRadius: '8px', border: '1px solid var(--border)' 
              }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Store Narrative</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{app.description || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Business Address</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{app.address || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Main Category</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>{app.categories || 'Clothing'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Identity Proof</p>
                  <p style={{ fontSize: '11px', color: '#FF6B6B', fontWeight: 700, margin: 0 }}>{app.documentType || 'Not specified'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Business Contact</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>{app.businessPhone || 'Not provided'}</p>
                </div>
              </div>

              {app.status === 'rejected' && app.rejectionReason && (
                <div style={{ padding: '8px 10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <p style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, margin: 0 }}>Rejection Reason: <span style={{ fontWeight: 400 }}>{app.rejectionReason}</span></p>
                </div>
              )}

              {app.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => handleUpdateStatus(app._id, 'approved')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 14px', borderRadius: '6px', border: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white',
                      fontWeight: 700, fontSize: '11px', cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 15 }} /> Approve Application
                  </button>
                  <button
                    onClick={() => setRejectingApp(app)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', 
                      padding: '6px 14px', borderRadius: '6px', 
                      fontWeight: 700, fontSize: '11px', cursor: 'pointer'
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 15 }} /> Reject Application
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal (Compact) */}
      <AnimatePresence>
        {rejectingApp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)', zIndex: 3000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px'
            }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
              style={{
                width: '100%', maxWidth: '380px', background: 'var(--bg-card)',
                borderRadius: '12px', border: '1px solid var(--border)',
                padding: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px', margin: 0 }}>Reject Application</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '12px', marginTop: '2px' }}>
                Please select a reason for rejecting <strong style={{ color: 'var(--text-primary)' }}>{rejectingApp.storeName}</strong>
              </p>

              <div style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
                {rejectionReasons.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setRejectionReason(reason)}
                    style={{
                      padding: '8px 10px', borderRadius: '6px', textAlign: 'left',
                      background: rejectionReason === reason ? 'rgba(255, 107, 107, 0.12)' : 'var(--bg-elevated)',
                      border: `1px solid ${rejectionReason === reason ? '#FF6B6B' : 'var(--border)'}`,
                      color: rejectionReason === reason ? '#FF6B6B' : 'var(--text-primary)',
                      fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {rejectionReason === 'Custom' && (
                <div style={{ marginBottom: '12px' }}>
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom rejection reason..."
                    style={{
                      width: '100%', padding: '6px 8px', borderRadius: '6px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: '11px', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button
                  onClick={() => setRejectingApp(null)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectionReason || (rejectionReason === 'Custom' && !customReason.trim())}
                  onClick={() => handleUpdateStatus(rejectingApp._id, 'rejected', rejectionReason)}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: 'none',
                    background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    opacity: (!rejectionReason || (rejectionReason === 'Custom' && !customReason.trim())) ? 0.5 : 1
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
