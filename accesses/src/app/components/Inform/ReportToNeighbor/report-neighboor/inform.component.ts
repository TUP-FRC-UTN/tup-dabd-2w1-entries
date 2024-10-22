import { Component } from '@angular/core';
import { AccessTableComponent } from '../access-table/access-table.component';
import { AccessFilterComponent } from '../access-filter/access-filter.component';

@Component({
  selector: 'app-inform',
  standalone: true,
  imports: [AccessTableComponent, AccessFilterComponent],
  templateUrl: './inform.component.html',
  styleUrl: './inform.component.css'
})
export class InformComponent {
  title = 'access-monthlyReport';
  year: number | null = null;
  month: number | null = null;

  onFilterSubmitted(event: { year: number, month: number }) {
    this.year = event.year;
    this.month = event.month;
  }

}
