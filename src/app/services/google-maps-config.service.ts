import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsConfigService {
  
  // Configuración de Google Maps
  // IMPORTANTE: Reemplaza 'TU_API_KEY_AQUI' con tu API Key real de Google Maps
  private readonly API_KEY = 'TU_API_KEY_AQUI';
  
  // URL para cargar la API de Google Maps
  private readonly GOOGLE_MAPS_API_URL = `https://maps.googleapis.com/maps/api/js?key=${this.API_KEY}&libraries=places`;

  constructor() { }

  getApiKey(): string {
    return this.API_KEY;
  }

  getApiUrl(): string {
    return this.GOOGLE_MAPS_API_URL;
  }

  // Método para verificar si Google Maps está disponible
  isGoogleMapsLoaded(): boolean {
    return typeof google !== 'undefined' && typeof google.maps !== 'undefined';
  }

  // Configuraciones predeterminadas para diferentes regiones de Perú
  getPeruRegionCenters() {
    return {
      lima: { lat: -12.0464, lng: -77.0428 },
      arequipa: { lat: -16.4090, lng: -71.5375 },
      cusco: { lat: -13.5319, lng: -71.9675 },
      trujillo: { lat: -8.1116, lng: -79.0287 },
      chiclayo: { lat: -6.7714, lng: -79.8413 },
      piura: { lat: -5.1945, lng: -80.6328 },
      iquitos: { lat: -3.7437, lng: -73.2516 },
      huancayo: { lat: -12.0653, lng: -75.2049 },
      tacna: { lat: -18.0056, lng: -70.2533 },
      ica: { lat: -14.0678, lng: -75.7286 }
    };
  }

  // Configuraciones de zoom recomendadas
  getZoomLevels() {
    return {
      country: 6,     // Ver todo el país
      region: 8,      // Ver una región
      city: 12,       // Ver una ciudad
      district: 15,   // Ver un distrito
      street: 18      // Ver calles
    };
  }
}