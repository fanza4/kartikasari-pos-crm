import { describe, it, expect } from 'vitest';
import {
  formatRupiah,
  formatDateIndo,
  formatDateOnly,
  normalizeWhatsAppPhone,
  formatDisplayPhone,
} from '../src/utils/formatters';

describe('Formatters Utility', () => {
  describe('formatRupiah', () => {
    it('formats standard prices per R7 correctly', () => {
      expect(formatRupiah(26000)).toBe('Rp 26.000');
      expect(formatRupiah(20000)).toBe('Rp 20.000');
      expect(formatRupiah(48000)).toBe('Rp 48.000');
      expect(formatRupiah(40000)).toBe('Rp 40.000');
      expect(formatRupiah(35000)).toBe('Rp 35.000');
      expect(formatRupiah(29000)).toBe('Rp 29.000');
      expect(formatRupiah(5000)).toBe('Rp 5.000');
      expect(formatRupiah(6000)).toBe('Rp 6.000');
      expect(formatRupiah(10000)).toBe('Rp 10.000');
    });

    it('handles zero, negative, or invalid numbers gracefully', () => {
      expect(formatRupiah(0)).toBe('Rp 0');
      expect(formatRupiah(NaN)).toBe('Rp 0');
      // @ts-expect-error test invalid input
      expect(formatRupiah(null)).toBe('Rp 0');
      // @ts-expect-error test invalid input
      expect(formatRupiah(undefined)).toBe('Rp 0');
    });

    it('formats large lifetime values accurately', () => {
      expect(formatRupiah(1250000)).toBe('Rp 1.250.000');
    });
  });

  describe('normalizeWhatsAppPhone', () => {
    it('normalizes local 08 prefix to Indonesian country code 628', () => {
      expect(normalizeWhatsAppPhone('081223456789')).toBe('6281223456789');
      expect(normalizeWhatsAppPhone('0812-2345-6789')).toBe('6281223456789');
    });

    it('keeps existing 62 prefix', () => {
      expect(normalizeWhatsAppPhone('6281223456789')).toBe('6281223456789');
      expect(normalizeWhatsAppPhone('+62 812-2345-6789')).toBe('6281223456789');
    });

    it('handles 8 prefix', () => {
      expect(normalizeWhatsAppPhone('81223456789')).toBe('6281223456789');
    });

    it('handles empty string', () => {
      expect(normalizeWhatsAppPhone('')).toBe('');
    });
  });

  describe('formatDisplayPhone', () => {
    it('formats 628 number into hyphenated Indonesian 08xx-xxxx-xxxx', () => {
      expect(formatDisplayPhone('6281223456789')).toBe('0812-2345-6789');
    });

    it('formats 08 number with hyphens', () => {
      expect(formatDisplayPhone('081223456789')).toBe('0812-2345-6789');
    });

    it('handles empty input gracefully', () => {
      expect(formatDisplayPhone('')).toBe('-');
    });
  });

  describe('formatDateIndo and formatDateOnly', () => {
    it('formats ISO string with month and year', () => {
      const formatted = formatDateOnly('2026-10-30T10:00:00.000Z');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Oktober');
    });

    it('formats localized date time with WIB', () => {
      const formatted = formatDateIndo('2026-10-30T10:00:00.000Z');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('WIB');
    });
  });
});
