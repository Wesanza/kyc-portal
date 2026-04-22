/**
 * Validate a KRA PIN number (format: A000000000A)
 */
export function validateKraPin(pin: string): boolean {
  return /^[A-Z]\d{9}[A-Z]$/.test(pin.trim().toUpperCase())
}

/**
 * Validate a Kenyan National ID number (6-8 digits)
 */
export function validateNationalId(id: string): boolean {
  return /^\d{6,8}$/.test(id.trim())
}

/**
 * Validate a Google Maps URL
 */
export function validateGoogleMapsUrl(url: string): boolean {
  const patterns = [
    /^https:\/\/maps\.app\.goo\.gl\/.+/,
    /^https:\/\/www\.google\.com\/maps\/.+/,
    /^https:\/\/goo\.gl\/maps\/.+/,
    /^https:\/\/maps\.google\.com\/.+/,
  ]
  return patterns.some((p) => p.test(url))
}

/**
 * Validate a Kenyan phone number (+254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX)
 */
export function validateKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '')
  return (
    /^\+254[17]\d{8}$/.test(cleaned) ||
    /^0[17]\d{8}$/.test(cleaned) ||
    /^254[17]\d{8}$/.test(cleaned)
  )
}

/**
 * Validate a Facebook URL
 */
export function validateFacebookUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?facebook\.com\/.+/.test(url)
}

/**
 * Validate an Instagram URL
 */
export function validateInstagramUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?instagram\.com\/.+/.test(url)
}

/**
 * Auto-format a Kenyan phone number as user types
 */
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('254')) {
    return '+' + digits.slice(0, 12)
  }
  if (digits.startsWith('0')) {
    return digits.slice(0, 10)
  }
  return raw
}