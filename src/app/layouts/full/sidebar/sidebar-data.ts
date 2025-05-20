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
    route: './medical-supplies',
    external: true,
    chipClass: 'bg-secondary text-white',
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
    displayName: 'Crear reporte',
    iconName: 'file-text',
    route: './create-report',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
  {
    displayName: 'Reportes',
    iconName: 'file-text',
    route: './reports',
    external: true,
    chipClass: 'bg-secondary text-white',
  },
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
    route: './medical-supplies',
    external: true,
    chipClass: 'bg-secondary text-white',
  }
];