import React, { createContext, useContext, useState } from 'react';
import { CartItem, MenuItem, ToppingItem, Customer } from '../types';

interface CartContextType {
  items: CartItem[];
  customer: Customer | null;
  customerName: string;
  customerWhatsapp: string;
  setCustomerInfo: (name: string, whatsapp: string) => void;
  setLinkedCustomer: (customer: Customer | null) => void;
  addToCart: (menuItem: MenuItem, selectedToppings?: ToppingItem[], notes?: string, customPrice?: number) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  toggleTopping: (cartItemId: string, topping: ToppingItem) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  updateCustomPrice: (cartItemId: string, price: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalNoodleCount: number; // Stamped items count
  isRewardEligible: boolean; // Customer has 10 stamps
  claimReward: boolean;
  setClaimReward: (claim: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>('');
  const [claimReward, setClaimReward] = useState<boolean>(false);

  const calculateItemTotal = (item: CartItem): number => {
    const basePrice = item.customPrice !== undefined ? item.customPrice : item.menuItem.price;
    const toppingsTotal = item.selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return (basePrice + toppingsTotal) * item.quantity;
  };

  const addToCart = (
    menuItem: MenuItem,
    selectedToppings: ToppingItem[] = [],
    notes: string = '',
    customPrice?: number
  ) => {
    // Generate unique id for cart item combining menu item + toppings
    const toppingIds = selectedToppings.map((t) => t.id).sort().join('-');
    const cartItemId = `${menuItem.id}-${toppingIds}-${notes ? notes.trim() : 'nonotes'}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + 1;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          itemTotal: (existing.menuItem.price + existing.selectedToppings.reduce((s, t) => s + t.price, 0)) * newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        cartItemId,
        menuItem,
        quantity: 1,
        selectedToppings,
        notes,
        customPrice,
        itemTotal: (customPrice !== undefined ? customPrice : menuItem.price) + selectedToppings.reduce((s, t) => s + t.price, 0),
      };
      return [...prev, newItem];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const updatedItem = { ...item, quantity: newQty };
            return {
              ...updatedItem,
              itemTotal: calculateItemTotal(updatedItem),
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const toggleTopping = (cartItemId: string, topping: ToppingItem) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const exists = item.selectedToppings.some((t) => t.id === topping.id);
          const newToppings = exists
            ? item.selectedToppings.filter((t) => t.id !== topping.id)
            : [...item.selectedToppings, topping];
          const updatedItem = { ...item, selectedToppings: newToppings };
          return {
            ...updatedItem,
            itemTotal: calculateItemTotal(updatedItem),
          };
        }
        return item;
      })
    );
  };

  const updateNotes = (cartItemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return { ...item, notes };
        }
        return item;
      })
    );
  };

  const updateCustomPrice = (cartItemId: string, price: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const updated = { ...item, customPrice: price };
          return { ...updated, itemTotal: calculateItemTotal(updated) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCustomer(null);
    setCustomerName('');
    setCustomerWhatsapp('');
    setClaimReward(false);
  };

  const setCustomerInfo = (name: string, whatsapp: string) => {
    setCustomerName(name);
    setCustomerWhatsapp(whatsapp);
  };

  const setLinkedCustomer = (cust: Customer | null) => {
    setCustomer(cust);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerWhatsapp(cust.whatsapp);
    }
  };

  // Total porsi mie yang memberikan stempel
  const totalNoodleCount = items.reduce((count, item) => {
    if (item.menuItem.givesStamp) {
      return count + item.quantity;
    }
    return count;
  }, 0);

  // Raw total
  const rawTotal = items.reduce((sum, item) => sum + item.itemTotal, 0);

  // Check if reward eligible: customer has >= 10 stamps
  const isRewardEligible = Boolean(customer && customer.stampsCount >= 10);

  // If claim reward is active, discount 1 standard noodle portion (Rp 26.000)
  const discount = claimReward && isRewardEligible ? 26000 : 0;
  const totalAmount = Math.max(0, rawTotal - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        customer,
        customerName,
        customerWhatsapp,
        setCustomerInfo,
        setLinkedCustomer,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleTopping,
        updateNotes,
        updateCustomPrice,
        clearCart,
        totalAmount,
        totalNoodleCount,
        isRewardEligible,
        claimReward,
        setClaimReward,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
