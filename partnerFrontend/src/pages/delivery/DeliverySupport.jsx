import React, { useState } from 'react';
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

export default function DeliverySupport() {
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

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
      maxWidth: '680px',
      margin: '0 auto',
      padding: '16px 12px 60px',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '26px' }} />
        </button>
      </div>

      {/* Hero Welcome Banner */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '20px',
          letterSpacing: '-0.3px'
        }}>
          Welcome to the{' '}
          <span style={{
            position: 'relative',
            display: 'inline-block',
            paddingBottom: '4px'
          }}>
            Delivery Partner Help Center
            <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '8px' }} viewBox="0 0 200 8" fill="none">
              <path d="M2 5C50 2 150 2 198 5" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* Illustration Avatar Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(254,226,226,0.15) 0%, rgba(254,215,170,0.15) 100%)',
          borderRadius: '24px',
          padding: '28px 20px',
          maxWidth: '360px',
          margin: '0 auto',
          border: '1px solid rgba(249,115,22,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Agent Avatar Box */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 8px 20px rgba(244,114,182,0.3)',
            position: 'relative'
          }}>
            <SupportAgentIcon sx={{ fontSize: '54px', color: '#831843' }} />
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
            Need any help?
          </p>
          <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700, margin: '2px 0 0' }}>
            RapidCloth is here for you.
          </p>
        </div>
      </div>

      {/* Section Title */}
      <h2 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '16px',
        paddingLeft: '4px'
      }}>
        Raise a new issue
      </h2>

      {/* Issue List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        background: 'var(--bg-card)',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
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
              padding: '16px 20px',
              cursor: 'pointer',
              borderBottom: index < issuesList.length - 1 ? '1px dashed var(--border)' : 'none',
              transition: 'background 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                flexShrink: 0
              }}>
                {issue.icon}
              </div>
              <span style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                {issue.title}
              </span>
            </div>

            <ChevronRightIcon sx={{ color: '#f97316', fontSize: '22px' }} />
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
                    onClick={() => setTicketSubmitted(true)}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '15px',
                      boxShadow: '0 4px 15px rgba(249,115,22,0.3)'
                    }}
                  >
                    Submit Ticket to RapidCloth
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
