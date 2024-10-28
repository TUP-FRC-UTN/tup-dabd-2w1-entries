import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class GlobalReportComponent implements OnInit {
 


  selectedReport: string = 'hood';  // Componente por defecto
  selectedHood: boolean = true;
  selectedNeighbor: boolean = false;

  ngOnInit() {
    // Inicializa el componente por defecto
    this.selectedReport = 'hood';
    this.selectedHood = true;
    this.selectedNeighbor = false;
  }

  // Función para manejar el cambio de selección
 
  // Función para manejar el cambio de selección
  onCheckboxChange(reportType: string) {
    if (reportType === 'hood') {
      this.selectedHood = true;
      this.selectedNeighbor = false;
      this.selectedReport = 'hood';
    } else if (reportType === 'neighbor') {
      this.selectedNeighbor = true;
      this.selectedHood = false;
      this.selectedReport = 'neighbor';
    }
  }
  

}
