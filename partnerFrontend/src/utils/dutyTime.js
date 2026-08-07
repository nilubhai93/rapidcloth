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
