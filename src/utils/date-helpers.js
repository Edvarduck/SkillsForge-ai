export function getWeekLabel(dateStr) {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - start) / 86400000);
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `S${week}`;
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameWeek(dateStr, weekStart) {
  const date = new Date(dateStr);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  return date >= weekStart && date < end;
}

export function toLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toInputDate(date = new Date()) {
  return toLocalDateStr(date);
}

export function daysSince(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 86400000);
}
