// User and Authentication Types
export interface AuthUser {
    id: string;
    email: string;
    username: string;
  }
  
  export interface Session {
    user: AuthUser;
    expires: string;
  }
  
  export interface AuthError {
    type: 'CredentialsSignin' | 'Default';
    message: string;
  }
  
  // Credential Types
  export interface SignInCredentials {
    email: string;
    password: string;
  }
  
  export interface SignUpCredentials extends SignInCredentials {
    username: string;
  }
  
  // Form Types
  export interface AuthFormProps {
    action: (formData: FormData) => Promise<void | { error: string }>;
    children: React.ReactNode;
  }
  
  // Navigation Types
  export type NavItem = 
    | { label: string; href: string }
    | { label: string; action: 'login' | 'logout' };
  
  export interface NavBarProps {
    navItems: NavItem[];
  }
  
  // Response Types
  export interface AuthResponse {
    error?: string;
    success?: boolean;
    redirectUrl?: string;
  }