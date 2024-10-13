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
import { AfterViewInit, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { AccesPdfGenerateService } from '../../../services/visitors/pdfService/acces-pdf-generate.service';


@Component({
  selector: 'app-access-table',
  standalone: true,
  imports: [DataTablesModule, CommonModule, HttpClientModule],
  templateUrl: './access-table.component.html',
  styleUrls: ['./access-table.component.css']
})
export class AccessTableComponent implements OnInit, AfterViewInit {
  @Input() selectedYear: number | null = null;
  @Input() selectedMonth: number | null = null;

  movements: any[] = [];
  table: any = null;
  exportButtonsEnabled: boolean = false; // Controla la habilitación de los botones

  constructor(private http: HttpClient, private pdfService: AccesPdfGenerateService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedYear'] || changes['selectedMonth']) {
      this.fetchData();
    }
  }

  fetchData(): void {
    if (this.selectedYear && this.selectedMonth) {
      this.http.get<any>(`http://localhost:8090/movements_entry/ByMonth?year=${this.selectedYear}&month=${this.selectedMonth}`)
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
      ordering: true,
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
        emptyTable: "No hay datos disponibles"
      },
      responsive: true,
    });
  }
  setupFilters(): void {
    $('#tipoIngresanteFilter, #nombreIngresanteFilter, #documentoFilter, #propietarioFilter').on('change keyup', () => {
      if (this.table) {
        this.table.draw();
      }
    });

    $.fn.dataTable.ext.search.push(
      (settings: any, data: string[], dataIndex: number) => {
        const tipoIngresante = ($('#tipoIngresanteFilter').val() as string || '').toLowerCase();
        const nombreIngresante = ($('#nombreIngresanteFilter').val() as string || '').toLowerCase();
        const documento = ($('#documentoFilter').val() as string || '').toLowerCase();
        const propietario = ($('#propietarioFilter').val() as string || '').toLowerCase();

       
        const tipoIngresanteMap: { [key: string]: string } = {
          'neighbour': 'vecino',
          'employee': 'empleado',
          'tenant': 'arrendatario',
          'visitor': 'visitante',
          'suplied': 'proveedor',
          'delivery': 'delivery'
        };

        const isTipoIngresanteMatch = tipoIngresante === '' || data[0].toLowerCase() === tipoIngresanteMap[tipoIngresante];
        
        return (
          isTipoIngresanteMatch &&
          data[1].toLowerCase().includes(nombreIngresante) &&
          data[2].toLowerCase().includes(documento) &&
          data[3].toLowerCase().includes(propietario)
        );
      }
    );

    this.table.on('draw', () => {
      const recordCount = this.table.rows({ filter: 'applied' }).count();
      this.exportButtonsEnabled = recordCount > 0; // Actualiza el estado de los botones
    });
  }

  loadDataIntoTable(): void {
    console.log('Movements:', this.movements);
    if (this.table) {
      this.table.clear();

      if (Array.isArray(this.movements) && this.movements.length > 0) {
        this.movements.forEach(movement => {
          this.table.row.add([
            movement.entryType || '',
            movement.visitorName || '',
            movement.visitorDocument || '',
            movement.neighborId || '',
            movement.hour || '',
            movement.day || '',
            movement.month || '',
            movement.year || ''
          ]);
        });
        this.exportButtonsEnabled = true; // Habilitar botones si hay datos
      } else {
        Swal.fire({
          icon: 'warning',
          title: '!No se encontraron registros!',
          
        });
        this.exportButtonsEnabled = false; // Deshabilitar botones si no hay datos
      }

      this.table.draw();
    } else {
      this.initializeDataTable(); 
    }
  }

  exportToExcel(): void {
    const tableElement = document.getElementById('myTable') as HTMLTableElement;
    if (this.exportButtonsEnabled) {
      this.pdfService.exportTableToExcel(tableElement, 'Reporte_Access');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No hay datos disponibles para exportar a Excel.',
      });
    }
  }

  exportToPdf(): void {
    const tableElement = document.getElementById('myTable') as HTMLTableElement;
    if (this.exportButtonsEnabled) {
      this.pdfService.exportTableToPdf(tableElement, 'Reporte_Access');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No hay datos disponibles para exportar a PDF.',
      });
    }
  }

  
}
