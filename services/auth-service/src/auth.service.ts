import bcrypt from 'bcryptjs';
import * as userRepo from './repositories/user.repository';
import * as sessionRepo from './repositories/session.repository';
import * as tokenRepo from './repositories/token.repository';

export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
  status: number;
}

export async function register(input: {
  email: string;
  password: string;
  name: string;
  role?: string;
  restaurantId?: string;
  language?: string;
}): Promise<AuthResult> {
  try {
    const user = await userRepo.createUser(input);

    const verificationToken = await tokenRepo.createVerificationToken(user.id);

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
        language: user.language,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        verificationToken,
      },
      status: 201,
    };
  } catch (error) {
    const message = (error as Error).message;
    return {
      success: false,
      error: message,
      status: message === 'Email already registered' ? 409 : 500,
    };
  }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Invalid email or password', status: 401 };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Invalid email or password', status: 401 };
  }

  const session = await sessionRepo.createSession(
    user.id,
    user.email,
    user.role,
    user.restaurantId,
  );

  return {
    success: true,
    data: {
      token: session.token,
      userId: session.userId,
      email: session.email,
      role: session.role,
      restaurantId: session.restaurantId,
      createdAt: session.createdAt,
    },
    status: 200,
  };
}

export async function logout(token: string): Promise<void> {
  await sessionRepo.deleteSession(token);
}

export async function getSession(token: string) {
  return sessionRepo.findSessionByToken(token);
}

export async function getProfile(userId: string) {
  const user = await userRepo.findUserById(userId);
  if (!user) return null;

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function verifyEmail(token: string): Promise<boolean> {
  const vt = await tokenRepo.findVerificationToken(token);
  if (!vt) return false;

  await userRepo.updateUser(vt.userId, { emailVerified: true });
  await tokenRepo.deleteVerificationToken(token);
  return true;
}

export async function forgotPassword(email: string): Promise<string | null> {
  const user = await userRepo.findUserByEmail(email);
  if (!user) return null;

  return tokenRepo.createPasswordResetToken(user.id);
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const rt = await tokenRepo.findPasswordResetToken(token);
  if (!rt) return false;

  await userRepo.updatePassword(rt.userId, newPassword);
  await tokenRepo.deletePasswordResetToken(token);
  return true;
}
