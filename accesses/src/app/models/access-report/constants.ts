
import { ColumnDef, LanguageConfig, SelectOption } from './Types';


      /**
   * Configuración de iconos para tipos de usuario
   */
      export const USER_TYPE_ICONS = {
        Empleado: {
          icon: 'bi bi-briefcase',
          color: '#fd7e14',
          title: 'Empleado'
        },
        Proveedor: {
          icon: 'bi bi-truck',
          color: '#20c997',
          title: 'Proveedor'
        },
        Visitante: {
          icon: 'bi bi-person-raised-hand',
          color: '#0d6efd',
          title: 'Visitante'
        },
        Vecino: {
          icon: 'bi bi-house-fill',
          color: '#198754',
          title: 'Vecino'
        },
        Obrero: {
          icon: 'bi bi-tools',
          color: '#dc3545',
          title: 'Obrero'
        },
        Delivery: {
          icon: 'bi bi-box-seam',
          color: 'purple',
          title: 'Delivery'
        },
        Cleaning: {
          icon: 'bi bi-stars',
          color: '#d63384',
          title: 'P. de Limpieza'
        },
        Jardinero: {
          icon: 'bi bi-flower1',
          color: '#0dcaf0',
          title: 'Jardinero'
        },
        Emergencias: {
          icon: 'bi bi-hospital"',
          color: '#dc3545',
          title: 'Emergencias'
        }
      };
    
/**
 * Opciones para el selector de entrada/salida
 */
export const ENTRY_EXIT_OPTIONS: SelectOption[] = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' }
];

/**
 * Opciones para el tipo de persona que ingresa
 */
export const TIPOS_INGRESANTE: SelectOption[] = [
  { value: 'neighbour', label: 'Vecino' },
  { value: 'visitor', label: 'Visitante' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'constructionworker', label: 'Obrero' },
  { value: 'suplier', label: 'Proveedor' },
  { value: 'employee', label: 'Empleado' },
  { value: 'services', label: 'Servicios' },
  { value: 'cleaning', label: 'Personal de Limpieza' },
  { value: 'gardener', label: 'Jardinero' }
];

/**
 * Opciones para el tipo de vehículo
 */
export const TIPOS_VEHICULO: SelectOption[] = [
  { value: 'car', label: 'Auto' },
  { value: 'motorcycle', label: 'Moto' },
  { value: 'truck', label: 'Camión' },
  { value: 'bike', label: 'Bicicleta' },
  { value: 'van', label: 'Camioneta' },
  { value: 'walk', label: 'Sin vehículo' }
];

/**
 * Opciones para el estado del horario
 */
export const ESTADO_HORARIO_OPTIONS: SelectOption[] = [
  { value: 'inrange', label: 'En horario' },
  { value: 'late', label: 'Tarde' }
];

/**
 * Mapeo de valores para las transformaciones
 */
export const VALUE_MAPPINGS: { [key: string]: string } = {
  // Entrada/Salida
  entrada: 'entrada',
  salida: 'salida',
  
  // Tipos de ingresante
  neighbour: 'vecino',
  visitor: 'visitante',
  delivery: 'delivery',
  constructionworker: 'obrero',
  suplier: 'proveedor',
  employee: 'empleado',
  services: 'servicios',
  
  // Tipos de vehículo
  car: 'auto',
  motorcycle: 'moto',
  truck: 'camion',
  bike: 'bicicleta',
  van: 'camioneta',
  walk: 'sin vehículo',
  
  // Estados de horario
  inrange: 'en horario',
  late: 'tarde'
};

/**
 * Configuración por defecto para el idioma de DataTables
 */
export const DEFAULT_LANGUAGE_CONFIG: LanguageConfig = {
  lengthMenu: " _MENU_ ",
  zeroRecords: "No se encontraron registros",
  info: "",
  infoEmpty: "",
  infoFiltered: "",
  search: "Buscar:",
  emptyTable: "No se encontraron resultados"
};

/**
 * Configuración por defecto para las columnas de la tabla
 */
export const DEFAULT_COLUMN_DEFS: ColumnDef[] = [

    
  { 
    targets: 11,
    className: 'text-center'
  },
  {
    targets: 9,
    render: (data: any) => {
      return data === '------' ? '<div class="text-center">------</div>' : data;
    }
  }
];

/**
 * Configuración de estilo para los badges
 */
export const BADGE_STYLES = {
  entry: {
    success: '#28a745',
    error: '#dc3545'
  },
  text: {
    light: 'white'
  }
};

  /**
   * Estilos predefinidos para los estados de horario
   */
  export const STATUS_STYLES = {
    late: {
      color: '#dc3545',  // Rojo para tarde
      text: 'Tarde'
    },
    inrange: {
      color: '#28a745',  // Verde para en horario
      text: 'En Horario'
    }
  };


  /**
   * Estilos predefinidos para los tipos de entrada/salida
   */
  export const ENTRY_STYLES = {
    entrada: {
      color: '#28a745',  // Verde para entrada
      text: 'Entrada'
    },
    salida: {
      color: '#dc3545',  // Rojo para salida
      text: 'Salida'
    }
  };
  