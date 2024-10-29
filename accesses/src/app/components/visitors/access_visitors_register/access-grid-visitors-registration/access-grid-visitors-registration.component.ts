import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Output,EventEmitter } from '@angular/core';
import { Visitor } from '../../../../models/visitors/VisitorsModels';
import { AccessVisitorsRegisterServiceService } from '../../../../services/visitors/access-visitors-register-service/access-visitors-register-service/access-visitors-register-service.service';

import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';

@Component({
  selector: 'app-access-grid-visitors-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-grid-visitors-registration.component.html',
  styleUrl: './access-grid-visitors-registration.component.css'
})
export class AccessGridVisitorsRegistrationComponent implements OnInit, OnDestroy {

  @Output() updateVisit = new EventEmitter<Visitor>();
  private unsubscribe$ = new Subject<void>();
  visitors: Visitor[] = [];
  VisitorOnUpdate: Visitor | null = null;
  table: any = null;

  constructor(private visitorService: AccessVisitorsRegisterServiceService) {}

 updateDataTable(): void {
    if(!this.table)
      return;
    this.table.clear();  
    
    this.visitors.forEach((visitor, index) => {
      this.table.row.add([
        visitor.document,
        visitor.firstName,
        visitor.lastName, 
        visitor.hasVehicle ? visitor.vehicle?.licensePlate : 'Sin vehículo', 
        `<div class="dropdown">
        <button class="btn btn-light dropdown-toggle" type="button" id="actionMenu${index}" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-ellipsis-v" style="color: black;"></i>
                </button>
          <ul class="dropdown-menu" aria-labelledby="actionMenuButton-${visitor.document}">
            <li><a role="button" class="dropdown-item update-visitor-btn" data-index="${index}">Modificar</a></li>
            <li><a role="button" class="dropdown-item text-danger delete-visitor-btn" data-index="${index}">Eliminar</a></li>
          </ul>
        </div>`
      ]);
    });
    this.table.draw();
    this.addActionsEventListeners();
}
  addActionsEventListeners() {
    const updateButtons = document.querySelectorAll('.update-visitor-btn') as NodeListOf<HTMLButtonElement>;
    const deleteButtons = document.querySelectorAll('.delete-visitor-btn') as NodeListOf<HTMLButtonElement>;
    updateButtons.forEach(b => {
      b.addEventListener('click', () => {
        const index = parseInt(b.getAttribute('data-index') || '0', 10);
        const selectedVisitor = this.visitors[index];
        this.updateVisitor(selectedVisitor);
      });
    });
    deleteButtons.forEach(b => {
      b.addEventListener('click', () => {
        const index = parseInt(b.getAttribute('data-index') || '0', 10);
        const selectedVisitor = this.visitors[index];
        this.deleteVisitor(selectedVisitor);
      });
    });
  }
  initializeDataTable(): void {
    this.table = ($('#tablaconsulta') as any).DataTable({
      dom: '<"top d-flex justify-content-start mb-2"f>rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"li>p><"clear">',
      columnDefs: [
        { orderable: false, searchable: false, targets: 4 },
        { className: "text-start", targets: '_all' }, // Alinea todas las columnas a la izquierda
        { className: "text-start", targets: 0 }       // Específicamente alinea la columna de documento
      ],
      paging: true,
      ordering: true,
      pageLength: 10,
      lengthChange: true,
      searching: true,
      info: true,
      autoWidth: false,
      language: {
        lengthMenu: " _MENU_ ",
        zeroRecords: "No se encontraron invitaciones",
        search: "Buscar:",
        emptyTable: "No hay invitaciones cargadas",
        info: "Mostrando _START_ a _END_ de _TOTAL_ invitaciones",
        infoEmpty: "Invitaciones no encontradas",
        infoFiltered: "(filtrado de _MAX_ invitaciones totales)"
      },
      responsive: true
    });
    this.updateDataTable();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
  

      $('#tablaconsulta tbody').on('click', '.view-more-btn', (event: any) => {
        const index = $(event.currentTarget).data('index');
        //const selectedUser = this.movements[index].user_allowed;
  
        //this.viewuser(selectedUser);
      });
    });

    this.visitorService.getVisitorsTemporalsSubject()
      .pipe(
        takeUntil(this.unsubscribe$))
      .subscribe(visitors => {
        console.log(visitors);
        this.visitors = visitors;
        this.updateDataTable();
        console.log('Visitantes actualizados en la grilla:', this.visitors);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateVisitor(visitor: Visitor) {
    this.VisitorOnUpdate = { ...visitor };
    console.log('Visitante a editar:', this.VisitorOnUpdate); 
    this.updateVisit.emit(this.VisitorOnUpdate);
    this.deleteVisitor(visitor);
  }

  saveModification() {
    if (this.VisitorOnUpdate) {
      this.visitorService.updateVisitorsTemporalsSubject(this.VisitorOnUpdate);
      this.VisitorOnUpdate = null;
    }
  }
  
  deleteVisitor(visitor: Visitor) {
    this.visitorService.deleteVisitorsTemporalsSubject(visitor);
  }
}
