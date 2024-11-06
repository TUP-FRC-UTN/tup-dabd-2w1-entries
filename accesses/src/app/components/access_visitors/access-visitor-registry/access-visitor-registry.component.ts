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
  ViewChildren,
  QueryList,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AuthRangeInfoDto,
  AccessDocumentTypeDto,
  AccessLastEntryUserAllowedDto,
  AccessLastExitUserAllowedDto,
  AccessNewAuthRangeDto,
  AccessNewMovementExitDto,
  AccessNewMovementsEntryDto,
  AccessNewUserAllowedDto,
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
import { InternalSettings } from 'datatables.net';
import { AllowedDaysDto } from '../../../services/access_visitors/movement.interface';
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
  AccessSuppEmpDto,
} from '../../../models/access-employee-allowed/access-user-allowed';
import { AccessVisitorHelperService } from '../../../services/access_visitors/access-visitor-helper.service';
import { AccessOwnerRenterserviceService } from '../../../services/access-owner/access-owner-renterservice.service';
import { AccessUserServiceService } from '../../../services/access-user/access-user-service.service';

@Component({
  selector: 'access-app-visitor-registry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccessAutosizeTextareaDirective,
    RouterModule,
    NgxScannerQrcodeModule,
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
  constructor(private userService: AccessUserServiceService) {}

  dataTable: any;

  isModalOpen = false;

  private readonly ngZone: NgZone = inject(NgZone);

  modalValid: boolean = false;

  //carga TODOS los invitados al iniciar la pantalla
  ngOnInit(): void {
    //DATOS
    //los 3 siguientes cargan a TODOS en la lista "comun" (donde estan todos los userAllowed)
    const sub = this.loadUsersAllowedData().subscribe({
      next: (data) => {
        console.log("allPeopleAllowed: ", this.allPeopleAllowed)
        this.filteredAllPeopleAllowed = this.allPeopleAllowed;
        
      },
      error: (err) => {
        console.log(err);
      }
    }); 
    this.subscription.add(sub);
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

  //metodos para limpiar los filtros
  //agrupa TODOS los checkbox (q tengan #checkBoxRef en su tag)
  @ViewChildren('checkBoxRef') checkBoxes!: QueryList<ElementRef>;

  clearFilters(){
    this.checkBoxes.forEach((checkbox) => {
      checkbox.nativeElement.checked = false;
    });

    // Limpia el input de busqueda 
    this.dataTable.search('').draw(false);

    //limpia los valores elegidos en los checkbox
    this.selectedValues = [];
    //busca todos los userAllowed (ya q no hay filtros en this.selectedValues)
    this.applyFilter();
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

            return [
              statusButton,
              `${visitor.last_name}, ${visitor.name}`,
              // "PASSPORT" se muestre como "Pasaporte"
              this.getUserTypeIcon(visitor.userType.description),
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
              

              actionButtons,
            ];
          });

          this.dataTable.clear().rows.add(formattedData).draw();
        });
        this.addEventListeners();
        // if(this.allEmployersChecked){
        //   this.ngZone.runOutsideAngular(() => {
        //     const formattedData = this.employers.map((visitor, index) => {
        //       const status = this.visitorStatus[visitor.document] || 'En espera';
    
        //       let statusButton = '';
        //       let actionButtons = '';
    
        //       switch (status) {
        //         case 'Ingresado':
        //           statusButton = `<button class="btn btn-success">Ingresado</button>`;
        //           actionButtons = `<button class="btn btn-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</button>`;
        //           break;
        //         case 'Egresado':
        //           statusButton = `<button class="btn btn-danger">Egresado</button>`;
        //           break;
        //         case 'En espera':
        //         default:
        //           statusButton = `<button class="btn btn-warning">En espera</button>`;
        //           actionButtons = `<button class="btn btn-info" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</button>`;
        //           break;
        //       }
    
        //       return [
        //         `${visitor.last_name} ${visitor.name}`,
        //         this.getUserTypeIcon(visitor.userType.description),
        //       `<div class="text-start">${this.getDocumentType(visitor) + " " +visitor.document}</div>`,
        //         `<div class="text-start">
        //         <select class="form-select" id="vehicles${index}" name="vehicles${index}">
        //             <option value="" disabled selected>Seleccione un vehículo</option>
        //             ${visitor.vehicles?.length > 0 ? visitor.vehicles.map(vehicle => `
        //                 <option value="${vehicle.plate}">${vehicle.plate} ${vehicle.vehicle_Type.description
        //                 === 'Car' ? 'Coche' : 
        //             vehicle.vehicle_Type.description === 'MotorBike' ? 'Motocicleta' : 
        //             vehicle.vehicle_Type.description === 'Truck' ? 'Camión' : 
        //             vehicle.vehicle_Type.description } </option>
        //             `).join('') : ''}
        //             <option value="sin_vehiculo">Sin vehículo</option>
        //         </select>
        //     </div>`,
        //         `<div class="d-flex justify-content-center">
        //           <div class="dropdown">
        //             <button class="btn btn-white dropdown-toggle p-0" 
        //                     type="button" 
        //                     data-bs-toggle="dropdown" 
        //                     aria-expanded="false">
        //                 <i class="fas fa-ellipsis-v" style="color: black;"></i> <!-- Tres puntos verticales -->
        //             </button>
        //             <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
        //               <li><button class="dropdown-item select-action" data-value="verMas" data-index="${index}">Ver más</button></li> <!-- Opción Ver más -->
    
        //               <li><button class="dropdown-item select-action" data-value="ingreso" data-index="${index}">Ingreso</button></li>
        //               <li><button class="dropdown-item select-action" data-value="egreso" data-index="${index}">Egreso</button></li>
        //             </ul>
        //           </div>
        //         </div>`,
        //         `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
        //         statusButton,
        //         actionButtons,
        //       ];
        //     });
    
        //     this.dataTable.clear().rows.add(formattedData).draw();
        //   });
        //   this.addEventListeners();
        // } 
        // else if(this.allVisitorsChecked){
        //   this.ngZone.runOutsideAngular(() => {
        //     const formattedData = this.visitors.map((visitor, index) => {
        //       const status = this.visitorStatus[visitor.document] || 'En espera';
    
        //       let statusButton = '';
        //       let actionButtons = '';
    
        //       switch (status) {
        //         case 'Ingresado':
        //           statusButton = `<button class="btn btn-success">Ingresado</button>`;
        //           actionButtons = `<button class="btn btn-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</button>`;
        //           break;
        //         case 'Egresado':
        //           statusButton = `<button class="btn btn-danger">Egresado</button>`;
        //           break;
        //         case 'En espera':
        //         default:
        //           statusButton = `<button class="btn btn-warning">En espera</button>`;
        //           actionButtons = `<button class="btn btn-info" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</button>`;
        //           break;
        //       }
    
        //       return [
        //         `${visitor.last_name} ${visitor.name}`,
        //         this.getUserTypeIcon(visitor.userType.description),
        //       `<div class="text-start">${this.getDocumentType(visitor) + " " +visitor.document}</div>`,
        //         `<div class="text-start">
        //         <select class="form-select" id="vehicles${index}" name="vehicles${index}">
        //             <option value="" disabled selected>Seleccione un vehículo</option>
        //             ${visitor.vehicles.length > 0 ? visitor.vehicles.map(vehicle => `
        //                 <option value="${vehicle.plate}">${vehicle.plate} ${vehicle.vehicle_Type.description
        //                 === 'Car' ? 'Coche' : 
        //             vehicle.vehicle_Type.description === 'MotorBike' ? 'Motocicleta' : 
        //             vehicle.vehicle_Type.description === 'Truck' ? 'Camión' : 
        //             vehicle.vehicle_Type.description } </option>
        //             `).join('') : ''}
        //             <option value="sin_vehiculo">Sin vehículo</option>
        //         </select>
        //     </div>`,
        //         `<div class="d-flex justify-content-center">
        //           <div class="dropdown">
        //             <button class="btn btn-white dropdown-toggle p-0" 
        //                     type="button" 
        //                     data-bs-toggle="dropdown" 
        //                     aria-expanded="false">
        //                 <i class="fas fa-ellipsis-v" style="color: black;"></i> <!-- Tres puntos verticales -->
        //             </button>
        //             <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
        //               <li><button class="dropdown-item select-action" data-value="verMas" data-index="${index}">Ver más</button></li> <!-- Opción Ver más -->
    
        //               <li><button class="dropdown-item select-action" data-value="ingreso" data-index="${index}">Ingreso</button></li>
        //               <li><button class="dropdown-item select-action" data-value="egreso" data-index="${index}">Egreso</button></li>
        //             </ul>
        //           </div>
        //         </div>`,
        //         `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
        //         statusButton,
        //         actionButtons,
        //       ];
        //     });
    
        //     this.dataTable.clear().rows.add(formattedData).draw();
        //   });
        //   this.addEventListeners();
        // }
        // else if(this.allOwnersChecked){
        //   this.ngZone.runOutsideAngular(() => {
        //     const formattedData = this.owners.map((visitor, index) => {
        //       const status = this.visitorStatus[visitor.document] || 'En espera';
    
        //       let statusButton = '';
        //       let actionButtons = '';
    
        //       switch (status) {
        //         case 'Ingresado':
        //           statusButton = `<button class="btn btn-success">Ingresado</button>`;
        //           actionButtons = `<button class="btn btn-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</button>`;
        //           break;
        //         case 'Egresado':
        //           statusButton = `<button class="btn btn-danger">Egresado</button>`;
        //           break;
        //         case 'En espera':
        //         default:
        //           statusButton = `<button class="btn btn-warning">En espera</button>`;
        //           actionButtons = `<button class="btn btn-info" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</button>`;
        //           break;
        //       }
    
        //       return [
        //         `${visitor.last_name} ${visitor.name}`,
        //         this.getUserTypeIcon(visitor.userType.description),
        //     //   `<div class="text-start">${this.getDocumentType(visitor) + " " +visitor.document}</div>`,
        //     `<div class="text-start">${"D " +visitor.document}</div>`,
        //         `<div class="text-start">
        //         <select class="form-select" id="vehicles${index}" name="vehicles${index}">
        //             <option value="" disabled selected>Seleccione un vehículo</option>
        //             ${visitor.vehicles.length > 0 ? visitor.vehicles.map(vehicle => `
        //                 <option value="${vehicle.plate}">${vehicle.plate} ${vehicle.vehicle_Type.description 
        //                 === 'Car' ? 'Coche' : 
        //             vehicle.vehicle_Type.description === 'MotorBike' ? 'Motocicleta' : 
        //             vehicle.vehicle_Type.description === 'Truck' ? 'Camión' : 
        //             vehicle.vehicle_Type.description } </option>
        //             `).join('') : ''}
        //             <option value="sin_vehiculo">Sin vehículo</option>
        //         </select>
        //     </div>`,
        //         `<div class="d-flex justify-content-center">
        //           <div class="dropdown">
        //             <button class="btn btn-white dropdown-toggle p-0" 
        //                     type="button" 
        //                     data-bs-toggle="dropdown" 
        //                     aria-expanded="false">
        //                 <i class="fas fa-ellipsis-v" style="color: black;"></i> <!-- Tres puntos verticales -->
        //             </button>
        //             <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
        //               <li><button class="dropdown-item select-action" data-value="verMas" data-index="${index}">Ver más</button></li> <!-- Opción Ver más -->
    
        //               <li><button class="dropdown-item select-action" data-value="ingreso" data-index="${index}">Ingreso</button></li>
        //               <li><button class="dropdown-item select-action" data-value="egreso" data-index="${index}">Egreso</button></li>
        //             </ul>
        //           </div>
        //         </div>`,
        //         `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
        //         statusButton,
        //         actionButtons,
        //       ];
        //     });
    
        //     this.dataTable.clear().rows.add(formattedData).draw();
        //   });
        //   this.addEventListeners();
        // }
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
      case "Employeed" : {
        return `<button style="background-color: orangered;border: bisque;" class="btn btn-primary" title="Empleado">
  <i class="bi bi-tools"></i> 
</button>`
      }
      case "Supplier" : {
        return `<button style="background-color: rgb(255, 230, 4);border: bisque;" class="btn btn-primary" title="Proveedor">
  <i class="bi bi-box-seam-fill"></i> 
</button>`
      }
      case "Visitor" : {
        return   `<button style="background-color: blue;border: bisque;" class="btn btn-primary" title="Visitante">
  <i class="bi bi-person-raised-hand"></i>
</button> `
      }
      case "Owner" : {
        return  `<button style="background-color: green;border: bisque;" class="btn btn-primary" title="Vecino">
  <i class="bi bi-house-fill"></i> 
</button>`
      }
      case "Tenant" : {
        return  `<button style="background-color: green;border: bisque;" class="btn btn-primary" title="Vecino">
  <i class="bi bi-house-fill"></i> 
</button>`
      }
      default : {
        return  `<button style="background-color: blue;border: bisque;" class="btn btn-primary" title="Visitante">
        <i class="bi bi-person-raised-hand"></i>
      </button> `
      }
    }
  }

  selectedValues: string[] = [];

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      this.selectedValues.push(value); // Agregar el valor si está seleccionado
    } else {
      this.selectedValues = this.selectedValues.filter(val => val !== value); // Eliminar el valor si está deseleccionado
    }

    console.log(this.selectedValues); // Puedes ver el resultado actual en la consola
    this.applyFilter(); // Llama al método de filtro si necesitas hacerlo automáticamente
  }

  applyFilter(): void {
    this.filteredAllPeopleAllowed = []; // Resetea la lista "comun" (donde estan todos los userAllowed) 
                                // antes de aplicar el filtro
    //console.log("visitors list actual: ", this.allPeopleAllowed)

    if (this.selectedValues.length > 0) {        
        for (let value of this.selectedValues) {
            switch (value) {
                case "employee": {
                  this.loadUsersAllowedData();
                  //lista de SOLO empleados
                  let employees = this.allPeopleAllowed.filter(x => x.userType.description === 'Employeed')
                  for (let user of employees) {
                      this.filteredAllPeopleAllowed.push(user);
                  }
                  break; // Continua al siguiente valor en lugar de detener el ciclo
                }
                case "supplier": {
                  this.loadUsersAllowedData();
                  //lista de SOLO proveedores
                  let suppliers = this.allPeopleAllowed.filter(x => x.userType.description === 'Supplier')
                  for (let user of suppliers) {
                      this.filteredAllPeopleAllowed.push(user);
                  }
                  break; // Continua al siguiente valor en lugar de detener el ciclo
                }
                case "neighbour": {
                  this.loadUsersAllowedData();
                  let neighbours = this.allPeopleAllowed.filter(x => x.userType.description === 'Owner' || x.userType.description === 'Tenant')
                  for (let user of neighbours) {
                      const owner: AccessUserAllowedInfoDto = {
                          ...user,  // Copia los campos de `user`
                          neighbor_id: 0  // Agrega el campo `neighbor_id` con un valor por defecto
                      };
                      this.filteredAllPeopleAllowed.push(owner);
                  }
                  break;
                }
                case "visitor": {
                  this.loadUsersAllowedData();
                  let visitors = this.allPeopleAllowed.filter(x => x.userType.description === 'Visitor')
                  for (let user of visitors) {
                      this.filteredAllPeopleAllowed.push(user);
                  }
                  break;
              }

            }
        }
     } else {

        //si no hay ninguno seleccionado, cargamos todos los tipos
        //Empleados y Proveedores
        this.loadUsersAllowedData();
        for (let user of this.allPeopleAllowed) {
            this.filteredAllPeopleAllowed.push(user);
        }
        
     }

    console.log("visitors list filtrada: ", this.filteredAllPeopleAllowed)

    this.updateDataTable(); // Actualiza la tabla al final de aplicar todos los filtros
}


  onSelectionChange(event: Event, visitor: AccessUserAllowedInfoDto,vehiclePlate:string) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    
    if (selectedValue === 'ingreso') {
      let accessObservable: Observable<boolean>;

      if (visitor.userType.description === 'Owner' || visitor.userType.description === 'Tenant') {
        accessObservable = this.prepareEntryMovement(visitor,vehiclePlate);
      } else if (visitor.userType.description === 'Employeed' || visitor.userType.description === 'Supplier') {
        accessObservable = this.prepareEntryMovementEmp(visitor);
      } else {
        accessObservable = this.visitorService.RegisterAccess(visitor, vehiclePlate);
      }

      if (accessObservable) {
        const sub = accessObservable.subscribe({
          next: (success) => {
            if (success) {
              console.log('Se registró el Ingreso correctamente');
              this.updateVisitorStatus(visitor, 'ingreso');
              this.updateDataTable();
            } else {
              console.log('Falló al registrar ingreso');
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
        exitObservable = this.prepareExitMovementEmp(visitor);

      } else {
        exitObservable = this.visitorService.RegisterExit(visitor, vehiclePlate);
        
      }

      if (exitObservable) {
        const sub = exitObservable.subscribe({
          next: (success) => {
            if (success) {
              console.log('Se registró el Egreso correctamente');
              this.updateVisitorStatus(visitor, 'egreso');
              this.updateDataTable();
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

    } else {
      this.visitorStatus[visitor.document] = 'En espera';
    }

    selectElement.value = '';
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
  private prepareEntryMovement(visitor: AccessUserAllowedInfoDtoOwner,plate:string): Observable<boolean> {
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
  
        // Mostrar diálogo de confirmación
        Swal.fire({
          title: 'Confirmar Ingreso',
          text: `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            // Realizar el registro solo si se confirma
            this.ownerService.registerOwnerRenterEntry(this.movement)
              .subscribe({
                next: (response) => {
                  console.log('Ingreso registrado con éxito:', response);
                  Swal.fire({
                    title: 'Registro Exitoso',
                    text: 'Registro de ingreso exitoso.',
                    icon: 'success',
                    confirmButtonText: 'Cerrar',
                  })
                  .then(() => {
                    observer.next(true);
                    observer.complete();
                  });
                },
                error: (err) => {
                  console.error('Error al registrar la entrada:', err);
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
          } else {
            // Si se cancela la confirmación
            observer.next(false);
            observer.complete();
          }
        }).catch(error => {
          console.error('Error en el diálogo de confirmación:', error);
          observer.error(error);
        });
      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
      }
    });
  }
  
  private prepareExitMovement(visitor: AccessUserAllowedInfoDtoOwner,plate:string): Observable<boolean> {

    return new Observable<boolean>((observer) => {
      const vehicless = plate ? visitor.vehicles.find(v => v.plate === plate) || undefined : undefined;
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
                //return true;
                observer.next(true);
                observer.complete();
              },
              error: (err) => {
                console.error('Error al registrar el egreso:', err);
                if(err.status != 409){
                  Swal.fire({
                    title: 'Error',
                    text: 'Error al cargar los datos. Intenta nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                  });
                  //return false;
                  observer.next(false);
                  observer.complete();
                } else {
                  Swal.fire({
                    title: 'El Vecino tiene un egreso previo!',
                    text: 'El Vecino debe ingresar antes de poder volver a salir',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                  });
                  //return false;
                  observer.next(false);
                  observer.complete();
                }
              },
            });
          this.subscription.add(sub);
        }

      });

    });
}

  //Empleados
  private userType: AccessUserAllowedTypeDto = {
    description: 'Employeed',
  };


  
  private prepareEntryMovementEmp(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {
    return new Observable<boolean>(observer => {
        try {
          
            // Preparar el objeto de movimiento
            const movementS: AccessMovementEntryDto = {
                description: String(this.observations || ''),
                movementDatetime: new Date().toISOString(),
                vehiclesId: 0,
                document: visitor.document,
            };

            // Mostrar diálogo de confirmación
            Swal.fire({
                title: 'Confirmar Ingreso',
                text: `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    // Realizar el registro solo si se confirma
                    const subscription = this.userService.registerEmpSuppEntry(movementS)
                        .subscribe({
                            next: (response) => {
                                // Log de la respuesta recibida para verificar
                                console.log('Respuesta de registro:', response);
                                
                                console.log('Ingreso registrado con éxito:', response);
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

                                if(err.status == 403){
                                this.helperService.entryOutOfAuthorizedHourRange(visitor.authRanges.at(this.helperService.todayIsInDateRange(visitor.authRanges)))
                                // Swal.fire({
                                //   title: 'Error',
                                //   text: 'No tiene permitido salir.',
                                //   icon: 'error',
                                //   confirmButtonText: 'Cerrar',
                                // });
                                //return false;
                                observer.next(false);
                                observer.complete(); 
                              }
                              else if (err.status == 409){
                                Swal.fire({
                                  title: 'Error',
                                  text: 'Tiene que salir antes de entrar.',
                                  icon: 'error',
                                  confirmButtonText: 'Cerrar',
                                });
                                
                               

                                Swal.fire({
                                    title: 'eee',
                                    icon: 'error',
                                    confirmButtonText: 'Cerrar',
                                }).then(() => {
                                    observer.next(false);
                                    observer.complete();
                                });
                              }}
                        });

                    // Agregar la suscripción al gestor de suscripciones
                    this.subscription.add(subscription);
                    
                } else {
                    // Si se cancela la confirmación
                    observer.next(false);
                    observer.complete();
                }
            }).catch(error => {
                console.error('Error en el diálogo de confirmación:', error);
                observer.error(error);
                observer.complete();
            });

        } catch (error) {
            console.error('Error al preparar el movimiento:', error);
            observer.error(error);
            observer.complete();
        }
    });
}




  private prepareExitMovementEmp(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {

    return new Observable<boolean>((observer) => {

      const movementS: AccessMovementEntryDto = {
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
              //return true;
              observer.next(true);
              observer.complete(); 
            },
            error: (err) => {
              console.error('Error al registrar el egreso:', err);
              if(err.status != 409 && err.status != 403){
                Swal.fire({
                  title: 'Error',
                  text: 'Error al cargar los datos. Intenta nuevamente.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                });
                //return false;
                observer.next(false);
                observer.complete(); 

              } else if(err.status == 403){
                this.helperService.entryOutOfAuthorizedHourRange(visitor.authRanges.at(this.helperService.todayIsInDateRange(visitor.authRanges)))
                // Swal.fire({
                //   title: 'Error',
                //   text: 'No tiene permitido salir.',
                //   icon: 'error',
                //   confirmButtonText: 'Cerrar',
                // });
                //return false;
                observer.next(false);
                observer.complete(); 
              }
              else if (err.status == 409){
                Swal.fire({
                  title: 'Error',
                  text: 'Tiene que entrar antes de salir.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                });
                //return false;
                observer.next(false);
                observer.complete(); 
              }
               else {
                Swal.fire({
                  title: 'El Empleado tiene un Egreso previo!',
                  text: 'El Empleado debe ingresar antes de poder volver a salir',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                });
                //return false;
                observer.next(false);
                observer.complete(); 
              }
            },
          });
  
          this.subscription.add(sub);
        }

      });
      
    });
    
  }
}