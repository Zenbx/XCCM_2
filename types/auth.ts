/**
 * Interface User synchronisée avec le backend
 * Les champs correspondent exactement à PublicUser du backend
 */
export interface User {
  user_id: string;
  email: string;
  lastname: string;
  firstname: string;
  org?: string | null;
  occupation?: string | null;
  profile_picture?: string | null;
  role?: string; // Rôle de l'utilisateur ('admin', 'user', etc.)
  created_at?: string; // Date en string côté frontend
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  firstname: string;
  lastname: string;
  occupation?: string;
  org?: string;
  profile_picture?: File;
}
