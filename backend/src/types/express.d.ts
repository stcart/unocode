import type { JwtPayload } from "../services/jwt.service";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
