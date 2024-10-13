import { AfterViewInit, Component, ElementRef, inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Document_TypeDto, NewMovements_EntryDto, Owner, User_AllowedInfoDto, Vehicle } from '../owner';
import { AccessOwnerRenterserviceService } from '../access-owner-renterservice.service';
import { debounceTime, distinctUntilChanged, filter, first, fromEvent, map, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { AlertDirective } from '../alert.directive';
import { InternalSettings } from 'datatables.net';

@Component({
  selector: 'app-acces-grid-owner-rent',
  standalone: true,
  imports: [CommonModule,FormsModule,AlertDirective],
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
  observations:string='';
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
          lengthMenu: 'Mostrar MENU registros',
          zeroRecords: 'No se encontraron registros',
          info: 'Mostrando de START a END de TOTAL registros',
          infoEmpty: 'No se encontró ese vecino',
          infoFiltered: '(filtrado de MAX registros totales)',
          search: 'Buscar:',
          emptyTable: 'No se encontró ese vecino',
        },
        responsive: true,
      });
  
      // Escuchar el evento de keyup para el campo de búsqueda
      $('#myInput').on('keyup', () => {
        const searchTerm = $('#myInput').val() as string;
  
        // Aplicar filtro solo si hay al menos 3 caracteres
        if (searchTerm.length >= 3) {
          this.dataTable.search(searchTerm).draw();
        } else {
          this.dataTable.search('').draw(); // Limpiar búsqueda si hay menos de 3 caracteres
        }
      });
    });
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
    });

  }
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
              `<button class="btn btn-info view-more-btn" data-index="${index}">Ver más</button>`, // Cambiar el uso de onclick
              `<select class="form-select select-action" data-index="${index}">
                  <option value="" selected disabled hidden>Seleccionar</option>
                  <option value="ingreso">Ingreso</option>
                  <option value="vehiculo">Añadir Vehículo</option>
                </select>`,
              `<textarea [(ngModel)]="observations" name="observations" id="observations"></textarea>`
            ];
          });
    
          this.dataTable.clear().rows.add(formattedData).draw();
        });
    
           this.addEventListeners()
      }
    
    }
    
    addEventListeners(): void {
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
            <input id="plate" class="swal2-input" placeholder="Placa">
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
      }
    
      // Restablece el valor del selector
      selectElement.value = '';
    }

    RegisterAccess(ownerSelected: User_AllowedInfoDto) {
      const vehicless = ownerSelected.vehicles && ownerSelected.vehicles.length > 0 
        ? ownerSelected.vehicles[0] 
        : undefined;
      const firstRange = ownerSelected.authRanges[0]; 
      this.movement.authRangesDto = {
        neighbor_id: 0,
        init_date: new Date(firstRange.init_date),
        end_date: new Date(firstRange.end_date),
        allowedDaysDtos: firstRange.allowedDays || []
      };
      this.movement.observations = this.observations;
      this.movement.newUserAllowedDto = {
        name: ownerSelected.name,
        last_name: ownerSelected.last_name,
        document: ownerSelected.document,
        email: ownerSelected.email,
        user_allowed_Type: ownerSelected.userType,
        documentType: this.doument,
        vehicle: vehicless
      };
    
      Swal.fire({
        title: 'Confirmar Ingreso',
        text: `¿Está seguro que desea registrar el ingreso de ${ownerSelected.name} ${ownerSelected.last_name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn-success',  
          cancelButton: 'btn-secondary'   
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const sub = this.ownerService.registerOwnerRenterEntry(this.movement).subscribe({
            next: (response) => {
              console.log("Entrada registrada con éxito:", response);
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
    
}
