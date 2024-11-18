import { Component, EventEmitter, OnInit, AfterViewInit, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';  
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AccessNewUserAllowedDto, AccessNewVehicleDto, AccessUserAllowedInfoDto2, AccessDayOfWeek, AccessFormattedHours } from '../../../models/access-visitors/access-VisitorsModels';
import { version } from 'jszip';
interface ValidationErrors {
  [key: string]: string | TimeRangeErrors;
}

interface TimeRangeErrors {
  [key: string]: string;
}

interface AdditionalVisitorsErrors {
  [key: number]: {
    [key: string]: string;
  };
}

@Component({
  selector: 'access-app-edit',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './access-edit.component.html',
  styleUrl: './access-edit.component.css',
  providers: [DatePipe]
})
export class AccessEditComponent implements OnInit, AfterViewInit {
  public validationErrors: ValidationErrors = {};
  private additionalVisitorsErrors: AdditionalVisitorsErrors = {};
  private http = inject(HttpClient);
  visitors: AccessUserAllowedInfoDto2[] = [];
  additionalVisitors: AccessUserAllowedInfoDto2[] = [];
  availableVisitors: AccessUserAllowedInfoDto2[] = [];
  neighbor_id: Number | null = null;
  table: any = null;
  todayDate: string = '';
  searchTerm: string = '';
  isModalVisible: boolean = false; // New property to control modal visibility
  user: any = null;
  constructor(private datePipe: DatePipe, private router: Router) {}
  // Selected visitor for editing
  selectedVisitor: AccessUserAllowedInfoDto2 = {
    document: '',
    documentType: 0,
    name: '',
    last_name: '',
    email: '',
    authId: '',
    authRange: {
      init_date: new Date(),
      end_date: new Date(),
      allowedDays: [{
        day: '',
        init_hour: [0,0],
        end_hour: [0,0]
      }],
      neighbor_id: 0
    },
    vehicle: {
      id: 0,
      plate: '',
      vehicle_Type: {
        description: ''
      },
      insurance: ''
    },
    visitorId: 0
  };

  fakeuser={
    id: 11,
    name: "Carlos",
    surname: "Fernández",
    dni: 34567890,
    cuit_cuil: 20345678901,
    date_birth: "1975-03-10T00:00:00",
    contact_id: 1003,
    business_name: "Fernández Construcciones",
    active: false,
    owner_type: {
      name: "Persona Jurídica"
    },
    files: [
      {
        file_id: "hty645"
      }
    ]
  }
  newVisitorTemplate: Partial<AccessUserAllowedInfoDto2> = {
    document: '',
    name: '',
    last_name: '',
    email: ''
  };
  ngAfterViewInit(): void {
   // this.editModal = new Modal(document.getElementById('editVisitorModal')!);

    $('#tablaEdit tbody').on('click', '.view-more-btn', (event: any) => {
      const index = $(event.currentTarget).data('index');
      const visitor = this.visitors[index];

      this.editVisitor(visitor);
    });
  }

  ngOnInit(): void {
    this.setTodayDate();
    this.fetchUser(); 
  }
setTodayDate(): void {
    const currentDate = new Date();
    this.todayDate = this.datePipe.transform(currentDate  , 'yyyy-MM-dd') || '';  // Formato compatible con el input de tipo date
; 
  } 


  onIDFilterChange($event: FocusEvent) {
    const input = $event.target as HTMLInputElement;
    console.log('el valor cambio:',input.valueAsNumber);
    this.neighbor_id = input.valueAsNumber;
    this.fetchvisitors(); // Fetch new data when ID changes
  }
  onSearch(event: any) {
    const searchValue = event.target.value;

    //Comprobacion de 3 o mas caracteres (No me gusta pero a Santoro si :c)
    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }
  loadDataIntoTable(): void {
    if ($.fn.dataTable.isDataTable('#tablaEdit')) {
      $('#tablaEdit').DataTable().clear().destroy();
    }
  
    this.table = $('#tablaEdit').DataTable({
      // Configuración básica de la tabla
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'asc'],
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.visitors, // Fuente de datos
  
      // Definición de columnas
      columns: [
        {
          data: null,
          className: 'align-middle',
          render: (data) => `<div>${data.name} ${data.last_name}</div>`
        },
        {
          data: 'document',
          className: 'align-middle',
          render: (data) => `<div>${data || ''}</div>`
        },
        {
          data: 'email',
          className: 'align-middle',
          render: (data) => `<div>${data || ''}</div>`
        },
        {
          data: 'authRange',
          className: 'align-middle',
          render: (data) => {
            const initDate = data ? 
              this.datePipe.transform(data.init_date, 'dd/MM/yyyy') : '';
            return `<div>${initDate}</div>`;
          }
        },
        {
          data: 'authRange',
          className: 'align-middle',
          render: (data) => {
            const endDate = data ? 
              this.datePipe.transform(data.end_date, 'dd/MM/yyyy') : '';
            return `<div>${endDate}</div>`;
          }
        },
        {
          data: null,
          className: 'align-middle text-center',
          searchable: false,
          render: (data, type, row, meta) => `
            <button class="btn btn-info btn-sm view-more-btn" data-index="${meta.row}">Editar</button>`
        }
      ],
  
      // Personalización del DOM y mensajes
      dom: '<"mb-3"t><"d-flex justify-content-between"lp>',
      language: {
        lengthMenu: `
          <select class="form-select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        zeroRecords: "No se encontraron visitantes",
        loadingRecords: "Cargando...",
        processing: "Procesando...",
      }
    });
      this.table.draw();
    
  }
  //fetchs
  fetchvisitors(): void {
    const neighbor = this.user.id;
    this.http.get<any>(`http://localhost:8090/user_Allowed/visitors/by${neighbor}`)
      .subscribe({
        next: (response) => {
          this.visitors = response;
          setTimeout(() => {
            this.loadDataIntoTable();
          }, 0);
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
  
  fetchUser(): void {
    // this.http.get<any>(`api de usuarios`)
    //   .subscribe({
    //     next: (response) => {
    //       this.user = response;
    //       setTimeout(() => {
    //         this.fetchvisitors();
    //       }, 0);
    //     },
    //     error: (error) => {
    //       Swal.fire({
    //         icon: 'warning',
    //         title: 'Error al obtener los ingresos',
    //         text: 'No hay movimientos para ese dia',
    //       });
    //     }
    //   });
      this.user = this.fakeuser;
      this.fetchvisitors();
  }

  
  formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return this.datePipe.transform(dateObj, 'yyyy-MM-dd') || '';
  }
  readonly DAYS_OF_WEEK: AccessDayOfWeek[] = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
  ];

  // auxiliares del modal 
  getDayTranslation(day: AccessDayOfWeek): string {
    const translations: Record<AccessDayOfWeek, string> = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return translations[day];
  }
  private formatTimeArrayToString(timeArray: number[]): string {
    if (!timeArray || timeArray.length !== 2) {
      return '';
    }
    
    const hours = timeArray[0].toString().padStart(2, '0');
    const minutes = timeArray[1].toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  addNewVisitor(): void {
    const newVisitor: AccessUserAllowedInfoDto2 = {
      ...this.newVisitorTemplate,
      authRange: JSON.parse(JSON.stringify(this.selectedVisitor.authRange))
    } as AccessUserAllowedInfoDto2;
    
    this.additionalVisitors.push(newVisitor);
  }

  removeVisitor(index: number): void {
    // Remove the visitor
    this.additionalVisitors.splice(index, 1);
    
    // Remove the validation errors for this visitor
    delete this.additionalVisitorsErrors[index];
    
    // Reindex the remaining errors
    const newErrors: AdditionalVisitorsErrors = {};
    Object.keys(this.additionalVisitorsErrors)
      .filter(key => parseInt(key) > index)
      .forEach(key => {
        const oldIndex = parseInt(key);
        newErrors[oldIndex - 1] = this.additionalVisitorsErrors[oldIndex];
      });
    
    this.additionalVisitorsErrors = newErrors;
  }

  saveAllVisitors(): void {
    if (this.hasValidationErrors()) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor corrija los campos marcados en rojo'
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas actualizar estos visitantes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const allVisitors = [
          this.selectedVisitor,
          ...this.additionalVisitors
        ];
        
        const updatePromises = allVisitors.map(visitor => {
          const updatedData: AccessUserAllowedInfoDto2 = {
            document: visitor.document,
            documentType: visitor.documentType,
            name: visitor.name,
            last_name: visitor.last_name,
            email: visitor.email,
            authId: visitor.authId,
            authRange: visitor.authRange,
            vehicle: visitor.vehicle,
            visitorId: visitor.visitorId
          };
          
          return this.http.put(`http://localhost:8090/user_Allowed/visitor/update`, updatedData).toPromise();
        });

        Promise.all(updatePromises)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Todos los visitantes han sido actualizados correctamente'
            });
            this.hideModal();
            this.additionalVisitors = [];
            this.fetchvisitors();
          })
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un error al actualizar algunos visitantes'
            });
          });
      }
    });
  }

  


 
  editVisitor(visitor: AccessUserAllowedInfoDto2): void {
    this.selectedVisitor = JSON.parse(JSON.stringify(visitor));
    this.additionalVisitors = [];
    console.log("selectedVisitor:", this.selectedVisitor);

    if (!this.selectedVisitor.authRange) {
      this.selectedVisitor.authRange = {
        init_date: new Date(),
        end_date: new Date(),
        allowedDays: [],
        neighbor_id: 0 // TODO: harcodeado ahora para que funque
      };
    }

    this.showModal(); 
  }
  isDayAllowed(day: AccessDayOfWeek): boolean {
    return this.selectedVisitor.authRange.allowedDays
      .some(allowedDay => allowedDay.day === day.toUpperCase());
  }
  getAllowedDayHours(day: AccessDayOfWeek): AccessFormattedHours {
    const allowedDay = this.selectedVisitor.authRange.allowedDays
      .find(d => d.day === day.toUpperCase());
      
    if (!allowedDay) {
      return { init_hour: '', end_hour: '' };
    }
  
    return {
      init_hour: this.formatTimeArrayToString(allowedDay.init_hour),
      end_hour: this.formatTimeArrayToString(allowedDay.end_hour)
    };
  }
 
  // Update all visitors when changing dates or allowed days
  updateAllVisitorsAuthRanges(): void {
    const authRangesCopy = JSON.parse(JSON.stringify(this.selectedVisitor.authRange));
    this.additionalVisitors.forEach(visitor => {
      visitor.authRange = authRangesCopy;
    });
  }


  onInitDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.selectedVisitor.authRange.init_date = new Date(target.value);
      this.updateAllVisitorsAuthRanges();
    }
  }

  onEndDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.selectedVisitor.authRange.end_date = new Date(target.value + 'T00:00:00');
      this.updateAllVisitorsAuthRanges();
    }
  }
  selectExistingVisitor(visitorDocument: string, index: number): void {
    const selectedVisitor = this.visitors.find(v => v.document === visitorDocument);
    if (selectedVisitor) {
      this.additionalVisitors[index] = {
        ...selectedVisitor,
        authRange: JSON.parse(JSON.stringify(this.selectedVisitor.authRange))
      };
    }
  }

  
  toggleDay(day: AccessDayOfWeek): void {
    const allowedDays = this.selectedVisitor.authRange.allowedDays;
    const index = allowedDays.findIndex(d => d.day === day.toUpperCase());
    
    if (index === -1) {
      allowedDays.push({
        day: day.toUpperCase(),
        init_hour: [9, 0],
        end_hour: [17, 0]
      });
    } else {
      allowedDays.splice(index, 1);
    }
    
    this.updateAllVisitorsAuthRanges();
  }
  updateAvailableVisitors(): void {
    const selectedDocuments = new Set([
      this.selectedVisitor.document,
      ...this.additionalVisitors.map(v => v.document)
    ]);


    this.availableVisitors = this.visitors.filter(visitor => 
      !selectedDocuments.has(visitor.document)
    );
  }
  getAvailableVisitorsForIndex(currentIndex: number): AccessUserAllowedInfoDto2[] {
    const selectedDocuments = new Set([
      this.selectedVisitor.document,
      ...this.additionalVisitors
        .map((v, index) => index !== currentIndex ? v.document : null)
        .filter(doc => doc !== null && doc !== '')
    ]);

    return this.visitors.filter(visitor => !selectedDocuments.has(visitor.document));
  }

  updateInitHour(day: AccessDayOfWeek, event: any): void {
    const allowedDay = this.selectedVisitor.authRange.allowedDays
      .find(d => d.day === day.toUpperCase());
    if (allowedDay) {
      const [hours, minutes] = event.target.value.split(':');
      allowedDay.init_hour = [parseInt(hours, 10), parseInt(minutes, 10)];
      this.validateDateRange(); // Validar después de actualizar la hora
      this.updateAllVisitorsAuthRanges();
    }
  }

  updateEndHour(day: AccessDayOfWeek, event: any): void {
    const allowedDay = this.selectedVisitor.authRange.allowedDays
      .find(d => d.day === day.toUpperCase());
    if (allowedDay) {
      const [hours, minutes] = event.target.value.split(':');
      allowedDay.end_hour = [parseInt(hours, 10), parseInt(minutes, 10)];
      this.validateDateRange(); // Validar después de actualizar la hora
      this.updateAllVisitorsAuthRanges();
    }
  }
  //parte del modal
  showModal(): void {
    this.isModalVisible = true;
    document.body.classList.add('modal-open');
  }

  hideModal(): void {
    this.isModalVisible = false;
    document.body.classList.remove('modal-open');
  }
  //validaciones 
  validateField(fieldName: string, value: string, visitorIndex?: number): void {
    const errors = this.getFieldError(fieldName, value);
    
    if (visitorIndex !== undefined) {
      if (!this.additionalVisitorsErrors[visitorIndex]) {
        this.additionalVisitorsErrors[visitorIndex] = {};
      }
      if (errors) {
        this.additionalVisitorsErrors[visitorIndex][fieldName] = errors;
      } else {
        delete this.additionalVisitorsErrors[visitorIndex][fieldName];
      }
    } else {
      if (errors) {
        this.validationErrors[fieldName] = errors;
      } else {
        delete this.validationErrors[fieldName];
      }
    }
  }

  private getFieldError(fieldName: string, value: string): string | null {
    switch (fieldName) {
      case 'name':
        return !value?.trim() ? 'El nombre es requerido' : null;
      case 'last_name':
        return !value?.trim() ? 'El apellido es requerido' : null;
      case 'document':
        return !value?.trim() ? 'El documento es requerido' : null;
      case 'email':
        if (!value?.trim()) return 'El email es requerido';
        return !this.isValidEmail(value) ? 'El formato del email no es válido' : null;
      default:
        return null;
    }
  }

 
  validateDateRange(): void {
    const initDate = new Date(this.selectedVisitor.authRange.init_date);
    const endDate = new Date(this.selectedVisitor.authRange.end_date);
    
    if (endDate <= initDate) {
      this.validationErrors['end_date'] = 'La fecha de fin debe ser mayor a la fecha de inicio';
    } else {
      delete this.validationErrors['end_date'];
    }
  
    // Validar que al menos un día esté seleccionado
    if (this.selectedVisitor.authRange.allowedDays.length === 0) {
      this.validationErrors['allowed_days'] = 'Debe seleccionar al menos un día de la semana';
    } else {
      delete this.validationErrors['allowed_days'];
    }
  
    // Validar las horas de cada día seleccionado
    this.selectedVisitor.authRange.allowedDays.forEach(day => {
      const initHour = day.init_hour[0] * 60 + day.init_hour[1];
      const endHour = day.end_hour[0] * 60 + day.end_hour[1];
  
      if (endHour <= initHour) {
        if (!this.validationErrors['time_range']) {
          this.validationErrors['time_range'] = {} as TimeRangeErrors;
        }
        (this.validationErrors['time_range'] as TimeRangeErrors)[day.day] = 'La hora final debe ser mayor a la hora inicial';
      } else {
        if (this.validationErrors['time_range']) {
          delete (this.validationErrors['time_range'] as TimeRangeErrors)[day.day];
          if (Object.keys(this.validationErrors['time_range'] as TimeRangeErrors).length === 0) {
            delete this.validationErrors['time_range'];
          }
        }
      }
    });
  }

  hasValidationErrors(): boolean {
    // Validaciones del visitante principal
    Object.keys(this.selectedVisitor).forEach(field => {
      if (field !== 'authRange' && field !== 'authId') {
        this.validateField(field, (this.selectedVisitor as any)[field]);
      }
    });

    // Validaciones de visitantes adicionales
    this.additionalVisitors.forEach((visitor, index) => {
      Object.keys(visitor).forEach(field => {
        if (field !== 'authRange' && field !== 'authId') {
          this.validateField(field, (visitor as any)[field], index);
        }
      });
    });

    // Validar fechas, días y horas
    this.validateDateRange();

    // Solo considerar errores de los índices que aún existen
    const validVisitorErrors = Object.keys(this.additionalVisitorsErrors)
      .filter(index => parseInt(index) < this.additionalVisitors.length)
      .some(index => Object.keys(this.additionalVisitorsErrors[Number(index)]).length > 0);

    return Object.keys(this.validationErrors).length > 0 || validVisitorErrors;
  }
  

  
getValidationClass(fieldName: string, visitorIndex?: number): string {
  if (visitorIndex !== undefined) {
    return this.additionalVisitorsErrors[visitorIndex]?.[fieldName] 
      ? 'is-invalid' 
      : '';
  }
  return this.validationErrors[fieldName] ? 'is-invalid' : '';
}

  // Método helper para obtener el mensaje de error
  getErrorMessage(fieldName: string, visitorIndex?: number): string {
    if (visitorIndex !== undefined) {
      return this.additionalVisitorsErrors[visitorIndex]?.[fieldName] || '';
    }
    const error = this.validationErrors[fieldName];
    return typeof error === 'string' ? error : '';
  }
  // Helper method to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  getTimeErrorMessage(day: AccessDayOfWeek): string {
    return ((this.validationErrors['time_range'] as TimeRangeErrors)?.[day] || '') as string;
  }
  hasTimeError(day: AccessDayOfWeek): boolean {
    return !!(this.validationErrors['time_range'] as TimeRangeErrors)?.[day];
  }
  
}
