export enum Role {
  // The ADMIN role has the highest priority, followed by the MODERATOR role, and finally the USER role.
  ADMIN = 'ADMIN',

  // The MODERATOR role has a higher priority than the USER role.
  MODERATOR = 'MODERATOR',
}
