# 📊 Leaderboard Updates - Guía de Implementación

## Resumen de Mejoras

Se han implementado todas las recomendaciones para mejorar el sistema de leaderboard:

### 1. ✅ Migración de Base de Datos

**Archivo:** `scripts/migrations/add-ai-score-column.sql`

La migración agrega:
- Columna `ai_score` (INTEGER) para almacenar scores pre-calculados
- Índice en `ai_score` para queries más rápidos
- Índice compuesto en `category + ai_score` para filtros por categoría

**Para aplicar la migración:**

```bash
# Opción A: Desde SQL editor de Supabase
# 1. Ve a tu dashboard de Supabase
# 2. Abre SQL Editor
# 3. Copia y pega el contenido de add-ai-score-column.sql
# 4. Ejecuta

# Opción B: Desde CLI (si tienes supabase CLI instalado)
npx supabase db push scripts/migrations/add-ai-score-column.sql
```

### 2. ✅ Nuevos Umbrales de Tiers

**Archivo:** `src/utils/scoring.ts`

| Tier | Antes | Ahora |
|------|-------|-------|
| S    | ≥90   | ≥80   |
| A    | ≥75   | ≥65   |
| B    | ≥55   | ≥45   |
| C    | <55   | <45   |

Esto distribuye mejor los productos entre tiers.

### 3. ✅ Fórmula de GPU Mejorada

**Cambios:**
- VRAM: 55% → 40% (reducido para no dominar el score)
- Cores/TOPS: 35% → 50% (aumentado para valorizar arquitectura)
- Arquitectura: 10% (se mantiene)

**Ejemplo:**
- RTX 4090 (24GB, 16384 cores): VRAM=40, Cores=50, Arch=6 = **96/100**
- RTX 4070 (12GB, 5888 cores): VRAM=20, Cores=18, Arch=6 = **44/100**

### 4. ✅ Score Breakdown (Desglose de Puntuación)

**Nueva función:** `getScoreBreakdown(product)`

Retorna:
```typescript
{
  total: 85,
  tier: "A",
  components: {
    "VRAM": { score: 35, max: 40, percentage: 88 },
    "CUDA Cores": { score: 40, max: 50, percentage: 80 },
    "Architecture Bonus": { score: 10, max: 10, percentage: 100 }
  }
}
```

### 5. ✅ Cálculo de Scores en Backend

**Archivo:** `scripts/update-catalog.ts`

Ahora calcula y guarda `ai_score` automáticamente cuando:
- Se actualiza el precio de un producto
- Se agregan specs faltantes
- Se ejecuta el script de actualización

**Beneficio:** El frontend ya no calcula scores, solo lee de la BD.

### 6. ✅ UI del Leaderboard Mejorada

**Archivo:** `src/app/leaderboard/page.tsx`

**Nuevas características:**

1. **Modal de Score Breakdown**
   - Click en cualquier producto para ver desglose
   - Muestra componentes del score (VRAM, Cores, etc.)
   - Incluye Value Analysis con recomendaciones

2. **Filtro por Presupuesto**
   - Dropdown "Max Price" con opciones: $500, $1000, $2000, $3000, $5000
   - Filtra productos en tiempo real
   - Se combina con filtros de categoría

3. **Indicador de Score de BD**
   - Badge "DB Score: XX" muestra el score almacenado
   - Útil para verificar si el script de actualización funcionó

4. **Mejoras Visuales**
   - Barras de progreso con bordes redondeados
   - Tooltip "Click for breakdown"
   - Animaciones suaves en el modal

## Pasos para Completar la Implementación

### Paso 1: Aplicar Migración de BD

```sql
-- Ejecuta esto en Supabase SQL Editor
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ai_score INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_ai_score ON products(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_score ON products(category, ai_score DESC);
```

### Paso 2: Actualizar Scores Existentes

Crea un script para calcular scores de productos existentes:

```bash
# Crea el archivo scripts/backfill-scores.ts
npx tsx --env-file=.env.local scripts/backfill-scores.ts
```

### Paso 3: Verificar en Producción

1. Abre http://localhost:3000/leaderboard
2. Verifica que los productos muestran "DB Score"
3. Haz click en un producto para ver el breakdown
4. Prueba el filtro por presupuesto

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/utils/scoring.ts` | Nuevos umbrales, fórmula GPU, getScoreBreakdown() |
| `src/app/leaderboard/page.tsx` | Modal, filtro presupuesto, DB score badge |
| `scripts/update-catalog.ts` | Cálculo de ai_score automático |
| `scripts/migrations/add-ai-score-column.sql` | NUEVO - Migración de BD |

## Próximos Pasos (Opcional)

1. **Script backfill-scores.ts**: Para calcular scores de productos existentes
2. **Cache de scores**: Invalidar cache cuando cambien specs
3. **Historial de scores**: Guardar versiones anteriores para comparar

## Testing

```bash
# 1. Aplica la migración en Supabase
# 2. Ejecuta update-catalog para actualizar scores
npx tsx --env-file=.env.local scripts/update-catalog.ts

# 3. Inicia el servidor de desarrollo
npm run dev

# 4. Abre http://localhost:3000/leaderboard
```

## Notas Importantes

- ⚠️ **RLS Policies**: Si tienes RLS habilitado, asegúrate de permitir lectura de `ai_score`
- ⚠️ **Tipos de TypeScript**: El tipo `Product` puede necesitar actualización para incluir `ai_score`
- ⚠️ **Cache de Next.js**: Puede que necesites limpiar cache (`npm run build` o borrar `.next`)