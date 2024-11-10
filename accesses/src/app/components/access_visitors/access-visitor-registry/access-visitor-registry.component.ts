import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  NgZone,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import {
  AccessDocumentTypeDto,
  AccessNewVehicleDto,
  AccessUserAllowedInfoDto,
  AccessUserAllowedTypeDto,
} from '../../../models/access-visitors/access-VisitorsModels';
import Swal from 'sweetalert2';
import { VisitorsService } from '../../../services/access_visitors/access-visitors.service';
import { Observable, Subscription } from 'rxjs';
//
import $ from 'jquery';
import 'datatables.net';

import 'datatables.net-bs5';
//import { AlertDirective } from '../alert.directive';
import { RouterModule } from '@angular/router';
import { AccessAutosizeTextareaDirective } from '../../../directives/access-autosize-textarea.directive';
import {
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
} from 'ngx-scanner-qrcode';
import {
  AccessNewMovementsEntryDtoOwner,
  AccessUserAllowedInfoDtoOwner,
  AccessVehicleOwner,
} from '../../../models/access-visitors/interface/access-owner';
import {
  AccessMovementEntryDto,
} from '../../../models/access-employee-allowed/access-user-allowed';
import { AccessVisitorHelperService } from '../../../services/access_visitors/access-visitor-helper.service';
import { AccessOwnerRenterserviceService } from '../../../services/access-owner/access-owner-renterservice.service';
import { AccessUserServiceService } from '../../../services/access-user/access-user-service.service';
import { AccessEmergenciesService } from '../../../services/access-emergencies/access-emergencies.service';
import { AccessNewEmergencyDto } from '../../../models/access-emergencies/access-new-emergecy-dto';
declare var bootstrap: any;
@Component({
  selector: 'access-app-visitor-registry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxScannerQrcodeModule,
    NgSelectModule
  ],
  providers: [DatePipe, VisitorsService, CommonModule],
  templateUrl: './access-visitor-registry.component.html',
  styleUrl: './access-visitor-registry.component.css',
})
export class AccessVisitorRegistryComponent
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
  constructor(private userService: AccessUserServiceService, private emergencyService : AccessEmergenciesService) {}

  dataTable: any;

  isModalOpen = false;
  showModal = false;
  visitorDocument: string = '';
  private readonly ngZone: NgZone = inject(NgZone);
  userAllowedGetAll:AccessUserAllowedInfoDto[] = [];
  modalValid: boolean = false;

  //carga TODOS los invitados al iniciar la pantalla
  ngOnInit(): void {
    this.userAllowedModal()
    //DATOS
    //los 3 siguientes cargan a TODOS en la lista "comun" (donde estan todos los userAllowed)
    const sub = this.loadUsersAllowedData().subscribe({
      next: () => {
        console.log("allPeopleAllowed: ", this.allPeopleAllowed)
        this.filteredAllPeopleAllowed = this.allPeopleAllowed;
        console.log("filteredAllPeopleAllowed: ", this.filteredAllPeopleAllowed)
        

      },
      error: (err) => {
        console.log(err);
      }
    }); 
    this.subscription.add(sub);
    const subs=this.subscription = this.ownerService.modalState$.subscribe(
      (document: string) => {
        this.visitorDocument = document;
        this.ModalDocument(document)
      }
    );
    this.subscription.add(subs)
    const ub=this.subscription =this.ownerService.movementState$.subscribe(
      (data: { document: string, movement: string ,plate:string}) => {
        const { document, movement,plate } = data;
        console.log('Documento:', document);
        console.log('Movimiento:', movement);
        this.onChangeMovement(document,movement,plate)
      }
    )
    this.subscription.add(ub)
  }
  onChangeMovement(doc:string,mov:string,plate:string){
    console.log(mov)
    console.log(plate)
    const user=this.userAllowedGetAll.find(userallowed => String(userallowed.document) === String(doc)
    )
    console.log(user)
    console.log(user?.userType.description)
    this.selectedVisitor=user||null 
    if(this.selectedVisitor?.userType.description==='Tenant'&& mov==='salida'){
      console.log('Llamando a prepareEntryMovement...');
      this.prepareEntryMovement(this.selectedVisitor, plate).subscribe({
        next: (result) => {
          console.log('Resultado de prepareEntryMovement:', result);
        },
        error: (err) => {
          console.error('Error en prepareEntryMovement:', err);
        }
      });
    }
    else if(this.selectedVisitor?.userType.description==='Tenant'&& mov==='entrada'){
      this.prepareExitMovement(this.selectedVisitor,plate).subscribe({
        next: (result) => {
          console.log('Resultado de prepareExitMovement:', result);
        },
        error: (err) => {
          console.error('Error en prepareExitMovement:', err);
        }
      });
    }
    else if((this.selectedVisitor?.userType.description==='Employeed' || this.selectedVisitor?.userType.description==='Supplier')&& mov==='entrada'){
      this.prepareExitMovementEmp(this.selectedVisitor,plate).subscribe({
        next: (result) => {
          console.log('Resultado de prepareExitMovementEmp:', result);
        },
        error: (err) => {
          console.error('Error en prepareExitMovementEmp:', err);
        }
      });
    }
    else if((this.selectedVisitor?.userType.description==='Employeed' || this.selectedVisitor?.userType.description==='Supplier') && mov==='salida'){
      this.prepareEntryMovementEmp(this.selectedVisitor,plate).subscribe({
        next: (result) => {
          console.log('Resultado de prepareEntryMovementEmp:', result);
        },
        error: (err) => {
          console.error('Error en prepareEntryMovementEmp:', err);
        }
      });
    }
    else if(this.selectedVisitor?.userType.description==='Owner'&& mov==='salida'){
      console.log('Llamando a prepareEntryMovement...');
      this.prepareEntryVisitor(this.selectedVisitor, plate).subscribe({
        next: (result) => {
          console.log('Resultado de prepareEntryVisitor:', result);
        },
        error: (err) => {
          console.error('Error en prepareEntryVisitor:', err);
        }
      });
    }
    else if(this.selectedVisitor?.userType.description==='Owner'&& mov==='entrada'){
      this.prepareExitVisitor(this.selectedVisitor,plate).subscribe({
        next: (result) => {
          console.log('Resultado de prepareExitVisitor:', result);
        },
        error: (err) => {
          console.error('Error en prepareExitVisitor:', err);
        }
      });
    }
    else if(this.selectedVisitor?.userType.description==='Emergency'&& mov==='salida'){
      console.log('Llamando a prepareEntryMovement...');
      this.prepareEntryMovementEmergency(this.selectedVisitor, plate).subscribe({
        next: (result) => {
          console.log('Resultado de prepareEntryMovementEmergency:', result);
        },
        error: (err) => {
          console.error('Error en prepareEntryMovementEmergency:', err);
        }
      });
    }
    else if(this.selectedVisitor?.userType.description==='Emergency'&& mov==='entrada'){
      this.prepareExitMovementEmergency(this.selectedVisitor,plate).subscribe({
        next: (result) => {
          console.log('Resultado de prepareExitMovementEmergency:', result);
        },
        error: (err) => {
          console.error('Error en prepareExitMovementEmergency:', err);
        }
      })
    }
    else {
      if(this.selectedVisitor){
        if(mov==='entrada'){
          this.prepareExitVisitor(this.selectedVisitor,plate).subscribe({
            next: (result) => {
              console.log('Resultado de prepareExitVisitor:', result);
            },
            error: (err) => {
              console.error('Error en prepareExitVisitor:', err);
            }
          });
        }
        else {
          this.prepareEntryVisitor(this.selectedVisitor,plate).subscribe({
            next: (result) => {
              console.log('Resultado de prepareEntryVisitor:', result);
            },
            error: (err) => {
              console.error('Error en prepareEntryVisitor:', err);
            }
          });
        }
      }
  }
  }
  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {    
    setTimeout(() => {
      this.initializeDataTable();
      this.setupModalEventListeners();
      this.updateDataTable();

      // Asegúrate de que el elemento de búsqueda esté disponible
      const searchInput = $('#dt-search-0');
      searchInput.on('keyup', () => {
        const searchTerm = searchInput.val() as string;
        this.dataTable.search(searchTerm).draw();
      });
    });
  }

  userAllowedModal(){
    const sub=this.visitorService.getAllUserAllowedModal().subscribe({
      next:(data)=>{
        this.userAllowedGetAll=data
      },error:(error)=>{
        console.log(error)
      }
    })
    this.subscription.add(sub)
  }

  //metodos para limpiar los filtros
  //agrupa TODOS los checkbox (q tengan #checkBoxRef en su tag)
  @ViewChildren('checkBoxRef') checkBoxes!: QueryList<ElementRef>;

  clearFilters(){
    this.checkBoxes.forEach((checkbox) => {
      checkbox.nativeElement.checked = false;
    });

    const customSearchInput = document.getElementById('customSearch') as HTMLInputElement;
    if (customSearchInput) {
      customSearchInput.value = '';
    }
    // Limpia el input de busqueda 
    this.dataTable.search('').draw(false);

    //limpia los valores elegidos en los checkbox
    this.selectedUserTypes = [];
    //busca todos los userAllowed (ya q no hay filtros en this.selectedValues)
    this.onFilterSelectionChange();
  }
  // FIN metodos para limpiar los filtros


  //PARA ESCANEAR

  isScanning = false;
  scannedResult: string = '';

  //Estado del visitante
  visitorStatus: { [document: string]: string } = {}; // Estado de cada visitante

  uploadQrImage() {
    // Abre el cuadro de diálogo de selección de archivo
    this.qrInput.nativeElement.click();
  }


  initializeDataTable(): void {
    this.ngZone.runOutsideAngular(() => {
      this.dataTable = ($('#visitorsTable') as any).DataTable({
        paging: true,
        ordering: true,
        pageLength: 5,
        lengthMenu: [5, 10, 25, 50],
        lengthChange: true,
        searching: true,
        info: true,
        autoWidth: false,
        language: {
          lengthMenu: '_MENU_',
          zeroRecords: 'No se encontraron registros',
          search: '',
          searchPlaceholder: 'Buscar',
          emptyTable: 'No hay datos disponibles',
          info: '',
          infoEmpty: '',
          infoFiltered: '',
        },
        responsive: true,
        dom: '<"top d-flex justify-content-start mb-2">rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"li>p><"clear">',
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

        $('#customSearch').on('keyup', (e) => {
          const target = e.target as HTMLInputElement;
          this.dataTable.search(target.value).draw();
        });
    });
    
  }
  

// metodos Load DATA
loadUsersAllowedData(): Observable<boolean> {

  return new Observable<boolean>((observer) => {

    const subscriptionAll = this.visitorService
      .getAllUserAllowedData()
      .subscribe({
        next: (list: AccessUserAllowedInfoDto[]) => {

          this.ngZone.run(() => {
            list.forEach((userAllowed) => {
              this.allPeopleAllowed.push({ //lo agrega a la lista "comun" donde estan TODOS los autorizados a ingresar
                document: userAllowed.document,
                name: userAllowed.name,
                userType: userAllowed.userType,
                last_name: userAllowed.last_name,
                documentTypeDto: userAllowed.documentTypeDto,
                authRanges: userAllowed.authRanges,
                email: userAllowed.email,
                vehicles: userAllowed.vehicles,
                neighbor_id: userAllowed.neighbor_id | 0,
              });
            });

            //console.log('Loaded owner/renter list:', this.visitors);
            //this.updateDataTable();
            observer.next(true);
            observer.complete();
          });
          this.updateDataTable();
        },
        error: (err) => {
          console.log(err);
          observer.next(false);
          observer.complete();
        }
      });
    this.subscription.add(subscriptionAll);

  });
}


      updateDataTable(): void {
        if (this.dataTable) {
          this.ngZone.runOutsideAngular(() => {
            const formattedData = this.filteredAllPeopleAllowed.map((visitor, index) => {
              const status = this.visitorStatus[visitor.document] || 'En espera';
              const userTypeIcon = this.getUserTypeIcon(visitor.userType.description);//icono
              let statusButton = '';
              let actionButtons = '';

              switch (status) {
                case 'Ingresado':
                  statusButton = `<span class="badge  text-bg-success">Ingresado</span>`;
                  actionButtons = `<span class="badge  text-bg-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</span>`;
                  break;
                case 'Egresado':
                  statusButton = `<span class="badge  text-bg-danger">Egresado</span>`;
                  break;
                case 'En espera':
                default:
                  statusButton = `<span class="badge text-bg-warning">En espera</span>`;
                  actionButtons = `<span class="badge  text-bg-success" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</span>`;
                  break;
              }
              const userTypeIconWithClick = `
              <span class="user-type-icon" data-document="${visitor.document}"style="cursor:pointer;">
                ${userTypeIcon}
              </span>`;
              console.log('Generando ícono con documento:', visitor.document, userTypeIconWithClick);
              return [
                statusButton,
                `${visitor.last_name}, ${visitor.name}`,
                // "PASSPORT" se muestre como "Pasaporte"
                userTypeIconWithClick,
                `<div class="text-start">${this.getDocumentType(visitor).substring(0,1) + " - " +visitor.document}</div>`,
                `<div class="text-start">
                <select class="form-select" id="vehicles${index}" name="vehicles${index}">
                    <option value="" disabled selected>Seleccione un vehículo</option>
                    ${visitor.vehicles?.length > 0 ? visitor.vehicles.map(vehicle => `
                        <option value="${vehicle.plate}">${vehicle.plate} ${vehicle.vehicle_Type.description
                        === 'Car' ? 'Coche' : 
                      vehicle.vehicle_Type.description === 'MotorBike' ? 'Motocicleta' : 
                      vehicle.vehicle_Type.description === 'Truck' ? 'Camión' : 
                      vehicle.vehicle_Type.description } </option>
                    `).join('') : ''}
                    <option value="sin_vehiculo">Sin vehículo</option>
                </select>
            </div>`,
            `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
                `<div class="d-flex justify-content-center">
                  <div class="dropdown">
                    <button class="btn btn-light border border-2" 
                            type="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false">
                      <i class="bi bi-three-dots-vertical"></i> <!-- Tres puntos verticales -->
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
                      <li><button class="dropdown-item select-action" data-value="verMas" data-index="${index}">Ver más</button></li> <!-- Opción Ver más -->

                      <li><button class="dropdown-item select-action" data-value="ingreso" data-index="${index}">Ingreso</button></li>
                      <li><button class="dropdown-item select-action" data-value="egreso" data-index="${index}">Egreso</button></li>
                    </ul>
                  </div>
                </div>`,
                

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
   const tdata=$('#visitorsTable tbody');
      // Delegación de eventos para los clics en los íconos de los usuarios
      tdata?.on('click', '.user-type-icon', (event: JQuery.TriggeredEvent) => {
        const document = $(event.currentTarget).data('document'); // Obtener el documento del data-atributo
        console.log('Clic en el ícono de usuario. Documento:', document);
        
        // Llamar a ModalDocument pasando el documento
        this.ModalDocument(document);
      });
    
    console.log('tableBody:', tableBody)
    if (tableBody) {
      tableBody.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        
       // Verificar si el clic ocurrió en un ícono de tipo de usuario
        // Manejar el botón "Ver más" en el menú desplegable
        if (target.classList.contains('select-action')) {
          const index = target.getAttribute('data-index');
          const value = target.getAttribute('data-value');
          const selectElement = document.getElementById('vehicles' + index) as HTMLSelectElement;
          const selectedVehicle = selectElement.value;
          if (index !== null) {
           
            let selectedOwner =  this.filteredAllPeopleAllowed[parseInt(index, 10)]; //antes era this.visitors

            // if(this.allEmployersChecked){
            //   selectedOwner = this.allPeopleAllowed[parseInt(index, 10)]; //antes era this.visitors
            // }
            // if(this.allVisitorsChecked){
            //   selectedOwner = this.allPeopleAllowed[parseInt(index, 10)]; //antes era this.visitors
            // }
            // if(this.allOwnersChecked){
            //   let selectedOwnerr = this.allPeopleAllowed[parseInt(index, 10)]; //antes era this.visitors
            //   let selectedOwnerWithNeighborId: AccessUserAllowedInfoDto = {
            //     ...selectedOwnerr,
            //     neighbor_id: 0, // Agregar el neighbor_id
            //   };
            //   selectedOwner = selectedOwnerWithNeighborId;
            // }

            // Aquí se maneja la opción "Ver más"
            if (value === 'verMas') {
              this.MoreInfo(selectedOwner);
            } else {
              // Manejar otras acciones (Ingreso/Egreso)
              const textareaElement = document.getElementById(
                'observations' + index
              ) as HTMLTextAreaElement;

              selectedOwner.observations = textareaElement.value || '';

              if (this.observations===''){
                this.observations=textareaElement.value
              }
              
              const mockEvent = {
                target: { value: value },
              } as unknown as Event;

              this.onSelectionChange(mockEvent, selectedOwner,selectedVehicle);
            }
          }
        }
      });
    } else {
      console.error('No se encontró el cuerpo de la tabla.');
    }
  }

  getUserTypeIcon(descr : string){
    switch (descr){
      case "Employeed" : {    //naranja (orange)
        return `<button style="background-color: #fd7e14;border: bisque;" class="btn btn-primary" title="Empleado">
                  <i class="bi bi-briefcase"></i>
                </button>`
      }
      case "Supplier" : {   //turquesa / verde agua (teal)
        return `<button style="background-color: #20c997;border: bisque;" class="btn btn-warning" title="Proveedor">
                  <i class="bi bi-truck"></i>
                </button>`
      }
      case "Visitor" : {    //azul (blue)
        return   `<button style="background-color: #0d6efd;border: bisque;" class="btn btn-primary" title="Visitante">
                    <i class="bi bi-person-raised-hand"></i>
                  </button> `
      }
      case "Owner" : {    //verde (green)
        return  `<button style="background-color: #198754;border: bisque;" class="btn btn-primary" title="Vecino">
                    <i class="bi bi-house-fill"></i> 
                  </button>`
      }
      case "Tenant" : {   //verde (green)
        return  `<button style="background-color: #198754;border: bisque;" class="btn btn-primary" title="Vecino">
                    <i class="bi bi-house-fill"></i> 
                  </button>`
      }

      case "Worker" : {   //rojo (red)
        return  `<button style="background-color: #dc3545;border: bisque;" class="btn btn-primary" title="Obrero">
                    <i class="bi bi-tools"></i> 
                  </button>`
      }
      case "Delivery" : {   //violeta (indigo)
        return  `<button style="background-color: purple;border: bisque;" class="btn btn-primary" title="Delivery">
                    <i class="bi bi-box-seam"></i> 
                  </button>`
      }
      case "Cleaning" : {   //rosa (pink)
        return  `<button style="background-color: #d63384;border: bisque;" class="btn btn-primary" title="P. de Limpieza">
                    <i class="bi bi-stars"></i>
                  </button>`
      }
      case "Gardener" : { //celeste (cyan)
        return  `<button style="background-color: #0dcaf0;border: bisque;" class="btn btn-primary" title="Jardinero">
                    <i class="bi bi-flower1"></i>
                  </button>`
      }

      default : {
      return  `<button style="background-color: grey;border: bisque;" class="btn btn-primary" title="???">
                  <i class="bi bi-question-lg"></i>
                </button> `
      }
    }
  }

  selectedUserTypes: string[] = [];

  // Definición de las opciones para ng-select
  userTypeOptions = [
    { value: 'neighbour', label: 'Vecino', descriptions: ['Owner', 'Tenant'] },
    { value: 'visitor', label: 'Visitante', descriptions: ['Visitor'] },
    { value: 'employee', label: 'Empleado', descriptions: ['Employeed'] },
    { value: 'service', label: 'Servicio', descriptions: ['Supplier', 'Worker', 'Delivery', 'Cleaning', 'Gardener'] },
    { value: 'supplier', label: 'Proveedor', descriptions: ['Supplier'] },
    { value: 'worker', label: 'Obrero', descriptions: ['Worker'] },
    { value: 'delivery', label: 'Delivery', descriptions: ['Delivery'] },
    { value: 'cleaning', label: 'Personal de Limpieza', descriptions: ['Cleaning'] },
    { value: 'gardener', label: 'Jardinero', descriptions: ['Gardener'] }
  ];

  onFilterSelectionChange(){

    this.loadUsersAllowedAfterRegistrationData();

    this.filteredAllPeopleAllowed = []; // Resetear la lista filtrada

    if (this.selectedUserTypes.length > 0) {
      // Obtener todas las descripciones seleccionadas
      const selectedDescriptions = this.selectedUserTypes
        .map(type => this.userTypeOptions.find(option => option.value === type)?.descriptions)
        .flat();

      // Filtrar usuarios según las descripciones seleccionadas
      const filteredUsers = this.allPeopleAllowed.filter(user => 
        selectedDescriptions.includes(user.userType.description)
      );

      // Procesar los usuarios filtrados
      filteredUsers.forEach(user => {
        if (['Owner', 'Tenant'].includes(user.userType.description)) {
          // Caso especial para vecinos
          this.filteredAllPeopleAllowed.push({
            ...user,
            neighbor_id: 0
          });
        } else {
          // Resto de casos
          this.filteredAllPeopleAllowed.push(user);
        }
      });
    } else {
      // Si no hay selecciones, mostrar todos
      this.filteredAllPeopleAllowed = [...this.allPeopleAllowed];
    }

    console.log("Lista filtrada:", this.filteredAllPeopleAllowed);
    this.updateDataTable();
  }



  onSelectionChange(event: Event, visitor: AccessUserAllowedInfoDto,vehiclePlate:string) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    
    if (selectedValue === 'ingreso') {
      let accessObservable: Observable<boolean>;

      if (visitor.userType.description === 'Owner' || visitor.userType.description === 'Tenant') {
        accessObservable = this.prepareEntryMovement(visitor,vehiclePlate);
      } else if (visitor.userType.description === 'Employeed' || visitor.userType.description === 'Supplier') {
        accessObservable = this.prepareEntryMovementEmp(visitor, vehiclePlate);
      } else {
        //es para visitors y los otros tipos q funcionan igual
        accessObservable = this.prepareEntryVisitor(visitor, vehiclePlate);
      }

      if (accessObservable) {
        const sub = accessObservable.subscribe({
          next: (success) => {
            if (success) {
              console.log('Se registró el Egreso correctamente');

              const sub2 = this.loadUsersAllowedAfterRegistrationData().subscribe({
                next: (response) => {
                  if(response){
                    this.onFilterSelectionChange();
                  }
                },
              });
              this.subscription.add(sub2);

            } else {
              console.log('Falló al registrar egreso');
            }
          },
          error: (error) => {
            console.error('Error al registrar ingreso:', error);
          }
        });
        this.subscription.add(sub);
      }

    } else if (selectedValue === 'egreso') {

      let exitObservable: Observable<boolean>;

      if (visitor.userType.description === 'Owner' || visitor.userType.description === 'Tenant') {
        exitObservable = this.prepareExitMovement(visitor,vehiclePlate);
        

      } else if (visitor.userType.description === 'Employeed' || visitor.userType.description === 'Supplier') {
        exitObservable = this.prepareExitMovementEmp(visitor, vehiclePlate);

      } else {
        //es para visitors y los otros tipos q funcionan igual
        exitObservable = this.prepareExitVisitor(visitor, vehiclePlate);
        //this.visitorService.RegisterExit(visitor, vehiclePlate);
        
      }

      if (exitObservable) {
        const sub = exitObservable.subscribe({
          next: (success) => {
            if (success) {
              console.log('Se registró el Egreso correctamente');

              const sub2 = this.loadUsersAllowedAfterRegistrationData().subscribe({
                next: (response) => {
                  if(response){
                    this.onFilterSelectionChange();
                  }
                },
              });
              this.subscription.add(sub2);

            } else {
              console.log('Falló al registrar egreso');
            }
          },
          error: (error) => {
            console.error('Error al registrar egreso:', error);
          }
        });
        this.subscription.add(sub);
      }

    } 
    // else {
    //   this.visitorStatus[visitor.document] = 'En espera';
    // }

    selectElement.value = '';
}

loadUsersAllowedAfterRegistrationData(): Observable<boolean> {

  return new Observable<boolean>((observer) => {

    const subscriptionAll = this.visitorService
      .getAllUserAllowedData()
      .subscribe({
        next: (list: AccessUserAllowedInfoDto[]) => {

          this.allPeopleAllowed = []; // se vacia

          this.ngZone.run(() => {
            list.forEach((userAllowed) => {
              this.allPeopleAllowed.push({ //se agregan a la lista "comun" donde estan TODOS los autorizados a ingresar
                document: userAllowed.document,
                name: userAllowed.name,
                userType: userAllowed.userType,
                last_name: userAllowed.last_name,
                documentTypeDto: userAllowed.documentTypeDto,
                authRanges: userAllowed.authRanges,
                email: userAllowed.email,
                vehicles: userAllowed.vehicles,
                neighbor_id: userAllowed.neighbor_id | 0,
              });
            });

            console.log('allPeopleAllowed actualizada (luego del registro o cambio de filtro):', this.allPeopleAllowed);
            //this.updateDataTable();
            observer.next(true);
            observer.complete();
          });
        },
        error: (err) => {
          console.log(err);
          observer.next(false);
          observer.complete();
        }
      });
    this.subscription.add(subscriptionAll);

  });
    
}


  allPeopleAllowed: AccessUserAllowedInfoDto[] = [];
  filteredAllPeopleAllowed: AccessUserAllowedInfoDto[] = [];

  // datos de búsqueda/filtrado
  parameter: string = '';



  // mostrar más info de un visitante
  selectedVisitor: AccessUserAllowedInfoDto | null = null; // Información del visitante seleccionado

  getDocumentType(visitor: AccessUserAllowedInfoDto): string {
    return visitor.documentTypeDto?.description === 'PASSPORT'
      ? 'Pasaporte' : 'DNI';
  }

  getVehicles(visitor: AccessUserAllowedInfoDto): AccessNewVehicleDto[] {
    return visitor.vehicles || []; // Devuelve la lista de vehículos o un array vacío
  }

  hasVehicles(visitor: AccessUserAllowedInfoDto): boolean {
    return visitor.vehicles && visitor.vehicles.length > 0; // Verifica si hay vehículos
  }

  // Método para abrir el modal y establecer el visitante seleccionado
  MoreInfo(visitor: AccessUserAllowedInfoDto) {
    this.selectedVisitor = visitor; // Guardar el visitante seleccionado
    this.openModal(); // Abrir el modal
  }
  
  ModalDocument(document:string){
    console.log("me han llamado")
    
    console.log("people",this.userAllowedGetAll)
    const user=this.userAllowedGetAll.find(userallowed => String(userallowed.document) === String(document)
    )
    console.log(user)
    this.selectedVisitor=user||null 
    console.log(this.selectedVisitor)
    this.openModal()
  }

  // Función para actualizar el estado del visitante
  updateVisitorStatus(
    visitor: AccessUserAllowedInfoDto,
    action: 'ingreso' | 'egreso'
  ) {
    if (action === 'ingreso') {
      this.visitorStatus[visitor.document] = 'Ingresado';
    } else if (action === 'egreso') {
      this.visitorStatus[visitor.document] = 'Egresado';
    }

    // Cambia a "En espera" si no egresa después de un tiempo
    //  setTimeout(
    //    () => {
    //      if (this.visitorStatus[visitor.document] === 'Ingresado') {
    //        this.visitorStatus[visitor.document] = 'En espera';
    //      }
    //    } /* tiempo en ms */
    //  );
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
        const newVisitor: AccessUserAllowedInfoDto = {
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
        this.filteredAllPeopleAllowed.push(newVisitor); //CHEQUEAR con vic a q lista le gustaria añadirlo
        this.updateDataTable(); // Actualiza la tabla de visitantes

        // Cerrar el modal si hay uno abierto
        this.closeModal();
      } catch (error) {
        console.error('Error al parsear el código QR:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al procesar el código QR.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
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

  //owner
  doument: AccessDocumentTypeDto = {
    description: 'DNI',
  };
  movement: AccessNewMovementsEntryDtoOwner = {
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
  vehiclee: AccessVehicleOwner = {
    plate: '',
    insurance: '',
    vehicle_Type: {
      description: '',
    },
  };


  // registra el ingreso de un VECINO (propietario o inquilino)
  //Metodo pero con modal de bootstrap (revisar) deje comentado abajo el original por las dudas
  private prepareEntryMovement(visitor: AccessUserAllowedInfoDtoOwner, plate: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        console.log('te llame')
        // Preparar datos del movimiento
        const vehicless = plate ? visitor.vehicles.find(v => v.plate === plate) || undefined : undefined;
        const firstRange = visitor.authRanges[0];
        const now = new Date();
  
        // Construir objeto de movimiento
        this.movement = {
          movementDatetime: now,
          authRangesDto: {
            neighbor_id: firstRange.neighbor_id,
            init_date: new Date(firstRange.init_date),
            end_date: new Date(firstRange.end_date),
            allowedDaysDtos: firstRange.allowedDays || [],
          },
          observations: this.observations,
          newUserAllowedDto: {
            name: visitor.name,
            last_name: visitor.last_name,
            document: visitor.document,
            email: visitor.email,
            user_allowed_Type: visitor.userType,
            documentType: this.doument,
            vehicle: vehicless,
          }
        };
  
        console.log('Observaciones:', this.movement.observations);
  
        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessage')!.textContent = modalMessage;
  
        // Obtener el modal usando el método correcto de Bootstrap 5
        const modalElement = document.getElementById('confirmIngresoModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  
        // Configurar los eventos del modal antes de mostrarlo
        modalElement.addEventListener('hidden.bs.modal', () => {
          // Limpiar los event listeners cuando se cierra el modal
          const confirmButton = document.getElementById('confirmButton')!;
          const cancelButton = document.getElementById('cancelButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });
  
        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmButton')!;
        confirmButton.onclick = () => {
          this.ownerService.registerOwnerRenterEntry(this.movement).subscribe({
            next: (response) => {
              console.log('Ingreso registrado con éxito:', response);
              modal.hide();
              
              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de ingreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(true);
                observer.complete();
              });
            },
            error: (err) => {
              console.error('Error al registrar la entrada:', err);
              modal.hide();
  
              if (err.status !== 409) {
                Swal.fire({
                  title: 'Error',
                  text: 'Error al cargar los datos. Intenta nuevamente.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              } else {
                Swal.fire({
                  title: 'El Vecino tiene un Ingreso previo!',
                  text: 'El Vecino debe egresar antes de poder volver a entrar',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              }
            }
          });
        };
  
        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };
  
        // Mostrar el modal
        modal.show();
  
      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
      }
    });
  }
  



//Egreso con modal de bootstrap 
private prepareExitMovement(visitor: AccessUserAllowedInfoDtoOwner, plate: string): Observable<boolean> {
  return new Observable<boolean>(observer => {
    try {
      // Preparar datos del movimiento
      const vehicless = plate ? visitor.vehicles.find(v => v.plate === plate) || undefined : undefined;
      const firstRange = visitor.authRanges[0];
      const now = new Date();

      // Construir objeto de movimiento
      this.movement = {
        movementDatetime: now,
        authRangesDto: {
          neighbor_id: firstRange.neighbor_id,
          init_date: new Date(firstRange.init_date),
          end_date: new Date(firstRange.end_date),
          allowedDaysDtos: firstRange.allowedDays || [],
        },
        observations: this.observations,
        newUserAllowedDto: {
          name: visitor.name,
          last_name: visitor.last_name,
          document: visitor.document,
          email: visitor.email,
          user_allowed_Type: visitor.userType,
          documentType: this.doument,
          vehicle: vehicless,
        }
      };

      console.log('Observaciones:', this.movement.observations);

      // Preparar mensaje del modal
      const modalMessage = `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`;
      document.getElementById('modalMessageEgreso')!.textContent = modalMessage;

      // Obtener el modal usando el método correcto de Bootstrap 5
      const modalElement = document.getElementById('confirmEgresoModal')!;
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

      // Configurar los eventos del modal antes de mostrarlo
      modalElement.addEventListener('hidden.bs.modal', () => {
        // Limpiar los event listeners cuando se cierra el modal
        const confirmButton = document.getElementById('confirmEgresoButton')!;
        const cancelButton = document.getElementById('cancelEgresoButton')!;
        confirmButton.onclick = null;
        cancelButton.onclick = null;
      });

      // Configurar el botón de confirmación
      const confirmButton = document.getElementById('confirmEgresoButton')!;
      confirmButton.onclick = () => {
        const sub = this.ownerService.registerExitOwner(this.movement).subscribe({
          next: (response) => {
            console.log('Egreso registrado con éxito:', response);
            modal.hide();
            
            Swal.fire({
              title: 'Registro Exitoso',
              text: 'Registro de egreso exitoso.',
              icon: 'success',
              confirmButtonText: 'Cerrar',
            }).then(() => {
              observer.next(true);
              observer.complete();
            });
          },
          error: (err) => {
            console.error('Error al registrar el egreso:', err);
            modal.hide();

            if (err.status !== 409) {
              Swal.fire({
                title: 'Error',
                text: 'Error al cargar los datos. Intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(false);
                observer.complete();
              });
            } else {
              Swal.fire({
                title: 'El Vecino tiene un egreso previo!',
                text: 'El Vecino debe ingresar antes de poder volver a salir',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(false);
                observer.complete();
              });
            }
          }
        });
        this.subscription.add(sub);
      };

      // Configurar el botón de cancelar
      const cancelButton = document.getElementById('cancelEgresoButton')!;
      cancelButton.onclick = () => {
        modal.hide();
        observer.next(false);
        observer.complete();
      };

      // Mostrar el modal
      modal.show();

    } catch (error) {
      console.error('Error al preparar el movimiento:', error);
      observer.error(error);
    }
  });
}



 
  //Empleados
  private userType: AccessUserAllowedTypeDto = {
    description: 'Employeed',
  };


  private prepareEntryMovementEmp(visitor: AccessUserAllowedInfoDtoOwner, platee : string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        // Preparar el objeto de movimiento
        const movementS: AccessMovementEntryDto = {
          description: String(this.observations || ''),
          movementDatetime: new Date().toISOString(),
          vehiclesId: visitor.vehicles.find(x => x.plate === platee)?.plate,
          document: visitor.document,
          documentType: visitor.documentTypeDto.description
        };
  
        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageIngresoEmp')!.textContent = modalMessage;
  
        // Obtener el modal
        const modalElement = document.getElementById('confirmIngresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  
        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
          const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });
  
        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
        confirmButton.onclick = () => {
          const subscription = this.userService.registerEmpSuppEntry(movementS).subscribe({
            next: (response) => {
              console.log('Respuesta de registro:', response);
              console.log('Ingreso registrado con éxito:', response);
              modal.hide();
              
              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de ingreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(true);
                observer.complete();
              });
            },
            error: (err) => {
              console.error('Error al registrar la entrada:', err);
              modal.hide();
  
              if (err.status === 403) {
                const errorMessage = err.error.message;
                
                if (errorMessage === "The user does not have authorization range") {
                  Swal.fire({
                    title: 'Acceso Denegado',
                    text: 'El usuario no tiene un rango de autorización asignado.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                  });
                } else if (errorMessage === "The user does not have authorization to entry for today") {
                  this.helperService.entryOutOfAuthorizedHourRange(
                    visitor.authRanges.at(this.helperService.todayIsInDateRange(visitor.authRanges))
                  );
                }
                observer.next(false);
                observer.complete();
              } else if (err.status === 409) {
                Swal.fire({
                  title: 'Error',
                  text: 'Tiene que salir antes de entrar.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              }
            }
          });
          this.subscription.add(subscription);
        };
  
        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };
  
        // Mostrar el modal
        modal.show();
  
      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  }
  
  private prepareExitMovementEmp(visitor: AccessUserAllowedInfoDtoOwner, platee : string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        // Preparar el objeto de movimiento
        const movementS: AccessMovementEntryDto = {
          description: String(this.observations || ''),
          movementDatetime: new Date().toISOString(),
          vehiclesId: visitor.vehicles.find(x => x.plate === platee)?.plate,
          document: visitor.document,
          documentType: visitor.documentTypeDto.description
        };
  
        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageEgresoEmp')!.textContent = modalMessage;
  
        // Obtener el modal
        const modalElement = document.getElementById('confirmEgresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  
        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
          const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });
  
        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
        confirmButton.onclick = () => {
          const sub = this.userService.registerEmpSuppExit(movementS).subscribe({
            next: (response) => {
              console.log('Egreso registrado con éxito:', response);
              modal.hide();
              
              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de egreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(true);
                observer.complete();
              });
            },
            error: (err) => {
              console.error('Error al registrar el egreso:', err);
              modal.hide();
  
              if (err.status != 409 && err.status != 403) {
                Swal.fire({
                  title: 'Error',
                  text: 'Error al cargar los datos. Intenta nuevamente.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              } else if (err.status === 403) {
                const errorMessage = err.error.message;
                
                if (errorMessage === "The user does not have authorization range") {
                  Swal.fire({
                    title: 'Acceso Denegado',
                    text: 'El usuario no tiene un rango de autorización asignado para hoy.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                  });
                } else if (errorMessage === "The user does not have authorization to entry for today") {
                  this.helperService.entryOutOfAuthorizedHourRange(
                    visitor.authRanges.at(this.helperService.todayIsInDateRange(visitor.authRanges))
                  );
                }
                observer.next(false);
                observer.complete();
              } else if (err.status === 409) {
                Swal.fire({
                  title: 'Error',
                  text: 'Tiene que entrar antes de salir.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              }
            }
          });
          this.subscription.add(sub);
        };
  
        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };
  
        // Mostrar el modal
        modal.show();
  
      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  }

  prepareEntryVisitor(visitor: AccessUserAllowedInfoDto, vehiclePlate: string): Observable<boolean>{
    return new Observable<boolean>((observer) => {
  
      try {
  
        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageIngresoEmp')!.textContent = modalMessage;
  
        // Obtener el modal
        const modalElement = document.getElementById('confirmIngresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  
        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
          const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });
  
        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
        confirmButton.onclick = () => {
          const sub = this.visitorService.RegisterAccess(visitor, vehiclePlate).subscribe({
            next: (response) => {
              console.log("respuesta: ", response);
              modal.hide();
              if(response){
                observer.next(true);
                observer.complete();
              } else {
                observer.next(false);
                observer.complete();
              }
            },
            error: (error) => {
              console.error('Error al registrar egreso:', error);
              modal.hide();
              observer.next(false);
              observer.complete();
            }
          });
          this.subscription.add(sub);
        };
  
        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };
  
        // Mostrar el modal
        modal.show();
  
      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  
  }
  
  prepareExitVisitor(visitor: AccessUserAllowedInfoDto, vehiclePlate: string): Observable<boolean>{
    return new Observable<boolean>((observer) => {
  
      try {
  
        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageEgresoEmp')!.textContent = modalMessage;
  
        // Obtener el modal
        const modalElement = document.getElementById('confirmEgresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  
        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
          const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });
  
        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
        confirmButton.onclick = () => {
          const sub = this.visitorService.RegisterExit(visitor, vehiclePlate).subscribe({
            next: (response) => {
              console.log("respuesta: ", response);
              modal.hide();
              if(response){
                observer.next(true);
                observer.complete();
              }
              else {
                observer.next(false);
                observer.complete();
              }
            },
            error: (error) => {
              console.error('Error al registrar egreso:', error);
              modal.hide();
              observer.next(false);
              observer.complete();
            }
          });
          this.subscription.add(sub);
        };
  
        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };
  
        // Mostrar el modal
        modal.show();
  
      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  }

//---------- EMERGENCIAS --------
private prepareExitMovementEmergency(visitor: AccessUserAllowedInfoDtoOwner, platee : string): Observable<boolean> {
  return new Observable<boolean>(observer => {
    try {
      // Preparar el objeto de movimiento
      const movementS: AccessNewEmergencyDto = {
        people: [
          {
            document: {
              type: visitor.documentTypeDto,
              number: visitor.document,
          },
          name: visitor.name,
          lastName: visitor.last_name,
          }
        ],
        vehicle:   null,
        observations: this.observations,
        loggedUserId: 1,
      };

      // Preparar mensaje del modal
      const modalMessage = `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`;
      document.getElementById('modalMessageIngresoEmp')!.textContent = modalMessage;

      // Obtener el modal
      const modalElement = document.getElementById('confirmIngresoEmpModal')!;
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

      // Configurar los eventos del modal
      modalElement.addEventListener('hidden.bs.modal', () => {
        const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
        const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
        confirmButton.onclick = null;
        cancelButton.onclick = null;
      });

      // Configurar el botón de confirmación
      const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
      confirmButton.onclick = () => {
        const subscription = this.emergencyService.registerEmergencyExit(movementS).subscribe({
          next: (response) => {

            console.log('Respuesta de registro:', response);
            console.log('Ingreso registrado con éxito:', response);
            modal.hide();
            if(response.at(0)?.state === 'SUCCESSFUL'){
              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de egreso exitoso',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(true);
                observer.complete();
              });
            }
            else {
              const state = this.getState(response.at(0)?.state +'')
              Swal.fire({
                title: 'Registro inválido',
                text: state,
                icon: 'error',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(false);
                observer.complete();
              });
            }
          },
          error: (err) => {
            console.error('Error al registrar la entrada:', err);
            modal.hide();
          }
        });
        this.subscription.add(subscription);
      };

      // Configurar el botón de cancelar
      const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
      cancelButton.onclick = () => {
        modal.hide();
        observer.next(false);
        observer.complete();
      };

      // Mostrar el modal
      modal.show();

    } catch (error) {
      console.error('Error al preparar el movimiento:', error);
      observer.error(error);
      observer.complete();
    }
  });
}

private prepareEntryMovementEmergency(visitor: AccessUserAllowedInfoDtoOwner, platee : string): Observable<boolean> {
  return new Observable<boolean>(observer => {
    try {
      // Preparar el objeto de movimiento
      const movementS: AccessNewEmergencyDto = {
        people: [
          {
            document: {
              type: visitor.documentTypeDto,
              number: visitor.document,
          },
          name: visitor.name,
          lastName: visitor.last_name,
          }
        ],
        vehicle: {
          plate: platee,
          vehicle_Type: visitor.vehicles.find((a) => a.plate === platee)?.vehicle_Type ?? {
            description: ''
          },
        },
        observations: this.observations,
        loggedUserId: 1,
      };

      // Preparar mensaje del modal
      const modalMessage = `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`;
      document.getElementById('modalMessageEgresoEmp')!.textContent = modalMessage;

      // Obtener el modal
      const modalElement = document.getElementById('confirmEgresoEmpModal')!;
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

      // Configurar los eventos del modal
      modalElement.addEventListener('hidden.bs.modal', () => {
        const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
        const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
        confirmButton.onclick = null;
        cancelButton.onclick = null;
      });

      // Configurar el botón de confirmación
      const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
      confirmButton.onclick = () => {
        const sub = this.emergencyService.registerEmergencyEntry(movementS).subscribe({
          next: (response) => {

            console.log('Respuesta de registro:', response);
            console.log('Ingreso registrado con éxito:', response);
            modal.hide();
            if(response.at(0)?.state === 'SUCCESSFUL'){
              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de ingreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(true);
                observer.complete();
              });
            }
            else {
              const state = this.getState(response.at(0)?.state +'')
              Swal.fire({
                title: 'Registro inválido',
                text: state,
                icon: 'error',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(false);
                observer.complete();
              });
            }
          },
          error: (err) => {
            console.error('Error al registrar el egreso:', err);
            modal.hide();

            if (err.status != 409 && err.status != 403) {
              Swal.fire({
                title: 'Error',
                text: 'Error al cargar los datos. Intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(false);
                observer.complete();
              });
            } else if (err.status === 403) {
              const errorMessage = err.error.message;
              
              if (errorMessage === "The user does not have authorization range") {
                Swal.fire({
                  title: 'Acceso Denegado',
                  text: 'El usuario no tiene un rango de autorización asignado para hoy.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar'
                });
              } else if (errorMessage === "The user does not have authorization to entry for today") {
                this.helperService.entryOutOfAuthorizedHourRange(
                  visitor.authRanges.at(this.helperService.todayIsInDateRange(visitor.authRanges))
                );
              }
              observer.next(false);
              observer.complete();
            } else if (err.status === 409) {
              Swal.fire({
                title: 'Error',
                text: 'Tiene que entrar antes de salir.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(false);
                observer.complete();
              });
            }
          }
        });
        this.subscription.add(sub);
      };

      // Configurar el botón de cancelar
      const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
      cancelButton.onclick = () => {
        modal.hide();
        observer.next(false);
        observer.complete();
      };

      // Mostrar el modal
      modal.show();

    } catch (error) {
      console.error('Error al preparar el movimiento:', error);
      observer.error(error);
      observer.complete();
    }
  });
}

private getState(state : string) : string{
  let text = '';
  switch (state) {
    case 'UNAUTHORIZED':
      text = 'El usuario no está autorizado a ingresar.';
      break;
    case 'WITHOUT_USER':
      text =  'No existe un usuario con el documento provisto.';
      break;
    case 'WITHOUT_EXIT':
      text =  'Tiene que salir antes de entrar';
      break;
    case 'WITHOUT_ENTRY':
      text =  'Tiene que entrar antes de salir.';
      break;
    case 'FAILED':
      text =  'Error al cargar los datos.';
      break;
    case null:
    default:
      return '';
  }    
  return text
}
}