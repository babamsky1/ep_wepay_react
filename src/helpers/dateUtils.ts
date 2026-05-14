// Ex. January 1, 2026
export const formatDateLong = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Ex. Jan 1, 2026
export const formatDateRangeShort = (startDate: Date | string | number, endDate: Date | string | number): string => {
  const startObj = typeof startDate === 'string' || typeof startDate === 'number' 
    ? new Date(startDate) 
    : startDate;
  
  const endObj = typeof endDate === 'string' || typeof endDate === 'number' 
    ? new Date(endDate) 
    : endDate;
  
  if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
    return 'Invalid Date Range';
  }
  
  const startFormatted = startObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  const endFormatted = endObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return `${startFormatted} – ${endFormatted}`;
};

export const getTimestamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getMonthName = (monthNumber: number): string => {
  return monthNames[monthNumber - 1] || 'Unknown';
};

export const formatDateTime = (dateTime: string | null) => {
  if (!dateTime) return "N/A";
  return new Date(dateTime).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const safeFormatDate = (value?: string): string => {
  if (!value) return "—";
  try {
    return formatDateLong(value);
  } catch {
    return value;
  }
};
