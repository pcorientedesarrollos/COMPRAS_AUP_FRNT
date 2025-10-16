import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Acopiador, CreateAcopiadorRequest, UpdateAcopiadorRequest, AcopiadorCoordinates } from '../models/acopiador.interface';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  acopiadores: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AcopiadorService {
  private apiUrl = 'http://localhost:3000/api/acopiadores';

  constructor(private http: HttpClient) { }

  getAcopiadores(page: number = 1, limit: number = 10, filters?: any): Observable<ApiResponse<PaginatedResponse<Acopiador>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Acopiador>>>(this.apiUrl, { params });
  }

  getAcopiadorById(id: number): Observable<ApiResponse<Acopiador>> {
    return this.http.get<ApiResponse<Acopiador>>(`${this.apiUrl}/${id}`);
  }

  createAcopiador(acopiadorData: CreateAcopiadorRequest): Observable<ApiResponse<{ idProveedor: number }>> {
    return this.http.post<ApiResponse<{ idProveedor: number }>>(this.apiUrl, acopiadorData);
  }

  updateAcopiador(id: number, acopiadorData: UpdateAcopiadorRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, acopiadorData);
  }

  toggleAcopiadorStatus(id: number): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  deleteAcopiador(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  getAcopiadoresMapData(): Observable<ApiResponse<AcopiadorCoordinates[]>> {
    return this.http.get<ApiResponse<AcopiadorCoordinates[]>>(`${this.apiUrl}/map/all`);
  }

  getAcopiadorCoordinates(id: number): Observable<ApiResponse<AcopiadorCoordinates>> {
    return this.http.get<ApiResponse<AcopiadorCoordinates>>(`${this.apiUrl}/${id}/coordinates`);
  }

  updateAcopiadorCoordinates(id: number, latitud: number, longitud: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}/coordinates`, { latitud, longitud });
  }
}
