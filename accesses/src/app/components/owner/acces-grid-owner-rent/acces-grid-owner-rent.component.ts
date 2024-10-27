import { AfterViewInit, Component, ElementRef, inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, first, fromEvent, map, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';

import { InternalSettings } from 'datatables.net';

import { AccessOwnerRenterserviceService } from '../../../services/ownerService/access-owner-renterservice.service';
import { AuthRangeInfoDto, Document_TypeDto, NewAuthRangeDto, NewMovements_EntryDto, User_AllowedInfoDto, Vehicle } from '../../../models/visitors/interface/owner';
import { LastEntryUserAllowedDto, LastExitUserAllowedDto } from '../../../models/visitors/access-VisitorsModels';
import { VisitorsService } from '../../../services/visitors/access-visitors.service';
import { AccessVisitorHelperService } from '../../../services/visitors/access-visitor-helper.service';

@Component({
  selector: 'app-acces-grid-owner-rent',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './acces-grid-owner-rent.component.html',
  styleUrl: './acces-grid-owner-rent.component.css'
})
export class AccesGridOwnerRentComponent implements OnInit,AfterViewInit,OnDestroy{

  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    this.subscription.unsubscribe();
  }
  doument:Document_TypeDto={
    description:'DNI'

    
  }
 private observations:string='';
  movement:NewMovements_EntryDto={
    movementDatetime:new Date(),
    observations:'',
    newUserAllowedDto:{
      name:'',
      last_name:'',
      document:'',
      user_allowed_Type:{
        description:''
      },
      documentType:this.doument,
      email:''
    },
    authRangesDto:{
      neighbor_id:0,
      init_date:new Date(), 
  end_date:new Date(),
  allowedDaysDtos:[]  
    },
  }
  dataTable: any;
  vehiclee:Vehicle={
    plate:'',
    insurance:'',
    vehicle_Type:{
      description:''
    }
  }
  initializeDataTable(): void {
    this.ngZone.runOutsideAngular(() => {
      this.dataTable = ($('#myTable') as any).DataTable({
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
          search: "Buscar:",
       
          emptyTable: "No hay datos disponibles",
        },
        responsive: true,
      });
      $('#dt-search-0').off('keyup').on('keyup', () => {
        const searchTerm = ($('#dt-search-0').val() as string).toLowerCase();
  
        if (searchTerm.length >= 3) {
          this.dataTable.search(searchTerm).draw();
        } else if (searchTerm.length === 0) {
          this.dataTable.search('').draw(false);
        }
        else{
          this.dataTable.search('').draw(false);
        }
      });

  })
  }


  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
    });

  }
  private readonly helperService=inject(AccessVisitorHelperService)
  private readonly accesVisitorService=inject(VisitorsService)
  ownerRenter:User_AllowedInfoDto[]=[]
  private readonly ownerService:AccessOwnerRenterserviceService=inject(AccessOwnerRenterserviceService);
  subscription=new Subscription();
  private readonly ngZone: NgZone = inject(NgZone);
  plate:string='';
  insurance:string='';
  vehicle_Type:string='';

  ngOnInit(): void {
    this.loadOwnerRenter();
  }
  loadOwnerRenter(){
    const subscriptionAll=this.ownerService.getAllOwnerRenterList().subscribe({
      next: (ownerList: User_AllowedInfoDto[]) => {
        this.ngZone.run(() => {
          this.ownerRenter = ownerList;
          console.log('Loaded owner/renter list:', this.ownerRenter);
          this.updateDataTable();
        });
    }})
    this.subscription.add(subscriptionAll);
    console.log(this.ownerRenter)
  }
    updateDataTable(): void {
      if (this.dataTable) {
        this.ngZone.runOutsideAngular(() => {
          const formattedData = this.ownerRenter.map((owner, index) => {
            return [
              `${owner.last_name} ${owner.name}`,
              owner.document,
              owner.documentTypeDto.description,
              `<button class="btn btn-info view-more-btn" data-index="${index}">Ver más</button>`, // Cambiar el uso de onclick
              `<select class="form-select select-action" data-index="${index}">
                  <option value="" selected disabled hidden>Seleccionar</option>
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                  <option value="vehiculo">Añadir Vehículo</option>
                </select>`,
             `<textarea name="observation" id="observation-${index}" data-index="${index}"></textarea>`
            ];
          });
    
          this.dataTable.clear().rows.add(formattedData).draw();
        });
    
           this.addEventListeners()
      }
    
    }
    
    addEventListeners(): void {
      const textareas = document.querySelectorAll('textarea[name="observation"]');
      textareas.forEach((textarea) => {
        textarea.addEventListener('change', (event) => {
          this.observations = (event.target as HTMLTextAreaElement).value; // Guarda el valor ingresado
          console.log(`Observación actual: ${this.observations}`);
        });
      });
      const buttons = document.querySelectorAll('.view-more-btn') as NodeListOf<HTMLButtonElement>;
      const selects = document.querySelectorAll('.form-select') as NodeListOf<HTMLSelectElement>;

  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const index = button.getAttribute('data-index');
      if (index !== null) {
        const selectedOwner = this.ownerRenter[parseInt(index, 10)];
        this.MoreInfo(selectedOwner);
      }
    });
  });

  selects.forEach((select) => {
    select.addEventListener('change', (event) => {
      const index = select.getAttribute('data-index');
      if (index !== null) {
        const selectedOwner = this.ownerRenter[parseInt(index, 10)];
        this.onSelectionChange(event, selectedOwner);
      }
    });
  });
    }

    MoreInfo(owner: User_AllowedInfoDto) {

      this.ngZone.run(() => {
        let vehicleInfo;

    if (owner.vehicles && owner.vehicles.length > 0) {
      const vehicle = owner.vehicles[0];
      const vehicleType = vehicle.vehicle_Type.description;

      vehicleInfo = `
        <strong>Tipo de vehículo:</strong> ${vehicleType === 'Car' ? 'Auto' :
          vehicleType === 'Motorcycle' ? 'Moto' :
          vehicleType === 'Truck' ? 'Camión' :
          vehicleType}<br>
        <strong>Patente del vehículo:</strong> ${vehicle.plate}
      `;
    } else {
      vehicleInfo = '<strong>No tiene vehículo</strong>';
    }


      Swal.fire({
        title: 'Información del Vecino',
        html: `
          <strong>Nombre:</strong> ${owner.name} ${owner.last_name}<br>
          <strong>Documento:</strong> ${owner.document}<br>
          <strong>Tipo de Documento:</strong> ${owner.documentTypeDto.description}<br>
          <strong>Email:</strong> ${owner.email}<br>
          <strong>Tipo de Vecino:</strong>${owner.userType.description === 'Owner' ? 'Propietario':owner.userType.description=== 'Tenant' 
            ? 'Inquilino' 
            : owner.userType.description}<br>
          ${vehicleInfo}
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      })});
    }
    RegisterVehicle(ownerSelected:User_AllowedInfoDto){
      this.ngZone.run(() => {
        Swal.fire({
          title: 'Registrar Vehículo',
          html: `
          <label for="plate">Patente</label>
            <input id="plate" class="swal2-input" placeholder="Patente">
             <select id="insurance" class="swal2-select">
              <option value="">Seleccione el seguro</option>
              <option value="San Cristobal">San Cristobal</option>
              <option value="La Nueva">La Nueva</option>
              <option value="La Segunda">La Segunda</option>
            </select>
            <select id="vehicleType" class="swal2-select">
              <option value="">Seleccione tipo de vehículo</option>
              <option value="Car">Automóvil</option>
              <option value="Motorcycle">Motocicleta</option>
              <option value="Truck">Camión</option>
            </select>
          `,
          focusConfirm: false,
          showCancelButton: true, 
          confirmButtonText: 'Registrar',
          cancelButtonText: 'Cancelar', 
          customClass: {
            confirmButton: 'btn-success',  
            cancelButton: 'btn-secondary'   
          },
          preConfirm: () => {
            const plates = (document.getElementById('plate') as HTMLInputElement).value;
            const insurance = (document.getElementById('insurance') as HTMLInputElement).value;
            const vehicleType = (document.getElementById('vehicleType') as HTMLSelectElement).value;
            if (!plates) {
              Swal.showValidationMessage('La patente es obligatoria');
              return false; 
            }
            if (!plates || !insurance || !vehicleType) {
              Swal.showValidationMessage('Por favor completa todos los campos');
            }
    
            return { plates, insurance, vehicleType };
          },
        }).then((result) => {
          if (result.isConfirmed) {
            const { plates, insurance, vehicleType } = result.value;
            this.plate=plates;
            this.insurance=insurance;
            this.vehicle_Type=vehicleType;

            this.vehiclee.insurance=this.insurance
            this.vehiclee.plate=this.plate
            this.vehiclee.vehicle_Type.description=this.vehicle_Type

            ownerSelected.vehicles?.push(this.vehiclee)
            console.log('Registrando vehículo:', { plates, insurance, vehicleType });
            alert("vehiculo registrado")
          }
        });
      });
    }

    onSelectionChange(event: Event, owner: User_AllowedInfoDto) {
      const selectElement = event.target as HTMLSelectElement;
      const selectedValue = selectElement.value;
      console.log(`Seleccionado: ${selectedValue} para el propietario: ${owner.name}`);
      if (selectedValue === 'ingreso') {
        this.RegisterAccess(owner);
      } else if (selectedValue === 'vehiculo') {
        this.RegisterVehicle(owner);
      }else if(selectedValue==='egreso'){
        this.RegisterExit(owner)
      }
    
      // Restablece el valor del selector
      selectElement.value = '';
    }

    RegisterAccess(visitor: User_AllowedInfoDto): void {
      const now = new Date();

      this.accesVisitorService.getVisitorLastExit(visitor.document).subscribe({
          next: (lastExitResponse) => {
              const lastExit: LastExitUserAllowedDto = lastExitResponse;
              const lastExitDateTime = this.helperService.processDate(lastExit.movementDatetime) || new Date(0);
  
              // Si no hay egreso previo o es el primer ingreso, permitir ingreso
              if (lastExitDateTime <= now) {
                  this.accesVisitorService.getVisitorLastEntry(visitor.document).subscribe({
                      next: (lastEntryResponse) => {
                          const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
                          const lastEntryDateTime = this.helperService.processDate(lastEntry.movementDatetime) || new Date(0);
  
                          // Permitir ingreso si no hay ingreso previo o si la última salida es posterior
                          if (lastEntryDateTime <= lastExitDateTime || lastEntry.firstEntry) {
                              console.log("Ingreso permitido");
                              this.prepareEntryMovement(visitor);
                          } else {
                              Swal.fire({
                                  title: 'Error',
                                  text: 'No puede ingresar, debe salir primero antes de hacer un nuevo ingreso.',
                                  icon: 'error',
                                  confirmButtonText: 'Cerrar'
                              });
                          }
                      },
                      error: (error) => {
                          console.error(error);
                          Swal.fire({
                              title: 'Error',
                              text: 'No se pudo verificar el último ingreso.',
                              icon: 'error',
                              confirmButtonText: 'Cerrar'
                          });
                      }
                  });
              } else {
                  Swal.fire({
                      title: 'Error',
                      text: 'No puede ingresar sin haber salido previamente.',
                      icon: 'error',
                      confirmButtonText: 'Cerrar'
                  });
              }
          },
          error: (error) => {
              console.error(error);
              Swal.fire({
                  title: 'Error',
                  text: 'No se pudo verificar el último egreso.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar'
              });
          }
      });
  }
  
  private prepareEntryMovement(visitor: User_AllowedInfoDto) {
      const vehicless = visitor.vehicles && visitor.vehicles.length > 0 
          ? visitor.vehicles[0] 
          : undefined;
  
      const firstRange = visitor.authRanges[0];
      const now=new Date()
      this.movement.movementDatetime=now;
      this.movement.authRangesDto = {
          neighbor_id: firstRange.neighbor_id,
          init_date: new Date(firstRange.init_date),
          end_date: new Date(firstRange.end_date),
          allowedDaysDtos: firstRange.allowedDays || []
      };
      this.movement.observations = this.observations;
      this.movement.newUserAllowedDto = {
          name: visitor.name,
          last_name: visitor.last_name,
          document: visitor.document,
          email: visitor.email,
          user_allowed_Type: visitor.userType,
          documentType: this.doument,
          vehicle: vehicless
      };
      console.log(this.movement.observations)
      Swal.fire({
          title: 'Confirmar Ingreso',
          text: `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'Cancelar',
      }).then((result) => {
          if (result.isConfirmed) {
              const sub = this.ownerService.registerOwnerRenterEntry(this.movement).subscribe({
                  next: (response) => {
                      console.log("Ingreso registrado con éxito:", response);
                      Swal.fire({
                          title: 'Registro Exitoso',
                          text: 'Registro de ingreso exitoso.',
                          icon: 'success',
                          confirmButtonText: 'Cerrar'
                      });
                  },
                  error: (err) => {
                      console.error("Error al registrar la entrada:", err);
                      Swal.fire({
                          title: 'Error',
                          text: 'Error al cargar los datos. Intenta nuevamente.',
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                      });
                  }
              });
  
              this.subscription.add(sub);
          }
      });
  }
  RegisterExit(visitor: User_AllowedInfoDto): void {
    const now = new Date();

    this.accesVisitorService.getVisitorLastEntry(visitor.document).subscribe({
        next: (lastEntryResponse) => {
            const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
            const lastEntryDateTime = this.helperService.processDate(lastEntry.movementDatetime);

            if (!lastEntryDateTime || lastEntryDateTime > now) {
                Swal.fire({
                    title: 'Error',
                    text: 'No puede salir sin haber ingresado previamente.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
                return;
            }

            this.accesVisitorService.getVisitorLastExit(visitor.document).subscribe({
                next: (lastExitResponse) => {
                    const lastExit: LastExitUserAllowedDto = lastExitResponse;
                    const lastExitDateTime = this.helperService.processDate(lastExit.movementDatetime) || new Date(0);

                    // Permitir egreso si es el primer egreso o si la última entrada es posterior a la última salida
                    if (lastEntryDateTime > lastExitDateTime || lastExit.firstExit) {
                        console.log("Egreso permitido");
                        this.prepareExitMovement(visitor);
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: 'No puede egresar, debe salir primero antes de hacer un nuevo ingreso.',
                            icon: 'error',
                            confirmButtonText: 'Cerrar'
                        });
                    }
                },
                error: (error) => {
                    console.error(error);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo verificar el último egreso.',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                }
            });
        },
        error: (error) => {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo verificar el último ingreso.',
                icon: 'error',
                confirmButtonText: 'Cerrar'
            });
        }
    });
}

private prepareExitMovement(visitor: User_AllowedInfoDto) {
    const vehicless = visitor.vehicles && visitor.vehicles.length > 0 
        ? visitor.vehicles[0] 
        : undefined;
        const now=new Date()
        this.movement.movementDatetime=now;
    const firstRange = visitor.authRanges[0];
    this.movement.authRangesDto = {
        neighbor_id: firstRange.neighbor_id,
        init_date: new Date(firstRange.init_date),
        end_date: new Date(firstRange.end_date),
        allowedDaysDtos: firstRange.allowedDays || []
    };
    this.movement.observations = this.observations;
    this.movement.newUserAllowedDto = {
        name: visitor.name,
        last_name: visitor.last_name,
        document: visitor.document,
        email: visitor.email,
        user_allowed_Type: visitor.userType,
        documentType: this.doument,
        vehicle: vehicless
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
            const sub = this.ownerService.registerExitOwner(this.movement).subscribe({
                next: (response) => {
                    console.log("Egreso registrado con éxito:", response);
                    Swal.fire({
                        title: 'Registro Exitoso',
                        text: 'Registro de egreso exitoso.',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                },
                error: (err) => {
                    console.error("Error al registrar el egreso:", err);
                    Swal.fire({
                        title: 'Error',
                        text: 'Error al cargar los datos. Intenta nuevamente.',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                }
            });

            this.subscription.add(sub);
        }
    });
}
}
