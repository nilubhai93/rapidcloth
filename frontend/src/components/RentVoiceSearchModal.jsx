import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MicIcon from '@mui/icons-material/MicRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from 'react-router-dom';

export default function RentVoiceSearchModal({ isOpen, onClose, onQuerySubmit }) {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let recognition = null;
    if (isOpen) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onstart = () => {
            setListening(true);
            setError('');
          };

          recognition.onresult = (event) => {
            const current = event.results[0][0]?.transcript;
            setTranscript(current);
            if (event.results[0].isFinal) {
              setListening(false);
              setTimeout(() => {
                onClose();
                if (onQuerySubmit) onQuerySubmit(current);
                else navigate(`/rent?search=${encodeURIComponent(current)}`);
              }, 800);
            }
          };

          recognition.onerror = (err) => {
            console.error('Speech error:', err);
            setListening(false);
            setError('Could not hear clearly. Please try again or type below.');
          };

          recognition.onend = () => {
            setListening(false);
          };

          recognition.start();
        } catch (e) {
          console.error(e);
          setListening(false);
          setError('Voice search initialization failed.');
        }
      } else {
        setError('Voice search is not supported on this browser.');
      }
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch (_) {}
      }
    };
  }, [isOpen]);

  const handleManualSearch = (term) => {
    onClose();
    if (onQuerySubmit) onQuerySubmit(term);
    else navigate(`/rent?search=${encodeURIComponent(term)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 10, 25, 0.75)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px',
              background: '#0a1128', borderRadius: '24px', padding: '32px 24px', textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)', border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'rgba(212, 175, 55, 0.15)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#f5d061', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <CloseIcon style={{ fontSize: '18px' }} />
            </button>

            {/* Pulsing Mic Circle */}
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {listening && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(212, 175, 55, 0.4)' }}
                />
              )}
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, boxShadow: '0 8px 20px rgba(212, 175, 55, 0.35)' }}>
                <MicIcon style={{ fontSize: '36px' }} />
              </div>
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
              {listening ? 'Listening for rental outfits...' : transcript ? 'Searching...' : 'Voice Search'}
            </h3>

            {transcript ? (
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#f5d061', margin: '8px 0 16px', fontStyle: 'italic' }}>
                "{transcript}"
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 16px' }}>
                {error || 'Try saying "Designer Lehenga", "Groom Sherwani", or "Tuxedo"'}
              </p>
            )}

            {/* Quick sample chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
              {['Lehenga for rent', 'Groom Sherwani', 'Party Gowns'].map((sample, i) => (
                <button
                  key={i}
                  onClick={() => handleManualSearch(sample)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.4)',
                    background: 'rgba(212, 175, 55, 0.15)', color: '#f5d061', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'; e.currentTarget.style.borderColor = '#d4af37'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'; e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'; }}
                >
                  {sample}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
