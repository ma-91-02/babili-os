import { prisma } from '@babili/database';

export interface SessionRecord {
  id: string;
  token: string;
  userId: string;
  email: string;
  role: string;
  restaurantId: string | null;
  createdAt: Date;
}

export async function createSession(userId: string, email: string, role: string, restaurantId: string | null): Promise<SessionRecord> {
  const { v4: uuidv4 } = await import('uuid');
  const token = uuidv4();

  return prisma.session.create({
    data: { token, userId, email, role, restaurantId },
  });
}

export async function findSessionByToken(token: string): Promise<SessionRecord | null> {
  return prisma.session.findUnique({ where: { token } });
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
