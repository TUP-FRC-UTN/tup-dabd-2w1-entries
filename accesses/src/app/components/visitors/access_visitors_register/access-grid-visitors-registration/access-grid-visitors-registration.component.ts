import { Component, OnInit, OnDestroy  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Output,EventEmitter } from '@angular/core';
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
    this.visitorService.getVisitorsTemporalsSubject()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(visitors => {
        this.visitors = visitors;
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
  cancelModification() {
    this.VisitorOnUpdate = null;
  }
  deleteVisitor(visitor: Visitor) {
    this.visitorService.deleteVisitorsTemporalsSubject(visitor);
  }
}
