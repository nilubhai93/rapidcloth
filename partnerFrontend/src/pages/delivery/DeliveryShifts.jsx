import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deliveryAPI } from '../../api';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import toast from 'react-hot-toast';
import {
  SHIFT_SLOT_TIMES,
  getShiftOnlineStatus,
  formatDecimalHourToTimeStr,
  getLocalDateStr,
  getBookedShiftsForDate,
  saveBookedShiftsForDate,
  cleanupExpiredShiftStorage,
  getUpcomingDateTabs,
  SHIFT_ATTENDANCE_TABLE,
  getShiftAttendanceRule
} from '../../utils/dutyTime';

export default function DeliveryShifts() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [dateTabs, setDateTabs] = useState(() => getUpcomingDateTabs());
  const [selectedDate, setSelectedDate] = useState(() => getUpcomingDateTabs()[0]?.id || getLocalDateStr());
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    cleanupExpiredShiftStorage();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitor midnight / date rollover in real time
  useEffect(() => {
    const timer = setInterval(() => {
      const freshTabs = getUpcomingDateTabs();
      const currentToday = freshTabs[0]?.id;
      if (currentToday && dateTabs[0]?.id !== currentToday) {
        setDateTabs(freshTabs);
        setSelectedDate(currentToday);
        cleanupExpiredShiftStorage();
        toast('☀️ Midnight Rollover: Shift schedule reset for today!', { icon: '🔄', duration: 5000 });
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [dateTabs]);

  // Booked slots in DB vs selected slots in the current UI state
  const [bookedSlots, setBookedSlots] = useState(() => getBookedShiftsForDate(selectedDate));
  const [selectedSlots, setSelectedSlots] = useState(() => getBookedShiftsForDate(selectedDate));
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchShifts = async () => {
      const localShifts = getBookedShiftsForDate(selectedDate);
      setBookedSlots(localShifts);
      setSelectedSlots(localShifts);

      try {
        setLoadingShifts(true);
        const res = await deliveryAPI.getBookedShifts(selectedDate);
        if (isMounted && res.data && Array.isArray(res.data.slotIds)) {
          setBookedSlots(res.data.slotIds);
          setSelectedSlots(res.data.slotIds);
          saveBookedShiftsForDate(res.data.slotIds, selectedDate);
        }
      } catch (err) {
        console.error('Failed to fetch shifts from backend:', err);
      } finally {
        if (isMounted) setLoadingShifts(false);
      }
    };

    fetchShifts();
    return () => { isMounted = false; };
  }, [selectedDate]);

  const shiftCategories = [
    {
      category: 'Early Morning Breakfast',
      tag: '☕ Breakfast Surge',
      timeRange: '7:00 AM – 10:00 AM',
      slots: [
        { id: 'morning-7-10', time: '7 AM – 10 AM', surge: '1.3x Surge' },
        { id: 'morning-7-8', time: '7 AM – 8 AM', surge: '1.2x Surge' },
        { id: 'morning-8-9', time: '8 AM – 9 AM', surge: '1.4x Surge' },
        { id: 'morning-9-10', time: '9 AM – 10 AM' }
      ]
    },
    {
      category: 'Late Morning Peak',
      tag: '☀️ Morning Rush',
      timeRange: '10:00 AM – 12:00 PM',
      slots: [
        { id: 'morning-10-12', time: '10 AM – 12 PM', surge: '1.2x Surge' },
        { id: 'morning-10-11', time: '10 AM – 11 AM' },
        { id: 'morning-11-12', time: '11 AM – 12 PM', surge: '1.3x Surge' }
      ]
    },
    {
      category: 'Lunch Shift',
      tag: '🔥 High Surge',
      timeRange: '12:00 PM – 4:00 PM',
      slots: [
        { id: 'lunch-12-4', time: '12 PM – 4 PM', surge: '1.5x Surge' },
        { id: 'lunch-1-2', time: '1 PM – 2 PM', surge: '1.2x Surge' },
        { id: 'lunch-2-3', time: '2 PM – 3 PM' },
        { id: 'lunch-3-4', time: '3 PM – 4 PM' }
      ]
    },
    {
      category: 'Evening Snacks',
      tag: '⚡ Popular',
      timeRange: '4:00 PM – 7:00 PM',
      slots: [
        { id: 'snacks-4-7', time: '4 PM – 7 PM' },
        { id: 'snacks-4-5', time: '4 PM – 5 PM' },
        { id: 'snacks-5-6', time: '5 PM – 6 PM' },
        { id: 'snacks-6-7', time: '6 PM – 7 PM' }
      ]
    },
    {
      category: 'Dinner Peak Shift',
      tag: '🔥 Mega Surge',
      timeRange: '7:00 PM – 11:00 PM',
      slots: [
        { id: 'dinner-7-11', time: '7 PM – 11 PM', surge: '1.8x Surge' },
        { id: 'dinner-8-10', time: '8 PM – 10 PM', surge: '1.5x Surge' },
        { id: 'dinner-10-11', time: '10 PM – 11 PM' }
      ]
    }
  ];

  const now = new Date();
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
  const isOnline = user?.deliveryProfile?.isOnline || false;

  // Calculate completed slots vs active booked slots
  const allSlotsList = shiftCategories.flatMap(c => c.slots);
  
  const completedSlotsList = allSlotsList.filter(slot => {
    const isBooked = bookedSlots.includes(slot.id);
    const slotInfo = SHIFT_SLOT_TIMES[slot.id];
    return isBooked && slotInfo && (currentDecimalHour >= slotInfo.endHour);
  });

  const activeBookedSlotsList = allSlotsList.filter(slot => {
    const isBooked = bookedSlots.includes(slot.id);
    const slotInfo = SHIFT_SLOT_TIMES[slot.id];
    return isBooked && (!slotInfo || currentDecimalHour < slotInfo.endHour);
  });

  // Toggle selection on slot click without immediately booking to backend
  const handleToggleSelection = (slotId) => {
    const isToday = selectedDate === getLocalDateStr(now);
    const slotInfo = SHIFT_SLOT_TIMES[slotId];
    const isPastEnd = isToday && slotInfo && (currentDecimalHour >= slotInfo.endHour);
    const isPastBookingCutoff = isToday && slotInfo && (currentDecimalHour >= (slotInfo.startHour - 0.25));

    if (isPastEnd) {
      toast('✓ This shift slot has already ended today.', { icon: 'ℹ️' });
      return;
    }

    if (isPastBookingCutoff) {
      toast.error('⏳ Booking Closed: Start time has already passed.');
      return;
    }

    // Prevent unselecting active shift if currently online
    const isActiveDuty = bookedSlots.includes(slotId) && !isPastEnd && isPastBookingCutoff;
    if (selectedSlots.includes(slotId) && isActiveDuty && isOnline) {
      toast.error('⚠️ Cannot unselect an active shift while online. Please go offline first.');
      return;
    }

    setSelectedSlots(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId);
      } else {
        return [...prev, slotId];
      }
    });
  };

  // Confirm and persist booking to MongoDB backend
  const handleConfirmBooking = async () => {
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one shift slot.');
      return;
    }

    try {
      setSavingBooking(true);
      await deliveryAPI.saveBookedShifts(selectedDate, selectedSlots);

      setBookedSlots(selectedSlots);
      saveBookedShiftsForDate(selectedSlots, selectedDate);

      const isToday = selectedDate === getLocalDateStr(now);
      const statusInfo = getShiftOnlineStatus(selectedSlots, new Date());

      if (isToday) {
        if (statusInfo.canGoOnline) {
          toast.success('🎉 Shift booked successfully! You are eligible to go online.');
          navigate('/delivery');
        } else {
          toast.success(`🎉 Shifts booked successfully! ${statusInfo.message}`, { duration: 5000 });
        }
      } else {
        const tabInfo = dateTabs.find(t => t.id === selectedDate);
        toast.success(`🎉 Shifts booked successfully for ${tabInfo?.dateStr || selectedDate}!`, { duration: 4500 });
      }
    } catch (err) {
      console.error('Failed to save booked shifts:', err);
      setBookedSlots(selectedSlots);
      saveBookedShiftsForDate(selectedSlots, selectedDate);
      toast.success('🎉 Shifts booked (saved locally)!');
    } finally {
      setSavingBooking(false);
    }
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: isMobile ? '8px 12px 140px' : '16px 16px 90px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0f172a'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        paddingTop: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>
              My Shifts & Slots
            </h1>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              Select slots and confirm booking to go online
            </div>
          </div>
        </div>

        {/* Counter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {completedSlotsList.length > 0 && (
            <div style={{
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              <CheckCircleIcon sx={{ fontSize: '13px' }} />
              <span>{completedSlotsList.length} Done</span>
            </div>
          )}

          <div style={{
            backgroundColor: bookedSlots.length > 0 ? '#ecfdf5' : '#f1f5f9',
            color: bookedSlots.length > 0 ? '#059669' : '#64748b',
            border: `1px solid ${bookedSlots.length > 0 ? '#a7f3d0' : '#cbd5e1'}`,
            borderRadius: '12px',
            padding: '4px 8px',
            fontSize: '10px',
            fontWeight: 800
          }}>
            {bookedSlots.length} Booked
          </div>
        </div>
      </div>

      {/* Date Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '14px',
        scrollbarWidth: 'none'
      }}>
        {dateTabs.map(tab => {
          const isSelected = selectedDate === tab.id;
          return (
            <motion.div
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(tab.id)}
              style={{
                flexShrink: 0,
                minWidth: '65px',
                padding: '8px 6px',
                borderRadius: '12px',
                textAlign: 'center',
                backgroundColor: isSelected ? '#f59e0b' : 'var(--bg-card, #152238)',
                color: isSelected ? '#0a1128' : 'var(--text-primary, #f8fafc)',
                boxShadow: isSelected ? '0 4px 12px rgba(245, 158, 11, 0.35)' : '0 2px 6px rgba(0,0,0,0.2)',
                border: isSelected ? 'none' : '1px solid var(--border, #1e293b)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {tab.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '4px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: '8px',
                  fontWeight: 900,
                  padding: '1px 4px',
                  borderRadius: '6px'
                }}>
                  {tab.badge}
                </div>
              )}
              <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: isSelected ? 0.9 : 0.6, fontWeight: 700 }}>
                {tab.label}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '1px' }}>
                {tab.dateStr}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completed Shift Activity Summary Card */}
      {completedSlotsList.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #86efac',
          borderRadius: '12px',
          padding: '10px 12px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.06)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircleIcon sx={{ fontSize: '18px' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>
              {completedSlotsList.length} Shift{completedSlotsList.length > 1 ? 's' : ''} Completed Today! 🎉
            </div>
            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, marginTop: '1px' }}>
              {completedSlotsList.map(s => s.time).join(' • ')}
            </div>
          </div>
        </div>
      )}

      {/* Live Surge Banner Announcement */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        border: '1px solid #a7f3d0',
        borderRadius: '12px',
        padding: '10px 12px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <LocalFireDepartmentIcon sx={{ fontSize: '18px' }} />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>
            Know LIVE Shift Surge Offers
          </div>
          <div style={{ fontSize: '12px', color: '#047857', fontWeight: 500 }}>
            Book Early Morning (7-10 AM), Lunch (12-4 PM) & Dinner (7-11 PM) for up to 1.8x surge pay!
          </div>
        </div>
      </div>

      {/* Shift Completion & Minimum Guarantee (MG) Rules Card */}
      <div style={{
        background: 'var(--bg-card, #152238)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '14px',
        padding: '14px 16px',
        marginBottom: '16px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
      }}>
        <div 
          onClick={() => setShowRulesModal(!showRulesModal)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <InfoOutlinedIcon sx={{ fontSize: '20px' }} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--text-primary, #ffffff)' }}>
                Shift Completion & MG Rules Table
              </div>
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, marginTop: '1px' }}>
                Req. Login: 90%–95% active time per shift for full attendance.
              </div>
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 800 }}>
            {showRulesModal ? 'Hide Rules ▲' : 'View Rules ▼'}
          </span>
        </div>

        <AnimatePresence>
          {showRulesModal && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed rgba(245, 158, 11, 0.25)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', color: 'var(--text-primary, #f8fafc)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#f59e0b' }}>
                      <th style={{ padding: '6px 8px' }}>Duration</th>
                      <th style={{ padding: '6px 8px' }}>Min Login Req.</th>
                      <th style={{ padding: '6px 8px' }}>Allowed Break</th>
                      <th style={{ padding: '6px 8px' }}>MG Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHIFT_ATTENDANCE_TABLE.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 800 }}>{row.duration}</td>
                        <td style={{ padding: '6px 8px', color: '#38bdf8', fontWeight: 700 }}>{row.reqRange}</td>
                        <td style={{ padding: '6px 8px', color: '#94a3b8' }}>{row.breakRange}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>
                            {row.mg}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories & Slots Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {shiftCategories.map(cat => (
          <div
            key={cat.category}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            {/* Category Header */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>{cat.category}</span>
                <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px', fontWeight: 600 }}>({cat.timeRange})</span>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                {cat.tag}
              </span>
            </div>

            {/* Slots List */}
            <div style={{ padding: '6px 12px' }}>
              {cat.slots.map((slot, sIdx) => {
                const isSelected = selectedSlots.includes(slot.id);
                const isBooked = bookedSlots.includes(slot.id);
                const slotInfo = SHIFT_SLOT_TIMES[slot.id];
                const isToday = selectedDate === getLocalDateStr(now);

                const isPastEnd = isToday && slotInfo && (currentDecimalHour >= slotInfo.endHour);
                const isPastBookingCutoff = isToday && slotInfo && (currentDecimalHour >= (slotInfo.startHour - 0.25));

                const isCompleted = isBooked && isPastEnd;
                const isActiveDuty = isBooked && !isPastEnd && isPastBookingCutoff;
                const isExpiredUnbooked = !isBooked && isPastBookingCutoff;
                const isRowDisabled = isExpiredUnbooked;

                return (
                  <div
                    key={slot.id}
                    onClick={() => !isRowDisabled && handleToggleSelection(slot.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 8px',
                      borderBottom: sIdx < cat.slots.length - 1 ? '1px dashed #f1f5f9' : 'none',
                      cursor: isRowDisabled ? 'not-allowed' : 'pointer',
                      opacity: isRowDisabled ? 0.5 : 1,
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                          {slot.time}
                        </span>
                        {slot.surge && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 900,
                            color: '#ffffff',
                            backgroundColor: '#7c3aed',
                            padding: '2px 6px',
                            borderRadius: '8px'
                          }}>
                            {slot.surge}
                          </span>
                        )}
                        {isCompleted && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#059669',
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            padding: '1px 6px',
                            borderRadius: '6px'
                          }}>
                            ✓ Completed
                          </span>
                        )}
                        {isActiveDuty && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#0284c7',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            padding: '1px 6px',
                            borderRadius: '6px'
                          }}>
                            🟢 Active Duty
                          </span>
                        )}
                      </div>

                      {/* Attendance Metadata */}
                      {slotInfo && (
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#d97706', fontWeight: 700 }}>
                            🎯 Min Login: {getShiftAttendanceRule(slotInfo.endHour - slotInfo.startHour).reqRangeStr}
                          </span>
                          <span>•</span>
                          <span>
                            ☕ Break: {getShiftAttendanceRule(slotInfo.endHour - slotInfo.startHour).breakRangeStr} ({getShiftAttendanceRule(slotInfo.endHour - slotInfo.startHour).mgPercent} MG)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Checkbox / Status Badge */}
                    <div style={{ flexShrink: 0, marginLeft: '12px' }}>
                      {isCompleted ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          border: '1px solid #a7f3d0',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          <CheckCircleIcon sx={{ fontSize: '15px' }} />
                          <span>Done</span>
                        </div>
                      ) : isExpiredUnbooked ? (
                        <div style={{
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          border: '1px solid #e2e8f0'
                        }}>
                          Closed
                        </div>
                      ) : (
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #f59e0b' : '2px solid #cbd5e1',
                          backgroundColor: isSelected ? '#f59e0b' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isSelected ? '0 2px 8px rgba(245, 158, 11, 0.45)' : 'none',
                          transition: 'all 0.2s ease'
                        }}>
                          {isSelected && (
                            <CheckIcon sx={{ fontSize: '16px', color: '#ffffff', stroke: '#ffffff', strokeWidth: 1.2 }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sticky Action Card */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? '76px' : '24px',
        left: isMobile ? '50%' : 'calc(50% + 130px)',
        transform: 'translateX(-50%)',
        width: isMobile ? 'calc(100% - 24px)' : 'min(580px, calc(100vw - 320px))',
        maxWidth: '580px',
        zIndex: 999
      }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(12px)',
            borderRadius: isMobile ? '18px' : '22px',
            padding: isMobile ? '10px 14px' : '14px 18px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
            border: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '8px' : '12px'
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              lineHeight: 1.2
            }}>
              Selected Shifts
            </div>
            <div style={{
              fontSize: isMobile ? '14px' : '17px',
              fontWeight: 900,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
              marginTop: '2px'
            }}>
              {selectedSlots.length} {selectedSlots.length === 1 ? 'Slot' : 'Slots'}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleConfirmBooking}
            disabled={savingBooking}
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '5px' : '7px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              color: '#0a1128',
              border: 'none',
              borderRadius: isMobile ? '13px' : '16px',
              padding: isMobile ? '10px 16px' : '12px 22px',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: 850,
              whiteSpace: 'nowrap',
              cursor: savingBooking ? 'not-allowed' : 'pointer',
              opacity: savingBooking ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)'
            }}
          >
            <span>
              {savingBooking
                ? 'Booking...'
                : (selectedDate === getLocalDateStr(now) ? 'Confirm & Go Online' : 'Confirm Booking')}
            </span>
            <PlayArrowIcon sx={{ fontSize: isMobile ? '16px' : '19px' }} />
          </motion.button>
        </motion.div>
      </div>

    </div>
  );
}
