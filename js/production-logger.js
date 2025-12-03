// Production-safe logging utility
// Wraps console methods to disable them in production

(function() {
  'use strict';

  // Check if we're in production
  const isProduction = window.location.hostname === '24toolhub.com' || 
                       window.location.hostname === 'www.24toolhub.com' ||
                       window.location.hostname.endsWith('.vercel.app');

  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  };

  // Replace console methods in production
  if (isProduction) {
    console.log = function() {};
    console.info = function() {};
    console.debug = function() {};
    // Keep console.warn and console.error for important messages
  }

  // Expose a way to enable logging for debugging in production
  window.enableDebugLogs = function() {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
    console.log('Debug logging enabled');
  };
})();
