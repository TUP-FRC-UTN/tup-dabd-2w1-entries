import { Component, OnDestroy, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AccessUserReportService } from '../../../../services/access_report/access-user-report.service';
import { forkJoin, Observable, of, firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { FilterValues, Movement } from '../../../../models/access-report/Types';
import { DataTableConfigService } from '../../../../services/access_report/access_datatableconfig/data-table-config.service';
import { ExportService } from '../../../../services/access_report/access-export/export.service';
import { ENTRY_EXIT_OPTIONS, TIPOS_INGRESANTE, TIPOS_VEHICULO, USER_TYPE_MAPPINGS, VALUE_MAPPINGS } from '../../../../models/access-report/constants';
import { AccessRegistryUpdateService } from '../../../../services/access-registry-update/access-registry-update.service';
import { AccessVisitorRegistryComponent } from '../../../access_visitors/access-visitor-registry/access-visitor-registry.component';

@Component({
  selector: 'app-access-table',
  standalone: true,
  imports: [DataTablesModule, CommonModule, HttpClientModule, NgSelectModule, FormsModule, AccessVisitorRegistryComponent],
  templateUrl: './access-table.component.html',
  styleUrls: ['./access-table.component.css']
})
export class AccessTableComponent implements OnInit, AfterViewInit, OnDestroy {
  // Propiedades para manejo de fechas
  anios: number[] = [];
  meses: number[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;
  today: Date = new Date(); 

  // propiedad para trackear el filtro activo
  activeFilter: string | null = null;

  activeUserTypeFilters: Set<string> = new Set();

  // Propiedades para datos y tabla
  movements: Movement[] = [];
  table: any = null;
  exportButtonsEnabled: boolean = false;

  // Opciones para selectores
  propietariosOptions: any[] = [];
  guardiasOptions: any[] = [];

  // Importamos las opciones constantes desde el archivo de constantes
  entryExitOptions = ENTRY_EXIT_OPTIONS;
  tiposIngresante = TIPOS_INGRESANTE;
  tiposVehiculo = TIPOS_VEHICULO;

  // Estado inicial de los filtros
  filterValues: FilterValues = {
    entryOrExit: [],
    tipoIngresante: [],
    unifiedSearch: '',
    typeCar: [],
    selectedGuardia: [],
    selectedPropietario: []
  };

  constructor(
    private http: HttpClient,
    private userService: AccessUserReportService,
    private dataTableConfig: DataTableConfigService,
    private exportService: ExportService
  ) {
    this.initializeDates();
  }
 
  /**
   * Inicializa las fechas por defecto (último mes)
   */
  private initializeDates(): void {
    const today = new Date();
    this.endDate = today;
    
    // Calcular la fecha de inicio (un mes antes)
    this.startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  }

  /**
   * Manejadores para los cambios de fecha
   */
  onStartDateChange(date: string): void {
    const selectedDate = new Date(date);
    if (selectedDate > this.today) {
      this.startDate = this.today;
    } else {
      this.startDate = selectedDate;
    }
    this.fetchData();
  }

  onEndDateChange(date: string): void {
    const selectedDate = new Date(date);
    if (selectedDate > this.today) {
      this.endDate = this.today;
    } else {
      this.endDate = selectedDate;
    }
    this.fetchData();
  }

  toggleUserTypeFilter(userType: string): void {
    if (this.activeUserTypeFilters.has(userType)) {
      this.activeUserTypeFilters.delete(userType);
    } else {
      this.activeUserTypeFilters.add(userType);
    }
    
    // Actualizar los filtros usando el nuevo mapeo
    this.filterValues.tipoIngresante = Array.from(this.activeUserTypeFilters)
      .map(type => USER_TYPE_MAPPINGS[type]?.filterValue)
      .filter(v => v);

    if (this.table) {
      this.table.draw();
    }
  }

  // Método para verificar si un botón está activo
  isUserTypeFilterActive(userType: string): boolean {
    return this.activeUserTypeFilters.has(userType);
  }

  private readonly registryUpdate = inject(AccessRegistryUpdateService);

  /**
   * Inicialización del componente
   * Carga las opciones de los selectores y obtiene los datos iniciales
   */
  ngOnInit(): void {
    this.registryUpdate.getObservable().subscribe(() => {
      this.loadSelectOptions();
      this.fetchData();
    });
  }

  /**
   * Carga las opciones para los selectores de propietarios y guardias
   * desde el servicio
   */
  private loadSelectOptions(): void {
    this.userService.getPropietariosForSelect().subscribe(
      options => this.propietariosOptions = options
    );

    this.userService.getGuardiasForSelect().subscribe(
      options => this.guardiasOptions = options
    );
  }

  /**
   * Obtiene los datos del servidor
   * Realiza la petición HTTP y maneja los errores
   */
  fetchData(): void {
    if (!this.startDate || !this.endDate) return;

    const startDateTime = new Date(this.startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(this.endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const formatDateTime = (date: Date) => {
        return `${date.getFullYear()}-${
            String(date.getMonth() + 1).padStart(2, '0')}-${
            String(date.getDate()).padStart(2, '0')}T${
            String(date.getHours()).padStart(2, '0')}:${
            String(date.getMinutes()).padStart(2, '0')}:${
            String(date.getSeconds()).padStart(2, '0')}`;
    };

    const formattedStartDate = formatDateTime(startDateTime);
    const formattedEndDate = formatDateTime(endDateTime);

    const url = `http://localhost:8090/movements_entryToNeighbor/ByMonth`;
    
    const params = new HttpParams()
      .set('startDate', formattedStartDate)
      .set('endDate', formattedEndDate);

    this.http.get<any>(url, { params }).pipe(
      catchError(error => {
        console.error('Error en la petición:', error);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al intentar cargar los datos. Por favor, intente nuevamente.',
        });
        return of({ data: [] });
      })
    ).subscribe(response => {
      this.movements = response.data;
      this.loadDataIntoTable();
    });
  }

  /**
   * Carga los datos en la tabla DataTable
   * Procesa los movimientos y actualiza la visualización
   */
  private async loadDataIntoTable(): Promise<void> {
    if (!this.table) return;

    this.table.clear();

    if (!Array.isArray(this.movements) || this.movements.length === 0) {
      this.handleEmptyData();
      return;
    }

    await this.userService.ensureCacheInitialized();
    const processedRows = await this.processMovements();
    
    processedRows.forEach(row => {
      this.table.row.add(row);
    });

    this.enableExportButtons();
    this.table.draw();
  }

  /**
   * Maneja el caso de cuando no hay datos para mostrar
   */
  private handleEmptyData(): void {
    Swal.fire({
      icon: 'warning',
      title: '¡No se encontraron registros!',
    });
    this.disableExportButtons();
  }

  /**
   * Habilita los botones de exportación y actualiza el estado del flag
   */
  private enableExportButtons(): void {
    this.exportButtonsEnabled = true;
    ['#excelBtn', '#pdfBtn'].forEach(btn => {
      $(btn).prop('disabled', false);
    });
  }

  /**
   * Deshabilita los botones de exportación y actualiza el estado del flag
   */
  private disableExportButtons(): void {
    this.exportButtonsEnabled = false;
    ['#excelBtn', '#pdfBtn'].forEach(btn => {
      $(btn).prop('disabled', true);
    });
  }

  /**
   * Procesa todos los movimientos para mostrarlos en la tabla
   */
  private async processMovements(): Promise<string[][]> {
    const processedMovements = this.movements.map(movement => 
      this.processMovement(movement));
    return Promise.all(processedMovements);
  }

  /**
   * Procesa un movimiento individual
   * Transforma los datos para su visualización
   */
  private async processMovement(movement: Movement): Promise<string[]> {
    try {
      const transformations: Observable<string>[] = [
        of(movement.day + '/' + movement.month + '/' + movement.year),
        of(movement.hour || ''),
        of(movement.entryOrExit || ''),
        of(movement.entryType || ''),
        this.userService.transformNameOrId(movement.visitorName || ''),
        of(movement.visitorDocument || ''),
        of(movement.carType || ''),
        of(movement.plate || ''),
        this.userService.getUserById(movement.neighborId),
        this.userService.getUserById(movement.securityId)
      ];

      return await firstValueFrom(forkJoin(transformations));
    } catch {
      return this.getErrorRow(movement);
    }
  }

  /**
   * Devuelve una fila con datos de error cuando falla el procesamiento
   */
  private getErrorRow(movement: Movement): string[] {
    return [
      movement.day + '/' + movement.month + '/' + movement.year,
      movement.hour || '',
      movement.entryOrExit || '',
      movement.entryType || '',
      movement.visitorName || '',
      movement.visitorDocument || '',
      movement.carType || '',
      movement.plate || '',
      '------',
      'Error de conexión'
    ];
  }

  /**
   * Inicializa la tabla DataTable con su configuración
   */
  private initializeDataTable(): void {
    const config = {
      ...this.dataTableConfig.getBaseConfig(),
    };
    
    this.table = ($('#myTable') as any).DataTable(config);
    
    // Primero configurar los botones
    this.exportService.setupExportButtons(this.table, this.startDate, this.endDate);
    
    // Luego configurar los listeners
    this.setupExportButtonListeners();
  }

  /**
   * Configura los listeners para los botones de exportación
   */
  private setupExportButtonListeners(): void {
    $('#excelBtn').on('click', () => {
      if (this.exportButtonsEnabled && this.table.buttons) {
        $(this.table.buttons.container()).find('.dt-button-excel').click();
      }
    });

    $('#pdfBtn').on('click', () => {
      if (this.exportButtonsEnabled && this.table.buttons) {
        $(this.table.buttons.container()).find('.dt-button-pdf').click();
      }
    });
  }

  getUserTypeColor(type: string): string {
    const typeConfig = this.dataTableConfig.USER_TYPE_ICONS[type as keyof typeof this.dataTableConfig.USER_TYPE_ICONS];
    return typeConfig ? typeConfig.color : 'grey';
  }

  getUserTypeIcon(type: string): string {
    const typeConfig = this.dataTableConfig.USER_TYPE_ICONS[type as keyof typeof this.dataTableConfig.USER_TYPE_ICONS];
    return typeConfig ? typeConfig.icon : 'bi bi-question-lg';
  }

  /**
   * Maneja el evento de redibujado de la tabla
   * Aplica estilos a las celdas
   */
  private handleDrawCallback(settings: any): void {
    setTimeout(() => {
      this.styleEntryExitColumn();
    });
  }

  /**
   * Aplica estilos a la columna de entrada/salida
   */
  private styleEntryExitColumn(): void {
    $(this.table.table().node()).find('td:nth-child(3)').each(function() {
      const cellText = $(this).text().trim().toLowerCase();
      const color = cellText === 'entrada' ? '#28a745' : '#dc3545';
      if (['entrada', 'salida'].includes(cellText)) {
        $(this).html(`
          <div class="d-flex justify-content-center">
            <span class="badge rounded-pill d-flex align-items-center justify-content-center" 
                  style="background-color: ${color}; color: white; border: none;">
              ${cellText.charAt(0).toUpperCase() + cellText.slice(1)}
            </span>
          </div>
        `);
      }
    });
  }

  /**
   * Limpieza al destruir el componente
   */
  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
      while ($.fn.dataTable.ext.search.length > 0) {
        $.fn.dataTable.ext.search.pop();
      }
    }
    $('#excelBtn, #pdfBtn').off('click');
  }

  /**
   * Método del ciclo de vida que se ejecuta después de que la vista se ha inicializado
   * Inicializa la tabla y configura los filtros
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
      this.setupFilters();
    });
  }

  /**
   * Configura los filtros de la tabla
   */
  private setupFilters(): void {
    this.setupUnifiedSearchFilter();
    this.setupCustomFilters();
  }

  /**
   * Configura el filtro de búsqueda unificada
   */
  private setupUnifiedSearchFilter(): void {
    $('#unifiedSearchFilter').on('keyup', (e) => {
      const target = $(e.target);
      const inputValue = target.val() as string;
      
      this.filterValues.unifiedSearch = inputValue.length >= 3 ? inputValue : '';
      
      if (this.table) {
        this.table.draw();
      }
    });
  }

  /**
   * Configura los filtros personalizados de la tabla
   */
  private setupCustomFilters(): void {
    $.fn.dataTable.ext.search.push(
      (settings: any, data: string[]) => this.filterRow(data)
    );
  }

  /**
   * Filtra una fila de datos según los criterios establecidos
   */
  private filterRow(data: string[]): boolean {
    const [fecha, , tipoEntrada, tipoIngresante, nombre, documento,
           tipoVehiculo, placa, propietario, guardia] = data;

    // Búsqueda unificada
    if (this.filterValues.unifiedSearch) {
      const searchTerm = this.filterValues.unifiedSearch.toLowerCase();
      const searchFields = [nombre, documento, placa];
      if (!searchFields.some(field => field.toLowerCase().includes(searchTerm))) {
        return false;
      }
    }

    // Verificar filtro de entrada/salida
    if (this.filterValues.entryOrExit.length > 0) {
      if (!this.filterValues.entryOrExit.some(value => 
        tipoEntrada.toLowerCase() === VALUE_MAPPINGS[value].toLowerCase())) {
        return false;
      }
    }

    // Verificar filtros de tipo de usuario si hay alguno activo
    if (this.filterValues.tipoIngresante.length > 0) {
      const normalizedTipoIngresante = tipoIngresante.toLowerCase().trim();
      
      const matchesTipo = this.filterValues.tipoIngresante.some(filterValue => {
        // Encontrar el tipo de usuario que corresponde a este filterValue
        const matchingType = Object.values(USER_TYPE_MAPPINGS).find(
          mapping => mapping.filterValue === filterValue
        );
        
        if (matchingType) {
          // Comparar con el valor de la columna, normalizando ambos valores
          return normalizedTipoIngresante === matchingType.columnValue.toLowerCase().trim();
        }
        return false;
      });
  
      if (!matchesTipo) return false;
    }
 
    // Verificar filtro de tipo de vehículo
    if (this.filterValues.typeCar.length > 0) {
      if (!this.filterValues.typeCar.some(value => 
        tipoVehiculo.toLowerCase() === VALUE_MAPPINGS[value].toLowerCase())) {
        return false;
      }
    }

    // Verificar filtro de propietario
    if (this.filterValues.selectedPropietario.length > 0) {
      const propietarioMatches = this.filterValues.selectedPropietario.some(selectedId => {
        const propietarioOption = this.propietariosOptions.find(p => p.id === selectedId);
        return propietarioOption && propietario.toLowerCase().includes(propietarioOption.label.toLowerCase());
      });
      if (!propietarioMatches) return false;
    }

    // Verificar filtro de guardia
    if (this.filterValues.selectedGuardia.length > 0) {
      const guardiaMatches = this.filterValues.selectedGuardia.some(selectedId => {
        const guardiaOption = this.guardiasOptions.find(g => g.id === selectedId);
        return guardiaOption && guardia.toLowerCase().includes(guardiaOption.label.toLowerCase());
      });
      if (!guardiaMatches) return false;
    }

    return true;
  }

  /**
   * Aplica los filtros seleccionados a la tabla
   * Este método es llamado cuando cambia cualquier filtro
   */
  applyFilters(): void {
    if (this.table) {
      this.table.draw();
    }
  }

  /**
   * Limpia todos los filtros aplicados
   * Reinicia los valores y actualiza la tabla
   */
  clearFilters(): void {
    // Reiniciar todos los valores de filtro
    this.activeFilter = null; 
    this.activeUserTypeFilters.clear();
    this.filterValues = {
      entryOrExit: [],
      tipoIngresante: [],
      unifiedSearch: '',
      typeCar: [],
      selectedGuardia: [],
      selectedPropietario: []
    };

    // Limpiar el campo de búsqueda unificada
    $('#unifiedSearchFilter').val('');
    
    // Redibujar la tabla con los filtros limpios
    if (this.table) {
      this.table.draw();
    }
  }
}