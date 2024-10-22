/// <reference types="datatables.net" />
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import 'jszip';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { AccesPdfGenerateService } from '../../../../services/visitors/pdfService/acces-pdf-generate.service';
import 'datatables.net-buttons/js/dataTables.buttons.js';
import 'datatables.net-buttons/js/buttons.html5.js';
import 'datatables.net-buttons/js/buttons.print.js';

@Component({
  selector: 'app-access-table',
  standalone: true,
  imports: [DataTablesModule, CommonModule, HttpClientModule],
  templateUrl: './access-table.component.html',
  styleUrl: './access-table.component.css'
})
export class AccessTableComponent implements OnInit, AfterViewInit, OnDestroy{
  

  @Input() selectedYear: number | null = null;
  @Input() selectedMonth: number | null = null;

  movements: any[] = [];
  table: any = null;
  exportButtonsEnabled: boolean = false; // Controla la habilitación de los botones

  constructor(private http: HttpClient, private pdfService: AccesPdfGenerateService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy() {
    // Limpiar la tabla y los filtros cuando el componente se destruye
    if (this.table) {
      this.table.destroy();
      // Remover todos los filtros personalizados
      while ($.fn.dataTable.ext.search.length > 0) {
        $.fn.dataTable.ext.search.pop();
      }
    }
    // Remover los event listeners
    $('#typeEntryOrExitFilter, #tipoIngresanteFilter, #nombreIngresanteFilter, #documentoFilter, #typecarFilter, #late-inRangeFilter').off();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedYear'] || changes['selectedMonth']) {
      this.fetchData();
    }
  }

  fetchData(): void {
    if (this.selectedYear && this.selectedMonth) {
      this.http.get<any>(`http://localhost:8090/movements_entryToHood/ByMonth?year=${this.selectedYear}&month=${this.selectedMonth}`)
        .subscribe({
          next: (response) => {
            console.log('API Response:', response);
            this.movements = response.data;
            this.loadDataIntoTable();
          },
          error: (error) => {
            console.error('Error fetching data:', error);
          }
        });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
      this.setupFilters();
    });
  }

  initializeDataTable(): void {
    this.table = ($('#myTable') as any).DataTable({
      paging: true,
      ordering: false,
      pageLength: 10,
      lengthChange: true,
      searching: true,
      info: true,
      autoWidth: false,
      language: {
        lengthMenu: "Mostrar _MENU_ registros",
        zeroRecords: "No se encontraron registros",
        info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "No hay registros disponibles",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        search: "Buscar:",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        },
        emptyTable: "No hay datos disponibles",
      },
      responsive: true,
      dom: 'Bfrtip', // Esto habilita los botones en la parte superior
      buttons: [
        {
          extend: 'excel',
          text: '<i class="fas fa-file-excel"></i> Excel',
          className: 'btn btn-success ms-2', // Aplicando estilo de Bootstrap
          titleAttr: 'Exportar a Excel'
        },
        {
          extend: 'pdf',
          text: '<i class="fas fa-file-pdf"></i> PDF',
          className: 'btn btn-danger ms-2', // Aplicando estilo de Bootstrap
          titleAttr: 'Exportar a PDF',
          orientation: 'portrait',
          pageSize: 'A4'
        },
        {
          extend: 'print',
          text: '<i class="fas fa-print"></i> Imprimir',
          className: 'btn btn-primary ms-2', // Aplicando estilo de Bootstrap
          titleAttr: 'Imprimir tabla'
        }
      ]
    });
  }
  
  setupFilters(): void {
    $('#typeEntryOrExitFilter, #tipoIngresanteFilter, #nombreIngresanteFilter, #documentoFilter, #typecarFilter, #late-inRangeFilter').off('change keyup');
    
    $('#typeEntryOrExitFilter, #tipoIngresanteFilter, #nombreIngresanteFilter, #documentoFilter,#typecarFilter, #late-inRangeFilter').on('change keyup', () => {
      if (this.table) {
        this.table.draw();
      }
    });
  
    $.fn.dataTable.ext.search.push(
      (settings: any, data: string[], dataIndex: number) => {
        const entryOrExit = ($('#typeEntryOrExitFilter').val() as string || '').toLowerCase();
        const tipoIngresante = ($('#tipoIngresanteFilter').val() as string || '').toLowerCase();
        const nombreIngresante = ($('#nombreIngresanteFilter').val() as string || '').toLowerCase();
        const documento = ($('#documentoFilter').val() as string || '').toLowerCase();
        const carType = ($('#typecarFilter').val() as string || '').toLowerCase();
         const lateInRange = ($('#late-inRangeFilter').val() as string || '').toLowerCase();
  


        const lateInRangeMap: { [key: string]: string } = {

          'inrange': 'en horario',
          'late': 'tarde',
          
  
        };


        const typeCarMap: { [key: string]: string } = {
          'car': 'auto',
          'motorcycle': 'moto',
          'truck': 'camion',
          'bike': 'bicicleta',
          'van': 'camioneta',
          };

        const entryOrExitmap: { [key: string]: string } = {
          'entry': 'entrada',
          'exit': 'salida'
         
        };
  
        // Mapa de tipos de ingresantes
        const tipoIngresanteMap: { [key: string]: string } = {

          'neighbour': 'vecino',
          'employee': 'empleado',     
          'suplied': 'proveedor',
          'delivery': 'delivery',
          'constructionWorker': 'obrero'
        };

         // Mapa de tipos de entrada
      
        // Verifica que el filtro solo aplique si se introducen al menos 3 caracteres
        const isEntryOrExitMatch = entryOrExit === '' || data[0].toLowerCase() === entryOrExitmap[entryOrExit];
        const isTipoIngresanteMatch = tipoIngresante === '' || data[1].toLowerCase() === tipoIngresanteMap[tipoIngresante];
        const isNombreIngresanteMatch = nombreIngresante.length < 3 || data[2].toLowerCase().includes(nombreIngresante);
        const isDocumentoMatch = documento.length < 3 || data[3].toLowerCase().includes(documento);
        const isTypeCarMatch = carType === '' || data[5].toLowerCase() === typeCarMap[carType];
        const isLateInRangeMatch = lateInRange === '' || data[7].toLowerCase() === lateInRangeMap[lateInRange];
  
       

        return (
          isEntryOrExitMatch &&
          isTipoIngresanteMatch &&
          isNombreIngresanteMatch &&
          isDocumentoMatch &&
          isTypeCarMatch &&
          isLateInRangeMatch
        );
      }
    );
  
    this.table.on('draw', () => {
      const recordCount = this.table.rows({ filter: 'applied' }).count();
      this.exportButtonsEnabled = recordCount > 0; 
    });
  }

  loadDataIntoTable(): void {
    console.log('Movements:', this.movements);
    if (this.table) {
      this.table.clear();

      if (Array.isArray(this.movements) && this.movements.length > 0) {
        this.movements.forEach(movement => {
          this.table.row.add([
            movement.entryOrExit || '',
            movement.entryType || '',
            movement.visitorName || '',
            movement.visitorDocument || '',
            movement.observations || '',
            movement.carType || '',
            movement.plate || '',
            movement.lateOrNot || '',
            movement.hour || '',
            movement.day  + '/' +movement.month  + '/' + movement.year ,
          
          ]);
        });
        this.exportButtonsEnabled = true; 
      } else {
        Swal.fire({
          icon: 'warning',
          title: '!No se encontraron registros!',
          
        });
        this.exportButtonsEnabled = false; 
      }

      this.table.draw();
    } else {
      this.initializeDataTable(); 
    }
  }


}
  
