import { supabase, isSupabaseConfigured, isNetworkOnline } from '../lib/supabase';
import { Customer, CustomerSegment } from '../types';

/**
 * Converts a database row from Supabase 'customers' table to the client Customer model.
 */
export const mapRowToCustomer = (row: any): Customer => {
  return {
    id: row.id,
    name: row.name || 'Pelanggan Kartika Sari',
    phone: row.phone || row.whatsapp || '',
    whatsapp: row.whatsapp || row.phone || '',
    totalVisits: Number(row.total_visits) || 1,
    lifetimeValue: Number(row.lifetime_value) || 0,
    stampsCount: Number(row.stamps_count) || 0,
    rewardsClaimed: Number(row.rewards_claimed) || 0,
    lastVisitDate: row.last_visit_date || row.last_visit || row.created_at || new Date().toISOString(),
    lastVisit: row.last_visit || row.last_visit_date || row.created_at || new Date().toISOString(),
    segment: (row.segment as CustomerSegment) || 'Pelanggan Baru',
    createdAt: row.created_at || new Date().toISOString(),
  };
};

/**
 * Converts client Customer model to database row for Supabase 'customers' table.
 */
export const mapCustomerToRow = (customer: Customer): any => {
  const visitDate = customer.lastVisit || customer.lastVisitDate || new Date().toISOString();
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone || customer.whatsapp || '',
    whatsapp: customer.whatsapp || customer.phone || '',
    total_visits: customer.totalVisits || 1,
    lifetime_value: customer.lifetimeValue || 0,
    stamps_count: customer.stampsCount || 0,
    rewards_claimed: customer.rewardsClaimed || 0,
    last_visit: visitDate,
    last_visit_date: visitDate,
    segment: customer.segment || 'Pelanggan Baru',
  };
};

/**
 * Pushes customer profile to Supabase cloud immediately with upsert.
 */
export const pushCustomerToCloud = async (customer: Customer): Promise<boolean> => {
  if (!isSupabaseConfigured() || !isNetworkOnline()) {
    return false;
  }

  try {
    const row = mapCustomerToRow(customer);
    const { error } = await supabase.from('customers').upsert([row]);
    if (error) {
      console.warn('Failed to push customer to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Network exception pushing customer to Supabase:', err.message);
    return false;
  }
};

/**
 * Fetches matching customer from Supabase by WhatsApp phone digits or name.
 */
export const fetchCloudCustomerByPhoneOrName = async (query: string): Promise<Customer | null> => {
  if (!isSupabaseConfigured() || !isNetworkOnline()) {
    return null;
  }

  const clean = query.trim();
  if (!clean) return null;

  const cleanDigits = clean.replace(/[^0-9]/g, '');
  const normDigits = cleanDigits.replace(/^62/, '0');

  try {
    const orConditions: string[] = [`name.ilike.%${clean}%`];

    if (cleanDigits) {
      orConditions.push(`whatsapp.ilike.%${cleanDigits}%`);
      orConditions.push(`phone.ilike.%${cleanDigits}%`);
      if (normDigits !== cleanDigits) {
        orConditions.push(`whatsapp.ilike.%${normDigits}%`);
        orConditions.push(`phone.ilike.%${normDigits}%`);
      }
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(orConditions.join(','))
      .limit(5);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Match priority: phone equality or closest match
    const mapped = data.map(mapRowToCustomer);
    const match =
      mapped.find((c) => {
        if (cleanDigits) {
          const cPhone = (c.whatsapp || c.phone || '').replace(/[^0-9]/g, '').replace(/^62/, '0');
          if (cPhone === normDigits || cPhone.includes(normDigits) || normDigits.includes(cPhone)) {
            return true;
          }
        }
        return c.name.toLowerCase().includes(clean.toLowerCase());
      }) || mapped[0];

    return match;
  } catch (err: any) {
    console.warn('Network exception fetching cloud customer:', err.message);
    return null;
  }
};

/**
 * Fetches all customers from Supabase cloud.
 */
export const fetchCloudCustomers = async (): Promise<Customer[]> => {
  if (!isSupabaseConfigured() || !isNetworkOnline()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('last_visit', { ascending: false });

    if (error || !data) {
      console.warn('Failed to fetch cloud customers:', error?.message);
      return [];
    }

    return data.map(mapRowToCustomer);
  } catch (err: any) {
    console.warn('Network exception fetching cloud customers:', err.message);
    return [];
  }
};

/**
 * Subscribes to Supabase Realtime changes on 'customers' table.
 */
export const subscribeToCloudCustomers = (
  onChange: (customer: Customer, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
): (() => void) => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('realtime_customers_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload: any) => {
          if (payload.new && payload.new.id) {
            const mapped = mapRowToCustomer(payload.new);
            onChange(mapped, payload.eventType || 'UPDATE');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err: any) {
    console.warn('Failed to setup Supabase realtime customer subscription:', err.message);
    return () => {};
  }
};
