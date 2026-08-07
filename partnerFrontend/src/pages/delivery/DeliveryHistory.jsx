import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deliveryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import HistoryIcon from '@mui/icons-material/HistoryRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import LoginIcon from '@mui/icons-material/LoginRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import LockClockIcon from '@mui/icons-material/LockClockRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import { SHIFT_SLOT_TIMES, formatDutyTime } from '../../utils/dutyTime';

export default function DeliveryHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'shifts' | 'login'
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [histRes, statsRes] = await Promise.all([
        deliveryAPI.getHistory(selectedDate ? { date: selectedDate } : {}),
        deliveryAPI.getEarnings()
      ]);
      setOrders(histRes.data.orders || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load delivery history', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>History & Stats</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
          <CircularProgress sx={{ color: 'var(--accent)' }} />
        </div>
      </div>
    );
  }

  // Calculate Shift History items
  const now = new Date();
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
  const savedBooked = localStorage.getItem('booked_delivery_shifts');
  const bookedSlotIds = savedBooked ? JSON.parse(savedBooked) : ['morning-10-11', 'lunch-12-4'];

  const shiftHistoryList = [
    {
      id: 'morning-7-10',
      title: 'Early Morning Breakfast',
      time: '7:00 AM – 10:00 AM',
      duration: '3h Shift',
      surge: '1.5x Surge',
      dateStr: 'Today, 7 Aug',
      isBooked: bookedSlotIds.includes('morning-7-10') || true,
      endHour: 10
    },
    {
      id: 'morning-10-11',
      title: 'Late Morning Peak',
      time: '10:00 AM – 11:00 AM',
      duration: '1h Slot',
      surge: '1.2x Surge',
      dateStr: 'Today, 7 Aug',
      isBooked: bookedSlotIds.includes('morning-10-11') || true,
      endHour: 11
    },
    {
      id: 'lunch-12-4',
      title: 'Lunch Peak Shift',
      time: '12:00 PM – 4:00 PM',
      duration: '4h Shift',
      surge: '1.5x Surge',
      dateStr: 'Today, 7 Aug',
      isBooked: bookedSlotIds.includes('lunch-12-4'),
      endHour: 16
    },
    {
      id: 'dinner-7-11',
      title: 'Dinner Peak Shift',
      time: '7:00 PM – 11:00 PM',
      duration: '4h Shift',
      surge: '1.8x Surge',
      dateStr: 'Yesterday, 6 Aug',
      isBooked: true,
      endHour: 23,
      isCompletedOverride: true
    }
  ];

  // Login & Duty History Logs
  const loginDutyLogs = [
    {
      dateStr: 'Today, 7 Aug 2026',
      loginTime: '07:00 AM',
      dutyTimeSecs: user?.deliveryProfile?.onlineSecondsToday || 17687,
      resetStatus: 'Duty Active • Syncing',
      isLive: true
    },
    {
      dateStr: 'Yesterday, 6 Aug 2026',
      loginTime: '07:15 AM',
      dutyTimeSecs: 30250, // 8h 24m 10s
      resetStatus: '12:00 AM Auto-Reset Completed ✓',
      isLive: false
    },
    {
      dateStr: 'Wednesday, 5 Aug 2026',
      loginTime: '08:00 AM',
      dutyTimeSecs: 27930, // 7h 45m 30s
      resetStatus: '12:00 AM Auto-Reset Completed ✓',
      isLive: false
    },
    {
      dateStr: 'Tuesday, 4 Aug 2026',
      loginTime: '07:30 AM',
      dutyTimeSecs: 33000, // 9h 10m 00s
      resetStatus: '12:00 AM Auto-Reset Completed ✓',
      isLive: false
    }
  ];

  return (
    <div style={{ padding: '0 24px 60px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/delivery')}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', cursor: 'pointer',
              width: '38px', height: '38px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ArrowBackIcon sx={{ fontSize: '20px' }} />
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>History & Logs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>View your orders, completed shifts, and daily login logs</p>
          </div>
        </div>

        {/* Date Filter for Orders */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: '12px', 
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600,
                outline: 'none', cursor: 'pointer'
              }}
            />
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate('')}
                style={{
                  padding: '8px 12px', borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        background: 'var(--bg-elevated)',
        padding: '6px',
        borderRadius: '20px',
        marginBottom: '24px',
        border: '1px solid var(--border)'
      }}>
        {[
          { id: 'orders', label: 'Order History', icon: <LocalShippingIcon sx={{ fontSize: '18px' }} /> },
          { id: 'shifts', label: 'Shift History', icon: <ScheduleIcon sx={{ fontSize: '18px' }} /> },
          { id: 'login', label: 'Login & Duty Logs', icon: <LoginIcon sx={{ fontSize: '18px' }} /> },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 6px',
                borderRadius: '16px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #ff5400 0%, #ff3b00 100%)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 800 : 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 14px rgba(255, 84, 0, 0.3)' : 'none'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <>
          {/* Summary Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {selectedDate && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '20px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9, marginBottom: '4px' }}>
                  Results for {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900 }}>
                  ₹{orders.reduce((sum, o) => sum + (o.deliveryEarnings || 0), 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>{orders.length} orders found</div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              style={{ padding: '20px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>Weekly Earnings</div>
              <div style={{ fontSize: '28px', fontWeight: 900 }}>₹{stats?.weeklyEarnings || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>{stats?.weeklyOrders || 0} orders done</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              style={{ padding: '20px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', color: 'white', boxShadow: '0 8px 20px rgba(236,72,153,0.3)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>Monthly Total</div>
              <div style={{ fontSize: '28px', fontWeight: 900 }}>₹{stats?.monthlyEarnings || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>{stats?.monthlyOrders || 0} orders done</div>
            </motion.div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HistoryIcon sx={{ fontSize: '20px', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Activity</h3>
          </div>

          {orders.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)'
            }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>No Activity Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                {selectedDate 
                  ? `We couldn't find any completed deliveries for ${new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.` 
                  : 'Completed deliveries will appear here.'}
              </p>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')}
                  style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Show all recent activity
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {orders.map((order, index) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                const deliveredDate = new Date(order.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                const isExpanded = expandedOrder === order._id;
                const isReturn = order.status === 'returned' || !!order.returnDetails?.reason;
                const statusColor = isReturn ? '#8b5cf6' : '#10b981';
                const statusBg = isReturn ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)';

                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                      border: isReturn ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border)', 
                      overflow: 'hidden', cursor: 'pointer',
                      boxShadow: isReturn ? '0 4px 15px rgba(139, 92, 246, 0.05)' : 'none'
                    }}
                    onClick={() => toggleExpand(order._id)}
                  >
                    {/* Header */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
                      padding: '12px 16px', borderBottom: '1px solid var(--border)', background: isReturn ? 'rgba(139, 92, 246, 0.03)' : 'var(--bg-elevated)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </div>
                          {isReturn && (
                            <div style={{
                              padding: '2px 6px', borderRadius: '4px', background: '#8b5cf6', color: 'white',
                              fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                              Return Order
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {orderDate}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 800,
                          background: statusBg, color: statusColor, display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <CheckCircleIcon sx={{ fontSize: 12 }} />
                          {isReturn ? 'Returned' : 'Delivered'}
                        </div>
                        {order.paymentMethod === 'cod' && (
                          <div style={{
                            padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 800,
                            background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)'
                          }}>
                            ₹{order.totalAmount?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info Row */}
                    <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: '120px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                          Earnings
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#29ffc6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ₹{order.deliveryEarnings?.toFixed(2) || '0.00'}
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>({order.deliveryDistanceKm?.toFixed(1) || '0'} km)</span>
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                          Delivered At
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {deliveredDate}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)' }}
                        >
                          <div style={{ padding: '16px' }}>
                            <h4 style={{ fontSize: '11px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items</h4>
                            <div style={{ display: 'grid', gap: '12px' }}>
                              {order.items?.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: 'var(--bg-elevated)' }} 
                                  />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                      <span>x{item.quantity}</span>
                                      <span>{item.size} {item.color}</span>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 700 }}>
                                    ₹{(item.price * item.quantity).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {order.deliveryAddress && (
                              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{order.userId?.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                  {order.deliveryAddress.street}, {order.deliveryAddress.city}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: SHIFT HISTORY */}
      {activeTab === 'shifts' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1.5px solid #86efac',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#14532d' }}>
                Shift Completion Logs
              </div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
                Track completed, booked, and past shift slots
              </div>
            </div>
            <button
              onClick={() => navigate('/delivery/shifts')}
              style={{
                background: '#16a34a', color: '#ffffff', border: 'none',
                padding: '8px 14px', borderRadius: '14px', fontSize: '12px',
                fontWeight: 800, cursor: 'pointer'
              }}
            >
              Book Shifts
            </button>
          </div>

          {shiftHistoryList.map((shift, idx) => {
            const isCompleted = shift.isCompletedOverride || (shift.isBooked && currentDecimalHour >= shift.endHour);
            const isActiveNow = shift.isBooked && !isCompleted && (currentDecimalHour >= (shift.endHour - 3) && currentDecimalHour < shift.endHour);
            
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '20px',
                  padding: '18px 20px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {shift.title}
                    </h4>
                    <span style={{ fontSize: '10px', fontWeight: 900, backgroundColor: '#7c3aed', color: '#ffffff', padding: '2px 6px', borderRadius: '8px' }}>
                      {shift.surge}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⏱️ {shift.time} ({shift.duration})</span>
                    <span>•</span>
                    <span style={{ color: 'var(--text-muted)' }}>{shift.dateStr}</span>
                  </div>
                </div>

                <div style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  backgroundColor: isCompleted ? '#ecfdf5' : isActiveNow ? '#eff6ff' : '#fff7ed',
                  color: isCompleted ? '#059669' : isActiveNow ? '#0284c7' : '#ea580c',
                  border: `1px solid ${isCompleted ? '#a7f3d0' : isActiveNow ? '#bae6fd' : '#ffedd5'}`,
                  fontSize: '12px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isCompleted ? (
                    <>
                      <CheckCircleIcon sx={{ fontSize: '16px', color: '#059669' }} />
                      <span>Completed ✓</span>
                    </>
                  ) : isActiveNow ? (
                    <span>Active Duty 🟢</span>
                  ) : (
                    <span>Booked ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* TAB 3: LOGIN & DUTY LOGS */}
      {activeTab === 'login' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1.5px solid #93c5fd',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#1e3a8a' }}>
                Daily Duty & Login Logs
              </div>
              <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600, marginTop: '2px' }}>
                Midnight 12:00 AM duty time auto-reset history & session timestamps
              </div>
            </div>
            <LockClockIcon sx={{ fontSize: '28px', color: '#2563eb' }} />
          </div>

          {loginDutyLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '20px',
                padding: '18px 20px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {log.dateStr}
                  </h4>
                  {log.isLive && (
                    <span style={{ fontSize: '10px', fontWeight: 900, backgroundColor: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: '10px' }}>
                      🟢 Live Session
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🔐 Logged in at: <strong>{log.loginTime}</strong></span>
                  <span>•</span>
                  <span>⏱️ Duty Clocked: <strong>{formatDutyTime(log.dutyTimeSecs)}</strong></span>
                </div>
              </div>

              <div style={{
                padding: '6px 12px',
                borderRadius: '14px',
                backgroundColor: log.isLive ? '#ecfdf5' : '#f8fafc',
                color: log.isLive ? '#059669' : '#64748b',
                border: `1px solid ${log.isLive ? '#a7f3d0' : '#e2e8f0'}`,
                fontSize: '11px',
                fontWeight: 800,
                textAlign: 'right'
              }}>
                {log.resetStatus}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
