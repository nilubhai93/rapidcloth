import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { deliveryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import DoneAllIcon from '@mui/icons-material/DoneAllRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import TwoWheelerIcon from '@mui/icons-material/TwoWheelerRounded';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import GroupAddIcon from '@mui/icons-material/GroupAddRounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import CampaignIcon from '@mui/icons-material/CampaignRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import CreditCardIcon from '@mui/icons-material/CreditCardRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { formatDutyTime, getLocalDateStr } from '../../utils/dutyTime';

// Isolated 1-Second Duty Ticker (Prevents Full Dashboard Re-Renders)
const DutyTimer = React.memo(({ user, isOnline }) => {
  const [dutySeconds, setDutySeconds] = useState(0);

  useEffect(() => {
    const calcSeconds = () => {
      if (!user?.deliveryProfile) return 0;
      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const profileDate = user.deliveryProfile.lastOnlineDate;

      const baseSec = (profileDate === todayStr) ? (user.deliveryProfile.onlineSecondsToday || 0) : 0;

      if (user.deliveryProfile.isOnline && user.deliveryProfile.lastOnlineStartTime) {
        let startMs = new Date(user.deliveryProfile.lastOnlineStartTime).getTime();
        const startOfTodayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (startMs < startOfTodayMs) {
          startMs = startOfTodayMs;
        }

        const elapsedSec = Math.floor((now.getTime() - startMs) / 1000);
        return baseSec + Math.max(0, elapsedSec);
      }
      return baseSec;
    };

    setDutySeconds(calcSeconds());

    const timer = setInterval(() => {
      setDutySeconds(calcSeconds());
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.deliveryProfile?.lastOnlineDate, user?.deliveryProfile?.lastOnlineStartTime, user?.deliveryProfile?.onlineSecondsToday, isOnline]);

  return (
    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
      {formatDutyTime(dutySeconds)}
    </span>
  );
});

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHotspotModal, setShowHotspotModal] = useState(false);

  // Live real-time temperature state
  const [liveTemp, setLiveTemp] = useState(27);

  // Weather condition state: 'cloudy' | 'sunny' | 'rainy' | 'stormy'
  const [weatherMode, setWeatherMode] = useState(() => {
    return localStorage.getItem('delivery_weather_mode') || 'cloudy';
  });

  // Listen to global weather updates from DeliveryLayout
  useEffect(() => {
    const handleWeatherUpdate = (e) => {
      if (e.detail) {
        if (e.detail.mode) setWeatherMode(e.detail.mode);
        if (e.detail.temp !== undefined) setLiveTemp(e.detail.temp);
      }
    };
    window.addEventListener('delivery_weather_updated', handleWeatherUpdate);
    return () => window.removeEventListener('delivery_weather_updated', handleWeatherUpdate);
  }, []);

  const weatherConfigs = {
    rainy: {
      pillText: `🌧️ ${liveTemp}°C • Heavy Rain (+₹35/order)`,
      pillBg: 'rgba(156, 163, 175, 0.2)',
      pillBorder: 'rgba(209, 213, 219, 0.4)',
      pillColor: '#e5e7eb',
      cardBg: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
      glowBg: 'radial-gradient(circle, rgba(156,163,175,0.2) 0%, rgba(0,0,0,0) 70%)',
      title: '🌧️ Rain Surge Active (+₹35 Extra!)',
      subtitle: 'Heavy Rain in your area • 1.8x Pay Surge + ₹35 Rain Incentive Active',
      buttonText: 'Go Online for Rain Surge 🌧️',
      buttonBg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      buttonShadow: '0 6px 20px rgba(0, 0, 0, 0.5)'
    },
    sunny: {
      pillText: `☀️ ${liveTemp}°C • Sunny & Clear`,
      pillBg: 'rgba(217, 119, 6, 0.2)',
      pillBorder: 'rgba(245, 158, 11, 0.4)',
      pillColor: '#fbbf24',
      cardBg: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
      glowBg: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(0,0,0,0) 70%)',
      title: '☀️ Sunny Peak Hours Live!',
      subtitle: '12:00 PM – 4:00 PM • 1.5x Peak Surge Active',
      buttonText: "Let's book and go online",
      buttonBg: 'linear-gradient(135deg, #44403c 0%, #292524 100%)',
      buttonShadow: '0 6px 20px rgba(0, 0, 0, 0.5)'
    },
    cloudy: {
      pillText: `⛅ ${liveTemp}°C • Overcast / Cloudy`,
      pillBg: 'rgba(148, 163, 184, 0.2)',
      pillBorder: 'rgba(203, 213, 225, 0.4)',
      pillColor: '#cbd5e1',
      cardBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      glowBg: 'radial-gradient(circle, rgba(148,163,184,0.2) 0%, rgba(0,0,0,0) 70%)',
      title: '⛅ Cloudy Weather Shift Live!',
      subtitle: 'Cool breeze & steady order demand • 1.2x Pay Active',
      buttonText: 'Book Slot & Go Online',
      buttonBg: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
      buttonShadow: '0 6px 20px rgba(0, 0, 0, 0.5)'
    },
    stormy: {
      pillText: `⛈️ ${liveTemp}°C • Thunderstorm (+₹50/order)`,
      pillBg: 'rgba(161, 161, 170, 0.2)',
      pillBorder: 'rgba(212, 212, 216, 0.4)',
      pillColor: '#e4e4e7',
      cardBg: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
      glowBg: 'radial-gradient(circle, rgba(161,161,170,0.2) 0%, rgba(0,0,0,0) 70%)',
      title: '⛈️ Storm Safety Bonus (+₹50 Extra!)',
      subtitle: 'Severe Weather Warning • 2.0x Mega Surge + ₹50 Bonus Pay Active',
      buttonText: 'Claim Storm Bonus Pay ⛈️',
      buttonBg: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
      buttonShadow: '0 6px 20px rgba(0, 0, 0, 0.6)'
    }
  };

  const currWeather = weatherConfigs[weatherMode] || weatherConfigs.cloudy;

  const isOnline = user?.deliveryProfile?.isOnline || false;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statsRes = await deliveryAPI.getEarnings();
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
        Loading Feed Dashboard...
      </div>
    );
  }

  const todayOrders = stats?.todayOrders || 0;
  // Calculate milestone progress percentage
  const milestoneTarget = 28;
  const progressPercent = Math.min(100, Math.round((todayOrders / milestoneTarget) * 100));

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '8px 8px 60px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0f172a'
    }}>
      
      {/* 1. TOP HERO HEADER & WEATHER ADAPTIVE SHIFT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: currWeather.cardBg,
          borderRadius: '16px',
          padding: '14px 16px',
          color: '#ffffff',
          boxShadow: '0 8px 25px rgba(15, 23, 42, 0.35)',
          marginBottom: '12px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s ease'
        }}
      >
        {/* Hardware-Accelerated CSS Weather FX Overlay */}
        <style>{`
          @keyframes rainDropKeyframe {
            0% { transform: translate3d(0, -30px, 0); opacity: 0; }
            50% { opacity: 0.85; }
            100% { transform: translate3d(0, 220px, 0); opacity: 0; }
          }
          @keyframes cloudDriftKeyframe1 {
            0% { transform: translate3d(-30%, 0, 0); opacity: 0.15; }
            50% { opacity: 0.45; }
            100% { transform: translate3d(120%, 0, 0); opacity: 0.15; }
          }
          @keyframes cloudDriftKeyframe2 {
            0% { transform: translate3d(-30%, 0, 0); opacity: 0.12; }
            50% { opacity: 0.38; }
            100% { transform: translate3d(120%, 0, 0); opacity: 0.12; }
          }
          @keyframes sunGlowKeyframe {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes stormFlashKeyframe {
            0%, 90%, 100% { opacity: 0; }
            92%, 96% { opacity: 0.85; }
          }
        `}</style>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {weatherMode === 'rainy' && (
            <div>
              {[...Array(10)].map((_, i) => (
                <div
                  key={`rain-${i}`}
                  style={{
                    position: 'absolute',
                    left: `${5 + i * 9.5}%`,
                    width: '2px',
                    height: '24px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(96,165,250,0.85) 100%)',
                    borderRadius: '2px',
                    transform: 'rotate(15deg)',
                    willChange: 'transform, opacity',
                    animation: `rainDropKeyframe ${0.7 + (i % 4) * 0.15}s linear infinite`,
                    animationDelay: `${(i % 5) * 0.12}s`
                  }}
                />
              ))}
            </div>
          )}

          {weatherMode === 'sunny' && (
            <div>
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(251,146,60,0.45) 0%, rgba(245,158,11,0.2) 50%, rgba(0,0,0,0) 70%)',
                  willChange: 'transform',
                  animation: 'sunGlowKeyframe 25s linear infinite'
                }}
              />
            </div>
          )}

          {weatherMode === 'cloudy' && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute', top: '8px', width: '160px',
                  willChange: 'transform',
                  animation: 'cloudDriftKeyframe1 24s linear infinite'
                }}
              >
                <svg viewBox="0 0 100 50" fill="currentColor" style={{ color: 'rgba(255, 255, 255, 0.22)', width: '100%', height: 'auto' }}>
                  <path d="M 20 40 A 15 15 0 0 1 30 18 A 20 20 0 0 1 65 15 A 18 18 0 0 1 85 30 A 12 12 0 0 1 82 40 Z" />
                </svg>
              </div>
              <div
                style={{
                  position: 'absolute', top: '50px', width: '190px',
                  willChange: 'transform',
                  animation: 'cloudDriftKeyframe2 32s linear infinite 7s'
                }}
              >
                <svg viewBox="0 0 120 50" fill="currentColor" style={{ color: 'rgba(255, 255, 255, 0.18)', width: '100%', height: 'auto' }}>
                  <path d="M 15 42 A 18 18 0 0 1 32 20 A 24 24 0 0 1 78 16 A 22 22 0 0 1 105 32 A 15 15 0 0 1 102 42 Z" />
                </svg>
              </div>
            </div>
          )}

          {weatherMode === 'stormy' && (
            <div>
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(circle at 75% 25%, rgba(192,132,252,0.4) 0%, rgba(124,58,237,0) 70%)',
                  animation: 'stormFlashKeyframe 3.5s ease-in-out infinite'
                }}
              />
            </div>
          )}
        </div>

        {/* Live Weather Indicator & Quick Switcher Pill Row */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '20px',
            background: currWeather.pillBg,
            border: `1px solid ${currWeather.pillBorder}`,
            color: currWeather.pillColor,
            fontSize: '11px',
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <span>{currWeather.pillText}</span>
          </div>

          <div style={{
            padding: '3px 8px',
            borderRadius: '20px',
            backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
            border: `1px solid ${isOnline ? '#34d399' : '#f87171'}`,
            fontSize: '10px',
            fontWeight: 800,
            color: isOnline ? '#34d399' : '#f87171'
          }}>
            {isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.8, fontWeight: 700, marginBottom: '2px' }}>
            Welcome back, {user?.name?.split(' ')?.[0] || 'Rider'} 👋
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.2px', lineHeight: 1.25 }}>
            {currWeather.title}
          </h2>
          <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px', fontWeight: 500 }}>
            {currWeather.subtitle}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/delivery/shifts')}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: currWeather.buttonBg,
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: currWeather.buttonShadow
          }}
        >
          <span>{currWeather.buttonText}</span>
          <ArrowForwardIcon sx={{ fontSize: '16px' }} />
        </motion.button>
      </motion.div>

      {/* 2. TODAY'S PROGRESS SUMMARY STRIP */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '10px 12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        border: '1px solid #f1f5f9',
        marginBottom: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
            Earnings
          </div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            ₹{stats?.todayEarnings || 0}
          </div>
          <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, marginTop: '1px' }}>
            Today's Income
          </div>
        </div>

        <div style={{ borderLeft: '1px dashed #e2e8f0', borderRight: '1px dashed #e2e8f0' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
            Online Time
          </div>
          <DutyTimer user={user} isOnline={isOnline} />
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
            Orders
          </div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            {todayOrders}
          </div>
          <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700, marginTop: '1px' }}>
            Completed
          </div>
        </div>
      </div>

      {/* 3. DAILY MILESTONE INCENTIVES TRACKER */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '12px 14px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        border: '1px solid #f1f5f9',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Daily Incentive
          </h3>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#ff5400' }}>
            Earn up to ₹365 extra ›
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px', fontWeight: 500 }}>
          Your trips count: <strong>{todayOrders}</strong>
        </p>

        {/* Milestone Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '10px' }}>
          {[
            { trips: 5, reward: '₹55' },
            { trips: 11, reward: '₹210' },
            { trips: 22, reward: '₹310' },
            { trips: 28, reward: '₹365' }
          ].map((item, idx) => {
            const isReached = todayOrders >= item.trips;
            return (
              <div key={idx} style={{
                background: isReached ? '#ecfdf5' : '#f8fafc',
                border: `1.5px solid ${isReached ? '#10b981' : '#e2e8f0'}`,
                borderRadius: '10px',
                padding: '6px 2px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: isReached ? '#10b981' : '#0f172a' }}>
                  {item.reward}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginTop: '1px' }}>
                  {item.trips} Trips
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '6px',
          width: '100%',
          backgroundColor: '#f1f5f9',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #ff5400 0%, #10b981 100%)',
              borderRadius: '10px'
            }}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/delivery/offers')}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: '#fff7ed',
            color: '#ff5400',
            border: '1px solid #ffedd5',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          See all offers
        </motion.button>
      </div>

      {/* 4. PROMOTIONAL BANNER CAROUSEL */}
      <div style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        borderRadius: '12px',
        padding: '12px 14px',
        border: '1px solid #fecdd3',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }}
      onClick={() => navigate('/delivery/offers')}
      >
        <div>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1px' }}>
            Tax & Financial Aid
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#9f1239' }}>
            Get up to ₹10,000 Tax Refund
          </div>
          <div style={{ fontSize: '11px', color: '#be123c', fontWeight: 500, marginTop: '1px' }}>
            File today with zero service charge
          </div>
        </div>
        <div style={{
          backgroundColor: '#e11d48',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '6px 10px',
          fontSize: '11px',
          fontWeight: 800,
          boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)'
        }}>
          FILE NOW
        </div>
      </div>

      {/* 5. SHORTCUTS GRID (4 Action Buttons) */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
          Shortcuts
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {/* Shortcut 1: Offers */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/delivery/offers')}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '10px 4px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#fff7ed',
              color: '#ff5400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 4px'
            }}>
              <LocalOfferIcon sx={{ fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Offers</div>
          </motion.div>

          {/* Shortcut 2: Hotspot Zone */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHotspotModal(true)}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '10px 4px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#eef2ff',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 4px'
            }}>
              <LocationOnIcon sx={{ fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>My Zone</div>
          </motion.div>

          {/* Shortcut 3: Insurance */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/delivery/emergency')}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '10px 4px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 4px'
            }}>
              <ShieldOutlinedIcon sx={{ fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Insurance</div>
          </motion.div>

          {/* Shortcut 4: Market Store */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/delivery/market')}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '10px 4px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#faf5ff',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 4px'
            }}>
              <StorefrontIcon sx={{ fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Gear Store</div>
          </motion.div>
        </div>
      </div>

      {/* 6. IMPORTANT MESSAGES / ANNOUNCEMENTS */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
          Important Messages
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CampaignIcon sx={{ fontSize: '18px' }} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '1px' }}>
                📢 Daily Incentives Announcement
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
                1.5x Peak Hour Surge active today from 12 PM to 4 PM across all primary hub zones.
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/delivery/notifications')}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: '#fff7ed',
              color: '#ff5400',
              border: 'none',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            View all messages
          </motion.button>
        </div>
      </div>

      {/* 7. YOUR FEED / STORIES CAROUSEL */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Your Feed
          </h3>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '6px',
          scrollbarWidth: 'none'
        }}>
          {/* Story 1 */}
          <div style={{
            minWidth: '120px',
            height: '140px',
            borderRadius: '14px',
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
          }}
          onClick={() => alert('🌧️ Rain Surge Alert: Earn +₹35 extra per completed order during rain shifts!')}
          >
            <div style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px', width: 'max-content' }}>
              SURGE
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.2 }}>Rain Extra Earnings</div>
              <div style={{ fontSize: '10px', opacity: 0.85, marginTop: '2px' }}>+₹35 Per Order</div>
            </div>
          </div>

          {/* Story 2 */}
          <div style={{
            minWidth: '120px',
            height: '140px',
            borderRadius: '14px',
            background: 'linear-gradient(180deg, #f97316 0%, #c2410c 100%)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)'
          }}
          onClick={() => alert('📍 Zone Update: Delivery radius expanded with optimized route navigation.')}
          >
            <div style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px', width: 'max-content' }}>
              UPDATE
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.2 }}>Location Optimized</div>
              <div style={{ fontSize: '10px', opacity: 0.85, marginTop: '2px' }}>Faster Pickup</div>
            </div>
          </div>

          {/* Story 3 */}
          <div style={{
            minWidth: '120px',
            height: '140px',
            borderRadius: '14px',
            background: 'linear-gradient(180deg, #10b981 0%, #047857 100%)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
          }}
          onClick={() => alert('🚀 Weekend Bonus Boost: Complete 15 orders this weekend to unlock ₹500 extra cash!')}
          >
            <div style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px', width: 'max-content' }}>
              BOOST
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.2 }}>Extra Earnings Offer</div>
              <div style={{ fontSize: '10px', opacity: 0.85, marginTop: '2px' }}>₹500 Weekend</div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. PARTNER BENEFITS & SERVICES GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      }}>
        {/* Benefit 1 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('💳 Pre-approved Partner Credit: Eligible for up to ₹50,000 low-interest instant loan.')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '12px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#ea580c', backgroundColor: '#fff7ed', padding: '2px 6px', borderRadius: '6px', width: 'max-content', marginBottom: '6px' }}>
            LOW INTEREST
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '1px' }}>
            Loans & Benefits
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Up to ₹50,000 credit
          </div>
        </motion.div>

        {/* Benefit 2 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('🎁 Refer & Earn: Share your referral link with friends to earn ₹18,500 per joining!')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '12px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#ffffff', backgroundColor: '#ef4444', padding: '2px 6px', borderRadius: '6px', width: 'max-content', marginBottom: '6px' }}>
            UPTO ₹18,500
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '1px' }}>
            Refer & Earn
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Invite rider friends
          </div>
        </motion.div>

        {/* Benefit 3 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('🛵 EV Bike Rental: Rent high-speed Electric Scooters starting at ₹149/day with free battery swapping.')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '12px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '6px', width: 'max-content', marginBottom: '6px' }}>
            FROM ₹149/DAY
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '1px' }}>
            Rent EV Vehicle
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Free battery swap
          </div>
        </motion.div>

        {/* Benefit 4 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/delivery/market')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '12px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#6366f1', backgroundColor: '#eef2ff', padding: '2px 6px', borderRadius: '6px', width: 'max-content', marginBottom: '6px' }}>
            OFFICIAL GEAR
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '1px' }}>
            RapidCloth Store
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Bags, Helmets, Raincoats
          </div>
        </motion.div>
      </div>

      {/* HOTSPOT ZONE MODAL */}
      <AnimatePresence>
        {showHotspotModal && (
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
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setShowHotspotModal(false)}
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
                <LocationOnIcon sx={{ fontSize: '32px', color: '#6366f1' }} />
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    High Demand Hotspots
                  </h3>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                    Surge Pay Active in Selected Hubs
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>Central Mall Fashion Hub</div>
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>🔥 Very High Demand • 1.5x Pay</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>Tech Park Retail Zone</div>
                  <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700, marginTop: '2px' }}>⚡ High Demand • 1.2x Pay</div>
                </div>
              </div>

              <button
                onClick={() => setShowHotspotModal(false)}
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
    </div>
  );
}
