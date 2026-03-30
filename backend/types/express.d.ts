import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      userId?: string;
      email?: string;
      role?: string;
      full_name?: string;
    };
  }
}

export type AuthRequest = Request & {
  user?: {
    id: string;
    userId?: string;
    email?: string;
    role?: string;
    full_name?: string;
  };
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

