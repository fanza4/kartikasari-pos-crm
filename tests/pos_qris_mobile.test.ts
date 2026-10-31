import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStoreSettings,
  updateStoreQrisImage,
  resetStoreQrisImage,
  saveTransaction,
  getTransactions,
  generateReceiptText,
} from '../src/services/storage';
import { Transaction } from '../src/types';
import { DEFAULT_STORE_SETTINGS, MENU_ITEMS } from '../src/data/menuData';

describe('Touch POS - QRIS Management, Customer Identity & Mobile Features', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('P1: can update and persist custom QRIS image URL in store settings', () => {
    const initialSettings = getStoreSettings();
    expect(initialSettings.qrisImageUrl).toBe(DEFAULT_STORE_SETTINGS.qrisImageUrl);

    const customBase64Qris = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/sampleCustomQris123';
    const updated = updateStoreQrisImage(customBase64Qris);

    expect(updated.qrisImageUrl).toBe(customBase64Qris);
    expect(getStoreSettings().qrisImageUrl).toBe(customBase64Qris);
  });

  it('P2: can reset custom QRIS image back to default store QRIS', () => {
    const customBase64Qris = 'data:image/jpeg;base64,customQrisData';
    updateStoreQrisImage(customBase64Qris);
    expect(getStoreSettings().qrisImageUrl).toBe(customBase64Qris);

    const reverted = resetStoreQrisImage();
    expect(reverted.qrisImageUrl).toBe(DEFAULT_STORE_SETTINGS.qrisImageUrl);
    expect(getStoreSettings().qrisImageUrl).toBe(DEFAULT_STORE_SETTINGS.qrisImageUrl);
  });

  it('P3: creates transaction with dine-in order type and table number', () => {
    const tx: Transaction = {
      id: 'tx-test-dinein-1',
      invoiceNumber: 'KS-889901',
      customerName: 'Kang Fajar',
      customerWhatsapp: '081234567890',
      orderType: 'dine_in',
      tableNumber: '05',
      notes: 'Kuah dipisah, jangan pakai bawang daun',
      items: [
        {
          cartItemId: 'item-1',
          menuItem: MENU_ITEMS[0],
          quantity: 2,
          selectedToppings: [],
          itemTotal: 52000,
        },
      ],
      totalAmount: 52000,
      paymentMethod: 'cash',
      cashGiven: 60000,
      changeAmount: 8000,
      stampsEarned: 2,
      rewardClaimed: false,
      createdAt: '2026-10-30T10:00:00.000Z',
      status: 'completed',
    };

    saveTransaction(tx);
    const saved = getTransactions();
    const found = saved.find((t) => t.id === 'tx-test-dinein-1');

    expect(found).toBeDefined();
    expect(found?.orderType).toBe('dine_in');
    expect(found?.tableNumber).toBe('05');
    expect(found?.customerName).toBe('Kang Fajar');
    expect(found?.notes).toBe('Kuah dipisah, jangan pakai bawang daun');
  });

  it('P4: creates transaction with takeaway order type', () => {
    const tx: Transaction = {
      id: 'tx-test-takeaway-1',
      invoiceNumber: 'KS-889902',
      customerName: 'Ibu Ratna',
      customerWhatsapp: '085712345678',
      orderType: 'takeaway',
      items: [
        {
          cartItemId: 'item-2',
          menuItem: MENU_ITEMS[1],
          quantity: 1,
          selectedToppings: [],
          itemTotal: 20000,
        },
      ],
      totalAmount: 20000,
      paymentMethod: 'qris',
      stampsEarned: 1,
      rewardClaimed: false,
      createdAt: '2026-10-30T10:30:00.000Z',
      status: 'completed',
    };

    saveTransaction(tx);
    const saved = getTransactions();
    const found = saved.find((t) => t.id === 'tx-test-takeaway-1');

    expect(found).toBeDefined();
    expect(found?.orderType).toBe('takeaway');
    expect(found?.paymentMethod).toBe('qris');
  });

  it('P5: generates digital receipt including order type and notes', () => {
    const tx: Transaction = {
      id: 'tx-test-receipt-1',
      invoiceNumber: 'KS-777123',
      customerName: 'Pak Hendra',
      customerWhatsapp: '08123456789',
      orderType: 'dine_in',
      tableNumber: '03',
      notes: 'Banyakin seledri',
      items: [
        {
          cartItemId: 'item-1',
          menuItem: MENU_ITEMS[0],
          quantity: 1,
          selectedToppings: [],
          itemTotal: 26000,
        },
      ],
      totalAmount: 26000,
      paymentMethod: 'cash',
      cashGiven: 30000,
      changeAmount: 4000,
      stampsEarned: 1,
      rewardClaimed: false,
      createdAt: '2026-10-30T12:00:00.000Z',
      status: 'completed',
    };

    const receipt = generateReceiptText(tx, DEFAULT_STORE_SETTINGS);

    expect(receipt).toContain('STRUK DIGITAL');
    expect(receipt).toContain('KS-777123');
    expect(receipt).toContain('Pak Hendra');
    expect(receipt).toContain('Makan di Tempat (Meja 03)');
    expect(receipt).toContain('Catatan  : Banyakin seledri');
    expect(receipt).toContain('Rp 26.000');
  });

  it('P6: provides verified Google Maps direct URL and embed URL for Mie Baso Kartika Sari', () => {
    const settings = getStoreSettings();
    expect(settings.mapsDirectUrl).toBe('https://maps.app.goo.gl/vFAbar6CYjoBZ9wNA');
    expect(settings.mapsEmbedUrl).toContain('Mie+Baso+Kartika+Sari');
  });
});
