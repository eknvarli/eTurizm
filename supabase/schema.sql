-- =============================================
-- eTurizm - Supabase PostgreSQL Şema
-- =============================================
-- Bu dosyayı Supabase SQL Editor'da çalıştırın.
-- Dashboard → SQL Editor → New Query → Yapıştır → Run

-- =============================================
-- 1. TRIPS TABLOSU
-- =============================================
-- Tüm seyahat planlarını saklar.
-- places ve constraints JSONB olarak saklanır — esnek ve hızlı.

CREATE TABLE IF NOT EXISTS public.trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Seyahat başlığı ve şehir
  title       TEXT NOT NULL DEFAULT 'Yeni Seyahat',
  city        TEXT NOT NULL DEFAULT '',

  -- Mekanlar (GeoJSON-uyumlu JSONB array)
  -- Her eleman: { id, lngLat: {lng, lat}, label, color, index, openHours, busynessLevel }
  places      JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Zaman kısıtları: { walk: 15, transit: 30 } (dakika)
  constraints JSONB NOT NULL DEFAULT '{"walk": 15, "transit": 30}'::jsonb,

  -- Harita durumu: { center: {lng, lat}, zoom: number }
  map_state   JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Benzersiz paylaşım kodu (8 karakter, URL-safe)
  share_id    TEXT UNIQUE NOT NULL,

  -- Zaman damgaları
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 2. İNDEKSLER
-- =============================================

-- Kullanıcıya göre sorgular için (en yaygın kullanım)
CREATE INDEX IF NOT EXISTS idx_trips_user_id
  ON public.trips(user_id);

-- Paylaşım linki sorgular için
CREATE INDEX IF NOT EXISTS idx_trips_share_id
  ON public.trips(share_id);

-- Zaman sıralama için
CREATE INDEX IF NOT EXISTS idx_trips_created_at
  ON public.trips(created_at DESC);

-- JSONB içindeki city alanı için GIN indeksi (metin araması)
CREATE INDEX IF NOT EXISTS idx_trips_city
  ON public.trips USING gin(to_tsvector('simple', city));

-- =============================================
-- 3. updated_at OTOMATİK GÜNCELLEME TRİGGER'I
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trips_updated_at ON public.trips;
CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================
-- Kullanıcılar yalnızca kendi seyahatlerini görebilir/değiştirebilir.
-- Paylaşım linkleri herkese açıktır.

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Kendi seyahatlerini okuyabilir
CREATE POLICY "trips_select_own"
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id);

-- Paylaşım ID'si ile herkes okuyabilir (share link)
CREATE POLICY "trips_select_shared"
  ON public.trips FOR SELECT
  USING (share_id IS NOT NULL);

-- Sadece kendi adına kayıt ekleyebilir
CREATE POLICY "trips_insert_own"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sadece kendi seyahatini güncelleyebilir
CREATE POLICY "trips_update_own"
  ON public.trips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sadece kendi seyahatini silebilir
CREATE POLICY "trips_delete_own"
  ON public.trips FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 5. ÖRNEK VERİ (Opsiyonel)
-- =============================================
-- Test için örnek bir seyahat kaydı (user_id'yi kendinizinkiyle değiştirin)
--
-- INSERT INTO public.trips (user_id, title, city, places, constraints, share_id)
-- VALUES (
--   auth.uid(),
--   'İstanbul Kültür Turu',
--   'İstanbul',
--   '[
--     {"id":"1","lngLat":{"lng":28.9784,"lat":41.0082},"label":"Ayasofya","color":"#3b82f6","index":0},
--     {"id":"2","lngLat":{"lng":28.9794,"lat":41.0060},"label":"Topkapı Sarayı","color":"#f59e0b","index":1},
--     {"id":"3","lngLat":{"lng":28.9740,"lat":41.0045},"label":"Kapalıçarşı","color":"#ec4899","index":2}
--   ]'::jsonb,
--   '{"walk": 20, "transit": 0}'::jsonb,
--   'demo1234'
-- );

-- =============================================
-- 6. SUPABASE AUTH AYARLARI (Manuel yapılacaklar)
-- =============================================
-- Dashboard → Authentication → Providers → Google'ı etkinleştirin:
--   1. Google Cloud Console'dan OAuth 2.0 Client ID alın
--   2. Client ID ve Client Secret'ı Supabase'e girin
--   3. Redirect URL'i Google Console'a ekleyin:
--      https://<project-ref>.supabase.co/auth/v1/callback
--   4. E-posta/Şifre sağlayıcısını KAPATIN (Auth → Providers → Email → Disable)
--
-- Dashboard → Authentication → URL Configuration:
--   Site URL: https://eturizm.app (veya localhost:5173 development için)
--   Additional Redirect URLs: http://localhost:5173/auth/callback
