import { Component, OnInit } from '@angular/core';
import { GoogleChartsModule } from 'angular-google-charts';
import { MonthlyVisitorCount } from '../../../../models/VisitorsCount/MonthlyVisitorCount';
import { MetricsService } from '../../../../services/metricService/metrics.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [GoogleChartsModule,NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  chart: any;

  monthlyVisitorCount: MonthlyVisitorCount[] = []


  constructor(private metricService: MetricsService) {}

  private getMonthName(month: number): string {
    let monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 
      'Mayo', 'Junio', 'Julio', 'Agosto', 
      'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[month - 1]; // Ajusta el índice ya que los meses comienzan desde 1
  }

  drawChartColumn() {
    // Mapea monthlyVisitorCount a un array que Google Charts pueda entender
    let dataApi = this.monthlyVisitorCount.map(v => [
      this.getMonthName(v.month), // Nombre del mes
      v.count                      // Cantidad
    ]);
  
    this.chart = {
      title: 'Accesos totales por mes',
      type: 'ColumnChart',
      data: [
  
        ...dataApi
      ],
      options: {
        hAxis: { title: 'Mes' },
        vAxis: { title: 'Cantidad' },
        legend: 'none'
      },
      width: 650,
      height: 400
    };
  }

  ngOnInit(): void {

    this.metricService.getMonthlyVisitorCounts().subscribe(data => {  
      this.monthlyVisitorCount = data; // Asigna los datos obtenidos 
      this.drawChartColumn(); // Dibuja el gráfico después de recibir los datos
    });

    //this.drawChartColumn();
  }






}
