export function toISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromISODate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function shiftDate(days: number, base = new Date()) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(fromISODate(value));
}

export function weekdayLabel(value = toISODate()) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(fromISODate(value));
}

export function weekdayShort(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(fromISODate(value));
}

export function getRecentDates(days: number, base = new Date()) {
  return Array.from({ length: days }, (_, index) => shiftDate(days - 1 - index, base));
}

export function getStartOfWeek(date = new Date()) {
  const start = new Date(date);
  const day = start.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function isThisWeek(value: string, base = new Date()) {
  const date = fromISODate(value);
  const start = getStartOfWeek(base);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

export function getWeekLabel(index: number) {
  return `W${index + 1}`;
}
