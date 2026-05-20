// Augment Express Request to include authenticated user info.
//filepath: backend/src/types/express.d.ts
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id?: number | string;
      userId?: number | string;
      roles?: string[];
      [key: string]: unknown;
    };
  }
}
