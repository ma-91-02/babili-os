import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import type { User, Role, SupportedLanguage } from '@babili/shared';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
  restaurantId?: string;
  language?: SupportedLanguage;
}

export interface AuthSession {
  token: string;
  userId: string;
  email: string;
  role: Role;
  restaurantId?: string;
  createdAt: string;
}

const users: Map<string, User & { passwordHash: string }> = new Map();
const sessions: Map<string, AuthSession> = new Map();
const verificationTokens: Map<string, string> = new Map();
const resetTokens: Map<string, string> = new Map();

export async function createUser(input: CreateUserInput): Promise<User> {
  const existing = Array.from(users.values()).find((u) => u.email === input.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const id = uuidv4();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const now = new Date().toISOString();

  const user: User & { passwordHash: string } = {
    id,
    email: input.email,
    name: input.name,
    role: input.role || 'customer',
    restaurantId: input.restaurantId,
    language: input.language || 'en',
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    passwordHash,
  };

  users.set(id, user);

  const token = uuidv4();
  verificationTokens.set(token, id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
    language: user.language,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function loginUser(email: string, password: string): Promise<AuthSession> {
  const user = Array.from(users.values()).find((u) => u.email === email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = uuidv4();
  const session: AuthSession = {
    token,
    userId: user.id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
    createdAt: new Date().toISOString(),
  };

  sessions.set(token, session);
  return session;
}

export function logoutUser(token: string): void {
  sessions.delete(token);
}

export function getSession(token: string): AuthSession | undefined {
  return sessions.get(token);
}

export function getUserById(id: string): (User & { passwordHash: string }) | undefined {
  return users.get(id);
}

export function verifyEmail(token: string): boolean {
  const userId = verificationTokens.get(token);
  if (!userId) return false;

  const user = users.get(userId);
  if (!user) return false;

  user.emailVerified = true;
  verificationTokens.delete(token);
  return true;
}

export function createForgotPasswordToken(email: string): string | undefined {
  const user = Array.from(users.values()).find((u) => u.email === email);
  if (!user) return undefined;

  const token = uuidv4();
  resetTokens.set(token, user.id);
  return token;
}

export function resetPassword(token: string, newPassword: string): boolean {
  const userId = resetTokens.get(token);
  if (!userId) return false;

  const user = users.get(userId);
  if (!user) return false;

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  resetTokens.delete(token);
  return true;
}

export function getUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
  return Array.from(users.values()).find((u) => u.email === email);
}
