import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationIcon from '@mui/icons-material/NavigationRounded';
import { deliveryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import CancelIcon from '@mui/icons-material/CancelRounded';
import VolumeUpIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffIcon from '@mui/icons-material/VolumeOffRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import LocalAtmIcon from '@mui/icons-material/LocalAtmRounded';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcardRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBikeRounded';
import { useLanguage } from '../../context/LanguageContext';

export default function DeliveryOrders() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [todayHistory, setTodayHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);

  const prevOrderIds = useRef([]);
  const prevOrderStatuses = useRef({});

  // Audio refs
  const orderRingtone = useRef(null);
  const rejectSound = useRef(null);
  const ringtoneInterval = useRef(null);
  const rejectInterval = useRef(null);

  // Initialize audio
  useEffect(() => {
    orderRingtone.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    orderRingtone.current.volume = 1.0;
    rejectSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3');
    rejectSound.current.volume = 1.0;
    return () => {
      stopRingtone();
      if (rejectInterval.current) clearInterval(rejectInterval.current);
    };
  }, []);

  const playRingtone = useCallback(() => {
    if (!soundEnabled || !orderRingtone.current) return;
    orderRingtone.current.currentTime = 0;
    orderRingtone.current.play().catch(() => { });
    if (ringtoneInterval.current) clearInterval(ringtoneInterval.current);
    ringtoneInterval.current = setInterval(() => {
      if (orderRingtone.current) {
        orderRingtone.current.currentTime = 0;
        orderRingtone.current.play().catch(() => { });
      }
    }, 3000);
  }, [soundEnabled]);

  const stopRingtone = useCallback(() => {
    if (ringtoneInterval.current) {
      clearInterval(ringtoneInterval.current);
      ringtoneInterval.current = null;
    }
    if (orderRingtone.current) {
      orderRingtone.current.pause();
      orderRingtone.current.currentTime = 0;
    }
  }, []);

  const playRejectTone = useCallback(() => {
    if (!soundEnabled || !rejectSound.current) return;
    if (rejectInterval.current) clearInterval(rejectInterval.current);
    rejectSound.current.currentTime = 0;
    rejectSound.current.play().catch(() => { });
    rejectInterval.current = setInterval(() => {
      if (rejectSound.current) {
        rejectSound.current.currentTime = 0;
        rejectSound.current.play().catch(() => { });
      }
    }, 2500);
    setTimeout(() => {
      if (rejectInterval.current) {
        clearInterval(rejectInterval.current);
        rejectInterval.current = null;
      }
      if (rejectSound.current) {
        rejectSound.current.pause();
        rejectSound.current.currentTime = 0;
      }
    }, 5000);
  }, [soundEnabled]);

  useEffect(() => {
    if (!user) return;
    loadOrders();
    window.scrollTo(0, 0);

    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const [driverPos, setDriverPos] = useState(null);

  useEffect(() => {
    if (!user) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error('Pickup geolocation error:', err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, loading]);

  function getDistanceKm(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  const loadOrders = async () => {
    try {
      const [res, historyRes] = await Promise.all([
        deliveryAPI.getCurrentOrders(),
        deliveryAPI.getHistory({ date: new Date().toISOString() })
      ]);
      const fetchedOrders = res.data.orders || [];
      const historyOrders = historyRes.data.orders || [];

      const assignedOrders = fetchedOrders.filter(o =>
        o.delivery?.status === 'assigned' && o.status !== 'cancelled'
      );

      if (assignedOrders.length > 0) {
        const hasNewAssignment = assignedOrders.some(o => !prevOrderIds.current.includes(o._id));
        if (hasNewAssignment || (assignedOrders.length > 0 && !ringtoneInterval.current)) {
          playRingtone();
          if (hasNewAssignment && prevOrderIds.current.length > 0) {
            toast.success('🚨 New order assigned! Accept now!', {
              icon: '📦', duration: 6000,
              style: { background: '#22c55e', color: '#fff', fontWeight: 700 }
            });
          }
        }
      } else {
        stopRingtone();
      }

      const oldStatuses = prevOrderStatuses.current;
      for (const order of fetchedOrders) {
        if (order.status === 'cancelled' && oldStatuses[order._id] && oldStatuses[order._id] !== 'cancelled') {
          playRejectTone();
          toast.error('Order was cancelled!', {
            icon: '❌', duration: 5000,
            style: { background: '#ef4444', color: '#fff', fontWeight: 700 }
          });
          break;
        }
      }

      prevOrderIds.current = fetchedOrders.map(o => o._id);
      const statusMap = {};
      fetchedOrders.forEach(o => { statusMap[o._id] = o.status; });
      prevOrderStatuses.current = statusMap;
      setOrders(fetchedOrders);
      setTodayHistory(historyOrders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await deliveryAPI.acceptOrder(id);
      stopRingtone();
      loadOrders();
    } catch (e) {
      alert('Failed to accept order.');
    }
  };

  const handleReject = async (id) => {
    try {
      await deliveryAPI.rejectOrder(id);
      stopRingtone();
      playRejectTone();
      toast.error('Order rejected', {
        icon: '🚫', duration: 5000,
        style: { background: '#ef4444', color: '#fff', fontWeight: 700 }
      });
      loadOrders();
    } catch (e) {
      alert('Failed to reject order.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await deliveryAPI.updateOrderStatus(id, status);
      loadOrders();
    } catch (e) {
      alert(`Failed to mark as ${status}.`);
    }
  };

  // Financial calculations helper
  const getOrderFinancials = (order) => {
    const totalAmount = order.totalAmount || 0;
    const storeTake = order.itemsPrice || Math.round(totalAmount * 0.82) || Math.max(0, totalAmount - 60);
    const deliveryFee = order.deliveryEarnings || Math.round(35 + (order.deliveryDistanceKm || 2) * 8);
    const incentiveOffice = order.surgeIncentive || order.incentiveBonus || 25;
    const arrivalTime = order.createdAt
      ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Just now';
    const arrivalDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })
      : 'Today';

    return {
      totalAmount,
      storeTake,
      deliveryFee,
      incentiveOffice,
      arrivalTime,
      arrivalDate,
      netEarnings: deliveryFee + incentiveOffice
    };
  };

  // Combine orders for receipt rendering
  const allDisplayOrders = orders.length > 0 ? orders : todayHistory;

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '640px', margin: '0 auto', padding: '8px 8px 80px' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.2px', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            {t('orders')}
          </h2>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 500, marginTop: '1px' }}>
            Live order tracking, store settlements & incentive office logs
          </div>
        </div>

        <button
          onClick={() => {
            setSoundEnabled(prev => {
              if (prev) { stopRingtone(); if (rejectInterval.current) { clearInterval(rejectInterval.current); rejectInterval.current = null; } }
              return !prev;
            });
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '5px 10px', borderRadius: '10px',
            border: '1px solid var(--border, #e2e8f0)',
            background: soundEnabled ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated, #ffffff)',
            color: soundEnabled ? '#10b981' : 'var(--text-muted, #64748b)',
            fontSize: '11px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          {soundEnabled ? <VolumeUpIcon sx={{ fontSize: 16 }} /> : <VolumeOffIcon sx={{ fontSize: 16 }} />}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
      </div>

      {/* 2. Active Orders Section */}
      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '16px 14px',
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border, #e2e8f0)',
          marginBottom: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px'
          }}>
            <DirectionsBikeIcon sx={{ fontSize: '20px' }} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
            No active orders assigned right now
          </div>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '11px', marginTop: '2px', margin: 0 }}>
            Keep your status Online. New order assignments will ring automatically.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
          {orders.map(order => {
            const fin = getOrderFinancials(order);
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border, #e2e8f0)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
                }}
              >
                {/* Active Order Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Order #{order._id.substring(order._id.length - 8).toUpperCase()} • {fin.arrivalTime}
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 800, marginTop: '1px' }}>
                      {order.items?.length || 1} items to deliver
                    </div>
                  </div>
                  <div style={{
                    padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 800,
                    textTransform: 'uppercase', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0'
                  }}>
                    {order.status}
                  </div>
                </div>

                {/* Pickup & Drop Addresses */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ padding: '8px 10px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <StorefrontIcon sx={{ color: '#6366f1', fontSize: '14px' }} />
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>PICKUP HUB</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '12px', color: 'var(--text-primary)' }}>
                      {order.items[0]?.productId?.sellerId?.sellerProfile?.storeName || 'Seller Store'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px', lineHeight: 1.2 }}>
                      {order.items[0]?.productId?.sellerId?.sellerProfile?.businessAddress || 'Hub Address'}
                    </div>
                  </div>

                  <div style={{ padding: '8px 10px', background: 'rgba(239,68,68,0.06)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <LocationOnIcon sx={{ color: '#ef4444', fontSize: '14px' }} />
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>DROP LOCATION</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '12px', color: 'var(--text-primary)' }}>
                      {order.userId?.name || 'Customer'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px', lineHeight: 1.2 }}>
                      {order.deliveryAddress?.city || 'Delivery Address'}
                    </div>
                  </div>
                </div>

                {/* Accept / Reject Action Buttons if pending */}
                {order.delivery?.status === 'assigned' && order.status !== 'cancelled' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => handleAccept(order._id)}
                      style={{
                        flex: 1, padding: '9px 12px', borderRadius: '10px', background: '#10b981', color: '#ffffff',
                        border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleReject(order._id)}
                      style={{
                        padding: '9px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)',
                        color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 3. Comprehensive Financial Receipt Log Section */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ReceiptLongIcon sx={{ color: '#f59e0b', fontSize: '18px' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              Order Financial Receipts & Settlement Log
            </h3>
          </div>
        </div>

        {/* Financial Summary Stat Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '12px',
          padding: '12px 14px',
          color: '#ffffff',
          marginBottom: '14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px' }}>
            TODAY'S RECEIVABLES & INCENTIVE BREAKDOWN
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
            {/* Stat 1: Total Order Value */}
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700 }}>ORDER VALUE</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                ₹{allDisplayOrders.reduce((sum, o) => sum + (o.totalAmount || 350), 0).toLocaleString()}
              </div>
            </div>

            {/* Stat 2: Taken from Restaurant/Store */}
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700 }}>STORE TAKE</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                ₹{allDisplayOrders.reduce((sum, o) => sum + getOrderFinancials(o).storeTake, 0).toLocaleString()}
              </div>
            </div>

            {/* Stat 3: Delivery Pay */}
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700 }}>DELIVERY PAY</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80', marginTop: '2px' }}>
                ₹{allDisplayOrders.reduce((sum, o) => sum + getOrderFinancials(o).deliveryFee, 0).toLocaleString()}
              </div>
            </div>

            {/* Stat 4: Incentive Office Bonus */}
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700 }}>INCENTIVE OFF.</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#f43f5e', marginTop: '2px' }}>
                ₹{allDisplayOrders.reduce((sum, o) => sum + getOrderFinancials(o).incentiveOffice, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Financial Item Receipts List */}
        {allDisplayOrders.length === 0 ? (
          <div style={{
            background: 'var(--bg-card, #ffffff)', borderRadius: '20px', padding: '30px 20px',
            textAlign: 'center', border: '1px solid var(--border, #e2e8f0)', color: 'var(--text-muted)'
          }}>
            No order receipts recorded yet today. Complete orders to view detailed breakdown logs.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {allDisplayOrders.map((order, oIdx) => {
              const fin = getOrderFinancials(order);
              return (
                <div
                  key={order._id || oIdx}
                  onClick={() => setSelectedOrderReceipt(order)}
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1.5px solid var(--border, #e2e8f0)',
                    borderRadius: '20px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s'
                  }}
                >
                  {/* Top Bar: Order ID, Arrival Time, Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        padding: '4px 8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b', fontSize: '11px', fontWeight: 900
                      }}>
                        #{order._id ? order._id.slice(-6).toUpperCase() : `ORD-${101 + oIdx}`}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {fin.arrivalTime} ({fin.arrivalDate})
                      </span>
                    </div>

                    <div style={{
                      fontSize: '11px', fontWeight: 900, padding: '3px 8px', borderRadius: '10px',
                      background: order.paymentMethod === 'cod' ? '#fef3c7' : '#dcfce7',
                      color: order.paymentMethod === 'cod' ? '#d97706' : '#059669',
                      border: `1px solid ${order.paymentMethod === 'cod' ? '#fde68a' : '#a7f3d0'}`
                    }}>
                      {order.paymentMethod === 'cod' ? '💵 COD Cash' : '💳 Prepaid'}
                    </div>
                  </div>

                  {/* Financial Grid Breakdown */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                    background: 'var(--bg-secondary, #f8fafc)', padding: '12px', borderRadius: '14px',
                    border: '1px solid var(--border, #f1f5f9)', marginBottom: '12px'
                  }}>
                    {/* Item 1: Total Order Cost */}
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>ORDER BILL</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                        ₹{fin.totalAmount}
                      </div>
                    </div>

                    {/* Item 2: Taken from Restaurant / Store */}
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>RESTAURANT TAKE</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                        ₹{fin.storeTake}
                      </div>
                    </div>

                    {/* Item 3: Delivery Cost Pay */}
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>DELIVERY PAY</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                        ₹{fin.deliveryFee}
                      </div>
                    </div>

                    {/* Item 4: Incentive Office Paid */}
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>INCENTIVE OFF.</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#e11d48', marginTop: '2px' }}>
                        +₹{fin.incentiveOffice}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Full Receipt Statement <ChevronRightIcon sx={{ fontSize: '16px' }} />
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#10b981' }}>
                      Total Partner Payout: ₹{fin.netEarnings}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Full Receipt Breakdown Modal */}
      <AnimatePresence>
        {selectedOrderReceipt && (() => {
          const fin = getOrderFinancials(selectedOrderReceipt);
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 10005, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
              onClick={() => setSelectedOrderReceipt(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                style={{
                  background: 'var(--bg-elevated, #ffffff)', borderRadius: '28px', padding: '24px', width: '100%', maxWidth: '420px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border, #e2e8f0)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ReceiptLongIcon sx={{ color: '#f59e0b', fontSize: '26px' }} />
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                        Order Statement Receipt
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        #{selectedOrderReceipt._id ? selectedOrderReceipt._id.toUpperCase() : 'ORD-RECEIPT'}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedOrderReceipt(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <CloseIcon sx={{ color: '#475569', fontSize: '20px' }} />
                  </button>
                </div>

                {/* Line Item Receipt Breakdown */}
                <div style={{ background: 'var(--bg-secondary, #f8fafc)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '20px', padding: '16px', marginBottom: '20px' }}>
                  
                  {/* Item 1: Order Arrival Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>Order Arrival Time</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--text-primary)' }}>{fin.arrivalTime} ({fin.arrivalDate})</span>
                  </div>

                  {/* Item 2: Customer Total Order Cost */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>Total Customer Order Cost</span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)' }}>₹{fin.totalAmount}</span>
                  </div>

                  {/* Item 3: Taken from Restaurant / Store */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>Taken from Restaurant / Store</span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#0284c7' }}>₹{fin.storeTake}</span>
                  </div>

                  {/* Item 4: Delivery Cost / Fee */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>Delivery Pay / Fee</span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#16a34a' }}>+₹{fin.deliveryFee}</span>
                  </div>

                  {/* Item 5: Paid at Incentive Office */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>Paid at Incentive Office (Surge)</span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#e11d48' }}>+₹{fin.incentiveOffice}</span>
                  </div>

                  {/* Item 6: Payment Method */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>Payment Method</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: selectedOrderReceipt.paymentMethod === 'cod' ? '#d97706' : '#059669' }}>
                      {selectedOrderReceipt.paymentMethod === 'cod' ? '💵 COD Cash Collected' : '💳 Prepaid Online'}
                    </span>
                  </div>
                </div>

                {/* Net Payout Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '18px', padding: '16px', color: '#ffffff',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.9 }}>TOTAL PARTNER PAYOUT</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, marginTop: '2px' }}>₹{fin.netEarnings}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 900 }}>
                    SETTLED ✓
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
