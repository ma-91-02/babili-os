import { prisma } from '@babili/database';

export async function createVerificationToken(userId: string): Promise<string> {
  const { v4: uuidv4 } = await import('uuid');
  const token = uuidv4();

  await prisma.emailVerificationToken.create({
    data: { token, userId },
  });

  return token;
}

export async function findVerificationToken(token: string) {
  return prisma.emailVerificationToken.findUnique({ where: { token } });
}

export async function deleteVerificationToken(token: string): Promise<void> {
  await prisma.emailVerificationToken.deleteMany({ where: { token } });
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const { v4: uuidv4 } = await import('uuid');
  const token = uuidv4();

  await prisma.passwordResetToken.create({
    data: { token, userId },
  });

  return token;
}

export async function findPasswordResetToken(token: string) {
  return prisma.passwordResetToken.findUnique({ where: { token } });
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { token } });
}

export async function deleteExpiredTokens(): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  await prisma.emailVerificationToken.deleteMany({
    where: { createdAt: { lt: oneHourAgo } },
  });

  await prisma.passwordResetToken.deleteMany({
    where: { createdAt: { lt: oneHourAgo } },
  });
}
