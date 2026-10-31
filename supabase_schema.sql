-- ==============================================================================
-- Skema Database Supabase untuk Mie Baso Kartika Sari (KS) Garut
-- Eksekusi skrip ini di SQL Editor pada dashboard Supabase:
-- 1. Buka menu SQL Editor di sidebar kiri (ikon tanda >_)
-- 2. Buat "New Query", paste seluruh skrip ini, lalu klik "Run" (atau Ctrl + Enter)
-- ==============================================================================

-- 1. Tabel Pelanggan & Loyalty CRM
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    total_visits INT DEFAULT 1,
    lifetime_value BIGINT DEFAULT 0,
    stamps_count INT DEFAULT 0,
    rewards_claimed INT DEFAULT 0,
    last_visit TIMESTAMPTZ DEFAULT now(),
    last_visit_date TIMESTAMPTZ DEFAULT now(),
    segment TEXT DEFAULT 'Pelanggan Baru',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing untuk pencarian cepat nomor WhatsApp/telepon
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_wa ON public.customers(whatsapp);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON public.customers(last_visit);

-- 2. Tabel Transaksi Kasir POS
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ DEFAULT now(),
    customer_id TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_whatsapp TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount BIGINT NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qris')),
    amount_paid BIGINT DEFAULT 0,
    cash_given BIGINT DEFAULT 0,
    change_amount BIGINT DEFAULT 0,
    stamps_awarded INT DEFAULT 0,
    stamps_earned INT DEFAULT 0,
    reward_claimed BOOLEAN DEFAULT false,
    order_type TEXT DEFAULT 'dine_in',
    table_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON public.transactions(invoice_number);

-- 3. Tabel Pesanan Pelanggan (Online Ordering Mandiri & Meja)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_whatsapp TEXT,
    order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway')),
    table_number TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount BIGINT NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qris')),
    payment_status TEXT NOT NULL DEFAULT 'Menunggu Pembayaran' CHECK (payment_status IN ('Menunggu Pembayaran', 'Sudah Dibayar')),
    order_status TEXT NOT NULL DEFAULT 'Pesanan Baru' CHECK (order_status IN ('Menunggu Pembayaran', 'Pesanan Baru', 'Sedang Diproses', 'Siap Diambil', 'Selesai', 'Dibatalkan')),
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    paid_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- 4. Tabel Pengaturan Toko (Store Settings)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    store_name TEXT NOT NULL DEFAULT 'Mie Baso & Aneka Jus Kartika Sari (KS)',
    tagline TEXT DEFAULT 'Kuliner Legendaris Mie Baso & Jus Segar Khas Garut',
    address TEXT NOT NULL DEFAULT 'Jln. Otista No 127 Paseban (Depan Rumah Beku), Garut Satu, Jawa Barat, Indonesia',
    phone TEXT DEFAULT '08122334455',
    operational_hours TEXT DEFAULT 'Setiap Hari: 09:30 - 21:00 WIB',
    maps_embed_url TEXT,
    maps_direct_url TEXT DEFAULT 'https://maps.app.goo.gl/vFAbar6CYjoBZ9wNA',
    qris_image_url TEXT DEFAULT '/qris.jpg',
    stamp_target INT DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed pengaturan default Toko Mie Baso Kartika Sari
INSERT INTO public.store_settings (id, store_name, address, maps_direct_url, qris_image_url)
VALUES (
    1, 
    'Mie Baso & Aneka Jus Kartika Sari (KS)', 
    'Jln. Otista No 127 Paseban (Depan Rumah Beku), Garut Satu, Jawa Barat, Indonesia',
    'https://maps.app.goo.gl/vFAbar6CYjoBZ9wNA',
    '/qris.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    address = EXCLUDED.address,
    maps_direct_url = EXCLUDED.maps_direct_url,
    qris_image_url = EXCLUDED.qris_image_url;

-- 5. Row Level Security (RLS) & Akses Publik Aplikasi Web
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Buat Policy agar aplikasi kasir & pelanggan dapat membaca serta menulis data
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public All Customers" ON public.customers;
    CREATE POLICY "Public All Customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public All Transactions" ON public.transactions;
    CREATE POLICY "Public All Transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public All Orders" ON public.orders;
    CREATE POLICY "Public All Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public All Store Settings" ON public.store_settings;
    CREATE POLICY "Public All Store Settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
END $$;
