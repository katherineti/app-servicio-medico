import { NavItem } from './nav-item/nav-item';
export const navItemsAdmin: NavItem[] = [
  {
    displayName: 'Dashboard',
    iconName: 'grid',
    route: './dashboard',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Insumos Médicos',
    iconName: 'activity',
    route: '',
    chipClass: 'bg-secondary text-white',
    children: [
      {
        displayName: 'Inventario almacén',
        iconName: 'file-text',
        route: './medical-supplies'
      },
    ],
  },
  {
    displayName: 'Usuarios',
    iconName: 'user',
    route: './users',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Roles',
    iconName: 'shield',
    route: './roles',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Logs',
    iconName: 'clipboard',
    route: './logs',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Reportes auditoría',
    iconName: 'file-text',
    route: './reports',
    chipClass: 'bg-secondary text-white',
    children: [
      {
        displayName: 'Lista reportes',
        iconName: 'file-text',
        route: './reports'
      },
      {
        displayName: 'Crear reporte',
        iconName: 'plus',
        route: './create-report'
      },
    ],
  },
  {
    displayName: 'Pacientes',
    iconName: 'users',
    route: './patients',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Informes médicos',
    iconName: 'folder-plus',
    route: './medical-reports',
    external: true,
    chipClass: 'bg-secondary text-white',
  }
];
export const navItems: NavItem[] = [
  {
    displayName: 'Dashboard',
    iconName: 'grid',
    route: './dashboard',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Insumos Médicos',
    iconName: 'activity',
    route: '',
    chipClass: 'bg-secondary text-white',
    children: [
      {
        displayName: 'Inventario almacén',
        iconName: 'file-text',
        route: './medical-supplies'
      },
    ],
  }
];
export const navItemsMedico: NavItem[] = [
  {
    displayName: 'Dashboard',
    iconName: 'grid',
    route: './dashboard',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Insumos Médicos',
    iconName: 'activity',
    route: '',
    chipClass: 'bg-secondary text-white',
    children: [
      {
        displayName: 'Inventario almacén',
        iconName: 'file-text',
        route: './medical-supplies'
      }
    ],
  },
  {
    displayName: 'Pacientes',
    iconName: 'users',
    route: './patients',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Informes médicos',
    iconName: 'folder-plus',
    route: './medical-reports',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
];
export const navItemsAlmacen2Movil: NavItem[] = [
  {
    displayName: 'Dashboard',
    iconName: 'grid',
    route: './dashboard',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Insumos Médicos',
    iconName: 'activity',
    route: '',
    chipClass: 'bg-secondary text-white',
    children: [ ]
  }
];