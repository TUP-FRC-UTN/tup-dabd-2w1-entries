import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';

@Component({
  selector: 'app-dashboard-prueba',
  standalone: true,
  imports: [FormsModule, GoogleChartsModule,NgIf,NgFor,KeyValuePipe ],
  templateUrl: './dashboard-prueba.component.html',
  styleUrl: './dashboard-prueba.component.css'
})
export class DashboardPruebaComponent {
  status = 1;
  periodFrom: string = '';
  periodTo: string = '';
  paymentStatus: string = 'Aprobado';
  columnChartType: ChartType = ChartType.ColumnChart;
  pieChartType: ChartType = ChartType.PieChart;
  lineChartType: ChartType = ChartType.LineChart;
  // Configuración para Google Charts
  columnChartData = [
    ['Enero', 1200, 800],
    ['Febrero', 1400, 950],
    ['Marzo', 1300, 700],
    ['Abril', 1500, 1100],
    ['Mayo', 1600, 900],
    ['Junio', 1700, 1000],
    ['Julio', 1800, 1200],
    ['Agosto', 1900, 1150],
    ['Septiembre', 2000, 1300],
    ['Octubre', 2100, 1250],
    ['Noviembre', 2200, 1400],
    ['Diciembre', 2300, 1500]
  ];
  
  columnChartOptions = {
    title: 'Comparación de Ingresos y Egresos',
    chartArea: { width: '60%' },
    hAxis: { title: 'Periodo', minValue: 0 },
    vAxis: { title: 'Monto' },
    series: {
      0: { color: '#1b9e77' }, // Color para Ingresos
      1: { color: '#d95f02' } // Color para Egresos
    },
    isStacked: true
  };
  // KPIs del gráfico de columnas
  columnKPIs = {
    totalPeriod: 3000, // Monto total del periodo
    monthlyAverage: 750, // Promedio mensual
    bestMonth: { value: 1170, month: 'Periodo 2' } // Mejor mes
  };

  // KPIs para el gráfico de pie
  pieKPIs = {
    topMethod: { name: 'Tarjeta de Crédito', percentage: 45 }, // Método de pago más usado
    totalTransactions: 230, // Total de transacciones
    averagePerMethod: {
      'Tarjeta de Crédito': 500,
      'PayPal': 300,
      'Transferencia Bancaria': 200
    }
  };

  // KPIs para el gráfico de líneas
  lineKPIs = {
    monthlyGrowth: 4.5, // Crecimiento mensual en porcentaje
    maxValue: { value: 1200, month: 'Agosto' }, // Valor máximo y mes correspondiente
    quarterlyTrend: 3.2 // Tendencia trimestral en porcentaje
  };

  // Método para aplicar filtros
  aplyFilters() {
    console.log('Aplicando filtros');
    // Aquí iría la lógica de los filtros
  }

  // Método para alternar entre vista expandida y normal del gráfico
  makeBig(viewStatus: number) {
    this.status = viewStatus;
  }



  // Configuración del gráfico de pastel (Promedio de pagos)
  pieChartData = [
    ['Método de Pago', 'Cantidad'],
    ['Efectivo', 10],
    ['Tarjeta de Crédito', 15],
    ['Transferencia', 5],
    ['Otro', 10]
  ];
  pieChartOptions = {
    title: 'Promedios de pagos',
    is3D: true,
    legend: { position: 'bottom' }
  };

  // Configuración del gráfico de líneas (Evolución de pagos)
  lineChartData = [
    ['Mes', 'Pagos'],
    ['Enero', 100],
    ['Febrero', 200],
    ['Marzo', 300],
    ['Abril', 400]
  ];
  lineChartOptions = {
    title: 'Evolución de Pagos',
    curveType: 'function',
    legend: { position: 'bottom' }
  };
}
