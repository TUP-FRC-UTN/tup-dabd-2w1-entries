import { Component, EventEmitter ,OnInit, AfterViewInit,ViewEncapsulation , inject  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';  

import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';

import Swal from 'sweetalert2';
import { Movement, UserAllowed } from '../../../services/visitors/movement.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultar',
  standalone: true,
  imports: [FormsModule,CommonModule,HttpClientModule ],
  templateUrl: './consultar.component.html',
  styleUrl: './consultar.component.css',
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None 
})

export class ConsultarComponent implements OnInit,AfterViewInit {
  
  exportButtonsEnabled: boolean = false;
  movements: Movement[] = [];
  table: any = null;
  selectedDate: string | null = null;
  todayDate: string = '';
  private http = inject(HttpClient);
  popupAbierto = false;
  constructor(  private datePipe: DatePipe, private router: Router ) {}
  
  navigateToComponent(event: any) {
    const selectedValue = event.target.value;
    this.router.navigate([selectedValue]);
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
  

      $('#tablaconsulta tbody').on('click', '.view-more-btn', (event: any) => {
        const index = $(event.currentTarget).data('index');
        const selectedUser = this.movements[index].user_allowed;
  
        this.viewuser(selectedUser);
      });
    });
  }
  ngOnInit(): void {
    this.setTodayDate(); 
    this.fetchMovements();
     // Llamada a tu servicio que obtiene los movimientos
  }
  setTodayDate(): void {
    const currentDate = new Date();
    this.todayDate = this.datePipe.transform(currentDate  , 'yyyy-MM-dd') || '';  // Formato compatible con el input de tipo date
    this.selectedDate = this.todayDate ; 
  } 
  onDateFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value;

    if (selectedDate) {
      this.selectedDate = selectedDate;  // Almacenar la fecha seleccionada
      this.fetchMovements();  // Volver a obtener los movimientos con la nueva fecha
    }
  }
  fetchMovements(): void {
    const fechaParam = this.selectedDate ? this.selectedDate : '2024-04-03';  // Default en caso de que no haya selección
    this.http.get<any>(`http://localhost:8090/movements_entry/By?fecha=${fechaParam}`)
      .subscribe({
        next: (response) => {
          this.movements = response;
          this.loadDataIntoTable();  // Cargar los datos en la tabla
        },
        error: (error) => {
          Swal.fire({
            icon: 'warning',
            title: 'Error al obtener los ingresos',
            text: 'No hay movimientos para ese dia',

          });
        }
      });
  }
  initializeDataTable(): void {
    this.table = ($('#tablaconsulta') as any).DataTable({
      paging: true,
      ordering: true,
      pageLength: 10,
      lengthChange: true,
      searching: true,
      info: true,
      autoWidth: false,
      language: {
        lengthMenu: "Mostrar _MENU_ registros",
        zeroRecords: "No se encontraron registros",
        search: "Buscar:",
     
        emptyTable: "No hay datos disponibles"
      },
      responsive: true
    });
  }
  loadDataIntoTable(): void {
   
    if (this.table) {
      this.table.clear();  
      if (Array.isArray(this.movements) && this.movements.length > 0) {
         this.movements.forEach((movement, index) => {
          const userAllowed = movement.user_allowed;
          this.table.row.add([
            'Ingreso',  
            `${movement.user_allowed.name} ${movement.user_allowed.last_name}`, 
            movement.user_allowed.document || '',
            movement.observations || '', 
            movement.vehicle ? movement.vehicle.plate : 'ingreso a pata ', 
            movement.movementDatetime ? new Date(movement.movementDatetime).toLocaleTimeString() : '',
            new Date(movement.movementDatetime).toLocaleDateString(),
            `<button class="btn btn-info btn-sm view-more-btn" data-index="${index}">Ver más</button>`
            
          ]);
        });
  
        this.exportButtonsEnabled = true; // Habilitar botones si hay datos
      } else {

        this.exportButtonsEnabled = false; // Deshabilitar botones si no hay datos
      }
  
      this.table.draw(); // Redibujar la tabla con los nuevos datos
    } else {
      this.initializeDataTable(); // Inicializar la tabla si aún no está creada
    }
  }
  addViewMoreEventListeners(): void {
    const buttons = document.querySelectorAll('.view-more-btn') as NodeListOf<HTMLButtonElement>;
    
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        const index = parseInt(button.getAttribute('data-index') || '0', 10);
        const selectedUser = this.movements[index].user_allowed;
  
        this.viewuser(selectedUser);
      });
    });
  }
  printTable(): void {
    const tableElement = document.getElementById('tablaconsulta') as HTMLTableElement;
    const win = window.open('', '_blank');

    // Comprueba si 'win' es null
    if (win) {
        win.document.write('<html><head><title>Imprimir Tabla</title></head><body>');
        win.document.write(tableElement.outerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    } else {
        
    }
  }
  viewuser(selectedUser: UserAllowed) {
    
  if (selectedUser) {
    const  vehiculos = `Ninguno`;
    if (selectedUser.vehicles != null) {
      const  vehiculos = `<strong>Vehículos:</strong> ${selectedUser.vehicles.join(', ')}`;
    }
    
    const userInfo = `
    <strong>Documento:</strong> ${selectedUser.document}<br>
    <strong>Nombre:</strong> ${selectedUser.name}<br>
    <strong>Apellido:</strong> ${selectedUser.last_name}<br>
    <strong>Email:</strong> ${selectedUser.email}<br>
    <strong>Vehículos:</strong> ${vehiculos}<br>
  `;
    Swal.fire({
        title: 'Información del Usuario',
        html: userInfo,
        icon: 'info',
        confirmButtonText: 'Cerrar'
    });
} else {
    console.error('Usuario seleccionado no encontrado');
}

  }
  cerrarPopup() {
    this.popupAbierto = false;}
    
  
}
