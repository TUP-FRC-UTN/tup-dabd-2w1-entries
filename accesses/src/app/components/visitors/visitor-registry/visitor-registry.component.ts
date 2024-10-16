import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnChanges, OnDestroy, OnInit, SimpleChanges, NgZone, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthRangeInfoDto, NewAuthRangeDto, NewMovements_EntryDto, NewUserAllowedDto, User_AllowedInfoDto, Visitor } from '../../../models/visitors/VisitorsModels';
import Swal from 'sweetalert2';
import { VisitorsService } from '../../../services/visitors/visitors.service';
import { Subscription } from 'rxjs';
import { AutoSizeTextAreaDirective } from '../../../directives/auto-size-text-area.directive';
//
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
//import { AlertDirective } from '../alert.directive';
import { InternalSettings } from 'datatables.net';
import { AllowedDaysDto } from '../../../services/visitors/movement.interface';

@Component({
  selector: 'app-visitor-registry',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoSizeTextAreaDirective],
  providers: [DatePipe, VisitorsService],
  templateUrl: './visitor-registry.component.html',
  styleUrl: './visitor-registry.component.css'
})
export class VisitorRegistryComponent implements OnInit, OnDestroy, AfterViewInit {

  subscription = new Subscription();

  private readonly visitorService = inject(VisitorsService);
  constructor(private datePipe: DatePipe){}

  //codigo nuevo

  dataTable: any;

  private readonly ngZone: NgZone = inject(NgZone);

  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    this.subscription.unsubscribe();
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
          lengthMenu: "Mostrar _MENU_ registros",
          zeroRecords: "No se encontraron registros",
          search: "Buscar:",
       
          emptyTable: "No hay datos disponibles",
        },
        responsive: true,
      });

      $('#dt-search-0').off('keyup').on('keyup', () => {
          const searchTerm = $('#dt-search-0').val() as string;

          if (searchTerm.length >= 3) {
              this.dataTable.search(searchTerm).draw();

          } else if (searchTerm.length === 0) {
              this.dataTable.search('').draw(false); 

          }
        else{
          this.dataTable.search('').draw(false); 
        }
      });

    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
    });

  }

  updateDataTable(): void {
    if (this.dataTable) {
      this.ngZone.runOutsideAngular(() => {
        const formattedData = this.visitors.map((visitor, index) => {
          return [
            `${visitor.last_name} ${visitor.name}`,
            //visitor.documentType, //DNI passport etc
            visitor.document,
            `<button style="width: 95%;" class="btn btn-info view-more-btn" data-index="${index}">Ver más</button>`, // Cambiar el uso de onclick
            `<select class="form-select select-action" data-index="${index}">
                <option value="" selected disabled hidden>Seleccionar</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>`,
            `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`
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
          const selectedOwner = this.visitors[parseInt(index, 10)];
          this.MoreInfo(selectedOwner);
        }
      });
    });

    selects.forEach((select) => {
      select.addEventListener('change', (event) => {
        const index = select.getAttribute('data-index');
        if (index !== null) {
          const selectedOwner = this.visitors[parseInt(index, 10)];

          const textareaElement = document.getElementById('observations'+index) as HTMLTextAreaElement;

          // console.log(textareaElement);
          // console.log(textareaElement.value);

          selectedOwner.observations = textareaElement.value || "";

          this.onSelectionChange(event, selectedOwner);
        }
      });
    });
  }

  onSelectionChange(event: Event, visitor: User_AllowedInfoDto) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    console.log(`Seleccionado: ${selectedValue} para el Visitante: ${visitor.name}`);
    if (selectedValue === 'ingreso') {
      this.RegisterAccess(visitor);
    } else if (selectedValue === 'egreso') {
      this.RegisterExit(visitor);
    }
  
    // Restablece el valor del selector
    selectElement.value = '';
  }

  //FIN codigo nuevo

  //carga TODOS los invitados al iniciar la pantalla
  ngOnInit(): void {
    this.loadVisitorsList();
  }


  loadVisitorsList(){
    const subscriptionAll=this.visitorService.getVisitorsData().subscribe({
      next:(data)=>{

        this.ngZone.run(() => {
          this.visitors = data;
          this.showVisitors = this.visitors;
          //console.log("data en el component: ", data);
          console.log("visitors en el component: ", this.visitors);
          this.updateDataTable();
        });

      }
    })
    this.subscription.add(subscriptionAll);
  }

  // lista de Visitors
  visitors: User_AllowedInfoDto[] = [];
  // lista de Visitors que se muestran en pantalla
  showVisitors = this.visitors;

  // datos de búsqueda/filtrado
  parameter: string = "";

  // buscar visitantes por parámetro (Nombre o DNI)
  Search(param: string): void {
    this.showVisitors = this.visitorService.getVisitorByParam(param);
  }

  // mostrar más info de un visitante
  MoreInfo(visitor: User_AllowedInfoDto) {
    const vehicleInfo = visitor.vehicles && visitor.vehicles.length > 0 ? 
      `<strong>Patente del vehículo: </strong>${visitor.vehicles[0].plate}` : 
      '<strong>No tiene vehículo</strong>';

    Swal.fire({
      title: 'Información del Visitante',
      html: `
        <strong>Nombre:</strong> ${visitor.name} ${visitor.last_name}<br>
        <strong>Documento:</strong> ${visitor.document}<br>
        <strong>Email:</strong> ${visitor.email}<br>
        ${vehicleInfo}
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  //registrar egreso de un visitante
  RegisterExit(visitor :User_AllowedInfoDto){
    Swal.fire({
      title: 'Función en desarrollo!',
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  //registrar ingreso de un visitante
  RegisterAccess(visitor :User_AllowedInfoDto): void{
    //verifica observations
    if(visitor.observations == undefined){
      visitor.observations = "";
    }

    // verifica si esta dentro de rango (fechas permitidas)
    let indexAuthRange = this.visitorService.todayIsInDateRange(visitor.authRanges);
    if(indexAuthRange >= 0){

      // verifica si esta dentro de rango (dia y horario permitido)
      let indexDayAllowed = this.visitorService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
      if(indexDayAllowed >= 0){
        
        // mapeos
        const newUserAllowedDto: NewUserAllowedDto = 
          this.visitorService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor);
        const newAuthRangeDto: NewAuthRangeDto = 
          this.visitorService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges);

        //se crea el objeto (q se va a pasar por el body en el post)
        const newMovements_EntryDto: NewMovements_EntryDto = 
          this.visitorService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto);

        //post en la URL
        this.visitorService.postVisitor(newMovements_EntryDto).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Ingreso registrado!',
              text: `¡El Ingreso de "${newMovements_EntryDto.newUserAllowedDto.name} ${newMovements_EntryDto.newUserAllowedDto.last_name}" fue registrado con éxito!`,
              confirmButtonColor: '#28a745',
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al registrar el Ingreso. Inténtelo de nuevo.',
              confirmButtonText: 'Cerrar'        
            });
          }
        });

      } else {
        //se dispara si el Visitor esta fuera de rango (dia y horario permitido)
        this.outOfAuthorizedHourRange(visitor, indexAuthRange, indexDayAllowed);
        return;

      }

    } else {
      //se dispara si el Visitor esta fuera de rango (fechas permitidas)
      this.outOfAuthorizedDateRange(visitor);
      return; // se termina la ejecucion del metodo (no se registra el ingreso)
    }

  }

  // muestra un modal avisando q el Visitor esta fuera de rango (dia y hora permitido)
  outOfAuthorizedHourRange(visitor: User_AllowedInfoDto, indexAuthRange: number, indexDayAllowed: number){
    console.log("metodo outOfAuthorizedDateRange (en visitor-registry.component): el Visitor esta fuera de rango dia y hora permitido");

    let allowedDay = visitor.authRanges.at(indexAuthRange)?.allowedDays.at(indexDayAllowed);

    let rangesHtml = 'El Visitante no tiene un rango horario autorizado';

    if(allowedDay != undefined && allowedDay.day != undefined && allowedDay.init_hour != undefined && allowedDay.end_hour != undefined){

        // ${this.datePipe.transform(allowedDay.init_hour,'hh:MM:ss')?.toString()}
        // ${this.datePipe.transform(allowedDay.end_hour,'hh:MM:ss')?.toString()}
          
        rangesHtml = `
          <p>
            <strong>Rango horario permitido </strong> <br>
            <strong>Desde: </strong> ${this.visitorService.stringToHour(allowedDay, true).substring(11)} <br>
            <strong>Hasta: </strong> ${this.visitorService.stringToHour(allowedDay, false).substring(11)}
          </p>
        `;
      
    }

    Swal.fire({
      title: 'Denegar ingreso!',
      html: `
        <strong>El Visitante está fuera del rango horario permitido!</strong> <br>
        ${rangesHtml}
      `,
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
  }

  // muestra un modal avisando q el Visitor esta fuera de rango (fechas permitidas)
  outOfAuthorizedDateRange(visitor: User_AllowedInfoDto){
    console.log("metodo outOfAuthorizedDateRange (en visitor-registry.component): el Visitor esta fuera de rango fecha");

    let rangesHtml = '';
    for (const range of visitor.authRanges) {

      console.log(range);

      rangesHtml += `
        <p>
          <strong>Fecha de inicio: </strong> ${this.datePipe.transform(range.init_date,'dd/MM/yyyy')?.toString()}<br>
          <strong>Fecha de fin: </strong> ${this.datePipe.transform(range.end_date,'dd/MM/yyyy')?.toString()}
        </p>
      `;
    }

    Swal.fire({
      title: 'Denegar ingreso!',
      html: `
        <strong>El Visitante está fuera del rango permitido!</strong>
        ${rangesHtml}
      `,
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
  }

  // escanear QR de un visitante, guardar la lista de visitantes en el front para registrar Ingreso/Egreso
  ScanQR(){
    Swal.fire({
      title: 'Función en desarrollo!',
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  // agregar un visitante que no esta en una lista, pero tiene autorizacion del Propietario/Inquilino
  AddVisitor(){

  }

  //volver a pantalla anterior
  Return(){
    
  }

}
