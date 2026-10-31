import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateOrderId,
  getOrders,
  saveOrder,
  getOrderById,
  updateOrderStatus,
  confirmOrderPayment,
  simulateQrisPaymentVerification,
  generateOrderReceiptText,
  formatRupiah,
  getStoreSettings,
} from '../src/services/storage';
import { Order, CustomerOrderItem, OrderStatus, PaymentStatus } from '../src/types';

describe('Mie Gacoan Style Self-Service Ordering System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockItem1: CustomerOrderItem = {
    cartItemId: 'item-kuah-1',
    menuItemId: 'mie_kuah_seporsi',
    name: 'Mie Kuah Seporsi',
    category: 'mie_kuah',
    unitPrice: 26000,
    quantity: 2,
    selectedToppings: [],
    subtotal: 52000,
    givesStamp: true,
  };

  const mockItem2: CustomerOrderItem = {
    cartItemId: 'item-jus-1',
    menuItemId: 'es_jeruk',
    name: 'Es Jeruk',
    category: 'minuman',
    unitPrice: 10000,
    quantity: 1,
    selectedToppings: [],
    subtotal: 10000,
    givesStamp: false,
  };

  it('1. generates unique order ID conforming to KS-ORD-YYYYMMDD-XXXX pattern', () => {
    const id1 = generateOrderId();
    const id2 = generateOrderId();

    expect(id1).toMatch(/^KS-ORD-\d{8}-\d{4}$/);
    expect(id2).toMatch(/^KS-ORD-\d{8}-\d{4}$/);
    expect(id1).not.toBe(id2);
  });

  it('2. calculates order total correctly and persists to storage', () => {
    const orderId = generateOrderId();
    const totalAmount = mockItem1.subtotal + mockItem2.subtotal; // 52000 + 10000 = 62000

    const order: Order = {
      id: orderId,
      customerName: 'Asep Suhendar',
      customerWhatsapp: '081234567890',
      orderType: 'dine_in',
      tableNumber: 'Meja 03',
      items: [mockItem1, mockItem2],
      totalAmount,
      paymentMethod: 'cash',
      paymentStatus: 'Menunggu Pembayaran',
      orderStatus: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
    };

    saveOrder(order);

    const stored = getOrderById(orderId);
    expect(stored).toBeDefined();
    expect(stored?.customerName).toBe('Asep Suhendar');
    expect(stored?.totalAmount).toBe(62000);
    expect(stored?.paymentStatus).toBe('Menunggu Pembayaran');
    expect(stored?.orderStatus).toBe('Menunggu Pembayaran');
    expect(stored?.items.length).toBe(2);
  });

  it('3. CASH workflow: allows cash payment confirmation by cashier and progresses to Sedang Diproses', () => {
    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      customerName: 'Rina Kartika',
      orderType: 'takeaway',
      items: [mockItem1],
      totalAmount: 52000,
      paymentMethod: 'cash',
      paymentStatus: 'Menunggu Pembayaran',
      orderStatus: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
    };

    saveOrder(order);

    // Kasir terima uang tunai
    const confirmed = confirmOrderPayment(orderId, 'cash');
    expect(confirmed).toBeDefined();
    expect(confirmed?.paymentStatus).toBe('Sudah Dibayar');
    expect(confirmed?.orderStatus).toBe('Sedang Diproses');
    expect(confirmed?.paidAt).toBeDefined();
    expect(confirmed?.processedAt).toBeDefined();

    // Check retrieved state
    const after = getOrderById(orderId);
    expect(after?.paymentStatus).toBe('Sudah Dibayar');
    expect(after?.orderStatus).toBe('Sedang Diproses');
  });

  it('4. QRIS workflow: verifies simulated QRIS gateway and updates payment status validly', () => {
    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      customerName: 'Budi Santoso',
      orderType: 'dine_in',
      tableNumber: 'Meja 08',
      items: [mockItem1, mockItem2],
      totalAmount: 62000,
      paymentMethod: 'qris',
      paymentStatus: 'Menunggu Pembayaran',
      orderStatus: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
    };

    saveOrder(order);

    // Simulator confirms QRIS gateway payment
    const result = simulateQrisPaymentVerification(orderId);
    expect(result.success).toBe(true);
    expect(result.order?.paymentStatus).toBe('Sudah Dibayar');
    expect(result.order?.paymentReference).toMatch(/^QRIS-SIM-/);
    expect(result.order?.orderStatus).toBe('Sedang Diproses');

    // Confirm stored
    const stored = getOrderById(orderId);
    expect(stored?.paymentStatus).toBe('Sudah Dibayar');
    expect(stored?.orderStatus).toBe('Sedang Diproses');
  });

  it('5. kitchen workflow: moves from Sedang Diproses -> Siap Diambil -> Selesai', () => {
    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      customerName: 'Siti Rohmah',
      customerWhatsapp: '085712345678',
      orderType: 'dine_in',
      tableNumber: 'Meja 01',
      items: [mockItem1],
      totalAmount: 52000,
      paymentMethod: 'cash',
      paymentStatus: 'Sudah Dibayar',
      orderStatus: 'Sedang Diproses',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    saveOrder(order);

    // Tandai siap diambil
    const ready = updateOrderStatus(orderId, 'Siap Diambil');
    expect(ready?.orderStatus).toBe('Siap Diambil');
    expect(ready?.readyAt).toBeDefined();

    // Tandai selesai
    const completed = updateOrderStatus(orderId, 'Selesai');
    expect(completed?.orderStatus).toBe('Selesai');
    expect(completed?.completedAt).toBeDefined();

    // Check stored
    const finalOrder = getOrderById(orderId);
    expect(finalOrder?.orderStatus).toBe('Selesai');
  });

  it('6. generates digital WhatsApp receipt text with order number, customer name, and item details', () => {
    const orderId = 'KS-ORD-20261030-9999';
    const order: Order = {
      id: orderId,
      customerName: 'Hendra Gunawan',
      customerWhatsapp: '081399887766',
      orderType: 'dine_in',
      tableNumber: 'Meja 12',
      items: [mockItem1],
      totalAmount: 52000,
      paymentMethod: 'cash',
      paymentStatus: 'Sudah Dibayar',
      orderStatus: 'Selesai',
      createdAt: '2026-10-30T10:00:00.000Z',
    };

    const settings = getStoreSettings();
    const receiptText = generateOrderReceiptText(order, settings);

    expect(receiptText).toContain('PESANAN ONLINE');
    expect(receiptText).toContain(orderId);
    expect(receiptText).toContain('Hendra Gunawan');
    expect(receiptText).toContain('Mie Kuah Seporsi');
    expect(receiptText).toContain(formatRupiah(52000));
    expect(receiptText).toContain('CASH');
    expect(receiptText).toContain('Sudah Dibayar');
  });

  it('7. supports order cancellation when needed', () => {
    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      customerName: 'Pelanggan Ragu',
      orderType: 'takeaway',
      items: [mockItem1],
      totalAmount: 52000,
      paymentMethod: 'cash',
      paymentStatus: 'Menunggu Pembayaran',
      orderStatus: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
    };

    saveOrder(order);

    const cancelled = updateOrderStatus(orderId, 'Dibatalkan');
    expect(cancelled?.orderStatus).toBe('Dibatalkan');
    expect(cancelled?.cancelledAt).toBeDefined();

    const stored = getOrderById(orderId);
    expect(stored?.orderStatus).toBe('Dibatalkan');
  });
});
