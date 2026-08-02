import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalkRounded';
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmberRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';

export default function DeliveryEmergency() {
  const navigate = useNavigate();
  const [activeCallModal, setActiveCallModal] = useState(null);

  const handleCall = (title, number) => {
    setActiveCallModal({ title, number });
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '16px 16px 60px',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Navigation Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px'
      }}>
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

        <button
          onClick={() => navigate('/delivery/support')}
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
          <HelpOutlineIcon sx={{ fontSize: '26px' }} />
        </button>
      </div>

      {/* Siren Icon Hero */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 35px rgba(239,68,68,0.5)',
            border: '4px solid rgba(254,202,202,0.4)'
          }}
        >
          <WarningAmberIcon sx={{ fontSize: '48px', color: '#ffffff' }} />
        </motion.div>

        <h1 style={{
          fontSize: '26px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '6px',
          letterSpacing: '-0.3px'
        }}>
          Are you in an emergency?
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          margin: 0,
          fontWeight: 500
        }}>
          Use these options only in emergency
        </p>
      </div>

      {/* Main Helpline Action Card */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => handleCall('RapidCloth Emergency Helpline', '1800-RAPID-SOS')}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'rgba(249,115,22,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f97316'
          }}>
            <PhoneInTalkIcon sx={{ fontSize: '24px' }} />
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Call <span style={{ color: '#f97316' }}>RapidCloth</span> helpline
            </span>
          </div>
        </div>
        <ChevronRightIcon sx={{ fontSize: '26px', color: 'var(--text-primary)' }} />
      </motion.div>

      {/* Two Column Grid Emergency Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '36px'
      }}>
        {/* Police Card */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCall('Police Control Room', '112')}
          style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            marginBottom: '16px'
          }}>
            <LocalPoliceOutlinedIcon sx={{ fontSize: '32px' }} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            Call<br />Police
          </span>
        </motion.div>

        {/* Ambulance Card */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCall('Ambulance Emergency', '108')}
          style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            marginBottom: '16px'
          }}>
            <MedicalServicesOutlinedIcon sx={{ fontSize: '32px' }} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            Call an<br />ambulance
          </span>
        </motion.div>
      </div>

      {/* Lower Details List */}
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
        {/* Emergency Details */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px dashed var(--border)',
          cursor: 'pointer'
        }}
        onClick={() => alert('🚨 Emergency Contact Contacts registered in your RapidCloth Profile:\n1. Ops Dispatch: +91 98765 43210\n2. Primary Nominee: Contacted upon SOS trigger.')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <AddCircleOutlineIcon sx={{ fontSize: '24px' }} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Emergency Details
            </span>
          </div>
          <ChevronRightIcon sx={{ color: '#f97316', fontSize: '22px' }} />
        </div>

        {/* Insurance Details */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          cursor: 'pointer'
        }}
        onClick={() => alert('🛡️ RapidCloth Partner Protection Insurance:\nPolicy No: RC-INS-2026-8894\nMedical Cover: Up to ₹5,00,000\nAccidental Cover: Active on duty')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <ShieldOutlinedIcon sx={{ fontSize: '24px' }} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Insurance Details
            </span>
          </div>
          <ChevronRightIcon sx={{ color: '#f97316', fontSize: '22px' }} />
        </div>
      </div>

      {/* Interactive Emergency Call Modal */}
      <AnimatePresence>
        {activeCallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.8)',
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
                maxWidth: '400px',
                width: '100%',
                border: '1px solid #ef4444',
                boxShadow: '0 20px 50px rgba(239, 68, 68, 0.3)',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setActiveCallModal(null)}
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

              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#ef4444'
              }}>
                <PhoneInTalkIcon sx={{ fontSize: '32px' }} />
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {activeCallModal.title}
              </h3>
              <p style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444', marginBottom: '24px' }}>
                {activeCallModal.number}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                  href={`tel:${activeCallModal.number.replace(/\s+/g, '')}`}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '15px',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  Dial Now ({activeCallModal.number})
                </a>
                <button
                  onClick={() => setActiveCallModal(null)}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
