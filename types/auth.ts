export interface User {
  user_id: string;
  email: string;
  firstname: string;
  lastname: string;
  occupation?: string;
  org?: string;
  created_at: string;
  role: string; // Rôle de l'utilisateur ('admin', 'user', etc.)
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
}
