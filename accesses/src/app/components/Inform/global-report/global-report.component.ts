import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InformComponent } from '../ReportToNeighbor/report-neighboor/inform.component';
import { ReportHoodComponent } from '../ReportToHood/report-hood/report-hood.component';

@Component({
  selector: 'app-global-report',
  standalone: true,
  imports: [CommonModule, FormsModule, InformComponent, ReportHoodComponent],
  templateUrl: './global-report.component.html',
  styleUrl: './global-report.component.css'
})
export class GlobalReportComponent {
  selectedReport: string = 'neighbor';

  onReportChange() {
   
    $.fn.dataTable.ext.search.pop();
    console.log('Reporte seleccionado:', this.selectedReport);
  }

}
