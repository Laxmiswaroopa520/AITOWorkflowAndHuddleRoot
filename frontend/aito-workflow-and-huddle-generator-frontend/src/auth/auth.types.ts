/*Defines reusable TypeScript types for the authenticated user, token information, and authentication-related values.*/
export interface CurrentUser {
  objectId: string;
  email: string | null;
  displayName: string | null;
  roles: string[];
  isAuthenticated: boolean;
}

/*This reflects the response returned by:

GET /api/auth/me*/