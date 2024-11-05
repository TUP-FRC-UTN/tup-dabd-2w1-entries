import { Component, Input, OnDestroy, OnInit, AfterViewInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AccessUserReportService } from '../../../../services/access_report/access-user-report.service';
import { forkJoin, map, Observable, of } from 'rxjs';

import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import 'datatables.net-buttons/js/dataTables.buttons.js';
import 'datatables.net-buttons/js/buttons.html5.js';
import 'datatables.net-buttons/js/buttons.print.js';
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import 'jszip';
import Swal from 'sweetalert2';

interface FilterValues {
  entryOrExit: string[];
  tipoIngresante: string[];
  nombreIngresante: string;
  documento: string;
  typeCar: string[];
  propietario: string;
  lateInRange: string[];
  plate: string;
  securityGuard: string;
  days: string[];
  selectedGuardia: number[];  
  selectedPropietario: number[];
}
@Component({
  selector: 'app-access-table',
  standalone: true,
  imports: [
    DataTablesModule, 
    CommonModule, 
    HttpClientModule,
    NgSelectModule,
    FormsModule
  ],
  templateUrl: './access-table.component.html',
  styleUrls: ['./access-table.component.css']
})
export class AccessTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedYear: number | null = null;
  @Input() selectedMonth: number | null = null;

  movements: any[] = [];
  table: any = null;
  exportButtonsEnabled: boolean = false;
  propietariosOptions: any[] = [];
  guardiasOptions: any[] = [];

  entryExitOptions = [
    { value: 'entry', label: 'Entrada' },
    { value: 'exit', label: 'Salida' }
  ];

  tiposIngresante = [
    { value: 'neighbour', label: 'Vecino' },
    { value: 'visitor', label: 'Visitante' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'constructionworker', label: 'Obrero' },
    { value: 'suplier', label: 'Proveedor' },
    { value: 'employee', label: 'Empleado' },
    { value: 'services', label: 'Servicios' }
  ];

  tiposVehiculo = [
    { value: 'car', label: 'Auto' },
    { value: 'motorcycle', label: 'Moto' },
    { value: 'truck', label: 'Camión' },
    { value: 'bike', label: 'Bicicleta' },
    { value: 'van', label: 'Camioneta' },
    { value: 'walk', label: 'Sin vehículo' }
  ];

  estadoHorarioOptions = [
    { value: 'inrange', label: 'En horario' },
    { value: 'late', label: 'Tarde' }
  ];

  daysOptions = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString()
  }));

  filterValues: FilterValues = {
    entryOrExit: [],
    tipoIngresante: [],
    nombreIngresante: '',
    documento: '',
    typeCar: [],
    propietario: '',
    lateInRange: [],
    plate: '',
    securityGuard: '',
    days: [],
    selectedGuardia: [],  // Inicializar como array vacío
    selectedPropietario: []
  };

  constructor(
    private http: HttpClient,
    private userService: AccessUserReportService
  ) {}

  ngOnInit(): void {
    this.loadSelectOptions();
    this.fetchData();
  }

  private loadSelectOptions(): void {
    this.userService.getPropietariosForSelect().subscribe(
      options => this.propietariosOptions = options
    );

    this.userService.getGuardiasForSelect().subscribe(
      options => this.guardiasOptions = options
    );
  }

  applyFilters(): void {
    if (this.table) {
      this.table.draw();
    }
  }

  clearFilters(): void {
    this.filterValues = {
      entryOrExit: [],
      tipoIngresante: [],
      nombreIngresante: '',
      documento: '',
      typeCar: [],
      propietario: '',
      lateInRange: [],
      plate: '',
      securityGuard: '',
      days: [],
      selectedGuardia: [],  // Inicializar como array vacío
      selectedPropietario: []
    };

    $('#nombreIngresanteFilter, #documentoFilter').val('');
    
    if (this.table) {
      this.table.draw();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedYear'] || changes['selectedMonth']) {
      this.fetchData();
    }
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
      while ($.fn.dataTable.ext.search.length > 0) {
        $.fn.dataTable.ext.search.pop();
      }
    }
    this.removeEventListeners();
    $('#excelBtn, #pdfBtn').off('click');
  }

  private removeEventListeners(): void {
    $('#nombreIngresanteFilter, #documentoFilter').off();
  }

  fetchData(): void {
    if (this.selectedYear && this.selectedMonth) {
      this.http.get<any>(`http://localhost:8090/movements_entryToNeighbor/ByMonth?year=${this.selectedYear}&month=${this.selectedMonth}`)
      .subscribe({
        next: (response) => {
          this.movements = response.data;
          this.loadDataIntoTable();
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Ocurrió un error al intentar cargar los datos. Por favor, intente nuevamente.',
          });
        }
      });
    } else {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      this.http.get<any>(`http://localhost:8090/movements_entryToNeighbor/ByMonth?year=${year}&month=${month}`)
      .subscribe({
        next: (response) => {
          this.movements = response.data;
          this.loadDataIntoTable();
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Ocurrió un error al intentar cargar los datos. Por favor, intente nuevamente.',
          });
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

  private setupExportButtons(): void {
    const buttons = new ($.fn.dataTable as any).Buttons(this.table, {
      buttons: [
        {
          extend: 'excel',
          text: 'Excel',
          className: 'buttons-excel d-none',
          filename: () => {
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const month = this.selectedMonth ? monthNames[this.selectedMonth - 1] : monthNames[new Date().getMonth()];
            return `Movimientos de ${month}`;
          },
          exportOptions: {
            columns: ':visible'
          },
          title: `LISTADO MENSUAL DE INGRESOS/EGRESOS - Fecha de emisión ${new Date().toLocaleDateString('es-AR')}`,
        },
        {
          extend: 'pdf',
          text: 'PDF',
          className: 'buttons-pdf d-none',
          filename: () => {
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const month = this.selectedMonth ? monthNames[this.selectedMonth - 1] : monthNames[new Date().getMonth()];
            return `Movimientos de ${month}`;
          },
          orientation: 'landscape',
          exportOptions: {
            columns: ':visible'
          },
          title: `LISTADO MENSUAL DE INGRESOS/EGRESOS - Fecha de emisión ${new Date().toLocaleDateString('es-AR')}`,
        }
      ]
    });

    this.table.buttons().container().appendTo('#myTable_wrapper');
  }

  setupFilters(): void {
    $('#nombreIngresanteFilter, #documentoFilter').on('keyup', (e) => {
      const target = $(e.target);
      const inputValue = target.val() as string;

      if (inputValue.length < 3) {
        switch(target.attr('id')) {
          case 'nombreIngresanteFilter':
            this.filterValues.nombreIngresante = '';
            break;
          case 'documentoFilter':
            this.filterValues.documento = '';
            break;
        }
      } else {
        switch(target.attr('id')) {
          case 'nombreIngresanteFilter':
            this.filterValues.nombreIngresante = inputValue;
            break;
          case 'documentoFilter':
            this.filterValues.documento = inputValue;
            break;
        }
      }

      if (this.table) {
        this.table.draw();
      }
    });

    $.fn.dataTable.ext.search.push(
      (settings: any, data: string[], dataIndex: number) => {
        return this.filterRow(data);
      }
    );
  }

  private filterRow(data: string[]): boolean {
    const [fecha, hora, tipoEntrada, tipoIngresante, nombre, documento, 
           observaciones, tipoVehiculo, placa, propietario, guardia, estadoHorario] = data;

    const mappings = {
      entry: 'entrada',
      exit: 'salida',
      neighbour: 'vecino',
      visitor: 'visitante',
      delivery: 'delivery',
      constructionworker: 'obrero',
      suplier: 'proveedor',
      employee: 'empleado',
      services: 'servicios',
      car: 'auto',
      motorcycle: 'moto',
      truck: 'camion',
      bike: 'bicicleta',
      van: 'camioneta',
      walk: 'sin vehículo',
      inrange: 'en horario',
      late: 'tarde'
    };

    if (this.filterValues.entryOrExit.length > 0 && 
        !this.filterValues.entryOrExit.some(value => 
          tipoEntrada.toLowerCase() === mappings[value as keyof typeof mappings])) {
      return false;
    }

    if (this.filterValues.tipoIngresante.length > 0 && 
        !this.filterValues.tipoIngresante.some(value => 
          tipoIngresante.toLowerCase() === mappings[value as keyof typeof mappings])) {
      return false;
    }

    if (this.filterValues.nombreIngresante && 
        !nombre.toLowerCase().includes(this.filterValues.nombreIngresante.toLowerCase())) {
      return false;
    }

    if (this.filterValues.documento && 
        !documento.toLowerCase().includes(this.filterValues.documento.toLowerCase())) {
      return false;
    }

    if (this.filterValues.typeCar.length > 0 && 
        !this.filterValues.typeCar.some(value => 
          tipoVehiculo.toLowerCase() === mappings[value as keyof typeof mappings])) {
      return false;
    }

    // Filtro de propietario con ng-select
    if (this.filterValues.selectedPropietario) {
      const propietarioOption = this.propietariosOptions.find(p => p.id === this.filterValues.selectedPropietario);
      if (propietarioOption && !propietario.toLowerCase().includes(propietarioOption.label.toLowerCase())) {
        return false;
      }
    }

    // Filtro de guardia con ng-select
    if (this.filterValues.selectedGuardia) {
      const guardiaOption = this.guardiasOptions.find(g => g.id === this.filterValues.selectedGuardia);
      if (guardiaOption && !guardia.toLowerCase().includes(guardiaOption.label.toLowerCase())) {
        return false;
      }
    }

    if (this.filterValues.plate && 
        !placa.toLowerCase().includes(this.filterValues.plate.toLowerCase())) {
      return false;
    }

    if (this.filterValues.lateInRange.length > 0 && 
        !this.filterValues.lateInRange.some(value => 
          estadoHorario.toLowerCase() === mappings[value as keyof typeof mappings])) {
      return false;
    }

    if (this.filterValues.days.length > 0) {
      const dayFromDate = fecha.split('/')[0].replace(/^0+/, '');
      if (!this.filterValues.days.includes(dayFromDate)) {
        return false;
      }
    }

    return true;
  }

  loadDataIntoTable(): void {
    if (this.table) {
      this.table.clear();

      if (Array.isArray(this.movements) && this.movements.length > 0) {
        this.userService.ensureCacheInitialized().then(() => {
          const processedMovements = this.movements.map(movement => {
            return new Promise<string[]>(resolve => {
              const transformations: Observable<string>[] = [
                of(movement.day + '/' + movement.month + '/' + movement.year),
                of(movement.hour || ''),
                of(movement.entryOrExit || ''),
                of(movement.entryType || ''),
                this.userService.transformNameOrId(movement.visitorName || ''),
                of(movement.visitorDocument || ''),
                of(movement.observations || ''),
                of(movement.carType || ''),
                of(movement.plate || ''),
                this.userService.getUserById(movement.neighborId),
                this.userService.getUserById(movement.securityId),
                of(movement.lateOrNot || '')
              ];

              forkJoin(transformations).subscribe({
                next: (results) => resolve(results),
                error: () => resolve([
                  movement.day + '/' + movement.month + '/' + movement.year,
                  movement.hour || '',
                  movement.entryOrExit || '',
                  movement.entryType || '',
                  movement.visitorName || '',
                  movement.documentType || '',
                  movement.visitorDocument || '',
                  movement.observations || '',
                  movement.carType || '',
                  movement.plate || '',
                  '------',
                  'Error de conexión',
                  movement.lateOrNot || ''
                ])
              });
            });
          });

          Promise.all(processedMovements).then(processedRows => {
            processedRows.forEach(row => {
              this.table.row.add(row);
            });

            this.exportButtonsEnabled = true;
            ['#excelBtn', '#pdfBtn'].forEach(btn => {
              $(btn).prop('disabled', false);
            });

            this.table.draw();
          });
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: '¡No se encontraron registros!',
        });
        this.exportButtonsEnabled = false;
        ['#excelBtn', '#pdfBtn'].forEach(btn => {
          $(btn).prop('disabled', true);
        });
      }
    }
  }

  initializeDataTable(): void {
    this.table = ($('#myTable') as any).DataTable({
      paging: true,
      ordering: false,
      pageLength: 5,
      lengthMenu: [[5, 10, 20], [5, 10, 20]], 
      scrollX: true,
      lengthChange: true,
      searching: true,
      info: true,
      autoWidth: false,
      language: {
        lengthMenu: " _MENU_ ",
        zeroRecords: "No se encontraron registros",
        info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "No se encontraron resultados",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        search: "Buscar:",
        emptyTable: "No se encontraron resultados",
      },
      responsive: true,
      dom: 'rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"l i> p><"clear">',
      drawCallback: function(settings: any) {
        const table = this;
        setTimeout(function() {
          // Manejo de Entrada/Salida
          $(table).find('td:nth-child(3)').each(function() {
            const cellText = $(this).text().trim().toLowerCase();
            if (cellText === 'entrada') {
              $(this).html(`
                <div class="d-flex justify-content-center">
                  <button type="button" class="btn rounded-pill w-75 d-flex align-items-center justify-content-center" 
                    style="background-color: #28a745; color: white; border: none; text-transform: uppercase;">
                    ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
                  </button>
                </div>
              `);
            } else if (cellText === 'salida') {
              $(this).html(`
                <div class="d-flex justify-content-center">
                  <button type="button" class="btn rounded-pill w-75 d-flex align-items-center justify-content-center" 
                    style="background-color: #dc3545; color: white; border: none; text-transform: uppercase;">
                    ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
                  </button>
                </div>
              `);
            }
          });

          $(table).find('td:nth-child(12)').each(function() {
            const estadoText = $(this).text().trim();
            if (estadoText === 'Tarde') {
              $(this).html(`
                <div class="d-flex justify-content-center">
                  <button type="button" class="btn rounded-pill w-75 d-flex align-items-center justify-content-center" 
                    style="background-color: #dc3545; color: white; border: none; min-width: 150px; white-space: nowrap;">
                    <span style="white-space: nowrap; display: inline-block;">Tarde</span>
                  </button>
                </div>
              `);
            } else if (estadoText.toLowerCase() === 'en horario') {
              $(this).html(`
                <div class="d-flex justify-content-center">
                  <button type="button" class="btn rounded-pill w-75 d-flex align-items-center justify-content-center" 
                    style="background-color: #28a745; color: white; border: none; min-width: 150px; white-space: nowrap;">
                    <span style="white-space: nowrap; display: inline-block;">En Horario</span>
                  </button>
                </div>
              `);
            }
          });
        }, 0);
      }
    });

    $('#excelBtn').on('click', () => {
      if (!this.exportButtonsEnabled) return;
      this.table.button('.buttons-excel').trigger();
    });

    $('#pdfBtn').on('click', () => {
      if (!this.exportButtonsEnabled) return;
      this.table.button('.buttons-pdf').trigger();
    });

    this.setupExportButtons();
  }
}