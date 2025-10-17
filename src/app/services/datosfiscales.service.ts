import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DatosFiscales,
  CreateDatosFiscalesRequest,
  UpdateDatosFiscalesRequest
} from '../models/datosfiscales.interface';

/**
 * Interface para respuesta de API genérica
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Servicio para gestionar Datos Fiscales y CSF
 */
@Injectable({
  providedIn: 'root'
})
export class DatosFiscalesService {
  private apiUrl = 'http://localhost:3000/api/datosfiscales';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los datos fiscales
   */
  getAll(filters?: any): Observable<ApiResponse<{ datosFiscales: DatosFiscales[], total: number }>> {
    return this.http.get<ApiResponse<{ datosFiscales: DatosFiscales[], total: number }>>(
      this.apiUrl,
      { params: filters || {} }
    );
  }

  /**
   * Obtener datos fiscales por ID
   */
  getById(id: number): Observable<ApiResponse<DatosFiscales>> {
    return this.http.get<ApiResponse<DatosFiscales>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nuevos datos fiscales
   */
  create(data: CreateDatosFiscalesRequest): Observable<ApiResponse<{ idDatosFiscales: number }>> {
    return this.http.post<ApiResponse<{ idDatosFiscales: number }>>(this.apiUrl, data);
  }

  /**
   * Actualizar datos fiscales
   */
  update(id: number, data: UpdateDatosFiscalesRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar datos fiscales
   */
  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  // ========== Métodos para CSF (Constancia de Situación Fiscal) ==========

  /**
   * Subir archivo CSF
   */
  uploadCSF(idDatosFiscales: number, file: File): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('csf', file);
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/${idDatosFiscales}/csf`,
      formData
    );
  }

  /**
   * Descargar archivo CSF
   */
  downloadCSF(idDatosFiscales: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${idDatosFiscales}/csf`,
      { responseType: 'blob' }
    );
  }

  /**
   * Obtener URL del CSF para visualización
   */
  getCSFUrl(idDatosFiscales: number): string {
    return `${this.apiUrl}/${idDatosFiscales}/csf`;
  }

  /**
   * Eliminar archivo CSF
   */
  deleteCSF(idDatosFiscales: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${idDatosFiscales}/csf`);
  }
}
