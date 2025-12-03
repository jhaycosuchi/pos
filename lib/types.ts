// Tipos y constantes del sistema POS

export type UserRole = 'admin' | 'caja' | 'mesero';

export interface User {
  id: number;
  username: string;
  rol: UserRole;
  nombre: string;
  estado: boolean;
  creado_en: string;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageMeseros: boolean;
  canManageProducts: boolean;
  canManageMenu: boolean;
  canManageOrders: boolean;
  canManageCash: boolean;
  canViewReports: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canManageMeseros: true,
    canManageProducts: true,
    canManageMenu: true,
    canManageOrders: true,
    canManageCash: true,
    canViewReports: true,
  },
  caja: {
    canManageUsers: false,
    canManageMeseros: true,
    canManageProducts: false,
    canManageMenu: false,
    canManageOrders: true,
    canManageCash: true,
    canViewReports: true,
  },
  mesero: {
    canManageUsers: false,
    canManageMeseros: false,
    canManageProducts: false,
    canManageMenu: false,
    canManageOrders: true,
    canManageCash: false,
    canViewReports: false,
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  caja: 'Caja',
  mesero: 'Mesero',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800',
  caja: 'bg-yellow-100 text-yellow-800',
  mesero: 'bg-blue-100 text-blue-800',
};