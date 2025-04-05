/**
 * Utilities for generating calendar export links/files.
 */

// Define the structure of an event for export purposes
interface CalendarExportEvent {
  date: string; // YYYY-MM-DD format
  title: string;
  description: string;
  startTime?: string; // HH:MM format (24-hour) for start time
  durationHours?: number; // Duration in hours
}

// Helper to format date for Google Calendar (YYYYMMDDTHHMMSSZ)
// Assumes input date is YYYY-MM-DD and handles time/timezone.
// Defaults to 17:00 local time if startTime is not provided.
const formatGoogleDate = (dateStr: string, startTime?: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return ''; // Handle invalid date

  let hours = 17;
  let minutes = 0;

  if (startTime) {
    const parts = startTime.split(':');
    if (parts.length === 2) {
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
      if (isNaN(hours) || isNaN(minutes)) {
        hours = 17; // Fallback
        minutes = 0;
      }
    }
  }

  // Set time in local timezone
  date.setHours(hours, minutes, 0, 0);

  // Convert to UTC for Google Calendar format
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hour = date.getUTCHours().toString().padStart(2, '0');
  const minute = date.getUTCMinutes().toString().padStart(2, '0');
  const second = date.getUTCSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}T${hour}${minute}${second}Z`;
};

// Helper to format date for ICS (YYYYMMDDTHHMMSSZ)
// Uses same logic as Google Date formatting for consistency.
const formatIcsDate = (dateStr: string, startTime?: string): string => {
  return formatGoogleDate(dateStr, startTime); // Reusing the same UTC logic
};

// Generate Google Calendar URL for a single event
export const createGoogleCalendarLink = (event: CalendarExportEvent): string => {
  const startDate = formatGoogleDate(event.date, event.startTime);
  if (!startDate) return ''; // Don't generate link if date is invalid
  
  // Calculate end date based on duration (default 1 hour)
  const duration = (event.durationHours || 1) * 60 * 60 * 1000; // in milliseconds
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(startDateTime.getTime() + duration);
  
  const endDate = endDateTime.toISOString().replace(/[-:]|\.\d{3}/g, ''); // Format end date to YYYYMMDDTHHMMSSZ
  
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description);
  
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;

  // Check URL length and simplify if necessary
  if (url.length > 2000) {
    const simplifiedDetails = encodeURIComponent(event.title); // Use title as minimal description
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${simplifiedDetails}`;
  }
  
  return url;
};

// Generate ICS file content for multiple events
export const createIcsFileContent = (events: CalendarExportEvent[]): string => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN'
  ];

  events.forEach(event => {
    const startDate = formatIcsDate(event.date, event.startTime);
    if (!startDate) return; // Skip invalid dates

    const duration = (event.durationHours || 1) * 60 * 60 * 1000;
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(startDateTime.getTime() + duration);
    const endDate = endDateTime.toISOString().replace(/[-:]|\.\d{3}/g, '');

    // Escape ICS special characters in text fields
    const escapeIcs = (text: string): string => {
      return text.replace(/\\/g, '\\').replace(/;/g, '\;').replace(/,/g, '\,').replace(/\n/g, '\\n');
    }

    icsContent = [
      ...icsContent,
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.random()}@fitplanpro`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/g, '')}Z`, // Use current time for DTSTAMP
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      `DESCRIPTION:${escapeIcs(event.description)}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT'
    ];
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n'); // Use CRLF line endings for ICS
};

// Function to trigger ICS file download
export const downloadIcsFile = (icsContent: string, filename: string = 'fitplan_workouts.ics') => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Clean up blob URL
}; 