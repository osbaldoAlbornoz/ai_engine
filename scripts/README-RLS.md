# Guía de Implementación de Row Level Security (RLS)

## ¿Qué es RLS?

Row Level Security (RLS) es una característica de PostgreSQL que permite restringir el acceso a filas de una base de datos basándose en el rol del usuario. En el contexto de Supabase:

- **anon key** (NEXT_PUBLIC_SUPABASE_ANON_KEY): Usuario anónimo, limitado por RLS
- **service_role key** (SUPABASE_SERVICE_ROLE_KEY): Usuario administrador, bypass RLS

## Pasos para Implementar

### Paso 1: Acceder al Dashboard de Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto de AI Engine
3. Navega a **SQL Editor** (en el sidebar izquierdo)

### Paso 2: Ejecutar el Script RLS

1. Copia el contenido de `setup-rls-policies.sql`
2. Pégalo en el SQL Editor
3. Haz clic en **Run** o presiona `Ctrl+Enter`

Deberías ver un mensaje de éxito para cada comando.

### Paso 3: Verificar las Políticas

Ejecuta esta query para confirmar que las políticas se crearon:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Resultado esperado:**

| tablename | policyname | cmd |
|-----------|------------|-----|
| products | Public read access | SELECT |
| products | Authenticated users can insert | INSERT |
| products | Authenticated users can update | UPDATE |
| products | Authenticated users can delete | DELETE |
| price_alerts | Public read for cron | SELECT |
| price_alerts | Anyone can insert alerts | INSERT |
| price_alerts | System can update alerts | UPDATE |

### Paso 4: Verificar Variables de Entorno

Asegúrate de que `.env.local` tenga las siguientes variables:

```env
# Frontend (público - limitado por RLS)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (privado - bypass RLS)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Importante**: `SUPABASE_SERVICE_ROLE_KEY` NUNCA debe tener el prefijo `NEXT_PUBLIC_` porque eso la expondría en el browser.

### Paso 5: Verificar que los Cron Jobs usen Service Role Key

Los siguientes archivos deben usar `SUPABASE_SERVICE_ROLE_KEY`:

**✅ Correcto:**
- `src/app/api/cron/check-prices/route.ts`
- `src/app/api/cron/update-catalog/route.ts`

**✅ Correcto:**
- `src/app/product/[id]/page.tsx` (usa createClient con variables de entorno)

## ¿Cómo Funciona la Protección?

### Antes de RLS (VULNERABLE)
```
┌─────────────┐
│   Hacker    │ ──→ NEXT_PUBLIC_SUPABASE_ANON_KEY ──→ DROP TABLE products ❌
└─────────────┘
```

### Después de RLS (PROTEGIDO)
```
┌─────────────┐
│   Hacker    │ ──→ NEXT_PUBLIC_SUPABASE_ANON_KEY ──→ RLS Policy ──→ ❌ DENEGADO
└─────────────┘
```

## Políticas Explicadas

### Tabla: products

| Política | Acción | Quién | Por qué |
|----------|--------|-------|---------|
| Public read access | SELECT | Todos | El catálogo debe ser público |
| Authenticated users can insert | INSERT | Solo autenticados | Prevenir spam de productos |
| Authenticated users can update | UPDATE | Solo autenticados | Prevenir modificaciones maliciosas |
| Authenticated users can delete | DELETE | Solo autenticados | Prevenir eliminación maliciosa |

### Tabla: price_alerts

| Política | Acción | Quién | Por qué |
|----------|--------|-------|---------|
| Public read for cron | SELECT | Todos + Cron | El cron job necesita leer alertas |
| Anyone can insert alerts | INSERT | Todos | Facilitar suscripción sin auth |
| System can update alerts | UPDATE | Cron (service_role) | Marcar como notificadas |

## Testing de Seguridad

### Test 1: Verificar que anon no puede eliminar productos

```sql
-- En el SQL Editor, simula un usuario anon:
SET LOCAL ROLE anon;

-- Intenta eliminar (debería fallar)
DELETE FROM products WHERE id = 'test-id';
-- ERROR: new row violates row-level security policy
```

### Test 2: Verificar que anon puede leer productos

```sql
SET LOCAL ROLE anon;

-- Esto debería funcionar
SELECT * FROM products LIMIT 1;
-- OK: retorna datos
```

### Test 3: Verificar que service_role bypass RLS

```sql
-- El cron job usa service_role, así que esto funciona:
-- (No necesitas testear esto manualmente, ya está configurado)
```

## Solución de Problemas

### Problema: "Policy not found"
**Causa**: Las políticas no se crearon correctamente.
**Solución**: Vuelve a ejecutar el script completo.

### Problema: "Permission denied"
**Causa**: RLS está habilitado pero no hay policies para tu rol.
**Solución**: Verifica que las políticas existen con la query de verificación.

### Problema: El cron job falla después de implementar RLS
**Causa**: El cron job no está usando `SUPABASE_SERVICE_ROLE_KEY`.
**Solución**: Asegúrate de que `src/app/api/cron/check-prices/route.ts` use:
```typescript
createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // No ANON_KEY
)
```

## Próximos Pasos

Después de implementar RLS, considera:

1. **Validación de datos**: Añadir Zod en `/api/alerts` para validar inputs
2. **Rate limiting**: Prevenir abuso del endpoint de alertas
3. **Logging**: Registrar intentos de acceso denegados

---

**Documentación oficial de Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security