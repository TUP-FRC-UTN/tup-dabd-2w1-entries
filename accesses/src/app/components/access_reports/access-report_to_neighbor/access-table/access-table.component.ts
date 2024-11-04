import { Component, Input, OnDestroy, OnInit, AfterViewInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';

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
  entryOrExit: Set<string>;
  tipoIngresante: Set<string>;
  nombreIngresante: string;
  tipodocumento: string;
  documento: string;
  typeCar: Set<string>;
  propietario: string;
  lateInRange: Set<string>;
  plate: string;
  days: Set<string>;
}

@Component({
  selector: 'app-access-table',
  standalone: true,
  imports: [DataTablesModule, CommonModule, HttpClientModule],
  templateUrl: './access-table.component.html',
  styleUrls: ['./access-table.component.css']
})
export class AccessTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedYear: number | null = null;
  @Input() selectedMonth: number | null = null;

  movements: any[] = [];
  table: any = null;
  exportButtonsEnabled: boolean = false;
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);


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

  filterValues: FilterValues = {
    entryOrExit: new Set<string>(),
    tipoIngresante: new Set<string>(),
    nombreIngresante: '',
    tipodocumento: '',
    documento: '',
    typeCar: new Set<string>(),
    propietario: '',
    lateInRange: new Set<string>(),
    plate: '',
    days: new Set<string>()
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
    
  }



  applyModalFilters(): void {
   
    
      this.table.draw();
    
  }

  clearModalFilters(): void {
    // Limpiar checkboxes dentro del modal
    const modalCheckboxes = document.querySelectorAll('#advancedFiltersModal input[type="checkbox"]');
    modalCheckboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });

    // Limpiar los sets en filterValues
    this.filterValues.entryOrExit.clear();
    this.filterValues.tipoIngresante.clear();
    this.filterValues.typeCar.clear();
    this.filterValues.lateInRange.clear();
    this.filterValues.days.clear();

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
    $('#nombreIngresanteFilter, #documentoFilter, #propietarioFilter, #placaFilter').off();
    $('.form-check-input').off();
  }

  clearFilters(): void {
    // Limpiar inputs de texto
    $('#nombreIngresanteFilter, #documentoFilter, #propietarioFilter, #placaFilter').val('');
    
    // Limpiar checkboxes del modal
    const modalCheckboxes = document.querySelectorAll('#advancedFiltersModal input[type="checkbox"]');
    modalCheckboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });

    // Restablecer filterValues
    this.filterValues = {
      entryOrExit: new Set<string>(),
      tipoIngresante: new Set<string>(),
      nombreIngresante: '',
      tipodocumento: '',
      documento: '',
      typeCar: new Set<string>(),
      propietario: '',
      lateInRange: new Set<string>(),
      plate: '',
      days: new Set<string>()
    };
    
    if (this.table) {
      this.table.draw();
    }
  }

  fetchData(): void {
    if (this.selectedYear && this.selectedMonth) {
      this.http.get<any>(`http://localhost:8090/movements_entryToNeighbor/ByMonth?year=${this.selectedYear}&month=${this.selectedMonth}`)
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);
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
  else {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    this.http.get<any>(`http://localhost:8090/movements_entryToNeighbor/ByMonth?year=${year}&month=${month}`)
    .subscribe({
      next: (response) => {
        console.log('API Response:', response);
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
        $(table).find('td:nth-child(3)').each(function() {
          const cellText = $(this).text().trim().toLowerCase();
          if (cellText === 'entrada') {
            $(this).html(`
              <div class="d-flex justify-content-center">
                <button type="button" class="btn rounded-pill w-75" 
                  style="background-color: #28a745; color: white; border: none; text-transform: uppercase;">
                  ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
                </button>
              </div>
            `);
          } else if (cellText === 'salida') {
            $(this).html(`
              <div class="d-flex justify-content-center">
                <button type="button" class="btn rounded-pill w-75" 
                  style="background-color: #dc3545; color: white; border: none; text-transform: uppercase;">
                  ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
                </button>
              </div>
            `);
          }
        });
        $(table).find('td:nth-child(13)').each(function() {
          const estadoText = $(this).text().trim();
          if (estadoText === 'Tarde') {
            $(this).css("color", "red");
            $(this).html(`<i class="fa-solid fa-triangle-exclamation"></i> ${estadoText}`);
          } else if (estadoText === 'En horario') {
            $(this).css("color", "green");
            $(this).html(`<i class="fa-solid fa-circle-check"></i> ${estadoText}`);
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
        title: `LISTADO MENSUAL DE INGRESOS/EGRESOS - 
                Fecha de emisión ${new Date().toLocaleDateString('es-AR')}`,
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
        title: `LISTADO MENSUAL DE INGRESOS/EGRESOS - 
                Fecha de emisión ${new Date().toLocaleDateString('es-AR')}`,
      }
    ]
  });

  this.table.buttons().container().appendTo('#myTable_wrapper');
}

setupFilters(): void {
  // Configurar filtros de texto
  $('#nombreIngresanteFilter, #documentoFilter, #propietarioFilter, #placaFilter').on('keyup', (e) => {
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
        case 'propietarioFilter':
          this.filterValues.propietario = '';
          break;
        case 'placaFilter':
          this.filterValues.plate = '';
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
        case 'propietarioFilter':
          this.filterValues.propietario = inputValue;
          break;
        case 'placaFilter':
          this.filterValues.plate = inputValue;
          break;
      }
    }

    if (this.table) {
      this.table.draw();
    }
  });

  // Configurar checkboxes del modal
  $('.form-check-input').on('change', (e) => {
    const checkbox = $(e.target);
    const value = checkbox.val() as string;
    const isChecked = checkbox.prop('checked');
    const checkboxId = checkbox.attr('id');

    if (checkboxId?.includes('day')) {
      this.updateFilterSet('days', value, isChecked);
    } else if (['entryCheck', 'exitCheck'].includes(checkboxId || '')) {
      this.updateFilterSet('entryOrExit', value, isChecked);
    } else if (this.tiposIngresante.some(tipo => tipo.value === checkboxId)) {
      this.updateFilterSet('tipoIngresante', value, isChecked);
    } else if (this.tiposVehiculo.some(tipo => tipo.value === checkboxId)) {
      this.updateFilterSet('typeCar', value, isChecked);
    } else if (['inrangeCheck', 'lateCheck'].includes(checkboxId || '')) {
      this.updateFilterSet('lateInRange', value, isChecked);
    }

    if (this.table) {
      this.table.draw();
    }
  });

  // Configurar filtro de DataTables
  $.fn.dataTable.ext.search.push(
    (settings: any, data: string[], dataIndex: number) => {
      return this.filterRow(data);
    }
  );
}

private updateFilterSet(filterName: keyof FilterValues, value: string, isChecked: boolean): void {
  const filter = this.filterValues[filterName];
  if (filter instanceof Set) {
    if (isChecked) {
      filter.add(value.toLowerCase());
    } else {
      filter.delete(value.toLowerCase());
    }
  }
}

private filterRow(data: string[]): boolean {
  const [fecha, hora, tipoEntrada, tipoIngresante, nombre, typeDocumento, documento, 
         observaciones, tipoVehiculo, placa, propietario, guardia, estadoHorario] = data;

  // Mapeo de valores para comparación
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

  // Verificar cada filtro
  if (this.filterValues.entryOrExit.size > 0 && 
      !Array.from(this.filterValues.entryOrExit).some(value => 
        tipoEntrada.toLowerCase() === mappings[value as keyof typeof mappings])) {
    return false;
  }

  if (this.filterValues.tipoIngresante.size > 0 && 
      !Array.from(this.filterValues.tipoIngresante).some(value => 
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

  if (this.filterValues.typeCar.size > 0 && 
      !Array.from(this.filterValues.typeCar).some(value => 
        tipoVehiculo.toLowerCase() === mappings[value as keyof typeof mappings])) {
    return false;
  }

  if (this.filterValues.propietario && 
      !propietario.toLowerCase().includes(this.filterValues.propietario.toLowerCase())) {
    return false;
  }

  if (this.filterValues.plate && 
      !placa.toLowerCase().includes(this.filterValues.plate.toLowerCase())) {
    return false;
  }

  if (this.filterValues.lateInRange.size > 0 && 
      !Array.from(this.filterValues.lateInRange).some(value => 
        estadoHorario.toLowerCase() === mappings[value as keyof typeof mappings])) {
    return false;
  }

  if (this.filterValues.days.size > 0) {
    const dayFromDate = fecha.split('/')[0].replace(/^0+/, '');
    if (!Array.from(this.filterValues.days).some(value => 
        dayFromDate === value)) {
      return false;
    }
  }

  return true;
}

loadDataIntoTable(): void {
  if (this.table) {
    this.table.clear();

    if (Array.isArray(this.movements) && this.movements.length > 0) {
      this.movements.forEach(movement => {
        this.table.row.add([
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
          movement.neighborId || '',
          'Garcia, ireneg',
          movement.lateOrNot || '',
        ]);
      });

      this.exportButtonsEnabled = true;
      ['#excelBtn', '#pdfBtn'].forEach(btn => {
        $(btn).prop('disabled', false);
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

    this.table.draw();
  }
}
}