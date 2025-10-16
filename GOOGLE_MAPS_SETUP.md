# Configuración de Google Maps para AUP Compras Frontend

Este proyecto ha sido migrado de Leaflet a Google Maps usando la librería oficial `@angular/google-maps`.

## Requisitos Previos

### 1. Obtener una API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API** (obligatorio)
   - **Places API** (opcional, para funcionalidades de búsqueda)
   - **Geocoding API** (opcional, para convertir direcciones a coordenadas)

4. Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
5. Copia la API Key generada

### 2. Configurar la API Key en el proyecto

Reemplaza `'TU_API_KEY_AQUI'` en los siguientes archivos:

#### `src/index.html`
```html
<script async defer 
  src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_REAL&libraries=places">
</script>
```

#### `src/app/services/google-maps-config.service.ts`
```typescript
private readonly API_KEY = 'TU_API_KEY_REAL';
```

### 3. Restricciones de seguridad recomendadas

En Google Cloud Console, configura restricciones para tu API Key:

#### Para desarrollo:
- **Restricción de aplicación**: Referentes HTTP
- **Restricciones del sitio web**: `http://localhost:*`, `https://localhost:*`

#### Para producción:
- **Restricción de aplicación**: Referentes HTTP  
- **Restricciones del sitio web**: `https://tudominio.com/*`

## Componentes Disponibles

### 1. GoogleMapComponent (`google-map.component.ts`)

Componente base reutilizable para mostrar mapas de Google.

**Uso básico:**
```html
<app-google-map
  [center]="{ lat: -12.0464, lng: -77.0428 }"
  [zoom]="10"
  [markers]="markers"
  [width]="'100%'"
  [height]="'400px'">
</app-google-map>
```

**Propiedades:**
- `center`: Coordenadas del centro del mapa
- `zoom`: Nivel de zoom (3-20)
- `markers`: Array de marcadores a mostrar
- `width/height`: Dimensiones del mapa
- `enableClickToAddMarker`: Permitir agregar marcadores con click

### 2. AcopiadoresMapComponent (`acopiadores-map.component.ts`)

Componente específico para mostrar acopiadores en el mapa.

**Características:**
- Carga automática de acopiadores con coordenadas
- Vista de detalles al hacer click en marcadores
- Controles para ajustar vista y limpiar mapa
- Responsive design

## Migración de Leaflet

### Cambios realizados:

1. **Dependencias removidas:**
   - `leaflet` 
   - `@types/leaflet`
   - CSS de Leaflet en `angular.json`

2. **Dependencias agregadas:**
   - `@angular/google-maps`

3. **Nuevos archivos:**
   - `components/google-map/` - Componente base
   - `components/acopiadores-map/` - Componente específico
   - `services/google-maps-config.service.ts` - Configuración

### Diferencias principales:

| Aspecto | Leaflet | Google Maps |
|---------|---------|-------------|
| **Inicialización** | `L.map()` | `<google-map>` component |
| **Marcadores** | `L.marker()` | `<map-marker>` component |
| **Eventos** | `.on('click')` | `(mapClick)`, `(mapClick)` |
| **Estilos** | CSS personalizable | Estilos limitados de Google |
| **Tiles** | Múltiples proveedores | Solo Google Maps |

## Uso en Producción

### Costos de Google Maps

- **Primeras 28,000 cargas de mapa/mes**: Gratis
- **Después**: $7 USD por cada 1,000 cargas adicionales

### Monitoreo de uso

1. Ve a Google Cloud Console → APIs y servicios → Panel de control
2. Revisa el uso de "Maps JavaScript API"
3. Configura alertas de facturación si es necesario

### Optimizaciones recomendadas

1. **Lazy loading**: Cargar el mapa solo cuando sea necesario
2. **Caching**: Guardar coordenadas en localStorage
3. **Batch requests**: Agrupar múltiples solicitudes de geocoding
4. **Static Maps**: Para imágenes estáticas usar Static Maps API (más barato)

## Comandos útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Build para producción
npm run build

# Verificar errores de TypeScript
npx tsc --noEmit
```

## Solución de problemas

### Error: "google is not defined"
- Verifica que la API Key esté configurada correctamente
- Asegúrate de que el script de Google Maps se carga antes que Angular

### Mapa no se muestra
- Revisa la consola del navegador para errores de API Key
- Verifica que las APIs estén habilitadas en Google Cloud Console
- Confirma que el dominio esté en la lista de referentes autorizados

### Marcadores no aparecen
- Verifica que las coordenadas estén en el formato correcto (números)
- Confirma que los datos del backend incluyan latitud y longitud

## Próximos pasos

1. **Configurar API Key real** en los archivos mencionados
2. **Probar funcionalidad** con datos reales del backend
3. **Personalizar estilos** del mapa según necesidades
4. **Agregar funcionalidades** como búsqueda de lugares o rutas
5. **Implementar caching** para optimizar rendimiento

## Recursos adicionales

- [Documentación oficial de Angular Google Maps](https://github.com/angular/components/tree/main/src/google-maps)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Precios de Google Maps Platform](https://cloud.google.com/maps-platform/pricing)