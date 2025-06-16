import { NavItem } from './nav-item/nav-item';

export const navItemsAdmin: NavItem[] = [ //( this.role === 'admin' || this.role === 'auditor' )
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
      {
        displayName: 'Inventario móvil',
        iconName: 'file-text',
        route: '/'
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
  // {
  //   displayName: 'Crear reporte',
  //   iconName: 'file-text',
  //   route: './create-report',
  //   external: true,
  //   chipClass: 'bg-secondary text-white',
  // },
  // {
  //   navCap: 'Auth',
  // },
  {
    displayName: 'Reportes',
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
];
export const navItems: NavItem[] = [ //almacen1 admin, medico
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
      {
        displayName: 'Inventario móvil',
        iconName: 'file-text',
        route: '/'
      }
    ],
  },
/*   {
    displayName: 'Insumos Médicos',
    iconName: 'activity',
    route: './medical-supplies',
    external: true,
    chipClass: 'bg-secondary text-white',
  } */
];

export const navItemsAlmacen2Movil: NavItem[] = [ //almacen2 movil
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
        displayName: 'Inventario móvil',
        iconName: 'file-text',
        route: '/'
      }
    ]
  }
];