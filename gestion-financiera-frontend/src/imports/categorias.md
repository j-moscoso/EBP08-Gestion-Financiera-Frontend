# Documentación de categorías

## Objetivo

Este documento describe cómo funciona el manejo de categorías en el backend de Gestion Financiera Backend y cómo debe integrarse el frontend para enviar correctamente el nombre junto con el icono.

## Resumen del comportamiento actual

El backend no guarda un campo separado para el icono de la categoría. Actualmente, la entidad `Categoria` solo persiste estos campos:

- `nombre`
- `descripcion`
- `usuario` (opcional, para categorías personalizadas)

Por lo tanto, si el usuario selecciona un icono en la interfaz, el frontend debe construir el valor final del nombre antes de enviarlo al backend. Ejemplo:

- Nombre visible: `vivienda`
- Icono seleccionado: `🏠`
- Nombre interno enviado al backend: `vivienda 🏠`

De esta forma el backend guarda el texto completo y el icono queda persistido junto al nombre.

## Reglas de negocio

1. Las categorías personalizadas se crean asociadas al usuario autenticado.
2. Las categorías globales no deben ser modificadas ni eliminadas por el usuario.
3. Al eliminar una categoría personalizada, las transacciones asociadas se reasignan a la categoría global `OTROS`.
4. El backend valida propiedad antes de actualizar o eliminar una categoría personalizada.

## Endpoints relacionados

### Crear categoría personalizada

- `POST /api/categorias/crearCategoriaPropia`

### Obtener categorías del usuario autenticado

- `GET /api/categorias/usuario`

### Actualizar categoría personalizada

- `PUT /api/categorias/actualizarCategoriaPropia/{idCategoria}`

### Eliminar categoría personalizada

- `DELETE /api/categorias/eliminarCategoriaPropia/{idCategoria}`

## Contratos de entrada

### CrearCategoriaRequest

Campos esperados:

- `nombre`: nombre final de la categoría, incluyendo el emoji si aplica.
- `descripcion`: texto descriptivo de la categoría.

Ejemplo de payload:

```json
{
  "nombre": "vivienda 🏠",
  "descripcion": "Gastos relacionados con el hogar"
}
```

### ActualizarCategoriaRequest

Campos esperados:

- `nombre`: nuevo nombre final de la categoría, incluyendo el emoji si aplica.
- `descripcion`: nueva descripción.

Ejemplo de payload:

```json
{
  "nombre": "alimentación 🍽️",
  "descripcion": "Compras del supermercado y comida"
}
```

## Flujo recomendado para el frontend

1. El usuario escribe el nombre base de la categoría.
2. El usuario selecciona un icono desde la interfaz.
3. El frontend concatena ambos valores antes de enviar la solicitud.
4. El backend recibe un único campo `nombre` con el formato `texto + emoji`.
5. El registro queda guardado con el icono visible dentro del nombre.

## Ejemplos de nombres internos

- `vivienda 🏠`
- `alimentación 🍽️`
- `transporte 🚗`
- `salud 🩺`
- `ahorro 💰`

## Consideraciones técnicas

- El backend actual no separa icono y nombre en distintos campos.
- Si en el futuro se necesita filtrar o editar el icono por separado, será necesario agregar un campo específico en la entidad `Categoria` y ajustar DTOs, servicio y persistencia.
- Mientras tanto, el emoji debe tratarse como parte del string del nombre.

## Archivos del backend relacionados

- `src/main/java/com/ebp08/gestion_financiera_backend/controller/CategoriaController.java`
- `src/main/java/com/ebp08/gestion_financiera_backend/service/CategoriaService.java`
- `src/main/java/com/ebp08/gestion_financiera_backend/dto/CrearCategoriaRequest.java`
- `src/main/java/com/ebp08/gestion_financiera_backend/dto/ActualizarCategoriaRequest.java`
- `src/main/java/com/ebp08/gestion_financiera_backend/entity/Categoria.java`
- `src/main/java/com/ebp08/gestion_financiera_backend/repository/CategoriaRepository.java`
