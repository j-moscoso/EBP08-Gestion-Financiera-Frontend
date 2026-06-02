# 💰 Gestión Financiera Personal

Aplicación web moderna para la gestión de finanzas personales con seguimiento de ingresos, gastos, categorías y presupuestos mensuales.

## ✨ Características Principales

### 🔐 Autenticación
- Registro de usuarios con validación completa
- Inicio de sesión seguro
- Cierre de sesión desde cualquier página

### 📊 Dashboard
- **Balance mensual acumulado** destacado con visualización clara
- Tarjetas de resumen (balance total, ingresos, gastos)
- Filtro por mes para análisis temporal
- Indicadores visuales de estado financiero

### 💼 Transacciones
- Crear **ingresos** y **gastos** manualmente
- Asignación automática de categoría por defecto
- Filtrado inteligente de categorías según tipo
- Historial completo de movimientos

### 🏷️ Categorías Personalizadas
- Crear categorías ilimitadas con iconos emoji
- Categorías específicas para ingresos o gastos
- Categorías mixtas (ambos tipos)
- Gestión completa (crear, editar, eliminar)

### 🎯 Presupuestos
- **Presupuesto mensual global** para control general
- **Presupuestos por categoría** para mayor precisión
- Barras de progreso visuales con código de colores:
  - 🟢 Verde: < 60% consumido
  - 🟡 Amarillo: 60-79% consumido
  - 🟠 Naranja: 80-99% consumido
  - 🔴 Rojo: ≥ 100% consumido
- Alertas automáticas al acercarse al límite
- Sincronización automática con gastos del mes

### 📊 Reportes y Análisis
- **Gastos por categoría** con gráficos de dona interactivos
- **Ingresos por categoría** con visualizaciones detalladas
- **Comparativa mensual** entre ingresos y gastos
- Filtrado por mes y año
- Métricas de ahorro y balance
- Datos obtenidos del backend en tiempo real

### 💡 Recomendaciones Inteligentes
- Sugerencias personalizadas según tu balance mensual
- Alertas basadas en el uso de presupuestos
- Recomendaciones generadas por el backend
- Actualización en tiempo real

### 🌓 Personalización
- Tema claro y oscuro
- Cambio de contraseña
- Gestión de códigos de recuperación
- Perfil de usuario

## 🎨 Diseño

### Paleta de Colores Ocean Breeze
- **Fondo**: `#e5ecff` - Azul suave y relajante
- **Principal**: `#60e6b0` - Verde aqua vibrante
- **Secundario**: `#06b6d4` - Cyan oceánico
- **Cards**: `#ffffff` - Blanco limpio
- **Ingresos**: Verde (#60e6b0)
- **Gastos**: Rojo (#ef4444)

### Características de UX
- ✅ Diseño completamente responsive
- ✅ Animaciones suaves y profesionales
- ✅ Estados de carga con spinners
- ✅ Validaciones en tiempo real
- ✅ Notificaciones toast para feedback
- ✅ Estados vacíos informativos
- ✅ Navegación intuitiva

## 🚀 Comenzar a Usar

### Primera vez
1. Abre la aplicación en tu navegador
2. Haz clic en "Regístrate aquí"
3. Completa el formulario de registro
4. ¡Listo! Serás redirigido al dashboard

### Iniciar sesión
1. Ingresa tu correo electrónico
2. Ingresa tu contraseña
3. Haz clic en "Iniciar Sesión"

> **Nota**: Esta es una aplicación de demostración. Cualquier credencial es válida para login.

## 📱 Navegación

### Dashboard (`/`)
- Vista principal con balance mensual
- Tarjetas de resumen financiero
- Selector de mes
- Botón para agregar transacciones
- Lista de movimientos recientes

### Categorías (`/categories`)
- Crear nuevas categorías con iconos personalizados
- Ver categorías de ingresos y gastos por separado
- Editar o eliminar categorías existentes

### Presupuestos (`/budgets`)
- Definir presupuesto mensual global
- Crear presupuestos específicos por categoría
- Visualizar progreso y alertas
- Filtrar por mes

## 💡 Casos de Uso

### Agregar un Gasto
1. En el dashboard, haz clic en "Nueva Transacción"
2. Completa la descripción (ej: "Compra de supermercado")
3. Ingresa el monto
4. Selecciona "Gasto"
5. Elige una categoría (ej: "Alimentación")
6. Haz clic en "Agregar Transacción"

### Crear una Categoría Personalizada
1. Ve a la sección "Categorías"
2. Haz clic en "Nueva Categoría"
3. Ingresa el nombre (ej: "Mascotas")
4. Selecciona un icono (ej: 🐶)
5. Elige el tipo (Gasto/Ingreso/Ambos)
6. Haz clic en "Crear Categoría"

### Definir un Presupuesto
1. Ve a la sección "Presupuestos"
2. Haz clic en "Nuevo Presupuesto"
3. Elige entre "Global" o "Por Categoría"
4. Ingresa el nombre y monto límite
5. Si es por categoría, selecciona una
6. Haz clic en "Crear Presupuesto"

## 🔍 Funcionalidades Avanzadas

### Filtro por Mes
- Usa el selector de mes en el dashboard
- Visualiza solo las transacciones del mes seleccionado
- El balance se recalcula automáticamente

### Estados Visuales
- **Balance positivo**: Indicador verde con ícono de estrella
- **Balance negativo**: Indicador rojo de alerta
- **Presupuesto OK**: Verde con check
- **Presupuesto alto**: Amarillo/Naranja con advertencia
- **Presupuesto excedido**: Rojo con alerta

### Notificaciones
- ✅ Transacción agregada
- ✅ Categoría creada
- ✅ Presupuesto definido
- ✅ Inicio de sesión exitoso
- ❌ Errores de validación

## 📊 Persistencia de Datos

Todos los datos se almacenan en el backend:
- **Usuarios**: Registro completo con autenticación JWT
- **Categorías**: 12 categorías globales + categorías personalizadas
- **Transacciones**: Historial completo de ingresos y gastos
- **Presupuestos**: Configuración mensual persistente
- **Recomendaciones**: Generadas dinámicamente por el backend

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **React Router 7** - Navegación
- **Tailwind CSS 4** - Estilos
- **Lucide React** - Iconos
- **Sonner** - Notificaciones
- **Recharts** - Gráficos y visualizaciones
- **Context API** - Estado global

### Backend
- **Spring Boot** - Framework de backend
- **JWT** - Autenticación segura
- **PostgreSQL** - Base de datos
- **REST API** - Arquitectura de servicios
- **Desplegado en Render** - https://eko-mj59.onrender.com

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (opcional):

```bash
# URL del backend (por defecto usa producción)
VITE_API_BASE_URL=https://eko-mj59.onrender.com/api

# Para desarrollo local con backend en tu máquina:
# VITE_API_BASE_URL=http://localhost:8080/api
```

### Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build
```

## 🎯 Historias de Usuario Implementadas

### Autenticación y Perfil
✅ **HU 1.1.1** - Registro de usuario con códigos de recuperación  
✅ **HU 1.1.2** - Inicio de sesión con JWT  
✅ **HU 1.1.3** - Cierre de sesión  
✅ **HU 1.1.4** - Cambio de contraseña  
✅ **HU 1.1.5** - Recuperación de cuenta con códigos  

### Categorías y Transacciones
✅ **HU 2.1.1** - Crear categorías personalizadas  
✅ **HU 2.1.2** - Asignar categoría a transacción  
✅ **HU 2.2.1** - Crear ingreso manual  
✅ **HU 2.3.1** - Crear gasto manual  
✅ **HU 2.4.1** - Editar y eliminar transacciones  
✅ **HU 2.5.1** - Transacciones programadas/recurrentes  

### Presupuestos
✅ **HU 3.1.1** - Definir presupuesto mensual global  
✅ **HU 3.1.2** - Definir presupuestos por categoría  
✅ **HU 3.1.3** - Ver estado de presupuestos con alertas  

### Dashboard y Reportes
✅ **HU 4.1.1** - Ver balance mensual acumulado  
✅ **HU 5.1.1** - Generar reporte de gastos por categoría  
✅ **HU 5.1.2** - Generar reporte de ingresos por categoría  
✅ **HU 5.1.3** - Generar reporte comparativo ingreso vs gasto  

### Recomendaciones
✅ **HU 4.1.1** - Visualizar recomendaciones según presupuesto  
✅ **HU 4.1.2** - Visualizar recomendaciones según balance mensual  

## 📝 Próximas Mejoras

- [ ] Exportación de reportes en PDF/CSV
- [ ] Metas de ahorro personalizadas
- [ ] Recordatorios de pagos recurrentes
- [ ] Multi-moneda
- [ ] Notificaciones push
- [ ] Proyecciones financieras
- [ ] Análisis de tendencias

## 👨‍💻 Desarrollo

Esta aplicación fue desarrollada siguiendo las mejores prácticas de React y diseño de interfaces modernas, con un enfoque en la experiencia de usuario y la accesibilidad.

---

**¡Empieza a gestionar tus finanzas hoy mismo!** 🚀💰
