import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jira-clone-key';

export class AuthService {
  static async register(data: { email: string; password_raw: string; name: string; avatar_url?: string }) {
    const existingUser = await db.selectFrom('users')
      .select('id')
      .where('email', '=', data.email)
      .executeTakeFirst();

    if (existingUser) {
      throw new Error('El correo ya está en uso');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password_raw, salt);

    const newUser = await db.insertInto('users')
      .values({
        email: data.email,
        password_hash,
        name: data.name,
        avatar_url: data.avatar_url || null,
      })
      .returning(['id', 'email', 'name', 'avatar_url', 'created_at'])
      .executeTakeFirstOrThrow();

    const token = this.generateToken(newUser.id, newUser.email);
    
    return { user: newUser, token };
  }

  static async login(email: string, password_raw: string) {
    const user = await db.selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(password_raw, user.password_hash);
    
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.email);

    // Excluimos el hash de la respuesta
    const { password_hash, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  private static generateToken(userId: string, email: string) {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    } catch (error) {
      return null;
    }
  }
}
