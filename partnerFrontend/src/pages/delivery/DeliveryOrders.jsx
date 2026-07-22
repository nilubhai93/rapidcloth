import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import NavigationIcon from '@mui/icons-material/NavigationRounded';
import { deliveryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import CancelIcon from '@mui/icons-material/CancelRounded';
import VolumeUpIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffIcon from '@mui/icons-material/VolumeOffRounded';
import ActiveDeliveryUI from '../../components/delivery/ActiveDeliveryUI';

export default function DeliveryOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [todayHistory, setTodayHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrderIds = useRef([]);
  const prevOrderStatuses = useRef({});

  // Audio refs
  const orderRingtone = useRef(null);
  const rejectSound = useRef(null);
  const ringtoneInterval = useRef(null);
  const rejectInterval = useRef(null);

  // Initialize audio
  useEffect(() => {
    // Loud urgent alarm for incoming assigned orders (different from seller tone)
    orderRingtone.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    orderRingtone.current.volume = 1.0;
    // Loud reject/cancel tone
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

    // Poll every 5 seconds for new assignments or status changes
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

      // Check for assigned (unaccepted) orders — play looping ringtone
      const assignedOrders = fetchedOrders.filter(o =>
        o.delivery?.status === 'assigned' && o.status !== 'cancelled'
      );

      if (assignedOrders.length > 0) {
        // New assigned order? Start ringtone + toast
        const hasNewAssignment = assignedOrders.some(o => !prevOrderIds.current.includes(o._id));
        if (hasNewAssignment || (assignedOrders.length > 0 && !ringtoneInterval.current)) {
          playRingtone();
          if (hasNewAssignment && prevOrderIds.current.length > 0) {
            toast.success('🚨 New order assigned! Accept now!', {
              icon: '📦',
              duration: 6000,
              style: { background: '#22c55e', color: '#fff', fontWeight: 700 }
            });
          }
        }
      } else {
        // No assigned orders pending — stop ringtone
        stopRingtone();
      }

      // Detect cancelled orders (user cancelled while assigned to this driver)
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

      // Update tracking refs
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
      stopRingtone(); // Stop ringing immediately on accept
      loadOrders();
    } catch (e) {
      alert('Failed to accept order.');
    }
  };

  const handleReject = async (id) => {
    try {
      await deliveryAPI.rejectOrder(id);
      stopRingtone();
      playRejectTone(); // Play reject tone for 5 seconds
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>My Deliveries</h2>
        <button
          onClick={() => {
            setSoundEnabled(prev => {
              if (prev) { stopRingtone(); if (rejectInterval.current) { clearInterval(rejectInterval.current); rejectInterval.current = null; } }
              return !prev;
            });
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: soundEnabled ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)',
            color: soundEnabled ? '#10b981' : 'var(--text-muted)',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          {soundEnabled ? <VolumeUpIcon sx={{ fontSize: 18 }} /> : <VolumeOffIcon sx={{ fontSize: 18 }} />}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No active orders assigned right now. Keep your status Online.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {orders.map(order => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                  <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>{order.items.length} items to deliver</div>
                </div>
                <div style={{ padding: '4px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, height: 'fit-content' }}>
                  {order.status}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {(() => {
                  const isReturnOrder = order.status === 'return-requested' || order.status === 'returning' || order.status === 'returned' || !!order.returnDetails?.reason;
                  
                  const storeName = order.items[0]?.productId?.sellerId?.sellerProfile?.storeName || order.items[0]?.productId?.sellerId?.name || 'Fashion Hub';
                  const storeAddress = order.items[0]?.productId?.sellerId?.sellerProfile?.businessAddress || order.items[0]?.productId?.sellerId?.phone || 'Address not specified';
                  const userName = order.userId?.name;
                  const userAddress = isReturnOrder && order.returnDetails?.pickupLocation?.address ? order.returnDetails.pickupLocation.address : `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`;

                  const pickupTitle = isReturnOrder ? 'Pickup (User)' : 'Pickup';
                  const pickupName = isReturnOrder ? userName : storeName;
                  const pickupAddressStr = isReturnOrder ? userAddress : storeAddress;
                  let pickupDist = null;
                  if (driverPos) {
                    if (isReturnOrder) {
                      const lat = order.returnDetails?.pickupLocation?.lat || order.deliveryLocation?.lat;
                      const lng = order.returnDetails?.pickupLocation?.lng || order.deliveryLocation?.lng;
                      if (lat && lng) {
                        pickupDist = getDistanceKm(driverPos.lat, driverPos.lng, lat, lng).toFixed(2);
                      }
                    } else if (order.sellerHubLocation?.lat && order.sellerHubLocation?.lng) {
                      pickupDist = getDistanceKm(driverPos.lat, driverPos.lng, order.sellerHubLocation.lat, order.sellerHubLocation.lng).toFixed(2);
                    }
                  }

                  const dropoffTitle = isReturnOrder ? 'Drop-off (Store)' : 'Drop-off';
                  const dropoffName = isReturnOrder ? storeName : userName;
                  const dropoffAddressStr = isReturnOrder ? storeAddress : userAddress;
                  const dropoffDist = order.deliveryDistanceKm ? order.deliveryDistanceKm.toFixed(2) : '--';

                  return (
                    <>
                      {/* Pickup Point */}
                      <div style={{ padding: '12px', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <StorefrontIcon sx={{ color: 'var(--accent)', fontSize: '18px' }} />
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{pickupTitle}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {pickupName}
                          {!isReturnOrder && order.items[0]?.productId?.sellerId?.name && !order.items[0]?.productId?.sellerId?.sellerProfile?.storeName && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '6px' }}>Store</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                          {pickupAddressStr}
                        </div>

                        {pickupDist > 0 && (
                          <div style={{
                            position: 'absolute', top: '-8px', right: '10px',
                            background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px'
                          }}>
                            <div style={{ width: '4px', height: '4px', background: 'var(--accent)', borderRadius: '50%' }} />
                            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)' }}>
                              {pickupDist} km
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Drop-off Point */}
                      <div style={{ padding: '12px', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <LocationOnIcon sx={{ color: 'var(--error)', fontSize: '18px' }} />
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{dropoffTitle}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {dropoffName}
                          {isReturnOrder && order.items[0]?.productId?.sellerId?.name && !order.items[0]?.productId?.sellerId?.sellerProfile?.storeName && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '6px' }}>Store</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                          {dropoffAddressStr}
                        </div>

                        {dropoffDist > 0 && (
                          <div style={{
                            position: 'absolute', top: '-8px', right: '10px',
                            background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px'
                          }}>
                            <div style={{ width: '4px', height: '4px', background: '#f97316', borderRadius: '50%' }} />
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#f97316' }}>{dropoffDist} km</span>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {order.delivery?.status === 'accepted' ? (
                <ActiveDeliveryUI
                  order={order}
                  updateStatus={updateStatus}
                  refreshOrders={loadOrders}
                />
              ) : (
                /* Assigned but not yet accepted */
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => handleAccept(order._id)} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: 'var(--success)', color: 'white',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                  }}>
                    Accept Order
                  </button>
                  <button onClick={() => handleReject(order._id)} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: 'var(--bg-elevated)', color: 'var(--error)',
                    border: '1px solid var(--error)',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                  }}>
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Today's History Section */}
      {todayHistory.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Today's Delivery History</h2>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {todayHistory.map(order => (
              <div key={order._id} style={{
                background: 'var(--bg-card)', padding: '16px', borderRadius: '16px',
                border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', color: 'var(--text-primary)' }}>{order.userId?.name || 'Customer'}</div>
                  </div>
                  <div style={{ 
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                    background: order.status === 'delivered' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: order.status === 'delivered' ? '#10b981' : '#ef4444'
                  }}>
                    {order.status}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Paid'} • ₹{order.totalAmount}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>
                    +₹{order.deliveryEarnings || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
