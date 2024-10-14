import {
  AfterViewInit,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { UserServiceService } from '../../../services/EmployeeService/user-service.service';
import { MovementEntryDto,SuppEmpDto } from '../../../models/EmployeeAllowed/user-alowed';
import { FormsModule } from '@angular/forms';
import { MoreInformationComponent } from '../more-information/more-information.component';
import { RegisterEntryComponent } from '../register-entry/register-entry.component';
import { NgFor, NgIf } from '@angular/common';
import $ from 'jquery';
import 'datatables.net';
import Swal from 'sweetalert2';
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
  observations: string = ''; // Agrega esta línea

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
        console.log(this.ListaUser); // Verifica que este log muestre los datos esperados
        this.initializeDataTable(); // Asegúrate de inicializar la tabla después de cargar los datos
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  private initializeDataTable(): void {
    const table = $('#myTable').DataTable({
      data: this.ListaUser,
      columns: [
        { data: 'name' },
        { data: 'document' },
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
        lengthMenu: 'Mostrar _MENU_ registros',
        zeroRecords: 'No se encontraron registros',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
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
  
    // Manejar el clic en el botón "Ver más"
    $('#myTable tbody').on('click', '.view-more', (event) => {
      const index = $(event.currentTarget).data('index');
      const user = this.ListaUser[index];
      this.showMoreInfoPopup(user);
    });
  
    // Manejar el cambio en el select de acción
    $('#myTable tbody').on('change', '.action-select', (event) => {
      const selectedValue = $(event.currentTarget).val(); // Obtener el valor seleccionado
      console.log(selectedValue);
      
      const document = $(event.currentTarget).data('document'); // Obtener el documento del usuario correspondiente
      const tr = $(event.currentTarget).closest('tr');
      const observations = $(tr).find('.observation').val(); // Obtener las observaciones de la fila
  
      // Crear el movimiento y enviarlo al servicio solo si se seleccionó una acción
      if (selectedValue) {
        const movement: MovementEntryDto = {
          description: String(observations || ''),
          movementDatetime: new Date().toISOString(), // Usa la fecha actual
          /* HARDCODEADO */
          vehiclesId: 0, // Puedes ajustar esto según tu lógica
          document: document, // Usar el documento del usuario
        };
        console.log(movement);
        
        
        // Guardar el movimiento en el servicio
        Swal.fire({
          title: 'Confirmar Ingreso',
          text: '¿Está seguro que desea registrar el ingreso?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, confirmar',
          cancelButtonText: 'Cancelar'
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            this.userService.registerEmpSupp(movement).subscribe({
              next: (response) => {
                console.log('Movimiento guardado exitosamente:', response);                
                Swal.fire({
                  title: '¡Éxito!',
                  text: 'El movimiento se ha registrado correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Cerrar'
                });
              },
              error: (error) => {
                console.error('Error al guardar el movimiento:', error);
                
                Swal.fire({
                  title: '¡Error!',
                  text: 'No se pudo registrar el movimiento. Inténtalo de nuevo.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar'
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
      focusConfirm: false,
      showCancelButton: false,
      confirmButtonText: 'Cerrar',
    });
  }
}
