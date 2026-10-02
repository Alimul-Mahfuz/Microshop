export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto | null;
  errors?: string[];
}
