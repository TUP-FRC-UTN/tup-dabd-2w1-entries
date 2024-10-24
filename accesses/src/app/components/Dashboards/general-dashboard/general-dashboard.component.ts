import { Component } from '@angular/core';
import { DashboardComponent } from "../dashboard/dashboard/dashboard.component";
import { PiechartComponent } from "../pieDashboard/piechart/piechart.component";
import { AreachartComponent } from "../areaDashboard/areachart/areachart.component";

@Component({
  selector: 'app-general-dashboard',
  standalone: true,
  imports: [DashboardComponent, PiechartComponent, AreachartComponent],
  templateUrl: './general-dashboard.component.html',
  styleUrl: './general-dashboard.component.css'
})
export class GeneralDashboardComponent {

}
