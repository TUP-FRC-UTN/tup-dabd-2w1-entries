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
  Document_TypeDto,
  LastEntryUserAllowedDto,
  LastExitUserAllowedDto,
  NewAuthRangeDto,
  NewMovement_ExitDto,
  NewMovements_EntryDto,
  NewUserAllowedDto,
  NewVehicleDto,
  User_AllowedInfoDto,
  User_allowedTypeDto,
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
import {
  NewMovements_EntryDtoOwner,
  User_AllowedInfoDtoOwner,
  VehicleOwner,
} from '../../../models/visitors/interface/owner';
import {
  MovementEntryDto,
  SuppEmpDto,
} from '../../../models/EmployeeAllowed/user-alowed';
import { AccessVisitorHelperService } from '../../../services/visitors/access-visitor-helper.service';
import { AccessOwnerRenterserviceService } from '../../../services/ownerService/access-owner-renterservice.service';
import { UserServiceService } from '../../../services/EmployeeService/user-service.service';

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

  private readonly helperService = inject(AccessVisitorHelperService);
  private readonly visitorService = inject(VisitorsService);
  private readonly ownerService: AccessOwnerRenterserviceService = inject(
    AccessOwnerRenterserviceService
  );
  private observations: string = '';
  constructor(private userService: UserServiceService) {}

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
          infoFiltered: '',
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

  /* Aca carga los visitantes */
  allVisitorsChecked = false;

  toggleAllVisitors(): void {
    this.allVisitorsChecked = !this.allVisitorsChecked; // Alternar el estado
    if (this.allVisitorsChecked) {
      // Cargar todos los visitantes
      this.loadVisitorsList();
    } else {
      // Vaciar la lista de visitantes
      this.visitors = [];
      this.showVisitors = [];
      this.updateDataTable();
    }
  }

  loadAllVisitors(): void {
    const subscriptionAll = this.visitorService.getVisitorsData().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.visitors = data; // Carga todos los visitantes
          this.showVisitors = this.visitors; // Actualiza la lista de visitantes a mostrar
          console.log('Visores en el componente: ', this.visitors);
          this.updateDataTable(); // Actualiza la tabla de visitantes
        });
      },
      error: (error) => {
        console.error('Error al cargar visitantes:', error);
      },
    });
    this.subscription.add(subscriptionAll);
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
            this.getDocumentType(visitor), // Asegurarte de que "PASSPORT" se muestre como "Pasaporte"
            `<div class="text-start">${visitor.document}</div>`,
            `<div class="d-flex justify-content-center">
              <div class="dropdown">
                <button class="btn btn-white dropdown-toggle p-0" 
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false">
                    <i class="fas fa-ellipsis-v" style="color: black;"></i> <!-- Tres puntos verticales -->
                </button>
                <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
                  <li><button class="dropdown-item select-action" data-value="verMas" data-index="${index}">Ver más</button></li> <!-- Opción Ver más -->

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
    const tableBody = document.querySelector('#visitorsTable tbody');

    if (tableBody) {
      tableBody.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        // Manejar el botón "Ver más" en el menú desplegable
        if (target.classList.contains('select-action')) {
          const index = target.getAttribute('data-index');
          const value = target.getAttribute('data-value');

          if (index !== null) {
            const selectedOwner = this.visitors[parseInt(index, 10)];

            // Aquí se maneja la opción "Ver más"
            if (value === 'verMas') {
              this.MoreInfo(selectedOwner);
            } else {
              // Manejar otras acciones (Ingreso/Egreso)
              const textareaElement = document.getElementById(
                'observations' + index
              ) as HTMLTextAreaElement;

              selectedOwner.observations = textareaElement.value || '';
              this.observations = textareaElement.value;

              const mockEvent = {
                target: { value: value },
              } as unknown as Event;

              this.onSelectionChange(mockEvent, selectedOwner);
            }
          }
        }
      });
    } else {
      console.error('No se encontró el cuerpo de la tabla.');
    }
  }

  onSelectionChange(event: Event, visitor: User_AllowedInfoDto) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;

    // Actualizar el estado del visitante
    if (selectedValue === 'ingreso') {
      this.visitorStatus[visitor.document] = 'Ingresado';
      // Actualizar el estado
      if (
        visitor.userType.description === 'Owner' ||
        visitor.userType.description === 'Tenant'
      ) {
        this.RegisterAccessOwner(visitor);
      } else if (
        visitor.userType.description === 'Employeed' ||
        visitor.userType.description === 'Supplier'
      ) {
        this.RegisterAccessOwnerEmp(visitor);
      } else {
        this.RegisterAccess(visitor);
      }
    } else if (selectedValue === 'egreso') {
      this.visitorStatus[visitor.document] = 'Egresado'; // Actualizar el estado
      if (
        visitor.userType.description === 'Owner' ||
        visitor.userType.description === 'Tenant'
      ) {
        this.RegisterExitOwner(visitor);
      } else if (
        visitor.userType.description === 'Employeed' ||
        visitor.userType.description === 'Supplied'
      ) {
        this.RegisterAccessOwnerEmp(visitor);
      } else {
        this.RegisterExit(visitor);
      }
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
    /*  Comentado para que no cargue de entrada los datos*/
    //this.loadVisitorsList();
    //this.loadOwnerRenter();
    //this.loadDataEmp();
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
    return visitor.documentTypeDto?.description === 'PASSPORT'
      ? 'Pasaporte'
      : visitor.documentTypeDto?.description ||
          'Tipo de documento no especificado';
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

        // Crear el nuevo visitante sin validar en el backend
        const newVisitor: User_AllowedInfoDto = {
          document: visitorData.document,
          name: visitorData.name,
          last_name: visitorData.lastName,
          email: 'email@example.com', // Asignar un valor por defecto si no se proporciona
          vehicles: [], // Aquí podrías llenar la lista de vehículos si se necesita
          userType: { description: 'Visitante' },
          authRanges: [
            {
              init_date: visitorData.init_date,
              end_date: visitorData.end_date,
              neighbor_id: visitorData.neighborId || 0,
              allowedDays: [
                {
                  day: visitorData.init_hour,
                  init_hour: visitorData.init_hour,
                  end_hour: visitorData.end_hour,
                },
              ],
            },
          ],
          observations: '', // Asigna observaciones si están disponibles
          documentTypeDto: { description: visitorData.documentType || 'DNI' },
          neighbor_id: visitorData.neighborId || 0,
        };

        // Agregar el visitante a la lista y actualizar el DataTable
        this.visitors.push(newVisitor);
        this.updateDataTable(); // Actualiza la tabla de visitantes

        // Cerrar el modal si hay uno abierto
        this.closeModal();
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

  //owner
  doument: Document_TypeDto = {
    description: 'DNI',
  };
  movement: NewMovements_EntryDtoOwner = {
    movementDatetime: new Date(),
    observations: '',
    newUserAllowedDto: {
      name: '',
      last_name: '',
      document: '',
      user_allowed_Type: {
        description: '',
      },
      documentType: this.doument,
      email: '',
    },
    authRangesDto: {
      neighbor_id: 0,
      init_date: new Date(),
      end_date: new Date(),
      allowedDaysDtos: [],
    },
  };
  vehiclee: VehicleOwner = {
    plate: '',
    insurance: '',
    vehicle_Type: {
      description: '',
    },
  };
  loadOwnerRenter() {
    const subscriptionAll = this.ownerService
      .getAllOwnerRenterList()
      .subscribe({
        next: (ownerList: User_AllowedInfoDtoOwner[]) => {
          this.ngZone.run(() => {
            ownerList.forEach((owner) => {
              this.visitors.push({
                document: owner.document,
                name: owner.name,
                userType: owner.userType,
                last_name: owner.last_name,
                documentTypeDto: owner.documentTypeDto,
                authRanges: owner.authRanges,
                email: owner.email,
                vehicles: owner.vehicles,
                neighbor_id: 0,
              });
            });

            console.log('Loaded owner/renter list:', this.visitors);
            this.updateDataTable();
          });
        },
      });
    this.subscription.add(subscriptionAll);
  }
  RegisterAccessOwner(visitor: User_AllowedInfoDtoOwner): void {
    const now = new Date();

    this.visitorService.getVisitorLastExit(visitor.document).subscribe({
      next: (lastExitResponse) => {
        const lastExit: LastExitUserAllowedDto = lastExitResponse;
        const lastExitDateTime =
          this.helperService.processDate(lastExit.movementDatetime) ||
          new Date(0);

        // Si no hay egreso previo o es el primer ingreso, permitir ingreso
        if (lastExitDateTime <= now) {
          this.visitorService.getVisitorLastEntry(visitor.document).subscribe({
            next: (lastEntryResponse) => {
              const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
              const lastEntryDateTime =
                this.helperService.processDate(lastEntry.movementDatetime) ||
                new Date(0);

              // Permitir ingreso si no hay ingreso previo o si la última salida es posterior
              if (
                lastEntryDateTime <= lastExitDateTime ||
                lastEntry.firstEntry
              ) {
                console.log('Ingreso permitido');
                this.prepareEntryMovement(visitor);
              } else {
                Swal.fire({
                  title: 'Error',
                  text: 'No puede ingresar, debe salir primero antes de hacer un nuevo ingreso.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                });
              }
            },
            error: (error) => {
              console.error(error);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo verificar el último ingreso.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              });
            },
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No puede ingresar sin haber salido previamente.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
          });
        }
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo verificar el último egreso.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  private prepareEntryMovement(visitor: User_AllowedInfoDtoOwner) {
    const vehicless =
      visitor.vehicles && visitor.vehicles.length > 0
        ? visitor.vehicles[0]
        : undefined;

    const firstRange = visitor.authRanges[0];
    const now = new Date();
    this.movement.movementDatetime = now;
    this.movement.authRangesDto = {
      neighbor_id: firstRange.neighbor_id,
      init_date: new Date(firstRange.init_date),
      end_date: new Date(firstRange.end_date),
      allowedDaysDtos: firstRange.allowedDays || [],
    };
    this.movement.observations = this.observations;
    this.movement.newUserAllowedDto = {
      name: visitor.name,
      last_name: visitor.last_name,
      document: visitor.document,
      email: visitor.email,
      user_allowed_Type: visitor.userType,
      documentType: this.doument,
      vehicle: vehicless,
    };
    console.log(this.movement.observations);
    Swal.fire({
      title: 'Confirmar Ingreso',
      text: `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const sub = this.ownerService
          .registerOwnerRenterEntry(this.movement)
          .subscribe({
            next: (response) => {
              console.log('Ingreso registrado con éxito:', response);
              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de ingreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              });
            },
            error: (err) => {
              console.error('Error al registrar la entrada:', err);
              Swal.fire({
                title: 'Error',
                text: 'Error al cargar los datos. Intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              });
            },
          });

        this.subscription.add(sub);
      }
    });
  }
  RegisterExitOwner(visitor: User_AllowedInfoDtoOwner): void {
    const now = new Date();

    this.visitorService.getVisitorLastEntry(visitor.document).subscribe({
      next: (lastEntryResponse) => {
        const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
        const lastEntryDateTime = this.helperService.processDate(
          lastEntry.movementDatetime
        );

        if (!lastEntryDateTime || lastEntryDateTime > now) {
          Swal.fire({
            title: 'Error',
            text: 'No puede salir sin haber ingresado previamente.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
          });
          return;
        }

        this.visitorService.getVisitorLastExit(visitor.document).subscribe({
          next: (lastExitResponse) => {
            const lastExit: LastExitUserAllowedDto = lastExitResponse;
            const lastExitDateTime =
              this.helperService.processDate(lastExit.movementDatetime) ||
              new Date(0);

            // Permitir egreso si es el primer egreso o si la última entrada es posterior a la última salida
            if (lastEntryDateTime > lastExitDateTime || lastExit.firstExit) {
              console.log('Egreso permitido');
              this.prepareExitMovement(visitor);
            } else {
              Swal.fire({
                title: 'Error',
                text: 'No puede egresar, debe salir primero antes de hacer un nuevo ingreso.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              });
            }
          },
          error: (error) => {
            console.error(error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo verificar el último egreso.',
              icon: 'error',
              confirmButtonText: 'Cerrar',
            });
          },
        });
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo verificar el último ingreso.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  private prepareExitMovement(visitor: User_AllowedInfoDtoOwner) {
    const vehicless =
      visitor.vehicles && visitor.vehicles.length > 0
        ? visitor.vehicles[0]
        : undefined;
    const now = new Date();
    this.movement.movementDatetime = now;
    const firstRange = visitor.authRanges[0];
    this.movement.authRangesDto = {
      neighbor_id: firstRange.neighbor_id,
      init_date: new Date(firstRange.init_date),
      end_date: new Date(firstRange.end_date),
      allowedDaysDtos: firstRange.allowedDays || [],
    };
    this.movement.observations = this.observations;
    this.movement.newUserAllowedDto = {
      name: visitor.name,
      last_name: visitor.last_name,
      document: visitor.document,
      email: visitor.email,
      user_allowed_Type: visitor.userType,
      documentType: this.doument,
      vehicle: vehicless,
    };

    Swal.fire({
      title: 'Confirmar Egreso',
      text: `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const sub = this.ownerService
          .registerExitOwner(this.movement)
          .subscribe({
            next: (response) => {
              console.log('Egreso registrado con éxito:', response);
              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de egreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              });
            },
            error: (err) => {
              console.error('Error al registrar el egreso:', err);
              Swal.fire({
                title: 'Error',
                text: 'Error al cargar los datos. Intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              });
            },
          });

        this.subscription.add(sub);
      }
    });
  }
  //Empleados
  private userType: User_allowedTypeDto = {
    description: '',
  };
  private loadDataEmp(): void {
    this.userService.getSuppEmpData().subscribe({
      next: (data: SuppEmpDto[]) => {
        data.forEach((emp) => {
          const aut: AuthRangeInfoDto[] = [];
          aut.push(emp.auth_range);
          this.userType.description = emp.userType;
          this.visitors.push({
            name: emp.name,
            neighbor_id: 0,
            document: emp.document,
            documentTypeDto: this.doument,
            last_name: emp.last_name,
            email: emp.email,
            vehicles: [],
            userType: this.userType,
            authRanges: aut,
          });
        });
        console.log(this.visitors);
        this.updateDataTable();
      },
      error: (error: any) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  RegisterAccessOwnerEmp(visitor: User_AllowedInfoDtoOwner): void {
    const now = new Date();

    this.visitorService.getVisitorLastExit(visitor.document).subscribe({
      next: (lastExitResponse) => {
        const lastExit: LastExitUserAllowedDto = lastExitResponse;
        const lastExitDateTime =
          this.helperService.processDate(lastExit.movementDatetime) ||
          new Date(0);

        // Si no hay egreso previo o es el primer ingreso, permitir ingreso
        if (lastExitDateTime <= now) {
          this.visitorService.getVisitorLastEntry(visitor.document).subscribe({
            next: (lastEntryResponse) => {
              const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
              const lastEntryDateTime =
                this.helperService.processDate(lastEntry.movementDatetime) ||
                new Date(0);

              // Permitir ingreso si no hay ingreso previo o si la última salida es posterior
              if (
                lastEntryDateTime <= lastExitDateTime ||
                lastEntry.firstEntry
              ) {
                console.log('Ingreso permitido');
                this.prepareEntryMovementEmp(visitor);
              } else {
                Swal.fire({
                  title: 'Error',
                  text: 'No puede ingresar, debe salir primero antes de hacer un nuevo ingreso.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                });
              }
            },
            error: (error) => {
              console.error(error);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo verificar el último ingreso.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              });
            },
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No puede ingresar sin haber salido previamente.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
          });
        }
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo verificar el último egreso.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  private prepareEntryMovementEmp(visitor: User_AllowedInfoDtoOwner) {
    const movementS: MovementEntryDto = {
      description: String(this.observations || ''),
      movementDatetime: new Date().toISOString(),
      vehiclesId: 0,
      document: visitor.document,
    };
    Swal.fire({
      title: 'Confirmar Ingreso',
      text: `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const sub = this.userService.registerEmpSuppEntry(movementS).subscribe({
          next: (response) => {
            console.log('Ingreso registrado con éxito:', response);
            Swal.fire({
              title: 'Registro Exitoso',
              text: 'Registro de ingreso exitoso.',
              icon: 'success',
              confirmButtonText: 'Cerrar',
            });
          },
          error: (err) => {
            console.error('Error al registrar la entrada:', err);
            Swal.fire({
              title: 'Error',
              text: 'Error al cargar los datos. Intenta nuevamente.',
              icon: 'error',
              confirmButtonText: 'Cerrar',
            });
          },
        });

        this.subscription.add(sub);
      }
    });
  }
  RegisterExitOwnerEmp(visitor: User_AllowedInfoDtoOwner): void {
    const now = new Date();

    this.visitorService.getVisitorLastEntry(visitor.document).subscribe({
      next: (lastEntryResponse) => {
        const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
        const lastEntryDateTime = this.helperService.processDate(
          lastEntry.movementDatetime
        );

        if (!lastEntryDateTime || lastEntryDateTime > now) {
          Swal.fire({
            title: 'Error',
            text: 'No puede salir sin haber ingresado previamente.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
          });
          return;
        }

        this.visitorService.getVisitorLastExit(visitor.document).subscribe({
          next: (lastExitResponse) => {
            const lastExit: LastExitUserAllowedDto = lastExitResponse;
            const lastExitDateTime =
              this.helperService.processDate(lastExit.movementDatetime) ||
              new Date(0);

            // Permitir egreso si es el primer egreso o si la última entrada es posterior a la última salida
            if (lastEntryDateTime > lastExitDateTime || lastExit.firstExit) {
              console.log('Egreso permitido');
              this.prepareExitMovementEmp(visitor);
            } else {
              Swal.fire({
                title: 'Error',
                text: 'No puede egresar, debe salir primero antes de hacer un nuevo ingreso.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              });
            }
          },
          error: (error) => {
            console.error(error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo verificar el último egreso.',
              icon: 'error',
              confirmButtonText: 'Cerrar',
            });
          },
        });
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo verificar el último ingreso.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  private prepareExitMovementEmp(visitor: User_AllowedInfoDtoOwner) {
    const movementS: MovementEntryDto = {
      description: String(this.observations || ''),
      movementDatetime: new Date().toISOString(),
      vehiclesId: 0,
      document: visitor.document,
    };

    Swal.fire({
      title: 'Confirmar Egreso',
      text: `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const sub = this.userService.registerEmpSuppExit(movementS).subscribe({
          next: (response) => {
            console.log('Egreso registrado con éxito:', response);
            Swal.fire({
              title: 'Registro Exitoso',
              text: 'Registro de egreso exitoso.',
              icon: 'success',
              confirmButtonText: 'Cerrar',
            });
          },
          error: (err) => {
            console.error('Error al registrar el egreso:', err);
            Swal.fire({
              title: 'Error',
              text: 'Error al cargar los datos. Intenta nuevamente.',
              icon: 'error',
              confirmButtonText: 'Cerrar',
            });
          },
        });

        this.subscription.add(sub);
      }
    });
  }
}
