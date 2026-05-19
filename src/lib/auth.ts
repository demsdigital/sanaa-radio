import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(
  payload: { id: number; email: string; role: string; requires2FA?: boolean; totpEnabled?: boolean },
  expiresIn: string = "7d"
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(
  token: string
): { id: number; email: string; role: string; requires2FA?: boolean; totpEnabled?: boolean } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: number; email: string; role: string; requires2FA?: boolean; totpEnabled?: boolean;
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/token=([^;]+)/);
  return match ? match[1] : null;
}
