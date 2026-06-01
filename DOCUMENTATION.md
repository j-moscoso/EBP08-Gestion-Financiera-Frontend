# Aplicación de Gestión Financiera Personal

## Descripción
Aplicación web completa para la gestión de finanzas personales con seguimiento de ingresos, gastos, categorías y presupuestos mensuales.

## Historias de Usuario Implementadas

### 1. Autenticación
- **HU 1.1.1 - Registro de usuario**: Formulario completo con validaciones
- **HU 1.1.2 - Inicio de sesión**: Autenticación con email y contraseña
- **HU 1.1.3 - Cierre de sesión**: Botón en el header para cerrar sesión

### 2. Categorías
- **HU 2.1.1 - Crear categorías personalizadas**: Página completa para gestionar categorías con selector de iconos
- **HU 2.1.2 - Asignar categoría a transacción**: Selector en formulario de transacciones con categoría por defecto

### 3. Transacciones
- **HU 2.2.1 - Crear ingreso manual**: Formulario con tipo "Ingreso"
- **HU 2.3.1 - Crear gasto manual**: Formulario con tipo "Gasto"

### 4. Presupuestos
- **HU 3.1.1 - Definir presupuesto mensual global**: Presupuesto general del mes
- **HU 3.1.2 - Definir presupuestos por categoría**: Presupuestos específicos por categoría

### 5. Balance
- **HU 4.1.1 - Ver balance mensual acumulado**: Dashboard con balance destacado y filtro por mes

## Estructura de Páginas

### `/login` - Inicio de Sesión
- Formulario de autenticación
- Validación de campos
- Visibilidad de contraseña
- Link a registro

### `/register` - Registro
- Formulario de creación de cuenta
- Validación completa
- Confirmación de contraseña
- Beneficios destacados

### `/` - Dashboard Principal
- Balance mensual acumulado (destacado)
- Tarjetas de resumen (balance, ingresos, gastos)
- Selector de mes
- Botón para nueva transacción
- Listado de movimientos filtrados por mes

### `/categories` - Gestión de Categorías
- Formulario para crear categorías
- Selector de iconos con emojis
- Tipo de categoría (ingreso/gasto/ambos)
- Listados separados por tipo
- Acciones de edición/eliminación

### `/budgets` - Gestión de Presupuestos
- Presupuesto global destacado
- Presupuestos por categoría
- Barras de progreso con colores
- Indicadores de estado
- Selector de mes

## Componentes Principales

### Layout
- `DashboardLayout`: Layout principal con header y navegación

### Páginas
- `LoginPage`: Pantalla de inicio de sesión
- `RegisterPage`: Pantalla de registro
- `DashboardPage`: Dashboard principal
- `CategoriesPage`: Gestión de categorías
- `BudgetsPage`: Gestión de presupuestos
- `NotFoundPage`: Página de error 404

### Componentes Reutilizables
- `Summary`: Tarjetas de resumen financiero
- `MonthlyBalance`: Balance mensual destacado
- `TransactionForm`: Formulario de transacciones
- `TransactionList`: Listado de movimientos
- `EmptyState`: Estado vacío genérico

### Contexto
- `AppContext`: Estado global de la aplicación
  - Usuario autenticado
  - Transacciones
  - Categorías
  - Presupuestos

## Paleta de Colores (Ocean Breeze)

- **Fondo**: #e5ecff
- **Principal**: #60e6b0 (verde aqua)
- **Secundario**: #06b6d4 (cyan)
- **Cards**: #ffffff (blanco)
- **Ingresos**: #60e6b0 (verde)
- **Gastos**: #ef4444 (rojo)
- **Alertas**: Naranja/Amarillo según nivel

## Características de UX

### Estados Visuales
- Estados vacíos con iconos y mensajes descriptivos
- Estados de error con validaciones
- Toast notifications para feedback
- Animaciones sutiles y efectos hover

### Responsive Design
- Diseño adaptable a móvil, tablet y desktop
- Menú móvil en header
- Grid responsive en todas las páginas

### Accesibilidad
- Labels en todos los inputs
- Contraste adecuado
- Estados de foco visibles
- Navegación por teclado

## Tecnologías Utilizadas

- **React 18**: Framework principal
- **React Router 7**: Sistema de routing
- **Tailwind CSS 4**: Estilos
- **Lucide React**: Iconos
- **Sonner**: Toast notifications
- **Context API**: Gestión de estado

## Flujo de Usuario

1. **Primera visita**: Usuario ve pantalla de login
2. **Registro**: Puede crear una cuenta nueva
3. **Login**: Ingresa con sus credenciales
4. **Dashboard**: Ve su balance mensual y resumen
5. **Transacciones**: Puede agregar ingresos/gastos
6. **Categorías**: Puede crear categorías personalizadas
7. **Presupuestos**: Puede definir límites de gasto
8. **Filtros**: Puede filtrar por mes
9. **Logout**: Puede cerrar sesión desde el header

## Datos de Ejemplo

La aplicación incluye datos de ejemplo para:
- 4 transacciones (2 ingresos, 2 gastos)
- 10 categorías predefinidas
- 3 presupuestos (1 global, 2 por categoría)
- Mes actual: Abril 2026

## Notas de Implementación

- **Sin Backend**: Toda la lógica es frontend, los datos se pierden al recargar
- **Simulación de Auth**: El login es simulado, cualquier credencial es válida
- **Categorías por defecto**: Si no se selecciona categoría, se asigna "Sin categoría"
- **Filtrado de categorías**: El formulario muestra solo categorías compatibles con el tipo de transacción
- **Presupuestos dinámicos**: Los gastos reales deberían actualizarse automáticamente (pendiente de integración)
