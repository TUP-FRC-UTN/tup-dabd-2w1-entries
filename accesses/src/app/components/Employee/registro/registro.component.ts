import {
  AfterViewInit,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { UserServiceService } from '../../../services/EmployeeService/user-service.service';
import {
  MovementEntryDto,
  SuppEmpDto,
} from '../../../models/EmployeeAllowed/user-alowed';
import { FormsModule } from '@angular/forms';
import { MoreInformationComponent } from '../more-information/more-information.component';
import { RegisterEntryComponent } from '../register-entry/register-entry.component';
import { NgFor, NgIf } from '@angular/common';
import $ from 'jquery';
import 'datatables.net';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    FormsModule,
    MoreInformationComponent,
    RegisterEntryComponent,
    NgFor,
    NgIf,
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'], // Asegúrate de que el nombre sea correcto
})
export class RegistroComponent implements OnInit, AfterViewInit, OnDestroy {
  ListaUser: SuppEmpDto[] = [];
  showRegisterEntry: boolean = false;
  selectedUser: SuppEmpDto | null = null;
  observations: string = '';

  constructor(private userService: UserServiceService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initializeDataTable();
  }

  ngOnDestroy(): void {
    if ($.fn.dataTable.isDataTable('#myTable')) {
      $('#myTable').DataTable().destroy(true);
    }
  }

  private loadData(): void {
    this.userService.getSuppEmpData().subscribe({
      next: (data: SuppEmpDto[]) => {
        this.ListaUser = data;
        console.log(this.ListaUser);
        this.initializeDataTable();
      },
      error: (error: any) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  private initializeDataTable(): void {
    const table = $('#myTable').DataTable({
      data: this.ListaUser,
      columns: [
        { data: 'name' },
        {
          data: null,
          render: () => 'DNI', // Mostrar 'DNI' como tipo de documento
        },
        {
          data: 'document',
          className: 'text-start', // Alinear a la izquierda
          render: (data) => data, // Solo mostrar el número de documento
        },
        {
          data: 'userType',
          render: (data) => {
            switch (data) {
              case 'Employeed':
                return 'Empleado';
              case 'Supplier':
                return 'Proveedor';
              default:
                return data; // En caso de que no coincida, retorna el valor original
            }
          },
        },
        {
          data: null,
          render: (data, type, row, meta) =>
            `<button class="btn btn-info view-more" data-index="${meta.row}">Ver más</button>`,
        },
        {
          data: null,
          render: (data, type, row, meta) => `
            <select class="form-control action-select" data-document="${row.document}">
              <option value="">Seleccionar</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          `,
        },
        {
          data: null,
          render: () =>
            `<textarea class="form-control observation" rows="1" placeholder="Observaciones"></textarea>`,
        },
      ],
      destroy: true,
      language: {
        lengthMenu: '_MENU_ ',
        zeroRecords: 'No se encontraron registros',
        info: '',
        infoEmpty: 'No hay registros disponibles',
        infoFiltered: '(filtrado de _MAX_ registros totales)',
        search: 'Buscar:',
        paginate: {
          first: '«',
          last: '»',
          next: '›',
          previous: '‹',
        },
      },
    
    });
  
    // Manejo de eventos
    $('#myTable tbody').on('click', '.view-more', (event) => {
      const index = $(event.currentTarget).data('index');
      const user = this.ListaUser[index];
      this.showMoreInfoPopup(user);
    });
  
    $('#myTable tbody').on('change', '.action-select', (event) => {
      const selectedValue = $(event.currentTarget).val();
      console.log(selectedValue);
  
      const document = $(event.currentTarget).data('document');
      const tr = $(event.currentTarget).closest('tr');
      const observations = $(tr).find('.observation').val();
  
      if (selectedValue === 'verMas') {
        const index = $(event.currentTarget).closest('tr').find('.view-more').data('index');
        const user = this.ListaUser[index]; // Asegúrate de tener acceso al índice correcto
        this.showMoreInfoPopup(user); // Llama a la función que muestra la información
        $(event.currentTarget).val(''); // Restablece el valor del select
      }
  
      if (selectedValue === 'ingreso') {
        const movement: MovementEntryDto = {
          description: String(observations || ''),
          movementDatetime: new Date().toISOString(),
          vehiclesId: 0,
          document: document,
        };
        console.log(movement);
  
        Swal.fire({
          title: 'Confirmar Ingreso',
          text: '¿Está seguro que desea registrar el ingreso?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, confirmar',
          cancelButtonText: 'Cancelar',
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            this.userService.registerEmpSuppEntry(movement).subscribe({
              next: (response) => {
                console.log('Movimiento guardado exitosamente:', response);
                Swal.fire({
                  title: '¡Éxito!',
                  text: 'El movimiento se ha registrado correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Cerrar',
                });
              },
              error: (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: error.error?.message || 'Error al guardar el movimiento',
                  confirmButtonColor: '#d33',
                });
                console.error('Error en la solicitud POST:', error);
              },
            });
          }
        });
      }
  
      if (selectedValue === 'egreso') {
        const movement: MovementEntryDto = {
          description: String(observations || ''),
          movementDatetime: new Date().toISOString(),
          vehiclesId: 0,
          document: document,
        };
        console.log(movement);
  
        Swal.fire({
          title: 'Confirmar Egreso',
          text: '¿Está seguro que desea registrar el egreso?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, confirmar',
          cancelButtonText: 'Cancelar',
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            this.userService.registerEmpSuppExit(movement).subscribe({
              next: (response) => {
                console.log('Movimiento guardado exitosamente:', response);
                Swal.fire({
                  title: '¡Éxito!',
                  text: 'El movimiento se ha registrado correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Cerrar',
                });
              },
              error: (error: HttpErrorResponse) => {
                console.error('Error al guardar el movimiento:', error);
                Swal.fire({
                  title: '¡Error!',
                  text: 'No se pudo registrar el movimiento. Inténtalo de nuevo.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                });
              },
            });
          }
        });
      }
    });
  }
  
  

  private showMoreInfoPopup(user: SuppEmpDto): void {
    Swal.fire({
      title: `Información de ${user.last_name}, ${user.name}`,
      html: `
      <strong>Documento:</strong> ${user.document}<br>
      <strong>Nombre:</strong> ${user.name}<br>
      <strong>Apellido:</strong> ${user.last_name}<br>
      <strong>Email:</strong> ${user.email}<br>
      <strong>Vehículos:</strong> ${
        user.vehicles && user.vehicles.length > 0
          ? user.vehicles.map((v) => v.vehicleType).join(', ')
          : 'No existe'
      }<br>
    `,
      icon: 'info',
      focusConfirm: false,
      showCancelButton: false,
      confirmButtonText: 'Cerrar',
    });
  }
}
