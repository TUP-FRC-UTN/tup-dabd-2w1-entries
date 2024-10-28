import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  inject,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  NgZone,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AuthRangeInfoDto,
  NewAuthRangeDto,
  NewMovement_ExitDto,
  NewMovements_EntryDto,
  NewUserAllowedDto,
  NewVehicleDto,
  User_AllowedInfoDto,
} from '../../../models/visitors/access-VisitorsModels';
import Swal from 'sweetalert2';
import { VisitorsService } from '../../../services/visitors/access-visitors.service';
import { Subscription } from 'rxjs';
//
import $ from 'jquery';
import 'datatables.net';

import 'datatables.net-bs5';
//import { AlertDirective } from '../alert.directive';
import { InternalSettings } from 'datatables.net';
import { AllowedDaysDto } from '../../../services/visitors/movement.interface';
import { RouterModule } from '@angular/router';
import { AccessAutosizeTextareaDirective } from '../../../directives/access-autosize-textarea.directive';
import {
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
} from 'ngx-scanner-qrcode';
import jsQR from 'jsqr';

@Component({
  selector: 'app-visitor-registry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccessAutosizeTextareaDirective,
    RouterModule,
    NgxScannerQrcodeModule,
  ],
  providers: [DatePipe, VisitorsService, CommonModule],
  templateUrl: './visitor-registry.component.html',
  styleUrl: './visitor-registry.component.css',
})
export class VisitorRegistryComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('qrInput') qrInput!: ElementRef;

  subscription = new Subscription();

  private readonly visitorService = inject(VisitorsService);

  constructor() {}

  dataTable: any;

  isModalOpen = false;

  private readonly ngZone: NgZone = inject(NgZone);

  modalValid: boolean = false;

  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    this.subscription.unsubscribe();
  }
  //PARA ESCANEAR

  isScanning = false;
  scannedResult: string = '';

  //Estado del visitante
  visitorStatus: { [document: string]: string } = {}; // Estado de cada visitante

  uploadQrImage() {
    // Abre el cuadro de diálogo de selección de archivo
    this.qrInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();

      // Procesa la imagen una vez cargada
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          // Crea un canvas temporal para extraer los datos de la imagen
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (context) {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

            // Usa jsQR para procesar la imagen
            const qrCode = jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );

            if (qrCode) {
              // QR encontrado: procesa el contenido escaneado
              this.handleQrScan([{ value: qrCode.data }]);
            } else {
              // QR no válido: muestra una alerta
              Swal.fire({
                icon: 'error',
                title: 'QR Invalido',
                text: 'No se ha podido leer un código QR válido en la imagen.',
              });
            }
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  initializeDataTable(): void {
    this.ngZone.runOutsideAngular(() => {
      this.dataTable = ($('#visitorsTable') as any).DataTable({
        paging: true,
        ordering: true,
        pageLength: 10,
        lengthChange: true,
        searching: true,
        info: true,
        autoWidth: false,
        language: {
          lengthMenu: '_MENU_',
          zeroRecords: 'No se encontraron registros',
          search: 'Buscar:',
          emptyTable: 'No hay datos disponibles',
          info: '',            
          infoEmpty: '',       
          infoFiltered: ''
        },
        responsive: true,
        dom: '<"top d-flex justify-content-start mb-2"f>rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"li>p><"clear">',
      });
  
      $('#dt-search-0')
        .off('keyup')
        .on('keyup', () => {
          const searchTerm = $('#dt-search-0').val() as string;
  
          if (searchTerm.length >= 3) {
            this.dataTable.search(searchTerm).draw();
          } else if (searchTerm.length === 0) {
            this.dataTable.search('').draw(false);
          } else {
            this.dataTable.search('').draw(false);
          }
        });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
      this.setupModalEventListeners();
    });
  }

  updateDataTable(): void {
    if (this.dataTable) {
      this.ngZone.runOutsideAngular(() => {
        const formattedData = this.visitors.map((visitor, index) => {
          const status = this.visitorStatus[visitor.document] || 'En espera';

          let statusButton = '';
          let actionButtons = '';

          switch (status) {
            case 'Ingresado':
              statusButton = `<button class="btn btn-success">Ingresado</button>`;
              actionButtons = `<button class="btn btn-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</button>`;
              break;
            case 'Egresado':
              statusButton = `<button class="btn btn-danger">Egresado</button>`;
              break;
            case 'En espera':
            default:
              statusButton = `<button class="btn btn-warning">En espera</button>`;
              actionButtons = `<button class="btn btn-info" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</button>`;
              break;
          }

          return [
            `${visitor.last_name} ${visitor.name}`,
            visitor.documentTypeDto.description,
            `<div class="text-start">${visitor.document}</div>`,
            `<button style="width: 95%;" class="btn btn-info view-more-btn" data-index="${index}">Ver más</button>`,
            `<div class="d-flex justify-content-center">
              <div class="dropdown">
                <button class="btn btn-white dropdown-toggle p-0" 
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false">
                    <i class="fas fa-ellipsis-v" style="color: black;"></i> <!-- Tres puntos verticales -->
                </button>
                <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
                  <li><button class="dropdown-item select-action" data-value="ingreso" data-index="${index}">Ingreso</button></li>
                  <li><button class="dropdown-item select-action" data-value="egreso" data-index="${index}">Egreso</button></li>
                </ul>
              </div>
            </div>`,
            `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
            statusButton,
            actionButtons,
          ];
          
          
        });

        this.dataTable.clear().rows.add(formattedData).draw();
      });
      this.addEventListeners();
    }
  }

  // Actualizar el método addEventListeners para manejar los clicks en el nuevo menú
  addEventListeners(): void {
    const buttons = document.querySelectorAll('.view-more-btn') as NodeListOf<HTMLButtonElement>;
    const actionButtons = document.querySelectorAll('.select-action') as NodeListOf<HTMLButtonElement>;

    buttons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const index = button.getAttribute('data-index');
        if (index !== null) {
          const selectedOwner = this.visitors[parseInt(index, 10)];
          this.MoreInfo(selectedOwner);
        }
      });
    });

    actionButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const index = button.getAttribute('data-index');
        const value = button.getAttribute('data-value');
        
        if (index !== null) {
          const selectedOwner = this.visitors[parseInt(index, 10)];
          const textareaElement = document.getElementById(
            'observations' + index
          ) as HTMLTextAreaElement;

          selectedOwner.observations = textareaElement.value || '';

          // Simular el evento de cambio
          const mockEvent = {
            target: {
              value: value
            }
          } as unknown as Event;

          this.onSelectionChange(mockEvent, selectedOwner);
        }
      });
    });
  }

  onSelectionChange(event: Event, visitor: User_AllowedInfoDto) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;

    // Actualizar el estado del visitante
    if (selectedValue === 'ingreso') {
      this.visitorStatus[visitor.document] = 'Ingresado'; // Actualizar el estado
      this.RegisterAccess(visitor);
    } else if (selectedValue === 'egreso') {
      this.visitorStatus[visitor.document] = 'Egresado'; // Actualizar el estado
      this.RegisterExit(visitor);
    } else {
      this.visitorStatus[visitor.document] = 'En espera'; // Restablecer a "En espera" si no se selecciona
    }

    // Restablece el valor del selector
    selectElement.value = '';

    // Actualizar la tabla para reflejar el nuevo estado
    this.updateDataTable();
  }

  //carga TODOS los invitados al iniciar la pantalla
  ngOnInit(): void {
    this.loadVisitorsList();
  }

  loadVisitorsList() {
    const subscriptionAll = this.visitorService.getVisitorsData().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.visitors = data;
          this.showVisitors = this.visitors;
          //console.log("data en el component: ", data);
          console.log('visitors en el component: ', this.visitors);
          this.updateDataTable();
        });
      },
    });
    this.subscription.add(subscriptionAll);
  }

  // lista de Visitors
  visitors: User_AllowedInfoDto[] = [];
  // lista de Visitors que se muestran en pantalla
  showVisitors = this.visitors;

  // datos de búsqueda/filtrado
  parameter: string = '';

  // buscar visitantes por parámetro (Nombre o DNI)
  Search(param: string): void {
    this.showVisitors = this.visitorService.getVisitorByParam(param);
  }

  // mostrar más info de un visitante
  selectedVisitor: User_AllowedInfoDto | null = null; // Información del visitante seleccionado

  getDocumentType(visitor: User_AllowedInfoDto): string {
    return visitor.documentTypeDto?.description === 'PASSPORT' ? 'Pasaporte' : visitor.documentTypeDto?.description || 'Tipo de documento no especificado';
  }
  

  getVehicles(visitor: User_AllowedInfoDto): NewVehicleDto[] {
    return visitor.vehicles || []; // Devuelve la lista de vehículos o un array vacío
  }
  
  hasVehicles(visitor: User_AllowedInfoDto): boolean {
    return visitor.vehicles && visitor.vehicles.length > 0; // Verifica si hay vehículos
  }
  
  

  // Método para abrir el modal y establecer el visitante seleccionado
  MoreInfo(visitor: User_AllowedInfoDto) {
    this.selectedVisitor = visitor; // Guardar el visitante seleccionado
    this.openModal(); // Abrir el modal
  }
  
  

  RegisterExit(visitor: User_AllowedInfoDto): void {
    this.visitorService.RegisterExit(visitor);

    this.updateVisitorStatus(visitor, 'egreso');
  }

  RegisterAccess(visitor: User_AllowedInfoDto): void {
    this.visitorService.RegisterAccess(visitor);
    this.updateVisitorStatus(visitor, 'ingreso');
  }

  // Función para actualizar el estado del visitante
  updateVisitorStatus(
    visitor: User_AllowedInfoDto,
    action: 'ingreso' | 'egreso'
  ) {
    if (action === 'ingreso') {
      this.visitorStatus[visitor.document] = 'Ingresado';
    } else if (action === 'egreso') {
      this.visitorStatus[visitor.document] = 'Egresado';
    }

    // Cambia a "En espera" si no egresa después de un tiempo
    setTimeout(
      () => {
        if (this.visitorStatus[visitor.document] === 'Ingresado') {
          this.visitorStatus[visitor.document] = 'En espera';
        }
      } /* tiempo en ms */
    );
  }

  openModal(): void {
    this.isModalOpen = true; // Abre el modal
  }

  closeModal(): void {
    this.isModalOpen = false; // Cierra el modal
    this.stopScanner(); // Detiene el escáner cuando se cierra
  }

  // Datos de escaneo
  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;

  // escanear QR de un visitante, guardar la lista de visitantes en el front para registrar Ingreso/Egreso
  ScanQR() {
    this.isScanning = true; // Activar el escáner
    this.startScanner();
  }

  startScanner(): void {
    if (!this.scanner.isStart) {
      this.scanner.start();
    }
  }

  stopScanner(): void {
    if (this.scanner.isStart) {
      this.scanner.stop();
      this.isScanning = false;
    }
  }

  handleQrScan(data: any): void {
    const scannedData = data[0]?.value; // Obtiene el valor escaneado
    if (scannedData) {
      console.log('Código QR escaneado:', scannedData);
  
      // Detener el scanner inmediatamente después de escanear
      this.stopScanner();
  
      try {
        // Parsear el JSON escaneado
        const visitorData = JSON.parse(scannedData)[0]; // Asumimos que siempre hay un elemento
  
        // Validar el QR escaneado
        this.visitorService.validateQrCode(visitorData.document).subscribe((isValid) => {
          if (isValid) {
            const newVisitor: User_AllowedInfoDto = {
              document: visitorData.document,
              name: visitorData.name,
              last_name: visitorData.lastName,
              email: 'email@example.com', // Asignar un valor por defecto si no se proporciona
              vehicles: [], // Aquí podrías llenar la lista de vehículos si se necesita
              userType: { description: 'Visitante' },
              authRanges: [{
                init_date: visitorData.init_date,
                end_date: visitorData.end_date,
                allowedDays: [{
                  day: visitorData.init_hour, // Esto puede necesitar ajustes según tu estructura
                  init_hour: visitorData.init_hour,
                  end_hour: visitorData.end_hour,
                }]
              }],
              observations: '', // Asigna observaciones si están disponibles
              documentTypeDto: { description: visitorData.documentType || 'DNI' }, // Manejar caso sin tipo de documento
              neighbor_id: visitorData.neighborId || 0, // Asegúrate de manejar neighborId si está presente
            };
  
            this.visitors.push(newVisitor);
            this.updateDataTable(); // Actualiza la tabla de visitantes
  
            // Cerrar el modal
            this.closeModal();
          } else {
            Swal.fire({
              title: 'QR Inválido',
              text: 'El código QR escaneado no es válido.',
              icon: 'error',
              confirmButtonText: 'Cerrar',
            });
            console.warn('Código QR no válido.');
          }
        }, (error) => {
          console.error('Error en la validación del código QR:', error);
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al validar el código QR.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
          });
        });
      } catch (error) {
        console.error('Error al parsear el código QR:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al procesar el código QR.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
        });
      }
    } else {
      console.warn('No se encontraron datos en el escaneo.');
    }
  }
  

  

  setupModalEventListeners() {
    const modal = document.getElementById('qrScannerModal');
    modal?.addEventListener('shown.bs.modal', () => {
      this.startScanner();
    });
    modal?.addEventListener('hidden.bs.modal', () => {
      this.stopScanner();
    });
  }

  // agregar un visitante que no esta en una lista, pero tiene autorizacion del Propietario/Inquilino
  AddVisitor() {}
}
