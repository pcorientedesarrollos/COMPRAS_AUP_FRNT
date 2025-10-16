import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapComponent, MapMarkerData } from '../google-map/google-map.component';
import { AcopiadorService } from '../../services/acopiador.service';
import { AcopiadorCoordinates } from '../../models/acopiador.interface';

@Component({
  selector: 'app-acopiadores-map',
  standalone: true,
  imports: [CommonModule, GoogleMapComponent],
  template: `
    <div class="acopiadores-map-container">
      <div class="map-header">
        <h2>Mapa de Acopiadores</h2>
        <div class="map-controls">
          <button 
            class="btn btn-primary" 
            (click)="loadAcopiadores()"
            [disabled]="loading">
            {{ loading ? 'Cargando...' : 'Cargar Acopiadores' }}
          </button>
          <button 
            class="btn btn-secondary" 
            (click)="fitMapToMarkers()"
            [disabled]="mapMarkers.length === 0">
            Ajustar Vista
          </button>
          <button 
            class="btn btn-outline" 
            (click)="clearMap()">
            Limpiar Mapa
          </button>
        </div>
      </div>

      <div class="map-wrapper">
        <app-google-map
          #googleMap
          [center]="mapCenter"
          [zoom]="mapZoom"
          [markers]="mapMarkers"
          [width]="'100%'"
          [height]="'500px'"
          [enableClickToAddMarker]="false">
        </app-google-map>
      </div>

      @if (selectedAcopiador) {
        <div class="acopiador-details">
          <h3>{{ selectedAcopiador.nombre }}</h3>
          <p><strong>ID:</strong> {{ selectedAcopiador.idProveedor }}</p>
          @if (selectedAcopiador.latitud && selectedAcopiador.longitud) {
            <p><strong>Coordenadas:</strong> {{ selectedAcopiador.latitud }}, {{ selectedAcopiador.longitud }}</p>
          }
        </div>
      }

      @if (error) {
        <div class="error-message">
          <p>{{ error }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .acopiadores-map-container {
      padding: 20px;
      max-width: 100%;
    }

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .map-header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }

    .map-controls {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }

    .btn-outline {
      background-color: transparent;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .btn-outline:hover {
      background-color: #007bff;
      color: white;
    }

    .map-wrapper {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .acopiador-details {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .acopiador-details h3 {
      margin: 0 0 10px 0;
      color: #007bff;
    }

    .acopiador-details p {
      margin: 5px 0;
      font-size: 14px;
    }

    .error-message {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 8px;
      border-left: 4px solid #dc3545;
    }

    @media (max-width: 768px) {
      .map-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .map-controls {
        width: 100%;
        justify-content: flex-start;
      }
    }
  `]
})
export class AcopiadoresMapComponent implements OnInit {
  
  mapCenter: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 }; // Oaxaca, México
  mapZoom: number = 8;
  mapMarkers: MapMarkerData[] = [];
  
  acopiadores: AcopiadorCoordinates[] = [];
  selectedAcopiador: AcopiadorCoordinates | null = null;
  loading: boolean = false;
  error: string | null = null;

  @ViewChild('googleMap') googleMapComponent!: GoogleMapComponent;

  constructor(private acopiadorService: AcopiadorService) {}

  ngOnInit(): void {
    // Cargar acopiadores automáticamente al inicio
    this.loadAcopiadores();
  }

  async loadAcopiadores(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      
      // Obtener todos los acopiadores (no paginados) con sus coordenadas
      const response = await this.acopiadorService.getAcopiadores(1, 1000).toPromise();
      
      if (response && response.data && response.data.acopiadores) {
        // Filtrar solo acopiadores con coordenadas válidas
        this.acopiadores = response.data.acopiadores
          .filter(acopiador => acopiador.latitud && acopiador.longitud)
          .map(acopiador => ({
            idProveedor: acopiador.idProveedor,
            nombre: acopiador.nombre,
            latitud: acopiador.latitud,
            longitud: acopiador.longitud
          }));
        
        this.createMarkersFromAcopiadores();
      }
    } catch (error) {
      console.error('Error al cargar acopiadores:', error);
      this.error = 'Error al cargar los acopiadores. Por favor, intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }

  private createMarkersFromAcopiadores(): void {
    this.mapMarkers = this.acopiadores
      .filter(acopiador => acopiador.latitud && acopiador.longitud)
      .map(acopiador => ({
        position: {
          lat: acopiador.latitud!,
          lng: acopiador.longitud!
        },
        title: acopiador.nombre,
        info: `ID: ${acopiador.idProveedor} - ${acopiador.nombre}`,
        id: acopiador.idProveedor
      }));

    // Si hay marcadores, ajustar la vista para mostrarlos todos
    if (this.mapMarkers.length > 0) {
      setTimeout(() => this.fitMapToMarkers(), 100);
    }
  }

  fitMapToMarkers(): void {
    if (this.googleMapComponent && this.mapMarkers.length > 0) {
      this.googleMapComponent.fitBounds();
    }
  }

  clearMap(): void {
    this.mapMarkers = [];
    this.selectedAcopiador = null;
  }

  onMarkerClick(marker: MapMarkerData): void {
    // Buscar el acopiador correspondiente al marcador
    const acopiador = this.acopiadores.find(a => a.idProveedor === marker.id);
    if (acopiador) {
      this.selectedAcopiador = acopiador;
    }
  }
}