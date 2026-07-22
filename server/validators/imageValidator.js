/**
 * Image Validation Functions
 * Validates image uploads for disease detection
 */

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ImageValidator = {
  validateMimeType: (mimetype) => {
    return ALLOWED_MIME_TYPES.includes(mimetype);
  },

  validateFileSize: (size) => {
    return size > 0 && size <= MAX_FILE_SIZE;
  },

  validateImage: (file) => {
    const errors = [];

    if (!file) {
      errors.push('No image file uploaded');
      return { valid: false, errors };
    }

    if (!ImageValidator.validateMimeType(file.mimetype)) {
      errors.push(`Invalid image format. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }

    if (!ImageValidator.validateFileSize(file.size)) {
      errors.push(`File size exceeds 5MB limit. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

module.exports = ImageValidator;
