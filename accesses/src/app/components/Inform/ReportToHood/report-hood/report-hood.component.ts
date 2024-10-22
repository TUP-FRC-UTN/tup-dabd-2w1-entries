import { Component } from '@angular/core';
import { AccessTableComponent } from '../access-table/access-table.component';
import { AccessFilterComponent } from '../access-filter/access-filter.component';

@Component({
  selector: 'app-report-hood',
  standalone: true,
  imports: [AccessTableComponent, AccessFilterComponent],
  templateUrl: './report-hood.component.html',
  styleUrl: './report-hood.component.css'
})
export class ReportHoodComponent {
  title = 'access-monthlyReport';
  year: number | null = null;
  month: number | null = null;

  onFilterSubmitted(event: { year: number, month: number }) {
    this.year = event.year;
    this.month = event.month;
  }

}
