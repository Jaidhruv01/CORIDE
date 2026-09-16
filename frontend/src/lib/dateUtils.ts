/**
 * CoRide Date & Time Utility Functions
 */

export const getTodayISO = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayAfterTomorrowISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getUpcomingWeekendISO = (): string => {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSaturday);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatFriendlyDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const today = getTodayISO();
  const tomorrow = getTomorrowISO();

  const clean = dateStr.split('T')[0];
  if (clean === today) return 'Today';
  if (clean === tomorrow) return 'Tomorrow';

  const [y, m, d] = clean.split('-').map(Number);
  if (y && m && d) {
    const target = new Date(y, m - 1, d);
    return target.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  return dateStr;
};

export const formatRideDate = (isoString: string) => {
  if (!isoString) {
    return {
      relativeBadge: 'Upcoming',
      formattedDate: 'Upcoming',
      formattedTime: '--:--',
      isToday: false,
      isTomorrow: false,
    };
  }

  const d = new Date(isoString);
  const today = getTodayISO();
  const tomorrow = getTomorrowISO();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;

  const isToday = dateKey === today;
  const isTomorrow = dateKey === tomorrow;

  let relativeBadge = '';
  if (isToday) relativeBadge = 'Today';
  else if (isTomorrow) relativeBadge = 'Tomorrow';

  const formattedDate = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    relativeBadge,
    formattedDate,
    formattedTime,
    isToday,
    isTomorrow,
  };
};
