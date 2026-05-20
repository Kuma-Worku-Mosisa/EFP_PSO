export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  faydaId: string; // Added: National Digital ID
  photoUrl: string | null; // Added: Optional profile picture URL
  createdAt: Date | null;

  // Relations
  user_roles: UserRole[]; // Included so you can display and manage permissions
}

// Supporting interfaces for the Many-to-Many Role relationship
export interface UserRole {
  user_id: number;
  role_id: number;
  roles: Role;
}

export interface Role {
  role_id: number;
  role_name: string;
}
