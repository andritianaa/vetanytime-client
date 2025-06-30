import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string) {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword)
}

export function generateToken(clientId: string) {
  return sign({ clientId }, JWT_SECRET, { expiresIn: "30d" })
}

export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET) as { clientId: string }
  } catch {
    return null
  }
}
