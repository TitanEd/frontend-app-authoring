import { defineMessages } from '@edx/frontend-platform/i18n';

export const imageValidationMessages = defineMessages({
  noFile: {
    id: 'course-authoring.custom.image-validation.no-file',
    defaultMessage: 'No file selected.',
    description: 'Image upload error: no file was chosen',
  },
  unsupportedFormat: {
    id: 'course-authoring.custom.image-validation.unsupported-format',
    defaultMessage: 'Only the following formats are supported: {formats}',
    description: 'Image upload error: the file type is not allowed',
  },
  tooBig: {
    id: 'course-authoring.custom.image-validation.too-big',
    defaultMessage: 'Image size should be less than 5MB',
    description: 'Image upload error: the file is larger than 5MB',
  },
  tooSmallDimensions: {
    id: 'course-authoring.custom.image-validation.too-small',
    defaultMessage: 'Image dimensions are too small. Minimum size is {minWidth}x{minHeight} pixels. Current size is {width}x{height} pixels.',
    description: 'Image upload error: the image is too small',
  },
  tooLargeDimensions: {
    id: 'course-authoring.custom.image-validation.too-large',
    defaultMessage: 'Image dimensions are too large. Maximum size is {maxWidth}x{maxHeight} pixels. Current size is {width}x{height} pixels.',
    description: 'Image upload error: the image is too large',
  },
  unreadable: {
    id: 'course-authoring.custom.image-validation.unreadable',
    defaultMessage: 'Could not read image dimensions.',
    description: 'Image upload error: the image could not be read',
  },
  failed: {
    id: 'course-authoring.custom.image-validation.failed',
    defaultMessage: 'Error validating image file.',
    description: 'Image upload error: validation failed unexpectedly',
  },
});

const invalid = (message, values = {}) => ({ isValid: false, error: { message, values } });

/**
 * Text of a validation error returned by the functions below, in the user language.
 * `error` is `{ message, values }` (a message descriptor and its values).
 */
export const formatImageValidationError = (intl, error) => (
  error ? intl.formatMessage(error.message, error.values) : ''
);

// Utility to validate image file type
export function validateImageFileType(file, allowedTypes = ['image/jpeg', 'image/png']) {
  if (!file) {
    return invalid(imageValidationMessages.noFile);
  }
  if (!allowedTypes.includes(file.type)) {
    return invalid(imageValidationMessages.unsupportedFormat, {
      formats: allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', '),
    });
  }
  return { isValid: true, error: null };
}

// Validate image file type and dimensions (min 300x300, max 1024x1024)
export async function validateImageFile(
  file,
  allowedTypes = ['image/jpeg', 'image/png'],
  minWidth = 300,
  minHeight = 300,
  maxWidth = 1024,
  maxHeight = 1024,
) {
  const typeResult = validateImageFileType(file, allowedTypes);
  if (!typeResult.isValid) {
    return typeResult;
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return invalid(imageValidationMessages.tooBig);
  }

  // Check dimensions
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const values = {
        minWidth, minHeight, maxWidth, maxHeight, width: img.width, height: img.height,
      };
      if (img.width < minWidth || img.height < minHeight) {
        resolve(invalid(imageValidationMessages.tooSmallDimensions, values));
      } else if (img.width > maxWidth || img.height > maxHeight) {
        resolve(invalid(imageValidationMessages.tooLargeDimensions, values));
      } else {
        resolve({ isValid: true, error: null });
      }
    };
    img.onerror = () => {
      resolve(invalid(imageValidationMessages.unreadable));
    };
    img.src = URL.createObjectURL(file);
  });
}
