import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { AccessMetricsService } from '../../../../services/access-metric/access-metrics.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopUser, UtilizationRate } from '../../../../models/access-metric/metris';



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


  constructor(private metricsService: AccessMetricsService) {
    const now = new Date();
    this.periodTo = this.formatYearMonth(now);
    
    // Fecha inicial por defecto (3 meses atrás)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    this.periodFrom = this.formatYearMonth(threeMonthsAgo);
    
    // Fecha mínima permitida (por ejemplo, 1 año atrás)
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    this.minDateFrom = this.formatYearMonth(oneYearAgo);
  }
  

  topUser: any[] = []



  roleTranslations: { [key: string]: string } = {
    'Employeed': 'Empleado',
    'Tenant': 'Inquilino',
    'Supplier': 'Proveedor',
    'Visitor': 'Visitante',
    'Owner':'Vecino',
    'Gardener':'Jardinero',
    'Service':'Servicios',
    'Cleaning': 'Limpieza',
    'Worker': 'Trabajador',
  };

  translateRole(role: string): string {
    return this.roleTranslations[role] || role; 
  }

  aplyFilters(): void {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);

    this.metricsService.getMovementCountsFilter(
      fromDate.year,
      fromDate.month,
      toDate.month
    ).subscribe(data => {
      console.log("Data filtrada recibida de la API:", data);

      // Array con los nombres de los días de la semana, comenzando desde Lunes
      const diasOrdenados = [
        'Lunes', 'Martes', 'Miércoles', 'Jueves', 
        'Viernes', 'Sábado', 'Domingo'
      ];

      // Crear el array de datos para el gráfico con cabeceras
      this.columnChartData = [
        ...diasOrdenados.map((dia, index) => {
          const dayIndex = index === 6 ? 7 : index + 1;
          const ingresos = data[dayIndex]?.entries || 0;
          const egresos = data[dayIndex]?.exits || 0;

          return [
            dia,
            ingresos,
            egresos
          ];
        })
      ];

      console.log('Datos del gráfico filtrados:', this.columnChartData);
    });


    const fromDateObj = this.parseYearMonth(this.periodFrom);
    const toDateObj = this.parseYearMonth(this.periodTo);
    
    // Supongamos que quieres obtener los top 5 usuarios entre el mes de inicio y el mes final
    this.metricsService.getTopUsers(fromDateObj.month, toDateObj.month, fromDateObj.year).subscribe(topUsers => {
      console.log('Top 5 usuarios:', topUsers);
      this.topUser = topUsers.slice(0, 5); // Limita a los primeros 5 usuarios
      console.log('TOP USUARIO ARRAY', this.topUser);
    });
    

    this.loadUtilizationData(fromDate.month, toDate.month, fromDate.year);

    this.loadAccessCounts();

  }


  private formatYearMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  // Convierte string YYYY-MM a objeto con año y mes
  private parseYearMonth(yearMonth: string): { year: number, month: number } {
    const [year, month] = yearMonth.split('-').map(num => parseInt(num));
    return { year, month };
  }


  dailyAccessCount: number = 0;
  dailyExitCount: number = 0;

  totalAccesCount: number = 0;
  totalExitCount: number = 0;

  today = new Date();
 
  dayWithMostAccesses: string = '';
  accessCount= 0;

  dayWithMostExits: string = '';
  exitsCountPeak = 0;

  currentMonthAccessCount:number = 0;
  currentMonthExitCount:number = 0;



  //public accessData: DayOfWeekMetricDTO[] = [];

  monthEntry: string = '';
  monthExit: string = '';
  entriesCount: number = 0;
  exitCount: number = 0;

  periodFrom: string = this.getDefaultFromDate();
  periodTo: string = this.getCurrentYearMonth();
  minDateFrom: string = '2020-01';
  topMethodName: string = "";


  ngOnInit() {
    this.fetchTodayAccessCount();
    this.loadAccessCounts();
    this.getPeakDayAccess();
    this.getThisMonthCount()
    this.loadEntryExit()
    this.getTotalEntries()
    this.getTotalExits();
    this.getMostEntriesByMonth();
    this.getMostExitsByMonth();
    this.fetchTodayExitCount();
    this.getThisMonthCountExit();
    this.getPeakDayExit();
    this.aplyFilters()
    this.loadUtilizationData();

  }




  getPeakDayExit(): void {
    this.metricsService.getExitCountByWeekAndDayOfWeek().subscribe((data) => {
      console.log(data, 'DATOS DE EGRESOS PICO');  // Verifica la estructura de la respuesta
      if (data) {
        this.dayWithMostExits = data.dayOfWeek;
        this.exitsCountPeak = data.exitsCountPeak;
        console.log('Día de egreso pico:', this.dayWithMostExits);
        console.log('Cantidad de egresos:', this.exitsCountPeak);
      }      
    });
  }
  



  getPeakDayAccess(): void {
    this.metricsService.getAccessCountByWeekAndDayOfWeek().subscribe((data) => {
      
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
      let today = new Date();
      let todayString = today.getFullYear() + '-' + 
                        (today.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                        today.getDate().toString().padStart(2, '0');
      console.log('Fecha calculada en frontend (todayString):', todayString);
      console.log('Fechas recibidas desde el backend:', data.map(item => item.date));
    
      let todayData = data.find(item => item.date === todayString);
      console.log('Datos encontrados para hoy:', todayData);
      
      this.dailyAccessCount = todayData ? todayData.count : 0;
      console.log('Cantidad de accesos hoy:', this.dailyAccessCount);
    });    
  }

  
  private fetchTodayExitCount(): void {
    this.metricsService.getDailyExitData().subscribe(data => {
      let today = new Date();
      let todayString = today.getFullYear() + '-' + 
                        (today.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                        today.getDate().toString().padStart(2, '0');
      console.log('Fecha calculada en frontend (todayString):', todayString);
      console.log('Fechas recibidas desde el backend:', data.map(item => item.date));
    
      let todayData = data.find(item => item.date === todayString);
      console.log('Datos encontrados para hoy:', todayData);
      
      this.dailyExitCount = todayData ? todayData.count : 0;
      console.log('Cantidad de accesos hoy:', this.dailyExitCount);
    });    
  }

  getMostEntriesByMonth(){
    this.metricsService.getMonthWithMostEntries().subscribe(
      (data) => {
        this.monthEntry = data.month;
        this.entriesCount = data.entriesCount;
      },
      (error) => {
        console.error('Error fetching data', error);
      })
  }

  getMostExitsByMonth(){
    this.metricsService.getMonthWithMostExitss().subscribe(
      (data) => {
        this.monthExit = data.month;
        this.exitCount = data.exitsCount;
      },
      (error) => {
        console.error('Error fetching data', error);
      })
  }


  getTotalExits(){
    this.metricsService.getTotalExitsForCurrentYear().subscribe((data) =>{
      this.totalExitCount = data
      console.log(data, 'Cantidad toaaaal');
    })
  }

  
  
  getTotalEntries(){
    this.metricsService.getTotalEntriesForCurrentYear().subscribe((data) =>{
      this.totalAccesCount = data
      console.log(data, 'Cantidad toaaaal');
    })
  }

  getThisMonthCount():void{
    this.metricsService.getThisMonthlyAccessCount().subscribe(data=>{
      console.log("Data",data);
      this.currentMonthAccessCount = data;
      
    })
  }

  getThisMonthCountExit():void{
    this.metricsService.getThisMonthlyExitCount().subscribe(data=>{
      console.log("Data",data);
      this.currentMonthExitCount = data;
      
    })
  }

  utilizationData: UtilizationRate[] = [];
  loading = true;
  error: string | null = null;

  loadUtilizationData(startMonth?: number, endMonth?: number, year?: number): void {
    this.loading = true;
    this.error = null;

    this.metricsService.getUtilizationRate(startMonth, endMonth, year)
      .subscribe({
        next: (response) => {
          this.utilizationData = response.data;
          this.loading = false;
          console.log(this.utilizationData, 'KPIS');
          
        },
        error: (err) => {
          this.error = 'Error al cargar los datos de utilización';
          this.loading = false;
          console.error('Error:', err);
        }
      });
  }

  

  private loadAccessCounts(): void {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);

    this.metricsService.getAccessCountByUserTypeFilter(
        fromDate.year,
        fromDate.month,
        toDate.month
    ).subscribe(data => {
        this.pieChartData = [
            ...data.map(item => [this.translateRole(item.userType), item.count])
        ];
    });
}


  pieChartType = ChartType.PieChart;
  pieChartData: any[] = [];
  pieChartOptions = {
    is3D: false,
    title: '',
    pieSliceText: 'value',
    legend: {
      position: 'right',
      textStyle: { color: '#6c757d', fontSize: 17 }
    },
    chartArea: { width: '100%', height: '100%' },

    colors: ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0']
  };



  columnChartType = ChartType.ColumnChart;
  columnChartData: any[] = ['Día', 'Ingresos', 'Egresos']; 
  columnChartOptions = {
    title: '',
    legend: {
      position: 'top',
      textStyle: { color: '#6c757d', fontSize: 14 },
      alignment: 'center',
      maxLines: 2
    },
    bar: { groupWidth: '100%' },
    height: 600,
    width: '100%',
    colors: ['#4caf50', '#f44336'],
    hAxis: {
      title: 'Días de la semana',
      textStyle: { color: '#6c757d' }
    },
    vAxis: {
      title: 'Cantidad',
      textStyle: { color: '#6c757d' },
      minValue: 0
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    series: {
      0: { labelInLegend: 'Ingresos' },
      1: { labelInLegend: 'Egresos' }
    }
  };


  getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  getDefaultFromDate(): string {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    return `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
  }



  private loadEntryExit(): void {
    // Obtener los valores de año y mes de los filtros
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);

    // Usar el nuevo método con filtros en lugar del original
    this.metricsService.getMovementCountsFilter(
      fromDate.year,
      fromDate.month,
      toDate.month
    ).subscribe(data => {
      console.log("Data recibida de la API:", data);
  
      // Array con los nombres de los días de la semana, comenzando desde Lunes
      const diasOrdenados = [
        'Lunes', 'Martes', 'Miércoles', 'Jueves', 
        'Viernes', 'Sábado', 'Domingo'
      ];
  
      // Crear el array de datos para el gráfico con cabeceras
      this.columnChartData = [
        ...diasOrdenados.map((dia, index) => {
          // Calcular el índice correcto para la API
          const dayIndex = index === 6 ? 7 : index + 1;
  
          // Obtener los valores de ingresos y egresos para ese día desde la API
          const ingresos = data[dayIndex]?.entries || 0;
          const egresos = data[dayIndex]?.exits || 0;
  
          return [
            dia,        // Nombre del día
            ingresos,   // Ingresos
            egresos     // Egresos
          ];
        })
      ];
  
      console.log('Datos del gráfico formateados:', this.columnChartData);
    });
}





























  barChartType:any
  //columnChartType:any;

  counterData: [] = [];

  status: number = 0;
 

  paymentStatus: string = 'Aprobado';
  comparisonType: string = 'ingresos';
  morosos: number = 0;

  lineChartData: any[] = [];
  //columnChartData: any[] = [];
  top5ChartData: any[] = [];






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





/*   getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 9);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
 */
/*   aplyFilters() {
    this.updateColumnChart();
    this.updatePieChart();
    this.updateTop5Chart();
  } */

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
