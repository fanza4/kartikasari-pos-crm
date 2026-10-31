/**
 * Indonesian Rupiah and Date Formatting Utilities
 * Standardized for Mie Baso & Aneka Jus Kartika Sari (KS)
 */

/**
 * Formats a numeric value into Indonesian Rupiah currency string.
 * Example: 26000 -> "Rp 26.000"
 */
export const formatRupiah = (amount: number): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
};

/**
 * Formats an ISO date string, Date, or timestamp into an Indonesian localized date-time string.
 * Example: "30 Okt 2026, 12:30 WIB"
 */
export const formatDateIndo = (dateInput: string | Date | number): string => {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  } catch {
    return String(dateInput);
  }
};

/**
 * Formats date only in Indonesian.
 * Example: "30 Oktober 2026"
 */
export const formatDateOnly = (dateInput: string | Date | number): string => {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const monthsLong = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return `${d.getDate()} ${monthsLong[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return String(dateInput);
  }
};

/**
 * Normalizes Indonesian WhatsApp phone number format.
 * Strips punctuation and converts local 08... or +628... to 628...
 * Example: "0812-2345-6789" -> "6281223456789"
 */
export const normalizeWhatsAppPhone = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

/**
 * Formats phone number for readable Indonesian local display.
 * Example: "6281223456789" -> "0812-2345-6789"
 */
export const formatDisplayPhone = (phone: string): string => {
  if (!phone) return '-';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.substring(2);
  }
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
  }
  return cleaned;
};
