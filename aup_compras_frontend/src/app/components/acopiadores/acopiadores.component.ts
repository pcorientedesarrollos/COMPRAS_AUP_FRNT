import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AcopiadorService, ApiResponse, PaginatedResponse } from '../../services/acopiador.service';
import { Acopiador, UpdateAcopiadorRequest } from '../../models/acopiador.interface';

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

  showForm = false;
  editingAcopiador: Acopiador | null = null;
  formAcopiador: any = {
    nombre: '',
    tipo: '',
    idDatosFiscales: 0,
    idDireccion: 0,
    idSagarpa: '',
    tipoDeMiel: 1
  };

  menuAbierto: number | null = null;

  constructor(
    private acopiadorService: AcopiadorService,
    private router: Router
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
    this.loading = true;
    this.error = null;
    this.acopiadorService.getAcopiadores().subscribe({
      next: (response: ApiResponse<PaginatedResponse<Acopiador>>) => {
        this.acopiadores = response.data?.acopiadores || [];
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
    this.formAcopiador = {
      nombre: '',
      tipo: '',
      idDatosFiscales: 0,
      idDireccion: 0,
      idSagarpa: '',
      tipoDeMiel: 1
    };
    this.showForm = true;
  }

  editAcopiador(acopiador: Acopiador): void {
    this.editingAcopiador = acopiador;
    this.formAcopiador = { ...acopiador };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingAcopiador = null;
  }

  saveAcopiador(): void {
    if (!this.formAcopiador.nombre || !this.formAcopiador.idSagarpa) {
      this.error = 'Nombre e ID Sagarpa son requeridos';
      return;
    }
    this.loading = true;
    this.error = null;
    if (this.editingAcopiador) {
      this.acopiadorService.updateAcopiador(this.editingAcopiador.idProveedor!, this.formAcopiador).subscribe({
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
      this.acopiadorService.createAcopiador(this.formAcopiador).subscribe({
        next: () => {
          this.loadAcopiadores();
          this.cancelForm();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Error al crear: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  deleteAcopiador(acopiador: Acopiador): void {
    if (confirm('�Eliminar acopiador?')) {
      this.acopiadorService.deleteAcopiador(acopiador.idProveedor!).subscribe({
        next: () => this.loadAcopiadores(),
        error: (error: any) => this.error = 'Error: ' + error.message
      });
    }
  }

  toggleStatus(acopiador: Acopiador): void {
    const updatedData: UpdateAcopiadorRequest = {
      activoInactivo: acopiador.activoInactivo === 0 ? 1 : 0
    };
    
    this.acopiadorService.updateAcopiador(acopiador.idProveedor!, updatedData).subscribe({
      next: () => this.loadAcopiadores(),
      error: (error: any) => this.error = 'Error: ' + error.message
    });
  }

  verEnMapa(): void {
    this.router.navigate(['/mapa']);
  }
}
