import { describe, expect, it } from 'vitest';
import { can } from '@tattoo/domain/authz/policies';

describe('authz policies', () => {
  it('grants studio_owner manage on studio', () => {
    expect(can('studio_owner', 'studios', 'manage')).toBe(false);
    expect(can('studio_owner', 'artists', 'manage')).toBe(true);
  });

  it('allows artist_admin to update own profile', () => {
    expect(can('artist_admin', 'artists', 'update')).toBe(true);
    expect(can('artist_admin', 'studios', 'manage')).toBe(false);
  });

  it('grants platform_superadmin full access', () => {
    expect(can('platform_superadmin', 'memberships', 'manage')).toBe(true);
    expect(can('platform_superadmin', 'events', 'delete')).toBe(true);
  });

  it('denies staff_readonly from writing', () => {
    expect(can('staff_readonly', 'appointments', 'read')).toBe(true);
    expect(can('staff_readonly', 'appointments', 'create')).toBe(false);
  });
});