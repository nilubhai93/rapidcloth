export function formatDutyTime(totalSecs = 0) {
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
}

export const getLocalDateStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const SHIFT_SLOT_TIMES = {
  'morning-7-10': { startHour: 7, endHour: 10, label: '7 AM – 10 AM' },
  'morning-7-8': { startHour: 7, endHour: 8, label: '7 AM – 8 AM' },
  'morning-8-9': { startHour: 8, endHour: 9, label: '8 AM – 9 AM' },
  'morning-9-10': { startHour: 9, endHour: 10, label: '9 AM – 10 AM' },
  'morning-10-12': { startHour: 10, endHour: 12, label: '10 AM – 12 PM' },
  'morning-10-11': { startHour: 10, endHour: 11, label: '10 AM – 11 AM' },
  'morning-11-12': { startHour: 11, endHour: 12, label: '11 AM – 12 PM' },
  'lunch-12-4': { startHour: 12, endHour: 16, label: '12 PM – 4 PM' },
  'lunch-1-2': { startHour: 13, endHour: 14, label: '1 PM – 2 PM' },
  'lunch-2-3': { startHour: 14, endHour: 15, label: '2 PM – 3 PM' },
  'lunch-3-4': { startHour: 15, endHour: 16, label: '3 PM – 4 PM' },
  'snacks-4-7': { startHour: 16, endHour: 19, label: '4 PM – 7 PM' },
  'snacks-4-5': { startHour: 16, endHour: 17, label: '4 PM – 5 PM' },
  'snacks-5-6': { startHour: 17, endHour: 18, label: '5 PM – 6 PM' },
  'snacks-6-7': { startHour: 18, endHour: 19, label: '6 PM – 7 PM' },
  'dinner-7-11': { startHour: 19, endHour: 23, label: '7 PM – 11 PM' },
  'dinner-8-10': { startHour: 20, endHour: 22, label: '8 PM – 10 PM' },
  'dinner-10-11': { startHour: 22, endHour: 23, label: '10 PM – 11 PM' }
};

export function hasActiveOrUpcomingShift(bookedSlotIds = [], date = new Date()) {
  if (!bookedSlotIds || bookedSlotIds.length === 0) return false;
  const currentDecimalHour = date.getHours() + date.getMinutes() / 60;
  return bookedSlotIds.some(id => {
    const slot = SHIFT_SLOT_TIMES[id];
    if (!slot) return true;
    return currentDecimalHour < slot.endHour;
  });
}

export function hasValidCurrentShift(bookedSlotIds = [], date = new Date()) {
  if (!bookedSlotIds || bookedSlotIds.length === 0) return false;
  const currentDecimalHour = date.getHours() + date.getMinutes() / 60;
  return bookedSlotIds.some(id => {
    const slot = SHIFT_SLOT_TIMES[id];
    if (!slot) return true;
    return currentDecimalHour >= (slot.startHour - 0.25) && currentDecimalHour < slot.endHour;
  });
}

export function formatDecimalHourToTimeStr(decimalHour) {
  let h = Math.floor(decimalHour);
  let m = Math.round((decimalHour - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  const ampm = h >= 12 ? 'PM' : 'AM';
  let displayHour = h % 12;
  if (displayHour === 0) displayHour = 12;
  const displayMins = String(m).padStart(2, '0');
  return `${displayHour}:${displayMins} ${ampm}`;
}

// Retrieve booked shift slot IDs for a specific date (defaults to Today)
export function getBookedShiftsForDate(date = new Date()) {
  const dateKey = typeof date === 'string' ? date : getLocalDateStr(date);
  try {
    const saved = localStorage.getItem(`booked_delivery_shifts_${dateKey}`);
    if (saved) return JSON.parse(saved);

    // Migration check for legacy key if checking today's date
    if (dateKey === getLocalDateStr(new Date())) {
      const legacy = localStorage.getItem('booked_delivery_shifts');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        localStorage.setItem(`booked_delivery_shifts_${dateKey}`, JSON.stringify(parsed));
        return parsed;
      }
    }
    return [];
  } catch (e) {
    return [];
  }
}

// Save booked shift slot IDs for a specific date (defaults to Today)
export function saveBookedShiftsForDate(slotIds = [], date = new Date()) {
  const dateKey = typeof date === 'string' ? date : getLocalDateStr(date);
  try {
    localStorage.setItem(`booked_delivery_shifts_${dateKey}`, JSON.stringify(slotIds));
    if (dateKey === getLocalDateStr(new Date())) {
      localStorage.setItem('booked_delivery_shifts', JSON.stringify(slotIds));
    }
  } catch (e) {
    console.error('Failed to save booked shifts:', e);
  }
}

// Automatically cleanup expired booked shift keys from previous days
export function cleanupExpiredShiftStorage() {
  try {
    const todayKey = getLocalDateStr(new Date());
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('booked_delivery_shifts_')) {
        const keyDateStr = key.replace('booked_delivery_shifts_', '');
        if (keyDateStr < todayKey) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.error('Failed to cleanup shift storage:', e);
  }
}

// Generate dynamic 5-day date tabs starting from Today
export function getUpcomingDateTabs(baseDate = new Date()) {
  const tabs = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 5; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);

    const dateKey = getLocalDateStr(d);
    const dayLabel = i === 0 ? 'Today' : dayNames[d.getDay()];
    const dateStr = `${d.getDate()} ${monthNames[d.getMonth()]}`;

    let badge = null;
    if (i === 2) badge = '1.5x Pay';
    if (i === 3) badge = 'Peak';

    tabs.push({
      id: dateKey,
      label: dayLabel,
      dateStr,
      isToday: i === 0,
      badge
    });
  }
  return tabs;
}

export const SHIFT_ATTENDANCE_TABLE = [
  { durationHours: 1.0, totalMins: 60, minReqMins: 50, reqRangeStr: '50 – 55 mins', breakRangeStr: '5 – 10 mins', mgPercent: '90%' },
  { durationHours: 1.5, totalMins: 90, minReqMins: 80, reqRangeStr: '80 – 85 mins (1h 20m)', breakRangeStr: '5 – 10 mins', mgPercent: '90%' },
  { durationHours: 2.0, totalMins: 120, minReqMins: 110, reqRangeStr: '110 – 115 mins (1h 50m)', breakRangeStr: '5 – 10 mins', mgPercent: '92%' },
  { durationHours: 2.5, totalMins: 150, minReqMins: 135, reqRangeStr: '135 – 140 mins (2h 15m)', breakRangeStr: '10 – 15 mins', mgPercent: '90%' },
  { durationHours: 3.0, totalMins: 180, minReqMins: 165, reqRangeStr: '165 – 170 mins (2h 45m)', breakRangeStr: '10 – 15 mins', mgPercent: '92%' },
  { durationHours: 3.5, totalMins: 210, minReqMins: 190, reqRangeStr: '190 – 195 mins (3h 15m)', breakRangeStr: '15 mins', mgPercent: '90%' },
  { durationHours: 4.0, totalMins: 240, minReqMins: 220, reqRangeStr: '220 – 225 mins (3h 40m)', breakRangeStr: '15 – 20 mins', mgPercent: '92%' },
  { durationHours: 5.0, totalMins: 300, minReqMins: 275, reqRangeStr: '275 – 280 mins (4h 35m)', breakRangeStr: '20 – 25 mins', mgPercent: '92%' },
  { durationHours: 6.0, totalMins: 360, minReqMins: 330, reqRangeStr: '330 – 335 mins (5h 30m)', breakRangeStr: '25 – 30 mins', mgPercent: '92%' },
  { durationHours: 8.0, totalMins: 480, minReqMins: 440, reqRangeStr: '440 – 450 mins (7h 20m)', breakRangeStr: '30 – 40 mins', mgPercent: '92%' }
];

export function getShiftAttendanceRule(durationHours) {
  const rounded = Math.round(durationHours * 10) / 10;
  const match = SHIFT_ATTENDANCE_TABLE.find(r => Math.abs(r.durationHours - rounded) < 0.1);
  if (match) return match;
  
  const totalMins = Math.round(durationHours * 60);
  const minReqMins = Math.round(totalMins * 0.90);
  return {
    durationHours,
    totalMins,
    minReqMins,
    reqRangeStr: `${minReqMins} mins`,
    breakRangeStr: `${totalMins - minReqMins} mins`,
    mgPercent: '90%'
  };
}

export function getShiftOnlineStatus(bookedSlotIds = [], date = new Date()) {
  if (!bookedSlotIds || bookedSlotIds.length === 0) {
    return {
      canGoOnline: false,
      reason: 'NO_BOOKED_SHIFTS',
      message: 'No active shift booked. Please book an upcoming shift slot to go online.'
    };
  }

  const currentDecimalHour = date.getHours() + date.getMinutes() / 60;

  // 1. Check if any booked slot is currently active (within startHour - 0.25 to endHour)
  const activeSlotId = bookedSlotIds.find(id => {
    const slot = SHIFT_SLOT_TIMES[id];
    if (!slot) return true;
    return currentDecimalHour >= (slot.startHour - 0.25) && currentDecimalHour < slot.endHour;
  });

  if (activeSlotId) {
    return { canGoOnline: true, reason: 'OK', message: 'You are eligible to go online!' };
  }

  // 2. Check if there are upcoming booked shifts later today (currentDecimalHour < slot.startHour - 0.25)
  const upcomingSlots = bookedSlotIds
    .map(id => SHIFT_SLOT_TIMES[id])
    .filter(slot => slot && currentDecimalHour < (slot.startHour - 0.25))
    .sort((a, b) => a.startHour - b.startHour);

  if (upcomingSlots.length > 0) {
    const nextSlot = upcomingSlots[0];
    const onlineAllowedDecimal = nextSlot.startHour - 0.25;
    const onlineTimeStr = formatDecimalHourToTimeStr(onlineAllowedDecimal);
    return {
      canGoOnline: false,
      reason: 'TOO_EARLY',
      nextAvailableTimeStr: onlineTimeStr,
      message: `Shift starts at ${nextSlot.label}. You can come online starting at ${onlineTimeStr} (15 mins before shift start).`
    };
  }

  // 3. Otherwise all booked shifts for today have expired
  return {
    canGoOnline: false,
    reason: 'EXPIRED',
    message: 'Your booked shift slot time has ended. Please book an active shift slot to go online.'
  };
}



