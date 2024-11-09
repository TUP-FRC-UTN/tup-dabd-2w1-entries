import { Injectable } from '@angular/core';
import $ from 'jquery';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import 'jszip';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
   /**
   * Configura los botones de exportación para la tabla
   */
   setupExportButtons(table: any, selectedMonth: number | null): void {
    const { formattedDate, formattedDateForFilename, currentMonth } = this.getFormattedDates(selectedMonth);
    
    // Limpiar botones existentes si los hay
    if (table.buttons) {
      $(table.buttons.container()).remove();
    }

    // Configurar nuevos botones
    const buttonsConfig = {
      buttons: [
        {
          ...this.getExcelConfig(formattedDateForFilename, currentMonth, formattedDate),
          className: 'dt-button-excel d-none'
        },
        {
          ...this.getPdfConfig(formattedDateForFilename, currentMonth),
          className: 'dt-button-pdf d-none'
        }
      ]
    };

    // Crear y agregar los botones
    const buttons = new ($.fn.dataTable.Buttons as any)(table, buttonsConfig);
    const $container = $(buttons.container());
    $container.appendTo('#myTable_wrapper');
    
    // Guardar referencia a los botones
    table.buttons = buttons;
  }

  /**
   * Obtiene las fechas formateadas para los nombres de archivo
   */
  private getFormattedDates(selectedMonth: number | null) {
    const today = new Date();
    const formattedDate = this.formatDate(today);
    const formattedDateForFilename = formattedDate.replace(/\//g, '-');
    const currentMonth = this.getMonthName(selectedMonth);

    return { formattedDate, formattedDateForFilename, currentMonth };
  }

  /**
   * Formatea una fecha al formato dd/mm/yyyy
   */
  private formatDate(date: Date): string {
    return [
      date.getDate().toString().padStart(2, '0'),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getFullYear()
    ].join('/');
  }

  /**
   * Obtiene el nombre del mes en español
   */
  private getMonthName(selectedMonth: number | null): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return selectedMonth ? 
      monthNames[selectedMonth - 1] : 
      monthNames[new Date().getMonth()];
  }

  /**
   * Obtiene la configuración para exportación a Excel
   */
  private getExcelConfig(formattedDateForFilename: string, currentMonth: string, formattedDate: string) {
    return {
      extend: 'excel',
      text: 'Excel',
      filename: () => `${formattedDateForFilename}. Movimientos del mes de ${currentMonth}`,
      exportOptions: {
        columns: ':visible',
        format: {
          body: (data: any, row: number, column: number) => {
            // Convertir a string y eliminar espacios en blanco
            const strData = String(data).trim();
            
            // Para la columna de tipo de ingresante
            if (column === 3) {
              const titleMatch = strData.match(/title="([^"]+)"/);
              if (titleMatch && titleMatch[1]) {
                return titleMatch[1];
              }
              return 'Desconocido';
            }

            // Para la columna con los guiones
            if (column === 9) {
              // Si incluye el div con clase text-center
              if (strData.includes('text-center')) {
                return '------';
              }
              // Si es directamente los guiones
              if (strData === '------') {
                return '------';
              }
              // Para cualquier otro caso, retornar el dato original
              return strData;
            }

            // Para cualquier otra columna, retornar el dato sin modificar
            return strData;
          }
        }
      },
      messageTop: `Movimientos del mes de ${currentMonth}\nFecha de emisión: ${formattedDate}`,
      title: 'LISTADO MENSUAL DE INGRESOS/EGRESOS',
      customize: (xlsx: any) => {
        const sheet = xlsx.xl.worksheets['sheet1.xml'];
        $('row:first c', sheet).attr('s', '48');
        $('row c[r^="A1"]', sheet).attr('s', '51');
      }
    };
  }

  /**
   * Obtiene la configuración para exportación a PDF
   */
  private getPdfConfig(formattedDateForFilename: string, currentMonth: string) {
    return {
      extend: 'pdf',
      text: 'PDF',
      filename: () => `${formattedDateForFilename}. Movimientos del mes de ${currentMonth}`,
      orientation: 'landscape',
      pageSize: 'A4',
      exportOptions: {
        columns: ':visible',
        format: {
          body: (data: any, row: number, column: number) => {
            // Convertir a string y eliminar espacios en blanco
            const strData = String(data).trim();
            
            // Para la columna de tipo de ingresante
            if (column === 3) {
              const titleMatch = strData.match(/title="([^"]+)"/);
              if (titleMatch && titleMatch[1]) {
                return titleMatch[1];
              }
              return 'Desconocido';
            }

            // Para la columna con los guiones
            if (column === 9) {
              // Si incluye el div con clase text-center
              if (strData.includes('text-center')) {
                return '------';
              }
              // Si es directamente los guiones
              if (strData === '------') {
                return '------';
              }
              // Para cualquier otro caso, retornar el dato original
              return strData;
            }

            // Para cualquier otra columna, retornar el dato sin modificar
            return strData;
          }
        }
      },
      customize: (doc: any) => {
        // Estilo para la tabla
        doc.content[1].table.headerRows = 1;
        doc.content[1].table.body[0].forEach((cell: any) => {
          cell.fillColor = '#25B79D';
          cell.color = '#FFFFFF';
        });

        // Ajustar los anchos de las columnas
        doc.content[1].table.widths = [
          'auto',  // Fecha
          'auto',  // Hora
          'auto',  // Tipo
          'auto',  // Ingresante
          50,      // Nombre
          100,     // Documento
          100,     // Observaciones
          'auto',  // Vehículo
          'auto',  // Placa
          'auto',  // Propietario
          'auto',  // Guardia
          'auto'   // Estado
        ];

        // Título principal
        doc.content[0] = {
          text: 'LISTADO MENSUAL DE INGRESOS/EGRESOS',
          alignment: 'left',
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 10]
        };

        // Subtítulo con el mes
        doc.content.splice(1, 0, {
          text: `Movimientos del mes de: ${currentMonth}`,
          alignment: 'left',
          fontSize: 12,
          margin: [0, 0, 0, 5]
        });
      },
      title: 'LISTADO MENSUAL DE INGRESOS/EGRESOS'
    };
  }
}