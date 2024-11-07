import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AccessUserReportService } from '../../../../services/access_report/access-user-report.service';
import { forkJoin, Observable, of } from 'rxjs';

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
  unifiedSearch: string;
  typeCar: string[];
  lateInRange: string[];
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
  anios: number[] = [];
  meses: number[] = [];
  selectedYear: number | null = null;
  selectedMonth: number | null = null;

  movements: any[] = [];
  table: any = null;
  exportButtonsEnabled: boolean = false;
  propietariosOptions: any[] = [];
  guardiasOptions: any[] = [];

  entryExitOptions = [
    { value: 'entrada', label: 'Entrada' },
    { value: 'salida', label: 'Salida' }
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
    unifiedSearch: '',
    typeCar: [],
    lateInRange: [],
    days: [],
    selectedGuardia: [],
    selectedPropietario: []
  };

  constructor(
    private http: HttpClient,
    private userService: AccessUserReportService
  ) {
    this.initializeYears();
    this.initializeMonths();
  }

  private initializeYears() {
    const currentYear = new Date().getFullYear();
    this.anios = Array.from({ length: 5 }, (_, i) => currentYear - i);
  }

  private initializeMonths() {
    this.meses = Array.from({ length: 12 }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.loadSelectOptions();
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear();
    this.selectedMonth = currentDate.getMonth() + 1;
    this.fetchData();
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.fetchData();
  }

  onMonthChange(month: number): void {
    this.selectedMonth = month;
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
      unifiedSearch: '',
      typeCar: [],
      lateInRange: [],
      days: [],
      selectedGuardia: [],
      selectedPropietario: []
    };

    $('#unifiedSearchFilter').val('');
    
    if (this.table) {
      this.table.draw();
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
    $('#unifiedSearchFilter').off();
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
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
      this.setupFilters();
    });
  }

  private setupExportButtons(): void {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    const formattedDateForFilename = formattedDate.replace(/\//g, '-');
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentMonth = this.selectedMonth ? monthNames[this.selectedMonth - 1] : monthNames[new Date().getMonth()];
  
    const buttons = new ($.fn.dataTable as any).Buttons(this.table, {
      buttons: [
        {
          extend: 'excel',
          text: 'Excel',
          className: 'buttons-excel d-none',
          filename: () => {
            return `${formattedDateForFilename}. Movimientos del mes de ${currentMonth}`;
          },
          exportOptions: {
            columns: ':visible'
          },
          messageTop: `Movimientos del mes de ${currentMonth}\nFecha de emisión: ${formattedDate}`,
          title: 'LISTADO MENSUAL DE INGRESOS/EGRESOS',
          customize: function(xlsx: any) {
            const sheet = xlsx.xl.worksheets['sheet1.xml'];
            $('row:first c', sheet).attr('s', '48');
            $('row c[r^="A1"]', sheet).attr('s', '51');
          },
        },
        {
          extend: 'pdf',
          text: 'PDF',
          className: 'buttons-pdf d-none',
          filename: () => {
            return `${formattedDateForFilename}. Movimientos del mes de ${currentMonth}`;
          },
          orientation: 'landscape',
          exportOptions: {
            columns: ':visible'
          },
          customize: function(doc: any) {
            doc.content[1].table.headerRows = 1;
            doc.content[1].table.body[0].forEach((cell: any) => {
              cell.fillColor = '#25B79D';
              cell.color = '#FFFFFF';
            });
            
            doc.content[0] = {
              text: 'LISTADO MENSUAL DE INGRESOS/EGRESOS',
              alignment: 'left',
              fontSize: 14,
              bold: true,
              margin: [0, 0, 0, 10]
            };
            
            doc.content.splice(1, 0, {
              text: `Movimientos del mes de: ${currentMonth}`,
              alignment: 'left',
              fontSize: 12,
              margin: [0, 0, 0, 5]
            });
          },
          title: 'LISTADO MENSUAL DE INGRESOS/EGRESOS'
        }
      ]
    });
  
    this.table.buttons().container().appendTo('#myTable_wrapper');
  }

  setupFilters(): void {
    $('#unifiedSearchFilter').on('keyup', (e) => {
      const target = $(e.target);
      const inputValue = target.val() as string;

      if (inputValue.length < 3) {
        this.filterValues.unifiedSearch = '';
      } else {
        this.filterValues.unifiedSearch = inputValue;
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

    if (this.filterValues.unifiedSearch) {
      const searchTerm = this.filterValues.unifiedSearch.toLowerCase();
      const matchesNombre = nombre.toLowerCase().includes(searchTerm);
      const matchesDocumento = documento.toLowerCase().includes(searchTerm);
      const matchesPlaca = placa.toLowerCase().includes(searchTerm);
      
      if (!matchesNombre && !matchesDocumento && !matchesPlaca) {
        return false;
      }
    }

    const mappings = {
      entrada: 'entrada',
      salida: 'salida',
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
          tipoEntrada.toLowerCase() === value.toLowerCase())) {
      return false;
    }

    if (this.filterValues.tipoIngresante.length > 0 && 
        !this.filterValues.tipoIngresante.some(value => 
          tipoIngresante.toLowerCase() === mappings[value as keyof typeof mappings])) {
      return false;
    }

    if (this.filterValues.typeCar.length > 0 && 
        !this.filterValues.typeCar.some(value => 
          tipoVehiculo.toLowerCase() === mappings[value as keyof typeof mappings])) {
      return false;
    }

    if (this.filterValues.selectedPropietario && this.filterValues.selectedPropietario.length > 0) {
      const propietarioMatches = this.filterValues.selectedPropietario.some(selectedId => {
        const propietarioOption = this.propietariosOptions.find(p => p.id === selectedId);
        return propietarioOption && propietario.toLowerCase().includes(propietarioOption.label.toLowerCase());
      });
      if (!propietarioMatches) return false;
    }

    if (this.filterValues.selectedGuardia && this.filterValues.selectedGuardia.length > 0) {
      const guardiaMatches = this.filterValues.selectedGuardia.some(selectedId => {
        const guardiaOption = this.guardiasOptions.find(g => g.id === selectedId);
        return guardiaOption && guardia.toLowerCase().includes(guardiaOption.label.toLowerCase());
      });
      if (!guardiaMatches) return false;
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
        ordering: true,
        pageLength: 5,
        lengthMenu: [[5, 10, 25,50 ], [5, 10, 25, 50]], 
        scrollX: true,
        lengthChange: true,
        orderCellsTop: true,
        order: [],
        columnDefs: [
            { 
                targets: 11, // Columna Estado
                className: 'text-center'
            },
            {
                targets: 9, // Columna Propietario (0-based index)
                render: function(data: any, type: any, row: any) {
                    if (data === '------') {
                        return '<div class="text-center">------</div>';
                    }
                    return data;
                }
            }
        ],
        searching: true,
        info: true,
        autoWidth: false,
        language: {
            lengthMenu: " _MENU_ ",
            zeroRecords: "No se encontraron registros",
            info: "",
            infoEmpty: "",
            infoFiltered: "",
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
                                <span class="badge rounded-pill d-flex align-items-center justify-content-center" 
                                    style="background-color: #28a745; color: white; border: none;">
                                    ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
                                </span>
                            </div>
                        `);
                    } else if (cellText === 'salida') {
                        $(this).html(`
                            <div class="d-flex justify-content-center">
                                <span class="badge rounded-pill d-flex align-items-center justify-content-center" 
                                    style="background-color: #dc3545; color: white; border: none;">
                                    ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
                                </span>
                            </div>
                        `);
                    }
                });
                $(table).find('td:nth-child(12)').each(function() {
                    const estadoText = $(this).text().trim();
                    if (estadoText === 'Tarde') {
                        $(this).html(`
                            <div class="d-flex justify-content-center">
                                <span class="badge rounded-pill d-flex align-items-center justify-content-center" 
                                    style="background-color: #dc3545; color: white; border: none;">
                                    <span style="white-space: nowrap; display: inline-block;">Tarde</span>
                                </span>
                            </div>
                        `);
                    } else if (estadoText.toLowerCase() === 'en horario') {
                        $(this).html(`
                            <div class="d-flex justify-content-center">
                                <span class="badge rounded-pill d-flex align-items-center justify-content-center" 
                                    style="background-color: #28a745; color: white; border: none;">
                                    <span style="white-space: nowrap; display: inline-block;">En Horario</span>
                                </span>
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