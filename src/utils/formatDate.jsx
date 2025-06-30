import React from 'react';

/**
 * Formats a date string, assuming it's in UTC, to the 'Asia/Jakarta' timezone.
 * Handles date strings from the API that might be missing the 'Z' UTC designator.
 * @param {string} dateString - The date string to format.
 * @param {object} options - Options for Intl.DateTimeFormat to override defaults.
 * @returns {string} The formatted date string.
 */
export function formatUTCDateString(dateString, options = {}) {
  if (!dateString) {
    return '-';
  }

  let dateToParse = String(dateString);

  // 1. Ensure 'T' separator for ISO 8601 compliance
  dateToParse = dateToParse.replace(' ', 'T');

  // 2. Truncate long fractional seconds to standard 3-digit milliseconds
  dateToParse = dateToParse.replace(/(\.\d{3})\d+/, '$1');

  // 3. Ensure it's treated as UTC if no timezone identifier is present
  if (!/Z|[+-]\d{2}(:?\d{2})?$/.test(dateToParse)) {
    dateToParse += 'Z';
  }

  const date = new Date(dateToParse);

  // 4. Validate the parsed date
  if (isNaN(date.getTime())) {
    return dateString; // Fallback to original string if parsing fails
  }

  // 5. Format to 'Asia/Jakarta' timezone
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  };

  // Use 'en-GB' for dd/mm/yyyy format and remove the comma for a cleaner look
  return new Intl.DateTimeFormat('en-GB', { ...defaultOptions, ...options }).format(date).replace(',', '');
}

/**
 * Formats a date string to show GMT+7 timezone explicitly in the format
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string with GMT+7 timezone
 */
export function formatGMT7DateTime(dateString) {
  if (!dateString) {
    return '-';
  }

  let dateToParse = String(dateString);

  // 1. Ensure 'T' separator for ISO 8601 compliance
  dateToParse = dateToParse.replace(' ', 'T');

  // 2. Handle long fractional seconds - truncate to 3 digits or remove if more than 6 digits
  dateToParse = dateToParse.replace(/(\.\d{3})\d+/, '$1');
  
  // 3. Ensure it's treated as UTC if no timezone identifier is present
  if (!/Z|[+-]\d{2}(:?\d{2})?$/.test(dateToParse)) {
    dateToParse += 'Z';
  }

  const date = new Date(dateToParse);

  // 4. Validate the parsed date
  if (isNaN(date.getTime())) {
    return dateString; // Fallback to original string if parsing fails
  }

  // 5. Format to 'Asia/Jakarta' timezone (GMT+7)
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta'
  };

  // Format the date using en-GB for dd/mm/yyyy format with proper time separators
  const jakartaDate = new Intl.DateTimeFormat('en-GB', options).format(date);
  
  // Remove comma and add GMT+7 suffix
  const cleanedDate = jakartaDate.replace(',', '');
  return `${cleanedDate}`;
}

const formatDate = ({ dateString }) => {
  return (
    <span>{dateString ? formatUTCDateString(dateString) : 'No date available'}</span>
  );
};

export default formatDate;
