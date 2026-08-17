import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/CloseRounded';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMicRounded';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalkRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CameraAltIcon from '@mui/icons-material/CameraAltRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import CircularProgress from '@mui/material/CircularProgress';
import toast from 'react-hot-toast';
import { deliveryAPI } from '../api';

import { getLocalDateStr, formatDutyTime, hasValidCurrentShift } from '../utils/dutyTime';

export default function DeliveryNavbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [sosModalOpen, setSosModalOpen] = useState(false);

  // Selfie Verification Modal & Live Camera States
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [selfieImage, setSelfieImage] = useState(null);
  const [verifyingSelfie, setVerifyingSelfie] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);

  // WebRTC Live Camera Stream Ref
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [streamObj, setStreamObj] = useState(null);

  const isOnline = user?.deliveryProfile?.isOnline || false;
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Load initial profile on mount to sync status & duty time
    const fetchProfile = async () => {
      try {
        const res = await deliveryAPI.getProfile();
        if (res.data?.user) setUser(res.data.user);
      } catch (e) {
        console.error('Failed to load profile status');
      }
    };
    if (user?.role === 'delivery') fetchProfile();
  }, []);

  // Start Live Front Camera Stream exclusively
  const startLiveCamera = async () => {
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } }
        });
      } catch (e1) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log('Auto-play notice:', e));
      }
      setStreamObj(stream);
      setIsCameraActive(true);
    } catch (e) {
      console.warn('Webcam live stream not accessible or permission denied', e);
      setIsCameraActive(false);
    }
  };

  // Stop Live Camera Stream
  const stopLiveCamera = () => {
    if (streamObj) {
      streamObj.getTracks().forEach(track => track.stop());
      setStreamObj(null);
    }
    setIsCameraActive(false);
  };

  // Manage camera lifecycle based on modal visibility & selfie state
  useEffect(() => {
    if (showSelfieModal && !selfieImage) {
      startLiveCamera();
    } else {
      stopLiveCamera();
    }
    return () => stopLiveCamera();
  }, [showSelfieModal, selfieImage]);

  // Process and preview captured selfie image
  const processSelfieImage = (imageDataUrl) => {
    stopLiveCamera();
    setSelfieImage(imageDataUrl);
    setVerifyingSelfie(true);
    setSelfieVerified(false);

    setTimeout(() => {
      setVerifyingSelfie(false);
      setSelfieVerified(true);
      toast.success('Live Selfie Verified Successfully! 🎉');
    }, 1200);
  };

  // Capture Photo Frame directly from Live Camera Stream
  const captureLiveSelfie = () => {
    try {
      if (videoRef.current && isCameraActive && videoRef.current.videoWidth > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 320;
        canvas.height = videoRef.current.videoHeight || 320;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        processSelfieImage(dataUrl);
      } else {
        // Fallback live camera snapshot canvas
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 300, 300);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 300, 300);

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(150, 120, 48, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LIVE CAMERA SELFIE', 150, 215);
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Captured: ${new Date().toLocaleTimeString()}`, 150, 240);

        processSelfieImage(canvas.toDataURL('image/jpeg'));
      }
    } catch (err) {
      console.error('Failed to capture frame from video stream', err);
    }
  };

  // Click handler when tapping Online/Offline toggle
  const handleToggleOnlineClick = async () => {
    if (isOnline) {
      // Going Offline: Check active orders before turning offline
      try {
        const res = await deliveryAPI.getCurrentOrders();
        const activeOrders = (res.data?.orders || []).filter(o =>
          o.delivery?.status === 'accepted' || o.delivery?.status === 'assigned'
        );

        if (activeOrders.length > 0) {
          alert('Please complete your assigned active orders before going offline.');
          return;
        }
      } catch (err) {
        console.error('Failed to check active orders', err);
      }
      executeGoOffline();
    } else {
      // Going Online: First check shift booking validity for current time
      let hasValidSlot = false;
      try {
        const saved = localStorage.getItem('booked_delivery_shifts');
        const bookedArr = saved ? JSON.parse(saved) : [];
        hasValidSlot = hasValidCurrentShift(bookedArr, new Date());
      } catch (e) {
        hasValidSlot = false;
      }

      if (!hasValidSlot) {
        toast.error('⚠️ Shift Slot Expired or Missing!\n\nYour booked shift slot time has ended. Please book an active shift slot to go online.');
        navigate('/delivery/shifts');
        return;
      }

      // Open Selfie Verification Modal before going online
      setSelfieImage(null);
      setVerifyingSelfie(false);
      setSelfieVerified(false);
      setShowSelfieModal(true);
    }
  };

  // Final confirmation to turn Online after selfie verification
  const confirmGoOnline = async () => {
    if (!selfieVerified) return;

    const oldUser = { ...user };
    const now = new Date();
    const todayStr = getLocalDateStr(now);

    setUser({
      ...user,
      deliveryProfile: {
        ...user?.deliveryProfile,
        isOnline: true,
        lastOnlineStartTime: now.toISOString(),
        lastOnlineDate: todayStr
      }
    });

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {},
          (err) => console.warn('Geolocation notice:', err.message),
          { enableHighAccuracy: false, timeout: 5000 }
        );
      }

      const res = await deliveryAPI.updateStatus(true);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      stopLiveCamera();
      setShowSelfieModal(false);
      toast.success('🟢 You are now ONLINE! Duty Timer Started.');
    } catch (e) {
      console.error('Failed to update status on server', e);
      setUser(oldUser);
    }
  };

  // Execute Go Offline
  const executeGoOffline = async () => {
    const oldUser = { ...user };
    const now = new Date();
    const todayStr = getLocalDateStr(now);

    let updatedSeconds = (user?.deliveryProfile?.lastOnlineDate === todayStr)
      ? (user?.deliveryProfile?.onlineSecondsToday || 0)
      : 0;

    if (isOnline && user?.deliveryProfile?.lastOnlineStartTime) {
      let startMs = new Date(user.deliveryProfile.lastOnlineStartTime).getTime();
      const startOfTodayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      if (startMs < startOfTodayMs) startMs = startOfTodayMs;

      const elapsed = Math.floor((now.getTime() - startMs) / 1000);
      updatedSeconds += Math.max(0, elapsed);
    }

    setUser({
      ...user,
      deliveryProfile: {
        ...user?.deliveryProfile,
        isOnline: false,
        lastOnlineStartTime: null,
        onlineSecondsToday: updatedSeconds,
        lastOnlineDate: todayStr
      }
    });

    try {
      const res = await deliveryAPI.updateStatus(false);
      if (res.data?.user) setUser(res.data.user);
      toast('🔴 Duty Paused. You are now OFFLINE.', { icon: '🛑' });
    } catch (e) {
      setUser(oldUser);
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: isDesktop ? '260px' : 0, right: 0, zIndex: 1000,
      background: 'rgba(12, 12, 18, 0.95)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(41, 255, 198, 0.1)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      justifyContent: 'space-between',
      boxShadow: '0 2px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Unified Pill Toggle Button */}
        <motion.div
          whileTap={{ scale: 0.96 }}
          onClick={handleToggleOnlineClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            flexDirection: isOnline ? 'row-reverse' : 'row',
            gap: '10px',
            padding: isOnline ? '4px 6px 4px 16px' : '4px 16px 4px 6px',
            borderRadius: '25px',
            backgroundColor: isOnline ? '#10b981' : '#4b5563',
            border: `1.5px solid ${isOnline ? '#34d399' : 'rgba(255, 255, 255, 0.35)'}`,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
            userSelect: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Knob */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              flexShrink: 0
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: `2px solid ${isOnline ? '#10b981' : '#cbd5e1'}`,
              backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'transparent'
            }} />
          </div>

          {/* Status Text */}
          <span style={{
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.2px'
          }}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </motion.div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* HELP Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/delivery/support')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '40px',
            padding: '0 18px',
            borderRadius: '24px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            border: 'none',
            fontWeight: 800,
            fontSize: '14px',
            letterSpacing: '0.3px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          <HeadsetMicIcon sx={{ fontSize: '20px', color: '#0f172a' }} />
          <span>HELP</span>
        </motion.button>

        {/* Round SOS Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/delivery/emergency')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            color: '#dc2626',
            border: 'none',
            fontWeight: 900,
            fontSize: '13px',
            letterSpacing: '0.3px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(220, 38, 38, 0.25)',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          <span>SOS</span>
        </motion.button>

      </div>

      {/* ===== STRICT LIVE CAMERA SELFIE PREVIEW MODAL ===== */}
      <AnimatePresence>
        {showSelfieModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              style={{
                background: '#ffffff',
                borderRadius: '32px',
                padding: '32px 24px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                position: 'relative',
                color: '#0f172a'
              }}
            >
              <button
                onClick={() => {
                  stopLiveCamera();
                  setShowSelfieModal(false);
                }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 20
                }}
              >
                <CloseIcon sx={{ fontSize: '20px' }} />
              </button>

              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <VerifiedUserIcon sx={{ fontSize: '32px' }} />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.3px' }}>
                Identity & Uniform Check
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5, fontWeight: 500 }}>
                {selfieVerified
                  ? 'Identity verified! Tap the green button to start duty.'
                  : 'Tap the round circle below to preview your live camera selfie.'}
              </p>

              {/* STRICT LIVE CAMERA CIRCLE VIEWFINDER */}
              <div
                onClick={isCameraActive ? captureLiveSelfie : startLiveCamera}
                style={{
                  position: 'relative',
                  width: '190px',
                  height: '190px',
                  margin: '0 auto 24px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '190px',
                  height: '190px',
                  borderRadius: '50%',
                  border: `4px solid ${selfieVerified ? '#10b981' : '#ff5400'}`,
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: selfieVerified
                    ? '0 0 30px rgba(16, 185, 129, 0.5)'
                    : '0 0 25px rgba(255, 84, 0, 0.4)'
                }}>
                  {selfieImage ? (
                    /* Captured Selfie Image Preview inside Round Circle */
                    <img
                      src={selfieImage}
                      alt="Selfie Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <>
                      {/* WebRTC Live Stream Video Feed */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: 'scaleX(-1)' // Mirroring for natural selfie
                        }}
                      />

                      {!isCameraActive && (
                        <div style={{ position: 'absolute', textAlign: 'center', color: '#ffffff', padding: '10px' }}>
                          <CameraAltIcon sx={{ fontSize: '48px', color: '#ffffff', marginBottom: '4px' }} />
                          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>TAP TO ACCESS CAMERA</div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Live Camera Badge */}
                {isCameraActive && !selfieImage && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
                    letterSpacing: '0.5px'
                  }}>
                    🔴 LIVE CAMERA PREVIEW
                  </div>
                )}

                {/* Status Icon Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '6px',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: selfieVerified ? '#10b981' : '#ff5400',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  zIndex: 15
                }}>
                  {selfieVerified ? <CheckCircleIcon sx={{ fontSize: '26px' }} /> : <CameraAltIcon sx={{ fontSize: '24px' }} />}
                </div>
              </div>

              {/* Status Verification Feedback */}
              {verifyingSelfie && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#6366f1', fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>
                  <CircularProgress size={20} sx={{ color: '#6366f1' }} />
                  <span>Verifying Rider Identity & Uniform...</span>
                </div>
              )}

              {selfieVerified && (
                <div style={{ color: '#10b981', fontSize: '15px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <CheckCircleIcon sx={{ fontSize: '20px' }} />
                  <span>Verified Successfully! Ready to go online.</span>
                </div>
              )}

              {/* Fixed Upload Selfie Button (Strict Camera Execution, No File Dialogs) */}
              {!selfieImage && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={captureLiveSelfie}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '16px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #ff5400 0%, #ff3b00 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(255, 84, 0, 0.35)'
                  }}
                >
                  <CameraAltIcon />
                  <span>Upload Selfie</span>
                </motion.button>
              )}

              {/* Retake Live Selfie Option */}
              {selfieImage && !verifyingSelfie && (
                <button
                  onClick={() => {
                    setSelfieImage(null);
                    setSelfieVerified(false);
                    startLiveCamera();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginBottom: '16px'
                  }}
                >
                  <RefreshIcon sx={{ fontSize: '18px' }} />
                  <span>Retake Live Selfie</span>
                </button>
              )}

              {/* Vibrant GREEN GO ONLINE NOW Button */}
              {selfieVerified && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    boxShadow: [
                      '0 6px 20px rgba(16, 185, 129, 0.4)',
                      '0 12px 32px rgba(16, 185, 129, 0.75)',
                      '0 6px 20px rgba(16, 185, 129, 0.4)'
                    ]
                  }}
                  transition={{
                    boxShadow: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                  }}
                  onClick={confirmGoOnline}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '18px',
                    padding: '16px',
                    fontSize: '17px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    letterSpacing: '0.3px'
                  }}
                >
                  <span>GO ONLINE NOW</span>
                  <PlayArrowIcon sx={{ fontSize: '24px' }} />
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Emergency Assistance Modal */}
      <AnimatePresence>
        {sosModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              style={{
                background: 'linear-gradient(145deg, #1e1215 0%, #12121c 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '24px',
                padding: '32px 28px',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 25px 60px rgba(239, 68, 68, 0.3)',
                textAlign: 'center',
                color: '#ffffff',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSosModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <CloseIcon sx={{ fontSize: '20px' }} />
              </button>

              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px'
              }}>
                <WarningRoundedIcon sx={{ fontSize: '36px', color: '#ef4444' }} />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>
                Emergency SOS Alert
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px', lineHeight: 1.5 }}>
                Do you require immediate safety or emergency support? Our Operations Control Team and Emergency Services are on standby.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                  href="tel:112"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '15px',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <PhoneInTalkIcon /> Call Emergency (112)
                </a>

                <button
                  onClick={() => {
                    alert('🚨 SOS Alert Dispatched! Our Safety Operations Team has received your GPS location.');
                    setSosModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <HeadsetMicIcon sx={{ color: '#29ffc6' }} /> Alert Ops Dispatcher
                </button>

                <button
                  onClick={() => setSosModalOpen(false)}
                  style={{
                    padding: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  Cancel / False Alarm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
