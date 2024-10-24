import { AfterViewInit, Component, ElementRef, inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, first, fromEvent, map, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { InternalSettings } from 'datatables.net';
import { DateTime } from 'luxon';
import { AccessOwnerRenterserviceService } from '../../../services/ownerService/access-owner-renterservice.service';
import { AuthRangeInfoDto, Document_TypeDto, NewAuthRangeDto, NewMovements_EntryDto, User_AllowedInfoDto, Vehicle } from '../../../models/visitors/interface/owner';
import {  } from '../../../models/visitors/VisitorsModels';

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
  private now :DateTime= DateTime.now().setZone('America/Argentina/Buenos_Aires');
  observations:string='';
  movement:NewMovements_EntryDto={
    movementDatetime:this.now.toJSDate(),
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
                       <option value="egreso">Egreso</option>
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
      }
      else if(selectedValue === 'egreso'){
        this.RegisterExit(owner);
      }
      // Restablece el valor del selector
      selectElement.value = '';
    }
  RegisterExit(ownerSelected: User_AllowedInfoDto) {
    const vehicless = ownerSelected.vehicles && ownerSelected.vehicles.length > 0 
        ? ownerSelected.vehicles[0] 
        : undefined;
        console.log("Fecha y hora local:",this.now.toString());
      const firstRange = ownerSelected.authRanges[0]; 
      const now=new Date();
      const isoString=now.toISOString();
      this.movement.movementDatetime=new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));;
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
      console.log(this.movement)
      Swal.fire({
        title: 'Confirmar Egreso',
        text: `¿Está seguro que desea registrar el ingreso de ${ownerSelected.name} ${ownerSelected.last_name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn-success',  
          cancelButton: 'btn-secondary'   
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const sub = this.ownerService.registerExitOwner(this.movement).subscribe({
            next: (response) => {
              console.log("Entrada registrada con éxito:", response);
              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de Egreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar'
              });
            },
            error: (err) => {
              console.error("Error al registrar la salida:", err);
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

    RegisterAccess(ownerSelected: User_AllowedInfoDto) {
      const vehicless = ownerSelected.vehicles && ownerSelected.vehicles.length > 0 
        ? ownerSelected.vehicles[0] 
        : undefined;
        console.log("Fecha y hora local:",this.now.toString());
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
        confirmButtonText: 'Sí',
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
