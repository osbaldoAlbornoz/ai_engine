import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Obtener variables de entorno con validación
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validar que las variables existan (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL no está definida en .env.local');
  }
  if (!supabaseAnonKey) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida en .env.local');
  }
  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY no está definida en .env.local');
  }
}

// Cliente para el frontend (limitado por RLS policies)
// Usamos un proxy para lazy initialization
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function createSupabaseInstance(): SupabaseClient {
  return createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  );
}

function createSupabaseAdminInstance(): SupabaseClient {
  return createClient(
    supabaseUrl || '',
    supabaseServiceRoleKey || ''
  );
}

// Proxy para lazy initialization manteniendo la API original
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = createSupabaseInstance();
    }
    return Reflect.get(_supabase, prop);
  }
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createSupabaseAdminInstance();
    }
    return Reflect.get(_supabaseAdmin, prop);
  }
});