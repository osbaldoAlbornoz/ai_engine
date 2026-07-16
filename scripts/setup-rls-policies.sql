-- ============================================
-- AI ENGINE - Row Level Security (RLS) Setup
-- ============================================
-- Este script habilita políticas de seguridad para proteger
-- la base de datos de Supabase contra accesos no autorizados.
--
-- Ejecutar en el SQL Editor de Supabase Dashboard

-- ============================================
-- 1. TABLA: products
-- ============================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública (cualquiera puede ver productos)
-- Esto permite que el frontend haga SELECT sin autenticación
DROP POLICY IF EXISTS "Public read access" ON products;
CREATE POLICY "Public read access" ON products
  FOR SELECT
  USING (true);

-- Policy: Solo usuarios autenticados pueden insertar/actualizar/eliminar
-- Esto previene que usuarios anónimos modifiquen productos
DROP POLICY IF EXISTS "Authenticated users can insert" ON products;
CREATE POLICY "Authenticated users can insert" ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update" ON products;
CREATE POLICY "Authenticated users can update" ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete" ON products;
CREATE POLICY "Authenticated users can delete" ON products
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 2. TABLA: price_alerts
-- ============================================

-- Habilitar RLS
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública (para que el cron job pueda leer todas las alertas)
-- El cron job usa el SERVICE_ROLE_KEY que bypass RLS
DROP POLICY IF EXISTS "Public read for cron" ON price_alerts;
CREATE POLICY "Public read for cron" ON price_alerts
  FOR SELECT
  USING (true);

-- Policy: Cualquier usuario puede insertar sus propias alertas
-- No requerimos autenticación para facilitar la suscripción
DROP POLICY IF EXISTS "Anyone can insert alerts" ON price_alerts;
CREATE POLICY "Anyone can insert alerts" ON price_alerts
  FOR INSERT
  WITH CHECK (true);

-- Policy: Solo actualizaciones del sistema (notified = true)
-- El cron job usa SERVICE_ROLE_KEY, así que bypass RLS
DROP POLICY IF EXISTS "System can update alerts" ON price_alerts;
CREATE POLICY "System can update alerts" ON price_alerts
  FOR UPDATE
  USING (true);

-- ============================================
-- 3. Verificación de políticas
-- ============================================

-- Query para verificar las políticas creadas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public';

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. El frontend usa NEXT_PUBLIC_SUPABASE_ANON_KEY (limitado por RLS)
-- 2. El backend (cron jobs) usa SUPABASE_SERVICE_ROLE_KEY (bypass RLS)
-- 3. Asegúrate de que SUPABASE_SERVICE_ROLE_KEY esté en .env.local
-- 4. Nunca expongas SUPABASE_SERVICE_ROLE_KEY en el frontend
-- ============================================