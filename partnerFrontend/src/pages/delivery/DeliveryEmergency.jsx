import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalkRounded';
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded';
import AddIcon from '@mui/icons-material/AddRounded';

export default function DeliveryEmergency() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState('main'); // 'main' | 'contacts' | 'insurance'
  const [activeCallModal, setActiveCallModal] = useState(null);
  const [openFaqId, setOpenFaqId] = useState(1); // Default FAQ #1 open as shown in reference
  const [showNomineeModal, setShowNomineeModal] = useState(false);
  const [showHospitalsModal, setShowHospitalsModal] = useState(false);

  const isOnline = user?.deliveryProfile?.isOnline || false;

  // Saved nominee state
  const [nominee, setNominee] = useState(() => {
    try {
      const saved = localStorage.getItem('insurance_nominee');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [nomineeForm, setNomineeForm] = useState({ name: '', relation: 'Spouse', phone: '' });

  // Emergency Contacts state initialized from localStorage
  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('emergency_contacts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'Family' });

  useEffect(() => {
    try {
      localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
    } catch (e) {
      console.error(e);
    }
  }, [contacts]);

  const handleCall = (title, number) => {
    setActiveCallModal({ title, number });
  };

  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      alert('Please fill in both name and phone number.');
      return;
    }
    setContacts(prev => [...prev, { id: Date.now(), ...newContact }]);
    setNewContact({ name: '', phone: '', relation: 'Family' });
    setShowAddModal(false);
  };

  const handleDeleteContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleNomineeSubmit = (e) => {
    e.preventDefault();
    if (!nomineeForm.name.trim()) return;
    setNominee(nomineeForm);
    localStorage.setItem('insurance_nominee', JSON.stringify(nomineeForm));
    setShowNomineeModal(false);
  };

  const faqList = [
    {
      id: 1,
      q: 'When is my insurance coverage active?',
      a: `Your insurance is active on the day you complete a delivery and for the next 7 days.\n\nExample:\nIf you deliver on 1st September, your coverage is valid till 8th September. You can raise a claim for any eligible hospitalization or accidental OPD treatment taken between 1st–8th September.\n\n⚠️ The policy covers you only if you are active and delivering through RapidCloth.`
    },
    {
      id: 2,
      q: 'What all is covered under my insurance?',
      a: 'The policy provides comprehensive coverage including:\n• Health Hospitalization Cover up to ₹2,00,000\n• Accidental Death Cover up to ₹10,00,000\n• Accidental OPD Treatment Cover up to ₹10,000\n• Temporary Total Disability (Loss of Pay) support.'
    },
    {
      id: 3,
      q: 'Is 24-hour hospitalization mandatory to claim Insurance?',
      a: 'Yes, for inpatient health claims, a minimum of 24 consecutive hours of hospitalization is mandatory. However, specified day-care procedures and accidental OPD treatments do not require 24-hour admission.'
    },
    {
      id: 4,
      q: 'What is Accidental OPD?',
      a: 'Accidental OPD covers outpatient medical treatment expenses (such as stitches, X-rays, dressings, or minor treatment) caused due to an accident while on duty, without requiring hospital stay.'
    },
    {
      id: 5,
      q: 'What is Loss of Pay (Temporary Total Disability)?',
      a: 'If an accident occurred during an active delivery shift prevents you from working temporarily, Loss of Pay insurance provides weekly financial support while you recover under medical advice.'
    },
    {
      id: 6,
      q: 'How can I avail Insurance during hospitalization?',
      a: 'You can present your digital Insurance E-Card at any of our 12,000+ cashless network hospitals. For non-network hospitals, you can submit original bills for reimbursement within 30 days.'
    },
    {
      id: 7,
      q: 'What documents are required to raise a claim?',
      a: 'Key documents required:\n1. Hospital Discharge Summary\n2. Original itemized medical bills & payment receipts\n3. Doctor prescriptions & diagnostic reports\n4. Copy of FIR (in case of road traffic accidents)\n5. Driver Photo ID & Policy E-Card'
    },
    {
      id: 8,
      q: 'What is covered under Maternity & Family Benefits?',
      a: 'Active delivery partners with eligible tenure get extended family coverage benefits including maternity support and hospital care for spouse and children.'
    },
    {
      id: 9,
      q: 'Where can I check policy details, E-card, nominee or family details?',
      a: 'All policy certificates, E-cards, cashless hospital lists, and nominee details can be reviewed and updated right here in the My Insurance Details section of your app.'
    }
  ];

  return (
    <div style={{
      backgroundColor: '#f4f5f8',
      minHeight: '100vh',
      padding: '16px 16px 60px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0f172a'
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        
        {/* ===== VIEW 2: EMERGENCY CONTACTS ===== */}
        {view === 'contacts' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '8px',
              paddingBottom: '16px'
            }}>
              <button
                onClick={() => setView('main')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0f172a',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowBackIcon sx={{ fontSize: '26px' }} />
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Emergency contacts
              </h2>
            </div>

            {/* Dotted Divider */}
            <div style={{
              borderBottom: '1px dashed #cbd5e1',
              marginBottom: '36px'
            }} />

            {/* Contacts Content */}
            {contacts.length === 0 ? (
              /* Empty State */
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4 }}
                style={{ textAlign: 'center', paddingTop: '50px' }}
              >
                {/* Floating Blinking Light Green Avatar Container */}
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 28px' }}>
                  {/* Blinking Light Green Wave Aura */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.85, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      inset: '-10px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(34, 197, 94, 0.25)',
                      boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
                    }}
                  />
                  
                  {/* Floating Light Green Circle Icon */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                      border: '2px solid #a7f3d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
                      zIndex: 2
                    }}
                  >
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <PersonIcon sx={{ fontSize: '76px', color: '#10b981' }} />
                    </motion.div>
                  </motion.div>
                </div>

                <p style={{
                  fontSize: '16px',
                  color: '#475569',
                  lineHeight: 1.5,
                  maxWidth: '280px',
                  margin: '0 auto 36px',
                  fontWeight: 500,
                  letterSpacing: '-0.1px'
                }}>
                  Please add a contact for emergency reach-out
                </p>

                {/* Animated Glowing RED Action Button */}
                <motion.button
                  whileHover={{ scale: 1.04, translateY: -2 }}
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    boxShadow: [
                      '0 6px 20px rgba(239, 68, 68, 0.4)',
                      '0 12px 32px rgba(239, 68, 68, 0.75)',
                      '0 6px 20px rgba(239, 68, 68, 0.4)'
                    ]
                  }}
                  transition={{
                    boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                    scale: { duration: 0.15 }
                  }}
                  onClick={() => setShowAddModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '18px',
                    padding: '16px 32px',
                    fontSize: '17px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    letterSpacing: '0.2px'
                  }}
                >
                  <span>Add Contact</span>
                  <ArrowForwardIcon sx={{ fontSize: '22px' }} />
                </motion.button>
              </motion.div>
            ) : (
              /* Contacts List */
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                    Saved Contacts ({contacts.length})
                  </span>
                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontWeight: 800,
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add New
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {contacts.map(c => (
                    <div key={c.id} style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '18px'
                        }}>
                          {c.name[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{c.phone} • {c.relation}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleCall(c.name, c.phone)}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#fff7ed',
                            border: 'none',
                            color: '#ea580c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <PhoneInTalkIcon sx={{ fontSize: '20px' }} />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(c.id)}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#fef2f2',
                            border: 'none',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: '20px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ===== VIEW 3: MY INSURANCE DETAILS (EXACT MATCH TO SCREENSHOTS 2 & 3) ===== */}
        {view === 'insurance' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '8px',
              paddingBottom: '16px'
            }}>
              <button
                onClick={() => setView('main')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0f172a',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowBackIcon sx={{ fontSize: '26px' }} />
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                My Insurance Details
              </h2>
            </div>

            {/* Dotted Line Divider */}
            <div style={{ borderBottom: '1px dashed #cbd5e1', marginBottom: '20px' }} />

            {/* 1. Insurance Benefits Main Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              marginBottom: '28px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', margin: 0 }}>
                Insurance Benefits
              </h3>

              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>
                Coverage for
              </div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.3px', marginBottom: '20px' }}>
                {user?.name?.toUpperCase() || 'ASTIK MANDAL'}
              </div>

              {/* 2x2 Grid Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '18px',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>Health</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>₹2,00,000</div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>Accidental death</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>₹10,00,000</div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>OPD Coverage</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>₹10,000</div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>Status</div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: isOnline ? '#10b981' : '#f43f5e'
                  }}>
                    {isOnline ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              {/* Status Warning Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#f43f5e',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1.4
              }}>
                <InfoOutlinedIcon sx={{ fontSize: '16px', color: '#f43f5e' }} />
                <span>Start delivering to activate your insurance</span>
              </div>
            </div>

            {/* 2. Quick Actions */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', marginBottom: '12px' }}>
                Quick actions
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Action 1: Nominee */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNomineeModal(true)}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#fff7ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ea580c'
                    }}>
                      <AddIcon sx={{ fontSize: '24px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        Nominee {nominee ? `(${nominee.name})` : ''}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        {nominee ? `Relation: ${nominee.relation}` : 'Add nominee to secure your family'}
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: '22px' }} />
                </motion.div>

                {/* Action 2: Hospitals */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowHospitalsModal(true)}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#fff7ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ea580c'
                    }}>
                      <LocalHospitalOutlinedIcon sx={{ fontSize: '24px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Hospitals</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        Enjoy Cashless treatment at 12000+ hospitals
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: '22px' }} />
                </motion.div>
              </div>
            </div>

            {/* 3. Learn About Insurance (Horizontal Scroll) */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', marginBottom: '12px' }}>
                Learn about insurance
              </div>

              <div style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollbarWidth: 'none'
              }}>
                {/* Guide Card 1 */}
                <div style={{
                  minWidth: '130px',
                  height: '140px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
                  border: '2px solid #ea580c',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onClick={() => alert('▶ Playing Insurance Guide Video...')}
                >
                  <div style={{ fontSize: '11px', fontWeight: 900, color: '#ea580c', textTransform: 'uppercase', lineHeight: 1.2 }}>
                    INSURANCE<br />GUIDE
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <PlayCircleFilledWhiteIcon sx={{ fontSize: '32px', color: '#ffffff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, color: '#ffffff', textAlign: 'center' }}>
                    Insurance Guide
                  </div>
                </div>

                {/* Guide Card 2 */}
                <div style={{
                  minWidth: '130px',
                  height: '140px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #ccfbf1 0%, #5eead4 100%)',
                  border: '2px solid #ea580c',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onClick={() => alert('▶ Playing OPD Insurance Video...')}
                >
                  <div style={{ fontSize: '11px', fontWeight: 900, color: '#0f766e', textTransform: 'uppercase', lineHeight: 1.2 }}>
                    OPD<br />INSURANCE
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <PlayCircleFilledWhiteIcon sx={{ fontSize: '32px', color: '#ffffff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, color: '#ffffff', textAlign: 'center' }}>
                    OPD
                  </div>
                </div>

                {/* Guide Card 3 */}
                <div style={{
                  minWidth: '130px',
                  height: '140px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #ffedd5 0%, #fdba74 100%)',
                  border: '2px solid #ea580c',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onClick={() => alert('▶ Playing Add Nominee Guide Video...')}
                >
                  <div style={{ fontSize: '11px', fontWeight: 900, color: '#c2410c', textTransform: 'uppercase', lineHeight: 1.2 }}>
                    ADD INSURANCE<br />NOMINEE
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <PlayCircleFilledWhiteIcon sx={{ fontSize: '32px', color: '#ffffff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, color: '#ffffff', textAlign: 'center' }}>
                    Nominee
                  </div>
                </div>
              </div>
            </div>

            {/* 4. FAQs Accordion */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', marginBottom: '12px' }}>
                FAQs
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.04)'
              }}>
                {faqList.map((item, idx) => {
                  const isOpen = openFaqId === item.id;
                  return (
                    <div key={item.id} style={{ borderBottom: idx < faqList.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div
                        onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                        style={{
                          padding: '18px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: isOpen ? '#fafafa' : '#ffffff'
                        }}
                      >
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', paddingRight: '12px', lineHeight: 1.3 }}>
                          {item.q}
                        </span>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ExpandMoreIcon sx={{ color: '#64748b', fontSize: '24px' }} />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{
                              padding: '0 20px 20px',
                              fontSize: '14px',
                              color: '#475569',
                              lineHeight: 1.6,
                              whiteSpace: 'pre-line',
                              borderTop: '1px dashed #e2e8f0',
                              paddingTop: '16px'
                            }}>
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== VIEW 1: MAIN EMERGENCY SCREEN ===== */}
        {view === 'main' && (
          <div>
            {/* Navigation Top Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingTop: '4px'
            }}>
              <button
                onClick={() => navigate('/delivery')}
                style={{
                  background: '#ffffff',
                  border: 'none',
                  color: '#0f172a',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <ArrowBackIcon sx={{ fontSize: '18px' }} />
              </button>

              <button
                onClick={() => navigate('/delivery/support')}
                style={{
                  background: '#ffffff',
                  border: 'none',
                  color: '#0f172a',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <HelpOutlineIcon sx={{ fontSize: '18px' }} />
              </button>
            </div>

            {/* Hero Pulsing Emergency Siren */}
            <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
              <div style={{
                position: 'relative',
                width: '68px',
                height: '68px',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Outer Glowing Wave */}
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.25)'
                  }}
                />
                {/* Middle Wave */}
                <motion.div
                  animate={{ scale: [1, 1.18, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.3 }}
                  style={{
                    position: 'absolute',
                    inset: '-3px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.35)'
                  }}
                />
                {/* Inner Red Core */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.5)',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v2" />
                    <path d="M4.93 4.93l1.41 1.41" />
                    <path d="M19.07 4.93l-1.41 1.41" />
                    <path d="M8 12a4 4 0 0 1 8 0v4H8z" />
                    <path d="M6 16h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                  </svg>
                </div>
              </div>

              <h1 style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '2px',
                letterSpacing: '-0.2px'
              }}>
                Are you in an emergency?
              </h1>
              <p style={{
                fontSize: '11px',
                color: '#64748b',
                margin: 0,
                fontWeight: 500
              }}>
                Use these options only in emergency
              </p>
            </div>

            {/* Primary Helpline Card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCall('RapidCloth Emergency Helpline', '1800-RAPID-SOS')}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                border: '1px solid rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ea580c'
                }}>
                  <PhoneInTalkIcon sx={{ fontSize: '18px' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  Call helpline
                </span>
              </div>
              <ChevronRightIcon sx={{ fontSize: '20px', color: '#0f172a' }} />
            </motion.div>

            {/* Two Column Grid Cards (Police & Ambulance) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '14px'
            }}>
              {/* Call Police Card */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCall('Police Control Room', '112')}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer',
                  border: '1px solid rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#334155',
                  marginBottom: '8px'
                }}>
                  <LocalPoliceOutlinedIcon sx={{ fontSize: '22px' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Call<br />Police
                </span>
              </motion.div>

              {/* Call Ambulance Card */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCall('Ambulance Emergency', '108')}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer',
                  border: '1px solid rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#334155',
                  marginBottom: '8px'
                }}>
                  <MedicalServicesOutlinedIcon sx={{ fontSize: '22px' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Call<br />Ambulance
                </span>
              </motion.div>
            </div>

            {/* Lower Action Items List */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0, 0, 0, 0.04)'
            }}>
              {/* Emergency Details */}
              <div
                onClick={() => setView('contacts')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px dashed #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444'
                  }}>
                    <AddCircleOutlineIcon sx={{ fontSize: '22px' }} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    Emergency Details
                  </span>
                </div>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ea580c'
                }}>
                  <ChevronRightIcon sx={{ fontSize: '20px' }} />
                </div>
              </div>

              {/* Insurance Details */}
              <div
                onClick={() => setView('insurance')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981'
                  }}>
                    <ShieldOutlinedIcon sx={{ fontSize: '22px' }} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    Insurance Details
                  </span>
                </div>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ea580c'
                }}>
                  <ChevronRightIcon sx={{ fontSize: '20px' }} />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ===== ADD NOMINEE MODAL ===== */}
      <AnimatePresence>
        {showNomineeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.6)',
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
                background: '#ffffff',
                borderRadius: '24px',
                padding: '28px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setShowNomineeModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <CloseIcon sx={{ fontSize: '18px' }} />
              </button>

              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Add Insurance Nominee
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Nominee receives policy benefit claims in case of emergency.
              </p>

              <form onSubmit={handleNomineeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', textAlign: 'left' }}>
                    Nominee Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suman Mandal"
                    value={nomineeForm.name}
                    onChange={e => setNomineeForm({ ...nomineeForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', textAlign: 'left' }}>
                    Relationship
                  </label>
                  <select
                    value={nomineeForm.relation}
                    onChange={e => setNomineeForm({ ...nomineeForm, relation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '15px',
                      backgroundColor: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', textAlign: 'left' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={nomineeForm.phone}
                    onChange={e => setNomineeForm({ ...nomineeForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  style={{
                    marginTop: '10px',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    fontWeight: 800,
                    border: 'none',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  Save Nominee Details
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CASHLESS HOSPITALS MODAL ===== */}
      <AnimatePresence>
        {showHospitalsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.6)',
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
                background: '#ffffff',
                borderRadius: '24px',
                padding: '28px',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setShowHospitalsModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <CloseIcon sx={{ fontSize: '18px' }} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <LocalHospitalOutlinedIcon sx={{ fontSize: '32px', color: '#ea580c' }} />
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    12,000+ Cashless Hospitals
                  </h3>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                    Direct Cashless Admission Available
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>Apollo Multi-Specialty Hospital</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Emergency Cashless • 2.4 km away</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>Fortis Healthcare Emergency</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Emergency Cashless • 4.1 km away</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>Max Super Specialty Hospital</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>24x7 Trauma & Cashless OPD • 5.8 km away</div>
                </div>
              </div>

              <button
                onClick={() => setShowHospitalsModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#0f172a',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ADD EMERGENCY CONTACT MODAL ===== */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.6)',
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
                background: '#ffffff',
                borderRadius: '24px',
                padding: '28px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <CloseIcon sx={{ fontSize: '18px' }} />
              </button>

              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Add Emergency Contact
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                This contact will be notified automatically during emergency alerts.
              </p>

              <form onSubmit={handleAddContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', textAlign: 'left' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newContact.name}
                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', textAlign: 'left' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={newContact.phone}
                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', textAlign: 'left' }}>
                    Relationship
                  </label>
                  <select
                    value={newContact.relation}
                    onChange={e => setNewContact({ ...newContact, relation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '15px',
                      backgroundColor: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="Family">Family</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  style={{
                    marginTop: '10px',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 800,
                    border: 'none',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Save Emergency Contact
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== INTERACTIVE DIAL MODAL ===== */}
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
              background: 'rgba(15, 23, 42, 0.65)',
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
                background: '#ffffff',
                borderRadius: '24px',
                padding: '28px',
                maxWidth: '380px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setActiveCallModal(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#64748b',
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
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#ef4444'
              }}>
                <PhoneInTalkIcon sx={{ fontSize: '32px' }} />
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                {activeCallModal.title}
              </h3>
              <p style={{ fontSize: '17px', fontWeight: 800, color: '#ef4444', marginBottom: '24px' }}>
                {activeCallModal.number}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={`tel:${activeCallModal.number.replace(/\s+/g, '')}`}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 800,
                    textDecoration: 'none',
                    fontSize: '15px',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Dial Now
                </a>
                <button
                  onClick={() => setActiveCallModal(null)}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#64748b',
                    fontWeight: 700,
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
