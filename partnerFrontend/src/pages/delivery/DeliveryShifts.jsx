import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
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

  // Load booked shift IDs for selectedDate
  const [bookedSlots, setBookedSlots] = useState(() => getBookedShiftsForDate(selectedDate));

  // Reload when selectedDate changes
  useEffect(() => {
    setBookedSlots(getBookedShiftsForDate(selectedDate));
  }, [selectedDate]);

  // Save bookedSlots whenever updated
  useEffect(() => {
    saveBookedShiftsForDate(bookedSlots, selectedDate);
  }, [bookedSlots, selectedDate]);

  const shiftCategories = [
    {
      category: 'Early Morning Breakfast',
      tag: '☕ Breakfast Surge',
      timeRange: '7:00 AM – 10:00 AM',
      slots: [
        { id: 'morning-7-10', time: '7 AM – 10 AM', duration: '3h Shift', statusText: 'Available (15 slots left)', statusType: 'available', surge: '1.3x Surge' },
        { id: 'morning-7-8', time: '7 AM – 8 AM', duration: '1h Slot', statusText: 'Available (5 slots left)', statusType: 'available', surge: '1.2x Surge' },
        { id: 'morning-8-9', time: '8 AM – 9 AM', duration: '1h Slot', statusText: 'Filling Fast (2 slots left)', statusType: 'filling', surge: '1.4x Surge' },
        { id: 'morning-9-10', time: '9 AM – 10 AM', duration: '1h Slot', statusText: 'Available (8 slots left)', statusType: 'available' }
      ]
    },
    {
      category: 'Late Morning Peak',
      tag: '☀️ Morning Rush',
      timeRange: '10:00 AM – 12:00 PM',
      slots: [
        { id: 'morning-10-12', time: '10 AM – 12 PM', duration: '2h Shift', statusText: 'Available (18 slots left)', statusType: 'available', surge: '1.2x Surge' },
        { id: 'morning-10-11', time: '10 AM – 11 AM', duration: '1h Slot', statusText: 'Available (7 slots left)', statusType: 'available' },
        { id: 'morning-11-12', time: '11 AM – 12 PM', duration: '1h Slot', statusText: 'Filling Fast (3 slots left)', statusType: 'filling', surge: '1.3x Surge' }
      ]
    },
    {
      category: 'Lunch Shift',
      tag: '🔥 High Surge',
      timeRange: '12:00 PM – 4:00 PM',
      slots: [
        { id: 'lunch-12-4', time: '12 PM – 4 PM', duration: '4h Shift', statusText: 'Available (14 slots left)', statusType: 'available', surge: '1.5x Surge' },
        { id: 'lunch-1-2', time: '1 PM – 2 PM', duration: '1h Slot', statusText: 'Filling Fast (2 slots left)', statusType: 'filling', surge: '1.2x Surge' },
        { id: 'lunch-2-3', time: '2 PM – 3 PM', duration: '1h Slot', statusText: 'Available (8 slots left)', statusType: 'available' },
        { id: 'lunch-3-4', time: '3 PM – 4 PM', duration: '1h Slot', statusText: 'Available (12 slots left)', statusType: 'available' }
      ]
    },
    {
      category: 'Evening Snacks',
      tag: '⚡ Popular',
      timeRange: '4:00 PM – 7:00 PM',
      slots: [
        { id: 'snacks-4-7', time: '4 PM – 7 PM', duration: '3h Shift', statusText: 'Available (19 slots left)', statusType: 'available' },
        { id: 'snacks-4-5', time: '4 PM – 5 PM', duration: '1h Slot', statusText: 'Available (6 slots left)', statusType: 'available' },
        { id: 'snacks-5-6', time: '5 PM – 6 PM', duration: '1h Slot', statusText: 'Filling Fast (3 slots left)', statusType: 'filling' },
        { id: 'snacks-6-7', time: '6 PM – 7 PM', duration: '1h Slot', statusText: 'Short Booked (Full)', statusType: 'full' }
      ]
    },
    {
      category: 'Dinner Peak Shift',
      tag: '🔥 Mega Surge',
      timeRange: '7:00 PM – 11:00 PM',
      slots: [
        { id: 'dinner-7-11', time: '7 PM – 11 PM', duration: '4h Shift', statusText: 'Available (22 slots left)', statusType: 'available', surge: '1.8x Surge' },
        { id: 'dinner-8-10', time: '8 PM – 10 PM', duration: '2h Slot', statusText: 'Filling Fast (1 slot left)', statusType: 'filling', surge: '1.5x Surge' },
        { id: 'dinner-10-11', time: '10 PM – 11 PM', duration: '1h Slot', statusText: 'Available (10 slots left)', statusType: 'available' }
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

  const handleToggleSlot = (slotId, statusType) => {
    if (statusType === 'full') {
      toast.error('This shift is full / short booked.');
      return;
    }

    const isToday = selectedDate === getLocalDateStr(now);
    const slotInfo = SHIFT_SLOT_TIMES[slotId];
    const isBooked = bookedSlots.includes(slotId);
    const isPastEnd = isToday && slotInfo && (currentDecimalHour >= slotInfo.endHour);
    const isPastBookingCutoff = isToday && slotInfo && (currentDecimalHour >= (slotInfo.startHour - 0.25));
    const isActiveDuty = isBooked && !isPastEnd && isPastBookingCutoff;

    if (isBooked && isPastEnd) {
      toast.success('✓ This shift slot was completed earlier today!');
      return;
    }

    if (!isBooked && isPastBookingCutoff) {
      toast.error('⏳ Booking Closed: You cannot book a shift whose start time has already passed.');
      return;
    }

    if (isBooked && isActiveDuty && isOnline) {
      toast.error('⚠️ Cannot unbook an active shift while online. Please go offline first.');
      return;
    }

    if (isBooked) {
      setBookedSlots(prev => prev.filter(id => id !== slotId));
      toast('Shift slot unbooked', { icon: 'ℹ️' });
    } else {
      setBookedSlots(prev => [...prev, slotId]);
      toast.success('Shift slot booked successfully! 🎉');
    }
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '8px 8px 80px',
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
              Book slots to go online (starts 15m before shift)
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
            backgroundColor: activeBookedSlotsList.length > 0 ? '#ecfdf5' : '#f1f5f9',
            color: activeBookedSlotsList.length > 0 ? '#059669' : '#64748b',
            border: `1px solid ${activeBookedSlotsList.length > 0 ? '#a7f3d0' : '#cbd5e1'}`,
            borderRadius: '12px',
            padding: '4px 8px',
            fontSize: '10px',
            fontWeight: 800
          }}>
            {activeBookedSlotsList.length} Booked
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
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', color: 'var(--text-primary, #ffffff)' }}>
                  <thead>
                    <tr style={{ background: 'rgba(245, 158, 11, 0.18)', color: '#f59e0b', textAlign: 'left', fontWeight: 900 }}>
                      <th style={{ padding: '8px 10px', borderRadius: '6px 0 0 6px' }}>Shift Duration</th>
                      <th style={{ padding: '8px 10px' }}>Total Time</th>
                      <th style={{ padding: '8px 10px' }}>Req. Min Login Time</th>
                      <th style={{ padding: '8px 10px', borderRadius: '0 6px 6px 0' }}>Allowed Break</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHIFT_ATTENDANCE_TABLE.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '7px 10px', fontWeight: 800 }}>{row.durationHours} Hr{row.durationHours > 1 ? 's' : ''}</td>
                        <td style={{ padding: '7px 10px', color: 'var(--text-muted)' }}>{row.totalMins} mins</td>
                        <td style={{ padding: '7px 10px', color: '#10b981', fontWeight: 800 }}>{row.reqRangeStr}</td>
                        <td style={{ padding: '7px 10px', color: '#f59e0b', fontWeight: 700 }}>{row.breakRangeStr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: '10px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <div>📌 <strong>Login Percentage:</strong> Maintaining 90% to 95% active login time per shift is required for full shift attendance & Minimum Guarantee (MG) eligibility.</div>
                <div style={{ marginTop: '4px' }}>⏸️ <strong>Break Usage:</strong> Use the in-app Pause option during short breaks instead of logging out completely to prevent shift cancellation.</div>
                <div style={{ marginTop: '4px' }}>🎯 <strong>Performance Criteria:</strong> Meeting the shift requirement also depends on maintaining the standard Acceptance Rate (AR) and avoiding unauthorized cancellations.</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shift Categories & Slot Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
        {shiftCategories.map((cat, catIdx) => (
          <div
            key={catIdx}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Category Header Bar */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{cat.category}</span>
                <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px', fontWeight: 600 }}>({cat.timeRange})</span>
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
            <div style={{ padding: '8px 16px' }}>
              {cat.slots.map((slot, sIdx) => {
                const isBooked = bookedSlots.includes(slot.id);
                const slotInfo = SHIFT_SLOT_TIMES[slot.id];
                const isToday = selectedDate === getLocalDateStr(now);

                const isPastEnd = isToday && slotInfo && (currentDecimalHour >= slotInfo.endHour);
                const isPastBookingCutoff = isToday && slotInfo && (currentDecimalHour >= (slotInfo.startHour - 0.25));

                const isCompleted = isBooked && isPastEnd;
                const isActiveDuty = isBooked && !isPastEnd && isPastBookingCutoff;
                const isExpiredUnbooked = !isBooked && isPastBookingCutoff;

                const isFull = slot.statusType === 'full';
                const isFilling = slot.statusType === 'filling';
                const isRowDisabled = isFull || isExpiredUnbooked;

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleToggleSlot(slot.id, slot.statusType)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 8px',
                      borderBottom: sIdx < cat.slots.length - 1 ? '1px dashed #f1f5f9' : 'none',
                      cursor: isRowDisabled ? 'not-allowed' : 'pointer',
                      opacity: isRowDisabled ? 0.55 : 1
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
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
                      </div>

                      {/* Status indicator in words */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                          ⏱️ {slot.duration}
                        </span>
                        <span>•</span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: isCompleted
                            ? '#059669'
                            : isActiveDuty
                            ? '#10b981'
                            : isBooked
                            ? '#0284c7'
                            : isExpiredUnbooked
                            ? '#64748b'
                            : isFull
                            ? '#ef4444'
                            : isFilling
                            ? '#f59e0b'
                            : '#0284c7'
                        }}>
                          {isCompleted
                            ? 'Completed ✓'
                            : isActiveDuty
                            ? 'Active Duty Now 🟢'
                            : isBooked
                            ? 'Booked ✓'
                            : isExpiredUnbooked
                            ? 'Booking Closed ⏳'
                            : slot.statusText}
                        </span>
                      </div>

                      {/* Minimum Required Login & Allowed Break metadata */}
                      {slotInfo && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                            🎯 Min Login: {getShiftAttendanceRule(slotInfo.endHour - slotInfo.startHour).reqRangeStr}
                          </span>
                          <span>•</span>
                          <span>
                            ☕ Break: {getShiftAttendanceRule(slotInfo.endHour - slotInfo.startHour).breakRangeStr} ({getShiftAttendanceRule(slotInfo.endHour - slotInfo.startHour).mgPercent} MG)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Booking Control checkbox/button */}
                    <div style={{
                      padding: (isCompleted || isExpiredUnbooked) ? '4px 10px' : '0',
                      height: '28px',
                      borderRadius: (isCompleted || isExpiredUnbooked) ? '12px' : '8px',
                      border: `2px solid ${
                        isCompleted
                          ? '#a7f3d0'
                          : isBooked
                          ? '#10b981'
                          : isExpiredUnbooked
                          ? '#cbd5e1'
                          : isFull
                          ? '#cbd5e1'
                          : '#94a3b8'
                      }`,
                      backgroundColor: isCompleted
                        ? '#ecfdf5'
                        : isBooked
                        ? '#10b981'
                        : isExpiredUnbooked
                        ? '#f1f5f9'
                        : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCompleted ? '#059669' : isExpiredUnbooked ? '#64748b' : '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      transition: 'all 0.2s ease'
                    }}>
                      {isCompleted ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircleIcon sx={{ fontSize: '16px', color: '#059669' }} />
                          <span>Completed</span>
                        </div>
                      ) : isBooked ? (
                        <CheckCircleIcon sx={{ fontSize: '20px' }} />
                      ) : isExpiredUnbooked ? (
                        <span>Closed</span>
                      ) : null}
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
        bottom: isMobile ? '84px' : '24px',
        left: isMobile ? '50%' : 'calc(50% + 130px)',
        transform: 'translateX(-50%)',
        width: isMobile ? 'calc(100% - 32px)' : 'min(608px, calc(100vw - 320px))',
        maxWidth: '608px',
        zIndex: 999
      }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '16px 20px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
              Selected Shifts
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
              {bookedSlots.length} Slots Reserved
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (bookedSlots.length === 0) {
                toast.error('Please select at least one shift slot.');
                return;
              }
              const statusInfo = getShiftOnlineStatus(bookedSlots, new Date());
              if (!statusInfo.canGoOnline) {
                toast.error(`⚠️ Cannot Go Online Yet\n\n${statusInfo.message}`, { duration: 4500 });
                return;
              }
              toast.success('Shifts confirmed! You are now eligible to go online.');
              navigate('/delivery');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              color: '#0a1128',
              border: 'none',
              borderRadius: '18px',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)'
            }}
          >
            <span>Confirm & Go Online</span>
            <PlayArrowIcon sx={{ fontSize: '20px' }} />
          </motion.button>
        </motion.div>
      </div>

    </div>
  );
}
