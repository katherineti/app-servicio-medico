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
/*       {
        displayName: 'Inventario móvil',
        iconName: 'file-text',
        route: '/'
      }, */
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
  },

  // --- AÑADIDO: Copia de Seguridad de la Base de Datos (Solo Admin) ---
/*   {
    displayName: 'Copia de Seguridad DB',
    iconName: 'database', // Icono sugerido
    route: './db-backup', // Ruta sugerida (debes crear el componente y la ruta)
    external: true,
    chipClass: 'bg-secondary text-white',
  }, */
];
export const navItems: NavItem[] = [ //almacen1 admin 
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
/*       {
        displayName: 'Inventario móvil',
        iconName: 'file-text',
        route: '/'
      } */
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
export const navItemsMedico: NavItem[] = [ //medico y enfermero(a)
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
/*       {
        displayName: 'Inventario móvil',
        iconName: 'file-text',
        route: '/'
      } */
    ],
  },
/*   {
    displayName: 'Insumos Médicos',
    iconName: 'activity',
    route: './medical-supplies',
    external: true,
    chipClass: 'bg-secondary text-white',
  } */
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
/*       {
        displayName: 'Inventario móvil',
        iconName: 'file-text',
        route: '/'
      } */
    ]
  }
];