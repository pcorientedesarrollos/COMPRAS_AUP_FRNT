import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

export interface MapMarkerData {
  position: google.maps.LatLngLiteral;
  title: string;
  info?: string;
  id?: string | number;
}

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker, MapInfoWindow],
  template: `
    <div class="map-container">
      <google-map
        #map
        [center]="center"
        [zoom]="zoom"
        [options]="mapOptions"
        (mapClick)="onMapClick($event)"
        [width]="width"
        [height]="height">
        
        @for (marker of markers; track marker.id || $index) {
          <map-marker
            [position]="marker.position"
            [title]="marker.title"
            [options]="markerOptions"
            (mapClick)="onMarkerClick(marker, $event)">
          </map-marker>
        }
        
        <map-info-window>
          <div class="info-window-content">
            <h3>{{ selectedMarker?.title }}</h3>
            @if (selectedMarker?.info) {
              <p>{{ selectedMarker?.info }}</p>
            }
          </div>
        </map-info-window>
      </google-map>
    </div>
  `,
  styles: [`
    .map-container {
      width: 100%;
      height: 100%;
    }
    
    .info-window-content {
      padding: 8px;
    }
    
    .info-window-content h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: bold;
    }
    
    .info-window-content p {
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class GoogleMapComponent implements OnInit {
  @ViewChild(GoogleMap) map!: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  @Input() center: google.maps.LatLngLiteral = { lat: -12.0464, lng: -77.0428 }; // Lima, Perú por defecto
  @Input() zoom: number = 10;
  @Input() markers: MapMarkerData[] = [];
  @Input() width: string = '100%';
  @Input() height: string = '400px';
  @Input() enableClickToAddMarker: boolean = false;

  selectedMarker: MapMarkerData | null = null;

  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 3,
    streetViewControl: true,
    fullscreenControl: true,
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
  };

  ngOnInit(): void {
    // Verificar si Google Maps está disponible
    if (typeof google === 'undefined') {
      console.error('Google Maps JavaScript API no está cargada');
    }
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (this.enableClickToAddMarker && event.latLng) {
      const position = event.latLng.toJSON();
      this.addMarker(position, 'Nuevo marcador');
    }
  }

  onMarkerClick(marker: MapMarkerData, event: google.maps.MapMouseEvent): void {
    this.selectedMarker = marker;
    if (this.infoWindow && event.latLng) {
      this.infoWindow.open();
    }
  }

  addMarker(position: google.maps.LatLngLiteral, title: string, info?: string): void {
    const newMarker: MapMarkerData = {
      position,
      title,
      info,
      id: Date.now()
    };
    this.markers = [...this.markers, newMarker];
  }

  removeMarker(markerId: string | number): void {
    this.markers = this.markers.filter(marker => marker.id !== markerId);
  }

  clearMarkers(): void {
    this.markers = [];
  }

  centerOnMarker(marker: MapMarkerData): void {
    this.center = marker.position;
    this.map.panTo(marker.position);
  }

  fitBounds(): void {
    if (this.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    this.markers.forEach(marker => {
      bounds.extend(marker.position);
    });
    
    this.map.fitBounds(bounds);
  }
}