import { format, differenceInCalendarDays, isValid, parseISO } from "date-fns";

/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a date for user-friendly display
 * @param {string|Date} dateInput - Date string (ISO format) or Date object
 * @param {string} formatPattern - Date format pattern (default: 'dd MMM yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, formatPattern = 'dd MMM yyyy') => {
  if (!dateInput) return 'N/A';
  
  try {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Handle ISO date strings
      date = parseISO(dateInput);
    } else {
      return 'Invalid date';
    }
    
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    return format(date, formatPattern);
  } catch (error) {
    console.error('Error formatting date:', dateInput, error);
    return 'Invalid date';
  }
};

/**
 * Formats a date for display with relative time context
 * @param {string|Date} dateInput - Date string (ISO format) or Date object
 * @returns {string} User-friendly relative date string
 */
export const formatRelativeDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else {
      return 'Invalid date';
    }
    
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    const today = new Date();
    const diffDays = differenceInCalendarDays(today, date);
    
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 0) return `In ${Math.abs(diffDays)} days`;
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    // For dates more than a week old, show formatted date
    return formatDate(date);
  } catch (error) {
    console.error('Error formatting relative date:', dateInput, error);
    return 'Invalid date';
  }
};

/**
 * Formats a date for display with both absolute and relative information
 * @param {string|Date} dateInput - Date string (ISO format) or Date object
 * @returns {string} Combined absolute and relative date string
 */
export const formatDateWithRelative = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else {
      return 'Invalid date';
    }
    
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    const formattedDate = formatDate(date);
    const relativeDate = formatRelativeDate(date);
    
    // If relative date is the same as formatted date, just return formatted
    if (relativeDate === formattedDate) {
      return formattedDate;
    }
    
    // For recent dates, show relative with formatted in parentheses
    if (['Today', 'Yesterday', 'Tomorrow'].includes(relativeDate) || 
        relativeDate.includes('days ago') || 
        relativeDate.includes('In ')) {
      return `${relativeDate} (${formattedDate})`;
    }
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date with relative:', dateInput, error);
    return 'Invalid date';
  }
};

/**
 * Formats a date for input fields (YYYY-MM-DD format)
 * @param {string|Date} dateInput - Date string (ISO format) or Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else {
      return '';
    }
    
    if (!isValid(date)) {
      return '';
    }
    
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', dateInput, error);
    return '';
  }
};

/**
 * Formats a date for table display with conditional relative/absolute formatting
 * @param {string|Date} dateInput - Date string (ISO format) or Date object
 * @param {boolean} showAbsolute - Whether to show absolute date format
 * @returns {string} Formatted date for table display
 */
export const formatTableDate = (dateInput, showAbsolute = false) => {
  if (!dateInput) return 'N/A';
  
  if (showAbsolute) {
    return formatDate(dateInput);
  } else {
    return formatRelativeDate(dateInput);
  }
};

/**
 * Checks if a date string is a valid ISO date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid ISO date string
 */
export const isValidISODate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return false;
  
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch (error) {
    return false;
  }
};

/**
 * Converts various date formats to a standardized Date object
 * @param {string|Date} dateInput - Date in various formats
 * @returns {Date|null} Standardized Date object or null if invalid
 */
export const parseDate = (dateInput) => {
  if (!dateInput) return null;
  
  try {
    if (dateInput instanceof Date) {
      return isValid(dateInput) ? dateInput : null;
    }
    
    if (typeof dateInput === 'string') {
      const date = parseISO(dateInput);
      return isValid(date) ? date : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateInput, error);
    return null;
  }
};
