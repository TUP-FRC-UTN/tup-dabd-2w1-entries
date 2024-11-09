import { Component, OnInit } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { AccessMetricsService } from '../../../../services/access-metric/access-metrics.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DayOfWeekMetricDTO } from '../../../../models/access-metric/metris';



// Interfaces para los KPIs
interface ColumnChartKPIs {
  totalPeriod: number;
  monthlyAverage: number;
  bestMonth: {
    month: string;
    value: number;
  };
}

interface PieChartKPIs {
  topMethod: {
    name: string;
    percentage: number;
  };
  totalTransactions: number;
  averagePerMethod: {
    [key: string]: number;
  };
}

interface TopExpenseKPIs {
  highestAmount: number;
  averageTop5: number;
  totalTop5: number;
}



@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [GoogleChartsModule, NgIf,CommonModule,FormsModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css'
})

export class MetricsComponent implements OnInit{


  constructor(private metricsService: AccessMetricsService) {}

  dailyAccessCount: number = 0;
  today = new Date();
 
  dayWithMostAccesses: string = '';
  accessCount:any

  public accessData: DayOfWeekMetricDTO[] = [];

  ngOnInit() {
    this.fetchTodayAccessCount();
    this.loadAccessCounts();
    this.getPeakDayAccess();

  }

  getPeakDayAccess(): void {
    this.metricsService.getAccessCountByWeekAndDayOfWeek().subscribe((data) => {
      console.log(data);
      if (data) {
        this.dayWithMostAccesses = data.dayOfWeek;
        this.accessCount = data.accessCount;
        console.log('Día de acceso pico:', this.dayWithMostAccesses);
        console.log('Cantidad de accesos:', this.accessCount);
      }      
    });
  }
  

  private fetchTodayAccessCount(): void {
    this.metricsService.getDailyAccessData().subscribe(data => {
      console.log(data);
      
      let todayString = this.today.toISOString().slice(0, 10); // Formato 'YYYY-MM-DD'
      let todayData = data.find(item => item.date === todayString);
      this.dailyAccessCount = todayData ? todayData.count : 0;
    });
  }


  private loadAccessCounts(): void {
    this.metricsService.getAccessCountByUserTypeForCurrentMonth().subscribe(data => {
      this.pieChartData = data.map(item => [item.userType, item.count]);
    });
  }


  pieChartType = ChartType.PieChart;
  pieChartData: any[] = [];
  pieChartOptions = {
    is3D: false,
    title: '',
    pieSliceText: 'value',
    legend: { position: 'none' },
    height: 300,
    width: 400,
    colors: ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0']
  };
























  counterData: [] = [];

  status: number = 0;
  periodFrom: string = this.getDefaultFromDate();
  periodTo: string = this.getCurrentYearMonth();
  minDateFrom: string = '2020-01';
  topMethodName: string = "";

  paymentStatus: string = 'Aprobado';
  comparisonType: string = 'ingresos';
  morosos: number = 0;

  lineChartData: any[] = [];
  columnChartData: any[] = [];
  top5ChartData: any[] = [];


  columnChartType = ChartType.ColumnChart;
  barChartType = ChartType.BarChart;



  incomePerAccess: number = 0


  // KPIs
  columnKPIs: ColumnChartKPIs = {
    totalPeriod: 0,
    monthlyAverage: 0,
    bestMonth: { month: '', value: 0 }
  };

  pieKPIs: PieChartKPIs = {
    topMethod: { name: '', percentage: 0 },
    totalTransactions: 0,
    averagePerMethod: {}
  };

  topExpenseKPIs: TopExpenseKPIs = {
    highestAmount: 0,
    averageTop5: 0,
    totalTop5: 0
  };

  top5ChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#40916c'],
    legend: { position: 'none' },
    chartArea: { width: '75%', height: '70%' },
    hAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12
      },
      format: 'currency',
      formatOptions: {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 0
      }
    },
    vAxis: {
      textStyle: { 
        color: '#6c757d',
        fontSize: 12
      }
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: '100%',
    bar: { groupWidth: '70%' }
  };



  columnChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#24473f'],
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '75%' },
    vAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12  // Tamaño de fuente más pequeño
      },
      // Formato personalizado para mostrar los valores en miles
      format: 'currency',
      formatOptions: {
        // Muestra solo miles, sin decimales
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 0
      }
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 600,
    width: '100%',
    bar: { groupWidth: '70%' }
  };


  getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 9);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  aplyFilters() {
    this.updateColumnChart();
    this.updatePieChart();
    this.updateTop5Chart();
  }

  private formatMonthYear(period: string): string {
    if (!period || !period.includes('-')) {
      console.warn('Invalid period format:', period);
      return 'Invalid Date';
    }

    try {
      const [year, month] = period.split('-');
      if (!year || !month) {
        console.warn('Invalid period parts:', { year, month });
        return 'Invalid Date';
      }

      const date = new Date(parseInt(year), parseInt(month) - 1);

      if (isNaN(date.getTime())) {
        console.warn('Invalid date created:', date);
        return 'Invalid Date';
      }

      return new Intl.DateTimeFormat('es', {
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', period, error);
      return 'Invalid Date';
    }
  }

  private getAllMonthsInRange(): string[] {
    const months: string[] = [];
    const [startYear, startMonth] = this.periodFrom.split('-').map(Number);
    const [endYear, endMonth] = this.periodTo.split('-').map(Number);

    let currentDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  private updateColumnChart() {
    if (!this.counterData || !Array.isArray(this.counterData) || this.counterData.length === 0) {
      console.warn('No hay datos para mostrar en el gráfico');
      return;
    }

    const months = this.getAllMonthsInRange();
    const monthlyData: { [key: string]: number } = {};

    // Inicializar datos mensuales
    months.forEach(month => {
      monthlyData[month] = 0;
    });



    this.columnChartData = months.map(month => [
      this.formatMonthYear(month),
      monthlyData[month] || 0
    ]);

    // Actualizar KPIs
    const values = Object.values(monthlyData).filter(val => !isNaN(val));
    this.columnKPIs = {
      totalPeriod: values.reduce((sum, val) => sum + val, 0),
      monthlyAverage: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
      bestMonth: Object.entries(monthlyData).reduce(
        (best, [month, value]) => {
          return !isNaN(value) && value > best.value ?
            { month: this.formatMonthYear(month), value } :
            best;
        },
        { month: '', value: 0 }
      )
    };

    // Actualizar opciones del gráfico
    this.columnChartOptions = {
      ...this.columnChartOptions,
      colors: [this.paymentStatus === 'Aprobado' ? '#40916c' : '#9d0208']
    };
  }

  private updatePieChart() {
    // Filtrar solo las transacciones del período seleccionado
    const filteredData = this.counterData.filter(transaction => {
     // const transactionPeriod = this.convertPeriodToYearMonth(transaction.period);
     // return transactionPeriod >= this.periodFrom && transactionPeriod <= this.periodTo;
    });

    // Agrupar por plataforma de pago y contar transacciones
/*     const platformCounts = filteredData.reduce((acc: { [key: string]: number }, curr) => {
      if (curr.amountPayed > 0) {
        const platform = curr.paymentPlatform || 'EFECTIVO';
        acc[platform] = (acc[platform] || 0) + 1; // Contar transacciones en lugar de sumar montos
      }
      return acc;
    }, {});
 */
    // Calcular el total de transacciones
    //const totalTransactions = Object.values(platformCounts).reduce((sum, count) => sum + count, 0);

    // Convertir conteos a porcentajes
    // Actualizar KPIs
    const methodTotals: { [key: string]: { sum: number, count: number } } = {};

/*     filteredData.forEach(transaction => {
      if (transaction.amountPayed > 0) {
        const platform = transaction.paymentPlatform || 'EFECTIVO';
        if (!methodTotals[platform]) {
          methodTotals[platform] = { sum: 0, count: 0 };
        }
        methodTotals[platform].sum += transaction.amountPayed;
        methodTotals[platform].count++;
      }
    }); */

  /*   this.pieKPIs = {
      topMethod: {
        name: Object.entries(methodTotals)
          .sort((a, b) => b[1].count - a[1].count)[0]?.[0] || '',
        percentage: (Object.entries(methodTotals)
          .sort((a, b) => b[1].count - a[1].count)[0]?.[1].count / totalTransactions) * 100 || 0
      },
      totalTransactions,
      averagePerMethod: Object.fromEntries(
        Object.entries(methodTotals).map(([method, data]) =>
          [method, data.sum / data.count]
        )
      )
    }; */
    this.topMethodName = this.pieKPIs.topMethod.name;
  }

  private updateTop5Chart() {
    if (!this.counterData || !Array.isArray(this.counterData)) {
      console.warn('No hay datos para mostrar en el top 5');
      return;
    }

    // Filtrar transacciones por período y ordenar por monto
/*     const filteredData = this.counterData
      .filter(transaction => {
        const transactionPeriod = this.convertPeriodToYearMonth(transaction.period);
        return transactionPeriod >= this.periodFrom && 
               transactionPeriod <= this.periodTo &&
               transaction.amountPayed > 0;
      })
      .sort((a, b) => (b.amountPayed || 0) - (a.amountPayed || 0))
      .slice(0, 5);
 */
    // Preparar datos para el gráfico
/*     this.top5ChartData = filteredData.map(transaction => [
      // Reemplaza 'description' con el campo que ya exista en tu interface
      `Expensa ${this.formatMonthYear(transaction.period)}`,  // Ejemplo usando solo el período
      transaction.amountPayed / 1000
  ]); */

    // Actualizar KPIs
/*     if (filteredData.length > 0) {
      const amounts = filteredData.map(t => t.amountPayed);
      this.topExpenseKPIs = {
        highestAmount: Math.max(...amounts),
        averageTop5: amounts.reduce((sum, val) => sum + val, 0) / amounts.length,
        totalTop5: amounts.reduce((sum, val) => sum + val, 0)
      };
    }
  } */

/*   private convertPeriodToYearMonth(period: any): string {
    if (!period) {
      console.warn('Period inválido:', period);
      return '';
    }

    try {
      // Si el periodo ya está en formato YYYY-MM, lo devolvemos directamente
      if (typeof period === 'string' && /^\d{4}-\d{2}$/.test(period)) {
        return period;
      }

      // Si no, intentamos el formato anterior (Mes Año)
      const monthMapping: { [key: string]: string } = {
        'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
        'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
        'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12',
        'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
        'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
        'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
      };

      const [month, year] = period.toString().trim().split(' ');
      if (monthMapping[month]) {
        return `${year}-${monthMapping[month]}`;
      }

      return '';
    } catch (error) {
      console.warn('Error al convertir periodo:', period, error);
      return '';
    }
  } */
  }
  makeBig(nro: number) {
    this.status = nro;
    } 
}
