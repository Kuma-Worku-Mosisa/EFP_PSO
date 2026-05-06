export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
  addressId?: number;
}
