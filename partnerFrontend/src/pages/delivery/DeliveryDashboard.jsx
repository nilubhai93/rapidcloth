import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { deliveryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
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

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dutySeconds, setDutySeconds] = useState(0);
  const [showHotspotModal, setShowHotspotModal] = useState(false);

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

  // Live real-time duty seconds ticker
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

    if (!isOnline) return;

    const timer = setInterval(() => {
      setDutySeconds(calcSeconds());
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.deliveryProfile, isOnline]);

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
      padding: '12px 12px 60px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0f172a'
    }}>
      
      {/* 1. TOP HERO HEADER & HIGH EARNING SHIFT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: '28px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 12px 30px rgba(49, 46, 129, 0.35)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow Accent Background Disk */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,84,0,0.4) 0%, rgba(255,84,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontWeight: 700, marginBottom: '4px' }}>
              Welcome back, {user?.name?.split(' ')?.[0] || 'Rider'} 👋
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, margin: 0, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              High Earning Shift Live!
            </h2>
            <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px', fontWeight: 500 }}>
              12:00 PM – 4:00 PM • 1.5x Surge Active
            </div>
          </div>
          
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
            border: `1px solid ${isOnline ? '#34d399' : '#f87171'}`,
            fontSize: '12px',
            fontWeight: 800,
            color: isOnline ? '#34d399' : '#f87171'
          }}>
            {isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/delivery/shifts')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #ff5400 0%, #ff3b00 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '18px',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(255, 84, 0, 0.4)'
          }}
        >
          <span>{"Let's book and go online"}</span>
          <ArrowForwardIcon sx={{ fontSize: '20px' }} />
        </motion.button>
      </motion.div>

      {/* 2. TODAY'S PROGRESS SUMMARY STRIP */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '18px 20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            Earnings
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
            ₹{stats?.todayEarnings || 0}
          </div>
          <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
            Today's Income
          </div>
        </div>

        <div style={{ borderLeft: '1px dashed #e2e8f0', borderRight: '1px dashed #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            Online Time
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>
            {formatDutyTime(dutySeconds)}
          </div>
          <div style={{ fontSize: '10px', color: isOnline ? '#10b981' : '#64748b', fontWeight: 700, marginTop: '2px' }}>
            {isOnline ? '🟢 Live' : 'Paused'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            Orders
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
            {todayOrders}
          </div>
          <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700, marginTop: '2px' }}>
            Completed
          </div>
        </div>
      </div>

      {/* 3. DAILY MILESTONE INCENTIVES TRACKER */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Daily Incentive
          </h3>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#ff5400' }}>
            Earn up to ₹365 extra ›
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px', fontWeight: 500 }}>
          Your trips count: <strong>{todayOrders}</strong>
        </p>

        {/* Milestone Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '14px' }}>
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
                borderRadius: '16px',
                padding: '10px 4px'
              }}>
                <div style={{ fontSize: '15px', fontWeight: 900, color: isReached ? '#10b981' : '#0f172a' }}>
                  {item.reward}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  {item.trips} Trips
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '8px',
          width: '100%',
          backgroundColor: '#f1f5f9',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '16px'
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
            padding: '12px',
            borderRadius: '16px',
            backgroundColor: '#fff7ed',
            color: '#ff5400',
            border: '1px solid #ffedd5',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          See all offers
        </motion.button>
      </div>

      {/* 4. PROMOTIONAL BANNER CAROUSEL */}
      <div style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        borderRadius: '24px',
        padding: '18px 20px',
        border: '1px solid #fecdd3',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }}
      onClick={() => navigate('/delivery/offers')}
      >
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
            Tax & Financial Aid
          </div>
          <div style={{ fontSize: '16px', fontWeight: 900, color: '#9f1239' }}>
            Get up to ₹10,000 Tax Refund
          </div>
          <div style={{ fontSize: '12px', color: '#be123c', fontWeight: 600, marginTop: '2px' }}>
            File today with zero service charge
          </div>
        </div>
        <div style={{
          backgroundColor: '#e11d48',
          color: '#ffffff',
          borderRadius: '14px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 800,
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
        }}>
          FILE NOW
        </div>
      </div>

      {/* 5. SHORTCUTS GRID (4 Action Buttons) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
          Shortcuts
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {/* Shortcut 1: Offers */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/delivery/offers')}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '14px 8px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#fff7ed',
              color: '#ff5400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px'
            }}>
              <LocalOfferIcon sx={{ fontSize: '22px' }} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>Offers</div>
          </motion.div>

          {/* Shortcut 2: Hotspot Zone */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHotspotModal(true)}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '14px 8px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#eef2ff',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px'
            }}>
              <LocationOnIcon sx={{ fontSize: '22px' }} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>My Zone</div>
          </motion.div>

          {/* Shortcut 3: Insurance */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/delivery/emergency')}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '14px 8px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px'
            }}>
              <ShieldOutlinedIcon sx={{ fontSize: '22px' }} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>Insurance</div>
          </motion.div>

          {/* Shortcut 4: Market Store */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/delivery/market')}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '14px 8px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#faf5ff',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px'
            }}>
              <StorefrontIcon sx={{ fontSize: '22px' }} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>Gear Store</div>
          </motion.div>
        </div>
      </div>

      {/* 6. IMPORTANT MESSAGES / ANNOUNCEMENTS */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
          Important Messages
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CampaignIcon sx={{ fontSize: '22px' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                📢 Daily Incentives Announcement
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
                1.5x Peak Hour Surge active today from 12 PM to 4 PM across all primary hub zones.
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/delivery/notifications')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '16px',
              backgroundColor: '#fff7ed',
              color: '#ff5400',
              border: 'none',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            View all messages
          </motion.button>
        </div>
      </div>

      {/* 7. YOUR FEED / STORIES CAROUSEL */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Your Feed
          </h3>
        </div>

        <div style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none'
        }}>
          {/* Story 1 */}
          <div style={{
            minWidth: '140px',
            height: '180px',
            borderRadius: '22px',
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)'
          }}
          onClick={() => alert('🌧️ Rain Surge Alert: Earn +₹35 extra per completed order during rain shifts!')}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '10px', width: 'max-content' }}>
              SURGE
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, lineHeight: 1.2 }}>Rain Extra Earnings</div>
              <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px' }}>+₹35 Per Order</div>
            </div>
          </div>

          {/* Story 2 */}
          <div style={{
            minWidth: '140px',
            height: '180px',
            borderRadius: '22px',
            background: 'linear-gradient(180deg, #f97316 0%, #c2410c 100%)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 6px 20px rgba(249, 115, 22, 0.3)'
          }}
          onClick={() => alert('📍 Zone Update: Delivery radius expanded with optimized route navigation.')}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '10px', width: 'max-content' }}>
              UPDATE
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, lineHeight: 1.2 }}>Location Optimized</div>
              <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px' }}>Faster Pickup</div>
            </div>
          </div>

          {/* Story 3 */}
          <div style={{
            minWidth: '140px',
            height: '180px',
            borderRadius: '22px',
            background: 'linear-gradient(180deg, #10b981 0%, #047857 100%)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
          }}
          onClick={() => alert('🚀 Weekend Bonus Boost: Complete 15 orders this weekend to unlock ₹500 extra cash!')}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '10px', width: 'max-content' }}>
              BOOST
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, lineHeight: 1.2 }}>Extra Earnings Offer</div>
              <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px' }}>₹500 Weekend</div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. PARTNER BENEFITS & SERVICES GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px'
      }}>
        {/* Benefit 1 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('💳 Pre-approved Partner Credit: Eligible for up to ₹50,000 low-interest instant loan.')}
          style={{
            background: '#ffffff',
            borderRadius: '22px',
            padding: '18px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c', backgroundColor: '#fff7ed', padding: '3px 8px', borderRadius: '8px', width: 'max-content', marginBottom: '8px' }}>
            LOW INTEREST
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            Loans & Benefits
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Up to ₹50,000 credit
          </div>
        </motion.div>

        {/* Benefit 2 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('🎁 Refer & Earn: Share your referral link with friends to earn ₹18,500 per joining!')}
          style={{
            background: '#ffffff',
            borderRadius: '22px',
            padding: '18px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', backgroundColor: '#ef4444', padding: '3px 8px', borderRadius: '8px', width: 'max-content', marginBottom: '8px' }}>
            UPTO ₹18,500
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            Refer & Earn
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Invite rider friends
          </div>
        </motion.div>

        {/* Benefit 3 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('🛵 EV Bike Rental: Rent high-speed Electric Scooters starting at ₹149/day with free battery swapping.')}
          style={{
            background: '#ffffff',
            borderRadius: '22px',
            padding: '18px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: '8px', width: 'max-content', marginBottom: '8px' }}>
            FROM ₹149/DAY
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            Rent EV Vehicle
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Free battery swap
          </div>
        </motion.div>

        {/* Benefit 4 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/delivery/market')}
          style={{
            background: '#ffffff',
            borderRadius: '22px',
            padding: '18px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#6366f1', backgroundColor: '#eef2ff', padding: '3px 8px', borderRadius: '8px', width: 'max-content', marginBottom: '8px' }}>
            OFFICIAL GEAR
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            RapidCloth Store
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
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
