/**
 * Interface para Datos Fiscales
 */
export interface DatosFiscales {
  idDatosFiscales: number;
  razonSocial: string | null;
  rfc: string | null;
  curp: string | null;
  csfFile: string | null;
  csfUploadDate: Date | null;
}

/**
 * Interface para crear Datos Fiscales
 */
export interface CreateDatosFiscalesRequest {
  razonSocial?: string;
  rfc?: string;
  curp?: string;
}

/**
 * Interface para actualizar Datos Fiscales
 */
export interface UpdateDatosFiscalesRequest {
  razonSocial?: string;
  rfc?: string;
  curp?: string;
}
