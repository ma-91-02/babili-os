import { prisma } from '@babili/database';
import bcrypt from 'bcryptjs';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: string;
  restaurantId?: string;
  language?: string;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  restaurantId: string | null;
  language: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createUser(data: CreateUserData): Promise<UserRecord> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role || 'customer',
      restaurantId: data.restaurantId || null,
      language: data.language || 'en',
    },
  });

  return user;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(id: string, data: Partial<Pick<UserRecord, 'emailVerified' | 'name' | 'language' | 'role' | 'restaurantId'>>): Promise<UserRecord | null> {
  return prisma.user.update({ where: { id }, data });
}

export async function updatePassword(id: string, newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
}
