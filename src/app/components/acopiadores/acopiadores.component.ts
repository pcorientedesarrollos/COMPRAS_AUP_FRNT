import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AcopiadorService, ApiResponse, PaginatedResponse } from '../../services/acopiador.service';
import { Acopiador, UpdateAcopiadorRequest } from '../../models/acopiador.interface';
import { DatosFiscalesService } from '../../services/datosfiscales.service';

@Component({
  selector: 'app-acopiadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acopiadores.component.html',
  styleUrl: './acopiadores.component.css'
})
export class AcopiadoresComponent implements OnInit {
  acopiadores: Acopiador[] = [];
  loading = false;
  error: string | null = null;

  // Variables de paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Variables para filtros avanzados
  totalFilteredItems: number = 0; // Total después de aplicar filtros
  filteredAcopiadores: Acopiador[] = []; // Datos filtrados completos
  isComplexFilter: boolean = false; // Si estamos usando filtros complejos

  // Variables de filtros
  filters = {
    searchText: '',        // Búsqueda general por nombre, ID SAGARPA
    status: 'all',         // 'all', 'active', 'inactive' - Por defecto: todos
    mapStatus: 'all',      // 'all', 'with-map', 'without-map'
    sagarpaStatus: 'all'   // 'all', 'with-sagarpa', 'without-sagarpa'
  };

  showForm = false;
  showMapModal = false;
  selectedAcopiadorForMap: Acopiador | null = null;
  editingAcopiador: Acopiador | null = null;
  
  // Variables para formulario mejorado
  formStep: number = 1; // Paso actual del formulario (1-3)
  maxSteps: number = 3;
  formValidation = {
    step1: false,
    step2: false, 
    step3: false
  };

  // Variables para CSF (Constancia de Situación Fiscal)
  showCsfModal = false;
  selectedAcopiadorForCsf: Acopiador | null = null;
  selectedCsfFile: File | null = null;
  uploadingCsf = false;
  csfFileUrl: SafeResourceUrl | null = null;
  private csfBlobUrl: string | null = null;
  csfModalMode: 'upload' | 'view' = 'upload'; // Modo del modal: subir o visualizar

  // Variables para edición inline
  editingIdSagarpa: number | null = null;
  tempIdSagarpa: string = '';
  savingIdSagarpa: boolean = false;
  
  editingNombre: number | null = null;
  tempNombre: string = '';
  savingNombre: boolean = false;
  formAcopiador: any = {
    // Paso 1: Información básica del acopiador
    nombre: '',
    idSagarpa: '',
    tipoDeMiel: 1,
    
    // Paso 2: Datos fiscales
    razonSocial: '',
    rfc: '',
    curp: '',
    
    // Paso 3: Dirección y ubicación
    direccion: '',
    latitud: null,
    longitud: null,
    
    // Campos técnicos (auto-generados)
    tipo: 'INDIVIDUAL',
    idDatosFiscales: 0,
    idDireccion: 0,
    empresa: 1,
    cantidad: 0,
    activoInactivo: 1
  };

  menuAbierto: number | null = null;

  constructor(
    private acopiadorService: AcopiadorService,
    private datosFiscalesService: DatosFiscalesService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.menuAbierto = null;
  }

  ngOnInit(): void {
    this.loadAcopiadores();
  }

  toggleMenu(id: number): void {
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  loadAcopiadores(): void {
    console.log('Cargando acopiadores...');
    this.loading = true;
    this.error = null;

    // Preparar filtros para el backend
    const backendFilters: any = {};

    // Filtro de búsqueda por texto (nombre)
    if (this.filters.searchText.trim()) {
      backendFilters.nombre = this.filters.searchText.trim();
    }

    // Filtro de estado activo/inactivo usando deleteProve
    if (this.filters.status !== 'all') {
      // deleteProve: 0 = Activo, 1 = Inactivo
      backendFilters.deleteProve = this.filters.status === 'active' ? 0 : 1;
    }

    // Filtro de coordenadas
    if (this.filters.mapStatus !== 'all') {
      backendFilters.mapStatus = this.filters.mapStatus;
    }

    // Filtro de ID SAGARPA
    if (this.filters.sagarpaStatus !== 'all') {
      backendFilters.sagarpaStatus = this.filters.sagarpaStatus;
    }

    // Verificar si hay filtros activos
    const hasActiveFilters = this.filters.searchText.trim() !== '' || 
                            this.filters.status !== 'all' || 
                            this.filters.mapStatus !== 'all' || 
                            this.filters.sagarpaStatus !== 'all';

    // Ahora todos los filtros están en el backend, usar paginación normal siempre
    const requestPageSize = this.pageSize;
    const requestPage = this.currentPage;

    this.acopiadorService.getAcopiadores(requestPage, requestPageSize, backendFilters).subscribe({
      next: (response: ApiResponse<PaginatedResponse<Acopiador>>) => {
        console.log('Respuesta del servidor:', response);
        const acopiadores = response.data?.acopiadores || [];
        console.log('Acopiadores recibidos:', acopiadores.length);
        
        // Ya no necesitamos filtros en frontend, todo se hace en backend
        this.acopiadores = acopiadores;
        this.filteredAcopiadores = acopiadores;
        this.totalFilteredItems = acopiadores.length;
        this.isComplexFilter = false; // Siempre falso ahora
        
        // Guardar metadata de paginación
        if (response.data?.pagination) {
          this.currentPage = response.data.pagination.page;
          this.pageSize = response.data.pagination.limit;
          this.totalItems = response.data.pagination.total;
          this.totalPages = response.data.pagination.totalPages;
        }
        
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar los acopiadores: ' + error.message;
        this.loading = false;
      }
    });
  }

  showNewForm(): void {
    this.editingAcopiador = null;
    this.formStep = 1;
    this.formAcopiador = {
      // Paso 1: Información básica del acopiador
      nombre: '',
      idSagarpa: '',
      tipoDeMiel: 1,
      
      // Paso 2: Datos fiscales
      razonSocial: '',
      rfc: '',
      curp: '',
      
      // Paso 3: Dirección y ubicación
      direccion: '',
      latitud: null,
      longitud: null,
      
      // Campos técnicos (auto-generados)
      tipo: 'INDIVIDUAL',
      idDatosFiscales: 0,
      idDireccion: 0,
      empresa: 1,
      cantidad: 0,
      activoInactivo: 1
    };
    this.formValidation = {
      step1: false,
      step2: false,
      step3: false
    };
    this.showForm = true;
  }

  editAcopiador(acopiador: Acopiador): void {
    this.editingAcopiador = acopiador;
    this.formStep = 1;
    
    // Mapear datos del acopiador a la estructura del formulario
    this.formAcopiador = {
      // Paso 1: Información básica del acopiador
      nombre: acopiador.nombre || '',
      idSagarpa: acopiador.idSagarpa || '',
      tipoDeMiel: acopiador.tipoDeMiel || 1,
      
      // Paso 2: Datos fiscales (usar datos del JOIN si están disponibles)
      razonSocial: acopiador.razonSocial || acopiador.nombre || '', // Si no hay razón social, usar nombre
      rfc: acopiador.rfc || '',         
      curp: acopiador.curp || '',        
      
      // Paso 3: Dirección y ubicación (usar datos del JOIN si están disponibles)
      direccion: acopiador.direccion || '',   
      latitud: acopiador.latitud || null,
      longitud: acopiador.longitud || null,
      
      // Campos técnicos
      tipo: acopiador.tipo || 'INDIVIDUAL',
      idDatosFiscales: acopiador.idDatosFiscales || 0,
      idDireccion: acopiador.idDireccion || 0,
      empresa: acopiador.empresa || 1,
      cantidad: acopiador.cantidad || 0,
      activoInactivo: acopiador.activoInactivo || 1
    };

    // Validar pasos con los datos cargados
    this.validateAllSteps();
    this.showForm = true;
  }

  // Función para validar todos los pasos después de cargar datos
  private validateAllSteps(): void {
    for (let step = 1; step <= this.maxSteps; step++) {
      const originalStep = this.formStep;
      this.formStep = step;
      this.validateCurrentStep();
      this.formStep = originalStep;
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingAcopiador = null;
    this.formStep = 1;
  }

  // Funciones para navegación del formulario por pasos
  nextStep(): void {
    if (this.formStep < this.maxSteps && this.validateCurrentStep()) {
      this.formStep++;
    }
  }

  previousStep(): void {
    if (this.formStep > 1) {
      this.formStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.maxSteps) {
      this.formStep = step;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.formStep) {
      case 1:
        const step1Valid = this.formAcopiador.nombre.trim() !== '' && 
                          this.formAcopiador.tipoDeMiel > 0;
        this.formValidation.step1 = step1Valid;
        return step1Valid;
        
      case 2:
        // Validar que al menos razón social y RFC estén llenos
        const hasRazonSocial = this.formAcopiador.razonSocial.trim() !== '';
        const hasRfc = this.formAcopiador.rfc.trim() !== '';
        
        // Validar formato de RFC si está presente
        let rfcValid = true;
        if (hasRfc) {
          const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
          rfcValid = rfcPattern.test(this.formAcopiador.rfc.toUpperCase());
        }
        
        // Validar formato de CURP si está presente
        let curpValid = true;
        if (this.formAcopiador.curp && this.formAcopiador.curp.trim() !== '') {
          const curpPattern = /^[A-Z]{4}[0-9]{6}[HM]{1}[A-Z]{2}[BCDFGHJKLMNPQRSTVWXYZ]{3}[0-9A-Z]{2}$/;
          curpValid = curpPattern.test(this.formAcopiador.curp.toUpperCase());
        }
        
        const step2Valid = hasRazonSocial && hasRfc && rfcValid && curpValid;
        this.formValidation.step2 = step2Valid;
        return step2Valid;
        
      case 3:
        const step3Valid = this.formAcopiador.direccion.trim() !== '';
        this.formValidation.step3 = step3Valid;
        return step3Valid;
        
      default:
        return false;
    }
  }

  // Validación específica de RFC
  validateRfc(): string | null {
    if (!this.formAcopiador.rfc || this.formAcopiador.rfc.trim() === '') {
      return null; // No hay error si está vacío
    }
    
    const rfc = this.formAcopiador.rfc.toUpperCase();
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    
    if (!rfcPattern.test(rfc)) {
      return 'Formato de RFC inválido (ej: PEGJ800101ABC)';
    }
    
    return null;
  }

  // Validación específica de CURP
  validateCurp(): string | null {
    if (!this.formAcopiador.curp || this.formAcopiador.curp.trim() === '') {
      return null; // No hay error si está vacío
    }
    
    const curp = this.formAcopiador.curp.toUpperCase();
    const curpPattern = /^[A-Z]{4}[0-9]{6}[HM]{1}[A-Z]{2}[BCDFGHJKLMNPQRSTVWXYZ]{3}[0-9A-Z]{2}$/;
    
    if (!curpPattern.test(curp)) {
      return 'Formato de CURP inválido (18 caracteres)';
    }
    
    return null;
  }

  // Auto-convertir a mayúsculas
  onRfcInput(): void {
    if (this.formAcopiador.rfc) {
      this.formAcopiador.rfc = this.formAcopiador.rfc.toUpperCase();
    }
    this.validateCurrentStep();
  }

  onCurpInput(): void {
    if (this.formAcopiador.curp) {
      this.formAcopiador.curp = this.formAcopiador.curp.toUpperCase();
    }
    this.validateCurrentStep();
  }

  isFormValid(): boolean {
    return this.formValidation.step1 && 
           this.formValidation.step2 && 
           this.formValidation.step3;
  }

  saveAcopiador(): void {
    // Validar todos los pasos antes de enviar
    this.validateCurrentStep(); // Validar paso actual
    if (!this.isFormValid()) {
      this.error = 'Por favor complete todos los campos requeridos en todos los pasos';
      return;
    }

    this.loading = true;
    this.error = null;

    // Preparar datos para envío (el backend creará los registros relacionados)
    const acopiadorData = {
      ...this.formAcopiador,
      // Asegurar que los campos numéricos sean correctos
      tipoDeMiel: parseInt(this.formAcopiador.tipoDeMiel),
      empresa: 1,
      cantidad: 0,
      activoInactivo: 1
    };

    if (this.editingAcopiador) {
      this.acopiadorService.updateAcopiador(this.editingAcopiador.idProveedor!, acopiadorData).subscribe({
        next: () => {
          this.loadAcopiadores();
          this.cancelForm();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Error al actualizar: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      console.log('Creando nuevo acopiador...');
      this.acopiadorService.createAcopiador(acopiadorData).subscribe({
        next: () => {
          console.log('Acopiador creado exitosamente, recargando lista...');
          this.loadAcopiadores();
          this.cancelForm();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error al crear acopiador:', error);
          this.error = 'Error al crear: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  deleteAcopiador(acopiador: Acopiador): void {
    if (confirm('¿Eliminar acopiador?')) {
      this.acopiadorService.deleteAcopiador(acopiador.idProveedor!).subscribe({
        next: () => this.loadAcopiadores(),
        error: (error: any) => this.error = 'Error: ' + error.message
      });
    }
  }

  toggleStatus(acopiador: Acopiador): void {
    const updatedData: UpdateAcopiadorRequest = {
      deleteProve: acopiador.deleteProve === 0 ? 1 : 0
    };
    
    this.acopiadorService.updateAcopiador(acopiador.idProveedor!, updatedData).subscribe({
      next: () => this.loadAcopiadores(),
      error: (error: any) => this.error = 'Error: ' + error.message
    });
  }

  verApicultores(acopiador: Acopiador): void {
    // Aquí puedes implementar la lógica para ver los apicultores relacionados con este acopiador
    console.log('Ver apicultores del acopiador:', acopiador);
    this.menuAbierto = null; // Cerrar el menú emergente

    // Por ahora mostramos un mensaje de que la funcionalidad está en desarrollo
    alert(`Ver apicultores de: ${acopiador.nombre}\n\nEsta funcionalidad estará disponible próximamente.`);

    // TODO: Implementar navegación a vista de apicultores o abrir modal con lista
    // this.router.navigate(['/apicultores', acopiador.idProveedor]);
  }

  verEnMapa(acopiador: Acopiador): void {
    // Verificar que el acopiador tenga coordenadas
    if (!acopiador.latitud || !acopiador.longitud) {
      this.error = 'Este acopiador no tiene coordenadas GPS registradas.';
      this.menuAbierto = null;
      return;
    }

    this.selectedAcopiadorForMap = acopiador;
    this.showMapModal = true;
    this.menuAbierto = null; // Cerrar el menú emergente
  }

  closeMapModal(): void {
    this.showMapModal = false;
    this.selectedAcopiadorForMap = null;
  }

  // Métodos de paginación
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAcopiadores();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAcopiadores();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadAcopiadores();
    }
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1; // Resetear a primera página
    this.loadAcopiadores();
  }

  // Helper para usar Math en el template
  Math = Math;

  // Helper para cambio de página
  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value);
    this.changePageSize(newSize);
  }

  // Helper para cálculo de registros mostrados
  getDisplayedRecordsEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  // Helper para verificar si hay filtros activos
  hasActiveFilters(): boolean {
    return this.filters.searchText.trim() !== '' || 
           this.filters.status !== 'all' || 
           this.filters.mapStatus !== 'all' || 
           this.filters.sagarpaStatus !== 'all';
  }

  // Métodos de filtros
  onSearchChange(): void {
    this.currentPage = 1; // Resetear a primera página
    this.loadAcopiadores();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1; // Resetear a primera página
    this.loadAcopiadores();
  }

  onMapStatusFilterChange(): void {
    this.currentPage = 1; // Resetear a primera página
    this.loadAcopiadores();
  }

  onSagarpaFilterChange(): void {
    this.currentPage = 1; // Resetear a primera página
    this.loadAcopiadores();
  }

  clearFilters(): void {
    this.filters = {
      searchText: '',
      status: 'all',
      mapStatus: 'all',
      sagarpaStatus: 'all'
    };
    this.currentPage = 1;
    this.isComplexFilter = false;
    this.totalFilteredItems = 0;
    this.filteredAcopiadores = [];
    this.loadAcopiadores();
  }

  removeFilter(filterType: string): void {
    switch (filterType) {
      case 'searchText':
        this.filters.searchText = '';
        break;
      case 'status':
        this.filters.status = 'all';
        break;
      case 'mapStatus':
        this.filters.mapStatus = 'all';
        break;
      case 'sagarpaStatus':
        this.filters.sagarpaStatus = 'all';
        break;
    }
    this.currentPage = 1; // Resetear a primera página
    this.loadAcopiadores();
  }

  // Método para calcular el índice consecutivo considerando la paginación
  getRowIndex(index: number): number {
    // Calcular el índice invertido basado en el total de registros
    // Si hay 518 registros total, el primero debe mostrar 518, el segundo 517, etc.
    return this.totalItems - ((this.currentPage - 1) * this.pageSize + index);
  }

  // Métodos para edición inline de ID SAGARPA
  startEditIdSagarpa(acopiador: Acopiador): void {
    this.editingIdSagarpa = acopiador.idProveedor!;
    this.tempIdSagarpa = acopiador.idSagarpa;
    
    // Hacer focus en el input después de que se renderice
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]:not([disabled])') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select(); // Seleccionar todo el texto
      }
    }, 0);
  }

  isEditingIdSagarpa(idProveedor: number): boolean {
    return this.editingIdSagarpa === idProveedor;
  }

  saveIdSagarpa(acopiador: Acopiador): void {
    if (this.savingIdSagarpa || this.tempIdSagarpa.trim() === '') {
      return;
    }

    // Si el valor no cambió, cancelar edición
    if (this.tempIdSagarpa === acopiador.idSagarpa) {
      this.cancelEditIdSagarpa();
      return;
    }

    this.savingIdSagarpa = true;
    const updatedData: UpdateAcopiadorRequest = {
      idSagarpa: this.tempIdSagarpa.trim()
    };

    this.acopiadorService.updateAcopiador(acopiador.idProveedor!, updatedData).subscribe({
      next: () => {
        // Actualizar el valor local
        acopiador.idSagarpa = this.tempIdSagarpa.trim();
        this.cancelEditIdSagarpa();
        this.savingIdSagarpa = false;
      },
      error: (error: any) => {
        this.error = 'Error al actualizar ID SAGARPA: ' + error.message;
        this.savingIdSagarpa = false;
      }
    });
  }

  cancelEditIdSagarpa(): void {
    this.editingIdSagarpa = null;
    this.tempIdSagarpa = '';
  }

  onIdSagarpaKeyup(event: KeyboardEvent, acopiador: Acopiador): void {
    if (event.key === 'Enter') {
      this.saveIdSagarpa(acopiador);
    } else if (event.key === 'Escape') {
      this.cancelEditIdSagarpa();
    }
  }

  // Métodos para edición inline de NOMBRE
  startEditNombre(acopiador: Acopiador): void {
    this.editingNombre = acopiador.idProveedor!;
    this.tempNombre = acopiador.nombre;
    
    // Hacer focus en el input después de que se renderice
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Nombre"]') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select(); // Seleccionar todo el texto
      }
    }, 0);
  }

  isEditingNombre(idProveedor: number): boolean {
    return this.editingNombre === idProveedor;
  }

  saveNombre(acopiador: Acopiador): void {
    if (this.savingNombre || this.tempNombre.trim() === '') {
      return;
    }

    // Si el valor no cambió, cancelar edición
    if (this.tempNombre === acopiador.nombre) {
      this.cancelEditNombre();
      return;
    }

    this.savingNombre = true;
    const updatedData: UpdateAcopiadorRequest = {
      nombre: this.tempNombre.trim()
    };

    this.acopiadorService.updateAcopiador(acopiador.idProveedor!, updatedData).subscribe({
      next: () => {
        // Actualizar el valor local
        acopiador.nombre = this.tempNombre.trim();
        this.cancelEditNombre();
        this.savingNombre = false;
      },
      error: (error: any) => {
        this.error = 'Error al actualizar nombre: ' + error.message;
        this.savingNombre = false;
      }
    });
  }

  cancelEditNombre(): void {
    this.editingNombre = null;
    this.tempNombre = '';
  }

  onNombreKeyup(event: KeyboardEvent, acopiador: Acopiador): void {
    if (event.key === 'Enter') {
      this.saveNombre(acopiador);
    } else if (event.key === 'Escape') {
      this.cancelEditNombre();
    }
  }

  // Métodos para CSF (Constancia de Situación Fiscal)
  verCsf(acopiador: Acopiador): void {
    this.selectedAcopiadorForCsf = acopiador;
    this.showCsfModal = true;
    this.menuAbierto = null; // Cerrar el menú emergente
    
    // Reset de estado anterior
    if (this.csfBlobUrl) {
      URL.revokeObjectURL(this.csfBlobUrl);
      this.csfBlobUrl = null;
    }
    this.csfFileUrl = null;
    this.selectedCsfFile = null;

    // Determinar el modo del modal basado en si ya tiene CSF
    if (acopiador.hasCsf && acopiador.csfFile) {
      this.csfModalMode = 'view';
      // Cargar el CSF existente para visualización
      this.loadExistingCSF(acopiador.idDatosFiscales);
    } else {
      this.csfModalMode = 'upload';
    }
  }

  private loadExistingCSF(idDatosFiscales: number): void {
    // Crear URL sanitizada para el CSF existente
    const csfUrl = this.acopiadorService.getCSFUrl(idDatosFiscales);
    this.csfFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(csfUrl);
  }

  closeCsfModal(): void {
    this.showCsfModal = false;
    this.selectedAcopiadorForCsf = null;
    this.selectedCsfFile = null;
    if (this.csfBlobUrl) {
      URL.revokeObjectURL(this.csfBlobUrl);
      this.csfBlobUrl = null;
    }
    this.csfFileUrl = null;
    this.uploadingCsf = false;
    this.csfModalMode = 'upload';
  }

  switchToUploadMode(): void {
    this.csfModalMode = 'upload';
    // Limpiar vista previa del archivo existente
    this.csfFileUrl = null;
    this.selectedCsfFile = null;
    if (this.csfBlobUrl) {
      URL.revokeObjectURL(this.csfBlobUrl);
      this.csfBlobUrl = null;
    }
  }

  switchToViewMode(): void {
    this.csfModalMode = 'view';
    // Cargar el CSF existente para visualización
    if (this.selectedAcopiadorForCsf && this.selectedAcopiadorForCsf.hasCsf) {
      this.loadExistingCSF(this.selectedAcopiadorForCsf.idDatosFiscales);
    }
  }

  onCsfFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedCsfFile = file;
      // Limpiar URL anterior si existe
      if (this.csfBlobUrl) {
        URL.revokeObjectURL(this.csfBlobUrl);
      }
      // Crear URL para preview
      this.csfBlobUrl = URL.createObjectURL(file);
      this.csfFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.csfBlobUrl);
    } else {
      this.error = 'Por favor selecciona un archivo PDF válido.';
      event.target.value = ''; // Limpiar input
    }
  }

  uploadCsf(): void {
    if (!this.selectedCsfFile || !this.selectedAcopiadorForCsf) {
      this.error = 'Selecciona un archivo PDF antes de subir.';
      return;
    }

    // Verificar que el acopiador tenga idDatosFiscales
    if (!this.selectedAcopiadorForCsf.idDatosFiscales) {
      this.error = 'El acopiador no tiene datos fiscales asociados.';
      return;
    }

    this.uploadingCsf = true;
    this.error = null;

    // Usar el método simple de upload (sin extracción)
    this.datosFiscalesService.uploadCSF(this.selectedAcopiadorForCsf.idDatosFiscales, this.selectedCsfFile).subscribe({
      next: (response) => {
        this.uploadingCsf = false;
        if (response.success) {
          alert(`CSF subido exitosamente para ${this.selectedAcopiadorForCsf?.nombre}`);
          // Recargar datos para mostrar que tiene CSF
          this.loadAcopiadores();
          // Cerrar el modal
          this.closeCsfModal();
        } else {
          this.error = response.message || 'Error al subir el archivo CSF';
        }
      },
      error: (error) => {
        this.uploadingCsf = false;
        this.error = 'Error al subir el archivo CSF: ' + (error.error?.message || error.message);
        console.error('Error uploading CSF:', error);
      }
    });
  }

  downloadCsf(acopiador: Acopiador): void {
    if (!acopiador.idDatosFiscales) {
      this.error = 'El acopiador no tiene datos fiscales asociados.';
      return;
    }

    this.acopiadorService.downloadCSF(acopiador.idDatosFiscales).subscribe({
      next: (blob) => {
        // Crear URL para el blob y descargar
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CSF_${acopiador.nombre}_${acopiador.idSagarpa}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.error = 'Error al descargar el archivo CSF: ' + (error.error?.message || error.message);
        console.error('Error downloading CSF:', error);
      }
    });
  }

  deleteCsf(acopiador: Acopiador): void {
    if (!acopiador.idDatosFiscales) {
      this.error = 'El acopiador no tiene datos fiscales asociados.';
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar el CSF de ${acopiador.nombre}?`)) {
      return;
    }

    this.acopiadorService.deleteCSF(acopiador.idDatosFiscales).subscribe({
      next: (response) => {
        if (response.success) {
          alert(`CSF eliminado exitosamente para ${acopiador.nombre}`);
          // Recargar datos para reflejar el cambio
          this.loadAcopiadores();
        } else {
          this.error = response.message || 'Error al eliminar el archivo CSF';
        }
      },
      error: (error) => {
        this.error = 'Error al eliminar el archivo CSF: ' + (error.error?.message || error.message);
        console.error('Error deleting CSF:', error);
      }
    });
  }

  removeCsfFile(): void {
    this.selectedCsfFile = null;
    if (this.csfBlobUrl) {
      URL.revokeObjectURL(this.csfBlobUrl);
      this.csfBlobUrl = null;
    }
    this.csfFileUrl = null;
  }
}
