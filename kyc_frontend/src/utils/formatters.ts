import { KENYAN_PHONE_REGEX, KRA_PIN_REGEX, GOOGLE_MAPS_REGEX } from './constants';

export const formatPhone = (value: string): string => {
  // Strip non-digits
  const digits = value.replace(/\D/g, '');
  // Auto-prefix with +254 if starts with 07 or 01
  if (digits.startsWith('07') || digits.startsWith('01')) {
    const local = digits.slice(1);
    return `+254${local}`;
  }
  return value;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const validateKraPin = (pin: string): string | null => {
  if (!pin) return 'KRA PIN is required';
  if (!KRA_PIN_REGEX.test(pin.toUpperCase())) {
    return 'KRA PIN must be in format A000000000A';
  }
  return null;
};

export const validateGoogleMapsUrl = (url: string): string | null => {
  if (!url) return 'Google Maps URL is required';
  if (!GOOGLE_MAPS_REGEX.test(url)) {
    return 'Must be a valid Google Maps link (maps.app.goo.gl, google.com/maps, or goo.gl/maps)';
  }
  return null;
};

export const validateKenyanPhone = (phone: string): string | null => {
  if (!phone) return 'Phone number is required';
  if (!KENYAN_PHONE_REGEX.test(phone)) {
    return 'Enter a valid Kenyan number (+254XXXXXXXXX or 07XXXXXXXX)';
  }
  return null;
};

export const validateFileSize = (file: File, maxMB = 10): string | null => {
  if (file.size > maxMB * 1024 * 1024) {
    return `File must be under ${maxMB}MB`;
  }
  return null;
};

export const validateFileType = (
  file: File,
  allowed = ['application/pdf', 'image/jpeg', 'image/png']
): string | null => {
  if (!allowed.includes(file.type)) {
    return 'Only PDF, JPG, and PNG files are accepted';
  }
  return null;
};
