import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Output, EventEmitter } from '@angular/core';
import { Visitor } from '../../../../models/visitors/VisitorsModels';
import { AccessVisitorsRegisterServiceService } from '../../../../services/visitors/access-visitors-register-service/access-visitors-register-service/access-visitors-register-service.service';

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

  constructor(private visitorService: AccessVisitorsRegisterServiceService) {}

  ngOnInit(): void {
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    this.visitorService.getVisitorsTemporalsSubject()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(visitors => {
        console.log(visitors);
        this.visitors = visitors;
        console.log('Visitantes actualizados en la grilla:', this.visitors);
      });

    // Suscribirse a eventos de reset si el servicio los proporciona
    this.visitorService.resetEvent$?.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.reset();
    });
  }

  // Método de reset principal
  reset(): void {
    this.visitors = [];
    this.VisitorOnUpdate = null;
    this.clearData();
  }

  // Método para limpiar los datos
  clearData(): void {
    this.visitors = [];
    this.VisitorOnUpdate = null;
    // También podríamos llamar al servicio para limpiar los datos si es necesario
    this.visitorService.resetAllData();
  }

  // Método para obtener el dataSource (si es necesario)
  get dataSource(): Visitor[] {
    return this.visitors;
  }

  // Método para establecer el dataSource (si es necesario)
  set dataSource(visitors: Visitor[]) {
    this.visitors = visitors;
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}