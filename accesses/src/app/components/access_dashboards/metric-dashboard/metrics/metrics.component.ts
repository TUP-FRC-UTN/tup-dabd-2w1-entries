import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { AccessMetricsService } from '../../../../services/access-metric/access-metrics.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopUser, UtilizationRate } from '../../../../models/access-metric/metris';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [GoogleChartsModule, NgIf,CommonModule,FormsModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css'
})

export class MetricsComponent implements OnInit{


  constructor(private metricsService: AccessMetricsService, private cdr: ChangeDetectorRef) {
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
  status: number = 0;



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

  applyFilters(): void {
    // Obtener los valores de año y mes de los filtros
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);
  
    // Primero, aplicar el filtro de movimiento (ingresos o egresos)
    this.metricsService.getMovementCountsFilter(
      fromDate.year,
      fromDate.month,
      toDate.month,
      this.chartType // Pasamos el tipo de filtro ('ingresos' o 'egresos')
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
          const cantidad = data[dayIndex]?.[this.chartType === 'ingresos' ? 'entries' : 'exits'] || 0;
  
          return [
            dia,
            cantidad // Muestra solo los ingresos o egresos según el filtro
          ];
        })
      ];
      console.log('Datos del gráfico filtrados:', this.columnChartData);
    });
  
    // Obtener los datos de los usuarios top
    const fromDateObj = this.parseYearMonth(this.periodFrom);
    const toDateObj = this.parseYearMonth(this.periodTo);
    
    this.metricsService.getTopUsers(fromDateObj.month, toDateObj.month, fromDateObj.year).subscribe(topUsers => {
      console.log('Top 5 usuarios:', topUsers);
      this.topUser = topUsers.slice(0, 5); // Limita a los primeros 5 usuarios
      console.log('TOP USUARIO ARRAY', this.topUser);
    });
    
    // Cargar los datos de utilización dependiendo de si es ingresos o egresos
    if (this.chartType === 'ingresos') {
      this.loadUtilizationData(fromDate.year, fromDate.month, toDate.month);
    } else {
      this.loadUtilizationExitData(fromDate.year, fromDate.month, toDate.month);
    }
  
    // Cargar la cuenta de accesos
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
    this.applyFilters()

  }



  private getMonthsRange(start: number, end: number): number[] {
    const months = [];
    for (let i = start; i <= end; i++) {
      months.push(i);
    }
    return months;
  }

  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
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

  utilizationData: any;
  loading = true;
  error: string | null = null;

  loadUtilizationData(year: number, startMonth: number, endMonth: number): void {
    this.loading = true;
    this.error = null;
  
    this.metricsService.getAccessCountByUserTypeFilter(year, startMonth, endMonth)
      .subscribe({
        next: (response) => {
          this.utilizationData = response;
          this.calculatePercentages(this.utilizationData, 'ingresos');
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los datos de ingresos';
          this.loading = false;
          console.error('Error:', err);
        }
      });
  }
  


  loadUtilizationExitData(year: number, startMonth: number, endMonth: number): void {
    this.loading = true;
    this.error = null;
  
    this.metricsService.getExitCountByUserTypeFilter(year, startMonth, endMonth)
      .subscribe({
        next: (response) => {
          this.utilizationData = response;
          this.calculatePercentages(this.utilizationData, 'egresos');
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los datos de egresos';
          this.loading = false;
          console.error('Error:', err);
        }
      });
  }

  uniqueData: UtilizationRate[] = [];

  calculatePercentages(data: UtilizationRate[], type: 'ingresos' | 'egresos'): void {
    // Agrupar los datos por tipo de usuario
    const groupedData = data.reduce<{ [key: string]: UtilizationRate }>((acc, item) => {
      // Aquí le decimos a TypeScript que 'acc' es un objeto con claves de tipo string y valores de tipo 'UtilizationRate'
      if (acc[item.userType]) {
        acc[item.userType].count += item.count;
      } else {
        acc[item.userType] = { userType: item.userType, count: item.count };
      }
      return acc;
    }, {}); // El objeto vacío se tipa como un acumulador de tipo { [key: string]: UtilizationRate }
  
    // Convertir el objeto agrupado en un array
    const uniqueData = Object.values(groupedData);
  
    // Calcular el total de accesos (o salidas)
    const totalCount = uniqueData.reduce((sum, item) => sum + item.count, 0);
  
    // Calcular el porcentaje por tipo de usuario
    uniqueData.forEach(item => {
      item.percentage = parseFloat(((item.count / totalCount) * 100).toFixed(2)); // Formatear a dos decimales
    });

    this.uniqueData = Object.values(groupedData);

    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} por usuario:`, uniqueData);
  }
  
  

  
  groupByUserType(data: any[]): any[] {
    const groupedData: { [key: string]: { userType: string, accessCount: number, utilizationPercentage: number } } = {};
  
    // Agrupar los datos por "userType"
    data.forEach(item => {
      if (groupedData[item.userType]) {
        // Si el tipo de usuario ya existe, sumamos los accesos
        groupedData[item.userType].accessCount += item.accessCount;
      } else {
        // Si es un tipo de usuario nuevo, lo agregamos
        groupedData[item.userType] = { 
          userType: item.userType,
          accessCount: item.accessCount,
          utilizationPercentage: item.utilizationPercentage 
        };
      }
    });
  
    // Convertimos el objeto agrupado de vuelta a un array
    return Object.values(groupedData);
  }
  


  
  private loadAccessCounts(): void {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);
  
    this.metricsService.getAccessCountByUserTypeFilter(
      fromDate.year,
      fromDate.month,
      toDate.month
    ).subscribe(data => {
      console.log(data, "DATA FILTRADA DE GRAFICO DE COLUMNAS");
  
      const chartData: any[] = [];
  
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
      const userTypesData: { [key: string]: number[] } = {};
      const userTypes: string[] = [];  
      const tooltips: string[][] = []; 
  
      data.forEach(item => {
        const month = item.month - 1; 
        const userType = item.userType;  
  
        if (!userTypesData[userType]) {
          userTypesData[userType] = new Array(12).fill(0); 
          userTypes.push(userType); 
        }
  
        userTypesData[userType][month] = item.count;
      });
  
      const filteredMonths = months.slice(fromDate.month - 1, toDate.month); 
      filteredMonths.forEach((month, i) => {
        const row: (string | number)[] = [month]; 
  
        userTypes.forEach(userType => {
          const count = userTypesData[userType][fromDate.month - 1 + i] || 0; 
          row.push(count);
        });
  
        chartData.push(row);
      });
  
      this.barChartData = chartData;
  
      console.log('Datos del gráfico de columnas:', this.barChartData);
  
      const series: { [key: number]: { labelInLegend: string, type: string } } = userTypes.reduce((acc: { [key: number]: { labelInLegend: string, type: string } }, userType, index) => {
        acc[index] = {
          labelInLegend: this.translateRole(userType), 
          type: 'column', 
        };
        return acc;
      }, {} as { [key: number]: { labelInLegend: string, type: string } });
  
      this.barChartOptions = {
        title: 'Comparación de Ingresos por Tipo de Usuario',
        legend: {
          position: 'bottom',
          textStyle: { color: '#6c757d', fontSize: 14 }
        },
        colors: ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'],
        hAxis: {
          title: 'Meses',  
          textStyle: { color: '#6c757d' },
          slantedText: true, 
        },
        vAxis: {
          title: 'Cantidad de Ingresos', 
          textStyle: { color: '#6c757d' },
          minValue: 0,
          format: '', 
        },
        animation: {
          duration: 1000,
          easing: 'out',
          startup: true
        },
        series, 

      };
    });
  }
  
  chartType: 'ingresos' | 'egresos' = 'ingresos';
  barChartType = ChartType.ColumnChart;  
  barChartData: any[] = [];
  barChartOptions: any = {};

  
  onChartTypeChange() {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);
  
    this.loadData();
    this.loadEntryExit();  

  
    if (this.chartType === 'ingresos') {
      this.loadUtilizationData(fromDate.year, fromDate.month, toDate.month);
    } else {
      this.loadUtilizationExitData(fromDate.year, fromDate.month, toDate.month);
    }
  }
  
  private loadData(): void {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);

    // Seleccionar el servicio según el tipo
    const service = this.chartType === 'ingresos' 
      ? this.metricsService.getAccessCountByUserTypeFilter(fromDate.year, fromDate.month, toDate.month)
      : this.metricsService.getExitCountByUserTypeFilter(fromDate.year, fromDate.month, toDate.month);

    service.subscribe(data => {
      console.log(data, `DATA FILTRADA DE GRAFICO DE ${this.chartType.toUpperCase()}`);

      const chartData: any[] = [];
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const userTypesData: { [key: string]: number[] } = {};
      const userTypes: string[] = [];

      data.forEach(item => {
        const month = item.month - 1;
        const userType = item.userType;

        if (!userTypesData[userType]) {
          userTypesData[userType] = new Array(12).fill(0);
          userTypes.push(userType);
        }

        userTypesData[userType][month] = item.count;
      });

      const filteredMonths = months.slice(fromDate.month - 1, toDate.month);
      filteredMonths.forEach((month, i) => {
        const row: (string | number)[] = [month];

        userTypes.forEach(userType => {
          const count = userTypesData[userType][fromDate.month - 1 + i] || 0;
          row.push(count);
        });

        chartData.push(row);
      });

      this.barChartData = chartData;

      const series: { [key: number]: { labelInLegend: string, type: string } } = 
        userTypes.reduce((acc: { [key: number]: { labelInLegend: string, type: string } }, userType, index) => {
          acc[index] = {
            labelInLegend: this.translateRole(userType),
            type: 'column',
          };
          return acc;
        }, {});

      this.barChartOptions = {
        title: `Comparación de ${this.chartType === 'ingresos' ? 'Ingresos' : 'Egresos'} por Tipo de Usuario`,
        legend: {
          position: 'bottom',
          textStyle: { color: '#6c757d', fontSize: 14 }
        },
        colors: ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'],
        hAxis: {
          title: 'Meses',
          textStyle: { color: '#6c757d' },
          slantedText: true,
        },
        vAxis: {
          title: `Cantidad de ${this.chartType === 'ingresos' ? 'Ingresos' : 'Egresos'}`,
          textStyle: { color: '#6c757d' },
          minValue: 0,
          format: '',
        },
        animation: {
          duration: 1000,
          easing: 'out',
          startup: true
        },
        series,
      };
    });
  }
  
  
  
  getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  getDefaultFromDate(): string {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    return `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
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
  columnChartData: any[] = [];  
  columnChartOptions = {
    title: '',
    legend: {
      position: 'top',
      textStyle: { color: '#6c757d', fontSize: 14 },
      alignment: 'center',
      maxLines: 2
    },
    
    bar: { groupWidth: 900 },
    hAxis: {
      title: 'Días de la semana',
      textStyle: { color: '#6c757d' }
    },
    vAxis: {
      title: 'Cantidad',
      textStyle: { color: '#6c757d' },
      minValue: 0,
      format: ''
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    series: {
      0: { labelInLegend: '' },
      1: { labelInLegend: '' },

    },
     colors: ['','']
  };


  private loadEntryExit(): void {
    // Obtener los valores de año y mes de los filtros
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);
  
    // Usar el filtro seleccionado (ingresos o egresos) en la llamada al servicio
    this.metricsService.getMovementCountsFilter(
      fromDate.year,
      fromDate.month,
      toDate.month,
      this.chartType // 'ingresos' o 'egresos'
    ).subscribe(data => {
      console.log("Data recibida de la API:", data);
  
      // Array con los nombres de los días de la semana, comenzando desde Lunes
      const diasOrdenados = [
        'Lunes', 'Martes', 'Miércoles', 'Jueves', 
        'Viernes', 'Sábado', 'Domingo'
      ];
  
      // Crear el array de datos para el gráfico con cabeceras
      if (this.chartType === 'ingresos') {
        // Mostrar solo ingresos
        this.columnChartOptions.series[0].labelInLegend = "ingresos"
        this.columnChartOptions.colors[0] = '#4caf50'
        this.columnChartData = [
          ...diasOrdenados.map((dia, index) => {
            const dayIndex = index === 6 ? 7 : index + 1;
            const ingresos = data[dayIndex]?.entries || 0;
  
            return [
              dia,            // Día de la semana
              ingresos        // Solo ingresos
            ];
          })
        ];
      } else if (this.chartType === 'egresos') {
        // Mostrar solo egresos
          this.columnChartOptions.series[0].labelInLegend = "egresos"
          this.columnChartOptions.colors[0] = '#f44336'

        this.columnChartData = [
          ...diasOrdenados.map((dia, index) => {
            const dayIndex = index === 6 ? 7 : index + 1;
            const egresos = data[dayIndex]?.exits || 0;
  
            return [
              dia,            // Día de la semana
              egresos         // Solo egresos
            ];
          })
        ];
      } else{

          this.columnChartOptions.series[0].labelInLegend = "egresos"
          this.columnChartOptions.series[1].labelInLegend = "ingresos"

          this.columnChartOptions.colors[0] = '#f44336'
          this.columnChartOptions.colors[1] = '#4caf50'

        this.columnChartData = [
          ...diasOrdenados.map((dia, index) => {
            const dayIndex = index === 6 ? 7 : index + 1;
    
            const ingresos = data[dayIndex]?.entries || 0;
            const egresos = data[dayIndex]?.exits || 0;
    
            return [
              dia,        // Nombre del día
              ingresos,   // Ingresos
              egresos     // Egresos
            ];
          })
        ];
      }
  
     
      console.log('Datos del gráfico formateados:', this.columnChartData);
    });
  }
  
  


  makeBig(nro: number) {
    this.status = nro;
    } 
}
