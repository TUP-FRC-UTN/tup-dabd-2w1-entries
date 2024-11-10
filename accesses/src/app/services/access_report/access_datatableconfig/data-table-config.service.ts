// services/datatable-config.service.ts

import { Injectable } from "@angular/core";
import { DEFAULT_COLUMN_DEFS, DEFAULT_LANGUAGE_CONFIG, ENTRY_STYLES, STATUS_STYLES, USER_TYPE_MAPPINGS, VALUE_MAPPINGS } from "../../../models/access-report/constants";
import { DataTableConfig, ColumnDef } from "../../../models/access-report/Types";
import { Subject } from "rxjs";
import { accessRegisterEventDetails } from "../../../models/problemas";

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
          targets: 8,
          render: (data: any) => {
            
            return data === '------' ? '<div class="text-center">------</div>' : data;
          }
        },
        {
          targets : 2,
          render: (data: string,type: any, row: any) => {
            
            const spliteData = data.split('!-');
            const movementType = spliteData.at(0);
            const lastMovement = spliteData.at(1);
            const style = this.ENTRY_STYLES[movementType?.toLocaleLowerCase() as keyof typeof this.ENTRY_STYLES];
            const details : accessRegisterEventDetails = {
              document : row[5],
              userType : row[3]
            }
            const butonAddition = `
          role="button" onclick="window.dispatchEvent(new CustomEvent('registerEntryExit', { detail: ${JSON.stringify(details)}  }))"
            `    
            return `
        <div class="d-flex justify-content-center">
          <span  style="background-color: ${style.color}; color: white; border: none; "
                class="badge rounded-pill d-flex align-items-center justify-content-center"
                ${lastMovement=== 'true'? butonAddition : ''}>
            <span style="white-space: nowrap; display: inline-block;">${style.text}</span>
          </span>
        </div>
      `;
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
  []
    }

//$(element).find('.badge').on('click', () => this.badgeClickSource.next(index));
    private badgeClickSource = new Subject<number>();
  badgeClick$ = this.badgeClickSource.asObservable();
}

