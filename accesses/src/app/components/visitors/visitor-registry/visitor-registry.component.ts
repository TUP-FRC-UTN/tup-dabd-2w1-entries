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
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AuthRangeInfoDto,
  NewAuthRangeDto,
  NewMovement_ExitDto,
  NewMovements_EntryDto,
  NewUserAllowedDto,
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
  subscription = new Subscription();

  private readonly visitorService = inject(VisitorsService);

  constructor() {}

  dataTable: any;

  isModalOpen = false;

  private readonly ngZone: NgZone = inject(NgZone);

  modalValid:boolean = false;
  

  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    this.subscription.unsubscribe();
  }
  //PARA ESCANEAR

  isScanning = false;
  scannedResult: string = '';

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
          lengthMenu: 'Mostrar _MENU_ registros',
          zeroRecords: 'No se encontraron registros',
          search: 'Buscar:',

          emptyTable: 'No hay datos disponibles',
        },
        responsive: true,
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
          return [
            `${visitor.last_name} ${visitor.name}`,
            visitor.documentTypeDto.description, //DNI passport etc (todavia el back no devuelve este dato)
            visitor.document,
            `<button style="width: 95%;" class="btn btn-info view-more-btn" data-index="${index}">Ver más</button>`, // Cambiar el uso de onclick
            `<select class="form-select select-action" data-index="${index}">
                <option value="" selected disabled hidden>Seleccionar</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>`,
            `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
          ];
        });

        this.dataTable.clear().rows.add(formattedData).draw();
      });

      this.addEventListeners();
    }
  }

  addEventListeners(): void {
    const buttons = document.querySelectorAll(
      '.view-more-btn'
    ) as NodeListOf<HTMLButtonElement>;
    const selects = document.querySelectorAll(
      '.form-select'
    ) as NodeListOf<HTMLSelectElement>;

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

          const textareaElement = document.getElementById(
            'observations' + index
          ) as HTMLTextAreaElement;

          // console.log(textareaElement);
          // console.log(textareaElement.value);

          selectedOwner.observations = textareaElement.value || '';

          this.onSelectionChange(event, selectedOwner);
        }
      });
    });
  }

  onSelectionChange(event: Event, visitor: User_AllowedInfoDto) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    //console.log(`Seleccionado: ${selectedValue} para el Visitante: ${visitor.name}`);
    if (selectedValue === 'ingreso') {
      this.RegisterAccess(visitor);
    } else if (selectedValue === 'egreso') {
      this.RegisterExit(visitor);
    }

    // Restablece el valor del selector
    selectElement.value = '';
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
  MoreInfo(visitor: User_AllowedInfoDto) {
    const vehicleInfo =
      visitor.vehicles && visitor.vehicles.length > 0
        ? `<strong>Patente del vehículo: </strong>${visitor.vehicles[0].plate}`
        : '<strong>No tiene vehículo</strong>';

    Swal.fire({
      title: 'Información del Visitante',
      html: `
        <strong>Nombre:</strong> ${visitor.name} ${visitor.last_name}<br>
        <strong>Documento:</strong> ${visitor.document}<br>
        <strong>Email:</strong> ${visitor.email}<br>
        ${vehicleInfo}
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
    });
  }

  RegisterExit(visitor: User_AllowedInfoDto): void {
    this.visitorService.RegisterExit(visitor);
  }

  RegisterAccess(visitor: User_AllowedInfoDto): void {
    this.visitorService.RegisterAccess(visitor);
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
    const scannedData = data[0]?.value;
    if (scannedData) {
      console.log('Código QR escaneado:', scannedData);
      this.scannedResult = scannedData;

      // Detener el scanner inmediatamente después de escanear
      this.stopScanner();

      // Validar el QR escaneado
      this.visitorService.validateQrCode(scannedData).subscribe((isValid) => {
        if (isValid) {
          const newVisitor: User_AllowedInfoDto = {
            document: scannedData,
            name: 'Nombre de ejemplo',
            last_name: 'Apellido de ejemplo',
            email: 'email@example.com',
            vehicles: [],
            userType: { description: 'Visitante' },
            authRanges: [],
            observations: '',
            documentTypeDto: { description: 'DNI' },
            neighbor_id: 0,
          };

          this.visitors.push(newVisitor);
          this.updateDataTable();
        } else {
          console.warn('Código QR no válido.');
        }

        // Opción 1: Buscar y hacer click en el botón de cierre
        const closeButton = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
        closeButton?.click();

        // O Opción 2: Agregar la clase modal-backdrop y remover el modal
        const modalElement = document.getElementById('qrScannerModal');
        if (modalElement) {
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          backdrop?.remove();
        }
      });
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
