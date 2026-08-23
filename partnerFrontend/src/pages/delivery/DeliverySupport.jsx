import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import GrainOutlinedIcon from '@mui/icons-material/GrainOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgentRounded';
import DeliveryPartnerAvatar from '../../components/DeliveryPartnerAvatar';

export default function DeliverySupport() {
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myTickets, setMyTickets] = useState([]);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const res = await deliveryAPI.getSupportTickets();
      if (res.data?.tickets) setMyTickets(res.data.tickets);
    } catch (err) {
      console.error('Fetch tickets error:', err);
    }
  };

  const handleFormSubmit = async () => {
    if (!issueText.trim()) {
      toast.error('Please describe your issue in detail');
      return;
    }
    setSubmitting(true);
    try {
      await deliveryAPI.createSupportTicket(selectedIssue.title, issueText);
      setTicketSubmitted(true);
      toast.success('Support ticket sent to Admin panel!');
      fetchMyTickets();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const issuesList = [
    { id: 1, title: 'Order earning issue', icon: <MonetizationOnOutlinedIcon /> },
    { id: 2, title: 'Incentives and Payout issue', icon: <PaymentsOutlinedIcon /> },
    { id: 3, title: 'Daily incentive issue', icon: <AccountBalanceWalletOutlinedIcon /> },
    { id: 4, title: 'Incorrect Payout to Bank', icon: <AccountBalanceOutlinedIcon /> },
    { id: 5, title: 'Activate rain mode', icon: <GrainOutlinedIcon /> },
    { id: 6, title: 'Floating cash issue', icon: <ReceiptLongOutlinedIcon /> },
    { id: 7, title: 'Duty related issues', icon: <TwoWheelerOutlinedIcon /> },
    { id: 8, title: 'Know about Insurance Benefits', icon: <HealthAndSafetyOutlinedIcon /> },
    { id: 9, title: 'Update Personal Details', icon: <PersonOutlinedIcon /> },
    { id: 10, title: 'Request new uniform/bag/rain coat', icon: <CheckroomOutlinedIcon /> },
    { id: 11, title: 'Report a technical issue', icon: <BuildOutlinedIcon /> },
    { id: 12, title: 'Add or Remove Secondary Zone', icon: <LocationOnOutlinedIcon /> },
    { id: 13, title: 'I want to leave RapidCloth', icon: <ExitToAppOutlinedIcon /> },
  ];

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setTicketSubmitted(false);
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '8px 8px 80px',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '20px' }} />
        </button>
      </div>

      {/* Hero Welcome Banner */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 900,
          color: '#0f172a',
          marginBottom: '8px',
          letterSpacing: '-0.3px'
        }}>
          Welcome to the{' '}
          <span style={{
            display: 'inline-block',
            color: '#0f172a'
          }}>
            Delivery Partner Help Center
          </span>
        </h1>

        {/* Illustration Avatar Card */}
        <div style={{
          background: 'var(--bg-card, #0e1c3e)',
          borderRadius: '20px',
          padding: '20px 24px',
          maxWidth: '340px',
          margin: '0 auto',
          border: '1.5px solid rgba(255, 84, 0, 0.35)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Delivery Partner Character Avatar */}
          <DeliveryPartnerAvatar width={240} height={185} className="pulse-glow-avatar float-soft" />

          <p style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 700, margin: '12px 0 4px', lineHeight: 1.4 }}>
            Need any help with your delivery duty?
          </p>
          <p style={{ fontSize: '15px', color: '#ffffff', fontWeight: 900, margin: 0, lineHeight: 1.3 }}>
            RapidCloth Partner Support is here for you 24/7.
          </p>
        </div>
      </div>

      {/* Section Title */}
      <div style={{ marginBottom: '14px', paddingLeft: '2px' }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 900,
          color: '#0f172a',
          margin: 0
        }}>
          Raise a new issue
        </h2>
      </div>

      {/* Issue List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        background: 'var(--bg-card)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        {issuesList.map((issue, index) => (
          <motion.div
            key={issue.id}
            whileTap={{ backgroundColor: 'rgba(249,115,22,0.08)' }}
            onClick={() => handleIssueClick(issue)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              cursor: 'pointer',
              borderBottom: index < issuesList.length - 1 ? '1px dashed var(--border)' : 'none',
              transition: 'background 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                flexShrink: 0
              }}>
                {React.cloneElement(issue.icon, { sx: { fontSize: '16px' } })}
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                {issue.title}
              </span>
            </div>

            <ChevronRightIcon sx={{ color: '#f59e0b', fontSize: '18px' }} />
          </motion.div>
        ))}
      </div>

      {/* Interactive Issue Resolution Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '24px',
                padding: '28px',
                maxWidth: '460px',
                width: '100%',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSelectedIssue(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'var(--bg-elevated)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <CloseIcon sx={{ fontSize: '18px' }} />
              </button>

              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                {selectedIssue.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                RapidCloth Partner Support is ready to assist you with this issue.
              </p>

              {ticketSubmitted ? (
                <div style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  textAlign: 'center'
                }}>
                  <p style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>
                    ✅ Ticket Raised Successfully!
                  </p>
                  <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>
                    Ticket ID: #RC-{Math.floor(100000 + Math.random() * 900000)}. Our support executive will reach out to you shortly.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea
                    placeholder="Describe your issue in detail..."
                    rows={3}
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                  <button
                    disabled={submitting}
                    onClick={handleFormSubmit}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #ff5400 0%, #ff6b00 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      border: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '15px',
                      boxShadow: '0 4px 15px rgba(255,84,0,0.4)',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? 'Submitting to Admin...' : 'Submit Ticket to RapidCloth'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
