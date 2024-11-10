// services/datatable-config.service.ts

import { Injectable } from "@angular/core";
import { DEFAULT_COLUMN_DEFS, DEFAULT_LANGUAGE_CONFIG, ENTRY_STYLES, STATUS_STYLES, USER_TYPE_MAPPINGS, VALUE_MAPPINGS } from "../../../models/access-report/constants";
import { DataTableConfig, ColumnDef } from "../../../models/access-report/Types";

@Injectable({
  providedIn: 'root'
})
export class DataTableConfigService {
  
  public readonly USER_TYPE_ICONS = USER_TYPE_MAPPINGS;
  public readonly ENTRY_STYLES = ENTRY_STYLES;
  public readonly STATUS_STYLES = STATUS_STYLES;

  
  
    /**
     * Retorna la configuración base para la tabla DataTable
     */
    getBaseConfig(): DataTableConfig {
      return {
        paging: true,
        ordering: true,
        pageLength: 5,
        lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
        scrollX: true,
        lengthChange: true,
        orderCellsTop: true,
        order: [],
        columnDefs: this.getColumnDefs(),
        searching: true,
        info: true,
        autoWidth: false,
        language: this.getLanguageConfig(),
        responsive: true,
        dom: 'rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"l i> p><"clear">',
        drawCallback: (settings: any) => {
          this.styleColumns(settings);
        }
      };
    }
  
    /**
     * Retorna la configuración de idioma para la tabla
     */
    private getLanguageConfig() {
      return {
        lengthMenu: " _MENU_ ",
        zeroRecords: "No se encontraron registros",
        info: "",
        infoEmpty: "",
        infoFiltered: "",
        search: "Buscar:",
        emptyTable: "No se encontraron resultados"
      };
    }
  
    private getColumnDefs() {
      return [
        { 
          targets: 11,
          className: 'text-center'
        },
        {
          targets: 9,
          render: (data: any) => {
            return data === '------' ? '<div class="text-center">------</div>' : data;
          }
        },
        {
          // Asumiendo que la columna de tipo es la 3 (ajusta según tu estructura)
        //ACA SE CONFIGURAN LOS otomes de las columnas
      targets: 3,
      className: 'text-center',
      render: (data: string, type: any, row: any) => {
        // Busca la configuración del tipo de usuario en USER_TYPE_ICONS
        const typeConfig = this.USER_TYPE_ICONS[data as keyof typeof this.USER_TYPE_ICONS] || {
          icon: 'bi bi-question-lg',
          color: 'grey',
          title: 'Desconocido'
        };
        const visitorDocument = row[5];
        return `
          <button style="background-color: ${typeConfig.color}; border: none;" 
                  class="btn btn-primary" 
                  onclick="window.dispatchEvent(new CustomEvent('openModalInfo', { detail: '${visitorDocument}' }))"
                  title="${typeConfig.title}">
            <i class="${typeConfig.icon}"><div class="d-none">${typeConfig.title}</div></i>
          </button>`;
      }
    }
  ];
    }
    /**
     * Aplica los estilos a las columnas después de cada redibujado de la tabla
     * @param settings Configuración de la tabla
     */
    private styleColumns(settings: any): void {
      const table = settings.nTable;
      this.styleEntryExitColumn(table);
      this.styleStatusColumn(table);
    }
  
    /**
     * Aplica estilos a la columna de entrada/salida
     * @param table Elemento de la tabla
     */
    private styleEntryExitColumn(table: any): void {
      $(table).find('td:nth-child(3)').each((_, element) => {
        const cellText = $(element).text().trim().toLowerCase();
        const visitorDocument = $(element).closest('tr').find('td:nth-child(6)').text().trim();
        const plate = $(element).closest('tr').find('td:nth-child(9)').text().trim();
        const splitedData = cellText.split('!-');
          const movementType = splitedData.at(0) + '';
          const lastMovement = splitedData.at(1) + ''; 
          console.log(splitedData)
          
        if (['entrada', 'salida'].includes(movementType.toLocaleLowerCase())) {
          const style = this.ENTRY_STYLES[movementType as keyof typeof this.ENTRY_STYLES];
          console.log(style)
          console.log(lastMovement)

          const buttonAddition = `
          role="button" onclick="window.dispatchEvent(new CustomEvent('Movment', { 
                  detail: { 
                    document: '${visitorDocument}', 
                    type: '${movementType}', 
                    plate: '${plate}' 
                  }
                }))"
          `

          console.log('Añadiendo botón para el documento:', visitorDocument);
          console.log('Placa:', plate);
          const badgeHTML = `
        <div class="d-flex justify-content-center">
          <span class="badge rounded-pill" 
                style="background-color: ${style.color}; color: white;"
                ${lastMovement=== 'true'? buttonAddition : ''}
                title="Ver documento">
            ${style.text}
          </span>
        </div>
      `;
      // Establecemos el badge como contenido de la celda
      $(element).html(badgeHTML);
     }
        
      });
    }
  
    /**
     * Aplica estilos a la columna de estado
     * @param table Elemento de la tabla
     */
    private styleStatusColumn(table: any): void {
      $(table).find('td:nth-child(12)').each((_, element) => {
        const estadoText = $(element).text().trim().toLowerCase();
        
        // Busca el estado correspondiente en el mapeo de valores
        const matchingStatus = Object.entries(VALUE_MAPPINGS).find(([key, value]) => 
          value.toLowerCase() === estadoText || key.toLowerCase() === estadoText
        );
  
        if (matchingStatus) {
          const [statusKey] = matchingStatus;
          const style = statusKey === 'late' ? this.STATUS_STYLES.late : this.STATUS_STYLES.inrange;
          this.applyBadgeStyle(element, style.color, style.text);
        }
      });
    }
  
    /**
     * Aplica el estilo de badge a un elemento
     * @param element Elemento al que se aplicará el estilo
     * @param color Color del badge
     * @param text Texto que se mostrará
     */
    private applyBadgeStyle(element: any, color: string, text: string): void {
      $(element).html(`
        <div class="d-flex justify-content-center">
          <span class="badge rounded-pill d-flex align-items-center justify-content-center" 
                style="background-color: ${color}; color: white; border: none;">
            <span style="white-space: nowrap; display: inline-block;">${text}</span>
          </span>
        </div>
      `);
    }
}

