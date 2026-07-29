import type { Role } from '../booking/types';

export interface Policy {
  resource: string;
  action: 'read' | 'create' | 'update' | 'delete' | 'manage';
  allow: Role[];
}

export const policies: Policy[] = [
  { resource: 'studios', action: 'manage', allow: ['platform_superadmin'] },
  {
    resource: 'studios',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  { resource: 'memberships', action: 'manage', allow: ['platform_superadmin', 'studio_owner'] },
  {
    resource: 'memberships',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  { resource: 'artists', action: 'manage', allow: ['platform_superadmin', 'studio_owner'] },
  { resource: 'artists', action: 'update', allow: ['artist_admin'] },
  {
    resource: 'artists',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  {
    resource: 'social_links',
    action: 'manage',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin'],
  },
  {
    resource: 'social_links',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  {
    resource: 'services',
    action: 'manage',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin'],
  },
  {
    resource: 'services',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  {
    resource: 'availability',
    action: 'manage',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin'],
  },
  {
    resource: 'availability',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  {
    resource: 'clients',
    action: 'manage',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin'],
  },
  {
    resource: 'clients',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  {
    resource: 'appointments',
    action: 'manage',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin'],
  },
  {
    resource: 'appointments',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  {
    resource: 'portfolio',
    action: 'manage',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin'],
  },
  {
    resource: 'portfolio',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  { resource: 'events', action: 'manage', allow: ['platform_superadmin', 'studio_owner'] },
  {
    resource: 'events',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
  {
    resource: 'google',
    action: 'manage',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin'],
  },
  {
    resource: 'google',
    action: 'read',
    allow: ['platform_superadmin', 'studio_owner', 'artist_admin', 'staff_readonly'],
  },
];

export function can(role: Role, resource: string, action: Policy['action']): boolean {
  return policies.some(
    (p) =>
      p.resource === resource &&
      (p.action === action || p.action === 'manage') &&
      p.allow.includes(role),
  );
}
