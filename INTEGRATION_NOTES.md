# Notas de Integración Frontend-Backend

## ✅ Estado Actual: Preparado para Integración Futura

El frontend está **completamente preparado** para integrarse con el backend, pero actualmente funciona con **datos locales (mock)** para desarrollo y pruebas.

### Archivo Clave para Integración

**`/src/app/services/api.ts`** - Este archivo contiene todas las funciones necesarias para comunicarse con el backend:
- Autenticación (login, registro, logout)
- Gestión de categorías
- Gestión de transacciones
- Gestión de presupuestos

**Este archivo está listo para usar**, solo necesitas activar las llamadas en los componentes cuando el backend esté disponible.

## 🎯 Funcionalidad Actual (Sin Backend)

### 1. Autenticación Local
- ✅ Sistema de login con validación de credenciales locales
- ✅ Sistema de registro de usuarios en memoria
- ✅ Validación de emails duplicados
- ✅ Validación de contraseñas (mínimo 6 caracteres)
- ✅ Logout con limpieza de sesión

### 2. Gestión de Categorías
- ✅ 10 categorías predefinidas
- ✅ Creación de categorías personalizadas (se guardan en memoria)
- ✅ Selección de iconos
- ✅ Tipos: Ingresos, Gastos, Ambos

### 3. Gestión de Transacciones
- ✅ Creación de transacciones
- ✅ Filtrado por mes
- ✅ Categorización automática
- ✅ Cálculo de balance mensual
- ✅ Visualización de ingresos vs gastos

### 4. Gestión de Presupuestos
- ✅ Presupuesto global mensual
- ✅ Presupuestos por categoría
- ✅ Indicadores visuales de progreso
- ✅ Alertas cuando se alcanza el límite

### 5. Formato de Moneda
- ✅ Todos los valores en pesos colombianos (COP)
- ✅ Formato: $3.500.000 (sin decimales)
- ✅ Datos de ejemplo actualizados

## 🔧 Cómo Activar la Integración con Backend

Cuando el backend esté listo, sigue estos pasos:

### Paso 1: Actualizar AppContext

Reemplaza el estado local con llamadas al backend en `/src/app/context/AppContext.tsx`:

```typescript
// Cargar datos del backend al iniciar
useEffect(() => {
  const loadInitialData = async () => {
    if (!user) return;

    const [cats, txs, budgs] = await Promise.all([
      api.getUserCategories(parseInt(user.id)),
      api.getUserTransactions(parseInt(user.id)),
      api.getUserBudgets(parseInt(user.id))
    ]);

    // Convertir y guardar en estado...
  };

  loadInitialData();
}, [user]);
```

### Paso 2: Actualizar Login y Registro

Ya están las funciones comentadas en el archivo `api.ts`. Solo necesitas:

1. Descomentar las importaciones de `api` en LoginPage.tsx y RegisterPage.tsx
2. Reemplazar la lógica de validación local con llamadas a `api.loginUser()` y `api.registerUser()`

### Paso 3: Actualizar Componentes de Formularios

Los formularios (TransactionForm, BudgetForm, CategoryForm) ya tienen los datos estructurados correctamente. Solo necesitas cambiar:

```typescript
// En lugar de llamar a addTransaction local:
onAddTransaction(data);

// Llamar al backend:
const result = await api.createTransaction(...);
onAddTransaction(result);
```

## 📋 Configuración del Backend

Cuando conectes, asegúrate de:

1. **URL del Backend:** Por defecto está configurado para `http://localhost:8080/api`
   - Si tu backend usa otra URL, actualiza `BASE_URL` en `/src/app/services/api.ts`

2. **CORS:** El backend debe permitir:
   - Origin: `http://localhost:5173` (o tu puerto de Vite)
   - Headers: `Authorization`, `Content-Type`
   - Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

## 📊 Mapeo de Datos (Backend ↔ Frontend)

### Usuario
```typescript
// Backend
{ id: number, nombre: string, correo: string }
// Frontend
{ id: string, name: string, email: string }
```

### Categoría
```typescript
// Backend
{ id: number, nombre: string, descripcion: string, idUsuario?: number }
// Frontend
{ id: string, name: string, icon: string, type: 'income'|'expense'|'both', isDefault: boolean }
```

### Transacción
```typescript
// Backend
{ id: number, idUsuario: number, idCategoria: number, tipo: 'INGRESO'|'GASTO',
  descripcion: string, monto: string, fecha: string }
// Frontend
{ id: string, description: string, amount: number, type: 'income'|'expense',
  categoryId: string, date: string }
```

### Presupuesto
```typescript
// Backend
{ id: number, idUsuario: number, idCategoria?: number, montoLimite: number,
  montoGastado: number, mes: string }
// Frontend
{ id: string, name: string, amount: number, spent: number,
  categoryId?: string, month: string }
```

## ⚠️ Nota Importante sobre Login

El backend actual **no devuelve el usuario** en el endpoint de login, solo el token. Recomendación:

**Agregar al backend:**
```
GET /usuarios/me  (requires token)
Response: { "id": 123, "nombre": "...", "correo": "..." }
```

## 🚀 Desarrollo Actual

Para desarrollo y pruebas **sin backend**:

```bash
pnpm install
pnpm dev
```

La aplicación funciona completamente con datos locales:
- Regístrate y crea usuarios
- Agrega categorías, transacciones y presupuestos
- Todo se guarda en memoria durante la sesión

## ✨ Ventajas de Este Enfoque

1. **Desarrollo independiente:** No necesitas el backend funcionando para desarrollar el frontend
2. **Pruebas rápidas:** Prueba todas las funcionalidades sin configurar nada
3. **Código preparado:** Cuando el backend esté listo, solo activas las llamadas API
4. **Sin cambios de lógica:** La estructura de datos ya está adaptada al backend

## 📝 Próximos Pasos

Cuando estés listo para conectar con el backend:

1. Revisa el archivo `/src/app/services/api.ts` - todas las funciones están listas
2. Actualiza los componentes para usar las funciones de `api.ts`
3. Configura CORS en el backend
4. Prueba la conexión endpoint por endpoint
5. Verifica el mapeo de datos
