/**
 * Simple Logger for Backend Operations
 */

const Logger = {
  info: (message) => console.log(`ℹ️ [INFO] ${new Date().toISOString()} - ${message}`),
  success: (message) => console.log(`✅ [SUCCESS] ${new Date().toISOString()} - ${message}`),
  warn: (message) => console.warn(`⚠️ [WARN] ${new Date().toISOString()} - ${message}`),
  error: (message, error = '') => console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`, error),
  debug: (message) => console.log(`🔍 [DEBUG] ${new Date().toISOString()} - ${message}`)
};

module.exports = Logger;
