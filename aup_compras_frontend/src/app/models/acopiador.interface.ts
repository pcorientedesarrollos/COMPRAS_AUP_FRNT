// Interfaces basadas en el backend AUP Compras
export interface Acopiador {
  idProveedor: number;
  tipo: string | null;
  nombre: string;
  idComprador: number | null;
  idDatosFiscales: number;
  idDireccion: number;
  idSagarpa: string;
  tipoDeMiel: number;
  empresa: number;
  cantidad: number;
  idEstado: number | null;
  activoInactivo: number; // 0 = Activo, 1 = Inactivo
  latitud: number | null;
  longitud: number | null;
  deleteProve: number;
}

export interface CreateAcopiadorRequest {
  tipo?: string;
  nombre: string;
  idComprador?: number;
  idDatosFiscales: number;
  idDireccion: number;
  idSagarpa: string;
  tipoDeMiel: number;
  empresa?: number;
  cantidad?: number;
  idEstado?: number;
  activoInactivo?: number;
  latitud?: number;
  longitud?: number;
}

export interface UpdateAcopiadorRequest {
  tipo?: string;
  nombre?: string;
  idComprador?: number;
  idDatosFiscales?: number;
  idDireccion?: number;
  idSagarpa?: string;
  tipoDeMiel?: number;
  empresa?: number;
  cantidad?: number;
  idEstado?: number;
  activoInactivo?: number;
  latitud?: number;
  longitud?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AcopiadoresResponse {
  acopiadores: Acopiador[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
// Interface para coordenadas de mapa
export interface AcopiadorCoordinates {
  idProveedor: number;
  nombre: string;
  latitud: number | null;
  longitud: number | null;
}
