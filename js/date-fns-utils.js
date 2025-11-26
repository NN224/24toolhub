// date-fns Utilities
// Date manipulation functions (standalone implementation)
// Note: date-fns is ESM only, so we provide our own implementation

(function() {
  'use strict';

  // Helper: Get days in month
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Helper: Check if year is leap year
  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  // Helper: Get days in year
  function getDaysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
  }

  // Format date
  window.formatDate = function(date, formatStr) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    const formats = {
      'yyyy-MM-dd': `${year}-${month}-${day}`,
      'dd/MM/yyyy': `${day}/${month}/${year}`,
      'MM/dd/yyyy': `${month}/${day}/${year}`,
      'yyyy-MM-dd HH:mm:ss': `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    };
    
    return formats[formatStr] || d.toLocaleDateString();
  };

  // Difference in years (accurate calculation)
  window.differenceInYears = function(dateLeft, dateRight) {
    const d1 = new Date(dateLeft);
    const d2 = new Date(dateRight);
    
    let years = d2.getFullYear() - d1.getFullYear();
    const monthDiff = d2.getMonth() - d1.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && d2.getDate() < d1.getDate())) {
      years--;
    }
    
    return years;
  };

  // Difference in months (accurate calculation)
  window.differenceInMonths = function(dateLeft, dateRight) {
    const d1 = new Date(dateLeft);
    const d2 = new Date(dateRight);
    
    const yearDiff = d2.getFullYear() - d1.getFullYear();
    const monthDiff = d2.getMonth() - d1.getMonth();
    let totalMonths = yearDiff * 12 + monthDiff;
    
    // Adjust if day hasn't been reached
    if (d2.getDate() < d1.getDate()) {
      totalMonths--;
    }
    
    return totalMonths;
  };

  // Difference in days (accurate calculation)
  window.differenceInDays = function(dateLeft, dateRight) {
    const d1 = new Date(dateLeft);
    const d2 = new Date(dateRight);
    
    // Set to midnight for accurate day calculation
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    const diff = d2 - d1;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // Difference in hours
  window.differenceInHours = function(dateLeft, dateRight) {
    const diff = new Date(dateRight) - new Date(dateLeft);
    return Math.floor(diff / (1000 * 60 * 60));
  };

  // Difference in minutes
  window.differenceInMinutes = function(dateLeft, dateRight) {
    const diff = new Date(dateRight) - new Date(dateLeft);
    return Math.floor(diff / (1000 * 60));
  };

  // Add days
  window.addDays = function(date, amount) {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
  };

  // Add months
  window.addMonths = function(date, amount) {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + amount);
    
    // Handle month overflow
    if (d.getDate() !== day) {
      d.setDate(0); // Go to last day of previous month
    }
    
    return d;
  };

  // Add years
  window.addYears = function(date, amount) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + amount);
    return d;
  };

  // Is after
  window.isAfter = function(dateLeft, dateRight) {
    return new Date(dateLeft) > new Date(dateRight);
  };

  // Is before
  window.isBefore = function(dateLeft, dateRight) {
    return new Date(dateLeft) < new Date(dateRight);
  };

  // Is same day
  window.isSameDay = function(dateLeft, dateRight) {
    const d1 = new Date(dateLeft);
    const d2 = new Date(dateRight);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  console.log('date-fns utilities initialized (standalone implementation)');
})();

