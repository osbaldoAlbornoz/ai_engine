# Implementación de Seguridad - Mejora #1

## Resumen de Cambios

Esta implementación protege la base de datos de Supabase contra accesos no autorizados mediante Row Level Security (RLS) y validación de datos.

---

## Archivos Creados

### 1. `scripts/setup-rls-policies.sql`
Script SQL para habilitar las políticas RLS en la base de datos.

**Acción requerida**: Ejecutar en el SQL Editor de Supabase Dashboard.

### 2. `scripts/README-RLS.md`
Guía paso a paso para implementar y verificar las políticas RLS.

### 3. `scripts/SECURITY-IMPLEMENTATION.md` (este archivo)
Documentación de la implementación completa.

---

## Archivos Modificados

### 1. `src/lib/supabase.ts`
**Cambio**: Añadido `supabaseAdmin` cliente con service role key.

```typescript
// Antes
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Después
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
```

**Propósito**: Permitir que el backend bypass RLS para operaciones administrativas.

---

### 2. `src/app/api/cron/check-prices/route.ts`
**Cambio**: Migrado de `supabase` a `supabaseAdmin`.

```typescript
// Antes
import { supabase } from "@/lib/supabase";
const { data: alerts } = await supabase.from("price_alerts")...

// Después
import { supabaseAdmin } from "@/lib/supabase";
const { data: alerts } = await supabaseAdmin.from("price_alerts")...
```

**Propósito**: El cron job necesita leer/actualizar todas las alertas sin restricciones RLS.

---

### 3. `src/app/api/cron/update-catalog/route.ts`
**Cambio**: Migrado de cliente manual a `supabaseAdmin`.

```typescript
// Antes
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const { data: activeProducts } = await supabase...

// Después
import { supabaseAdmin } from "@/lib/supabase";
const { data: activeProducts } = await supabaseAdmin...
```

**Propósito**: Mismo motivo que check-prices, operaciones administrativas sin RLS.

---

### 4. `src/app/api/alerts/route.ts`
**Cambio**: Añadida validación con Zod.

```typescript
import { z } from "zod";

const alertSchema = z.object({
  email: z.string().email("Invalid email address"),
  productId: z.string().min(10, "Invalid product ID (ASIN)"),
  productName: z.string().optional(),
  baselinePrice: z.number().positive().optional()
});

// En el POST:
const validationResult = alertSchema.safeParse(body);
if (!validationResult.success) {
  return NextResponse.json({ error: "Invalid data", details: ... }, { status: 400 });
}
```

**Propósito**: Prevenir datos inválidos o maliciosos de entrar a la base de datos.

---

## Políticas RLS Implementadas

### Tabla: `products`

| Política | Acción | Rol | Descripción |
|----------|--------|-----|-------------|
| `Public read access` | SELECT | Todos | El catálogo es público |
| `Authenticated users can insert` | INSERT | Autenticados | Solo admins pueden añadir productos |
| `Authenticated users can update` | UPDATE | Autenticados | Solo admins pueden modificar |
| `Authenticated users can delete` | DELETE | Autenticados | Solo admins pueden eliminar |

### Tabla: `price_alerts`

| Política | Acción | Rol | Descripción |
|----------|--------|-----|-------------|
| `Public read for cron` | SELECT | Todos | El cron job puede leer alertas |
| `Anyone can insert alerts` | INSERT | Todos | Usuarios pueden suscribirse sin auth |
| `System can update alerts` | UPDATE | Service Role | El cron marca como notificadas |

---

## Variables de Entorno Requeridas

Asegúrate de que `.env.local` tenga:

```env
# Frontend (público)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (privado - NUNCA exponer en el frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Otros
CRON_SECRET=tu-secreto-para-cron-jobs
APIFY_TOKEN=apify_api_xxxxx
RESEND_API_KEY=re_xxxxx
```

---

## Pasos para Completar la Implementación

### Paso 1: Ejecutar Script RLS
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Navega a **SQL Editor**
4. Copia y ejecuta `scripts/setup-rls-policies.sql`

### Paso 2: Verificar Políticas
Ejecuta esta query en Supabase:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Paso 3: Verificar Variables de Entorno
Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` esté en `.env.local`.

### Paso 4: Testear
1. **Test frontend**: Verifica que `/category/gpus` carga productos correctamente.
2. **Test API**: Envía un POST a `/api/alerts` con datos inválidos (debería retornar 400).
3. **Test cron**: Ejecuta manualmente `/api/cron/check-prices` con el header `Authorization: Bearer {CRON_SECRET}`.

---

## Beneficios de Seguridad

### Antes (VULNERABLE)
```
❌ Cualquier persona con la anon key podía:
   - DELETE FROM products
   - UPDATE products SET price = 0
   - INSERT datos falsos
```

### Después (PROTEGIDO)
```
✅ Con anon key (frontend):
   - SELECT products ✓ (permitido)
   - INSERT price_alerts ✓ (permitido)
   - DELETE products ✗ (bloqueado por RLS)
   - UPDATE products ✗ (bloqueado por RLS)

✅ Con service_role key (backend):
   - Todas las operaciones ✓ (bypass RLS)
```

---

## Posibles Problemas y Soluciones

### Problema: "Permission denied" en el frontend
**Causa**: RLS está bloqueando una operación legítima.
**Solución**: Revisa las políticas con la query de verificación.

### Problema: El cron job falla
**Causa**: No está usando `supabaseAdmin`.
**Solución**: Verifica que los imports sean correctos.

### Problema: Validación Zod muy estricta
**Causa**: El schema rechaza datos válidos.
**Solución**: Ajusta el schema en `src/app/api/alerts/route.ts`.

---

## Próximas Mejoras Recomendadas

1. **Rate Limiting**: Prevenir abuso del endpoint `/api/alerts`.
2. **Logging**: Registrar intentos de acceso denegados.
3. **Monitoreo**: Alertas cuando RLS bloquea operaciones sospechosas.

---

**Implementación completada**: $(date)
**Archivos modificados**: 4
**Archivos creados**: 3