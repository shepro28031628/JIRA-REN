import { defineEventHandler, readBody, setCookie, createError } from 'h3';
import { AuthService } from '../../services/auth.service';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body.email || !body.password || !body.name) {
      throw createError({ statusCode: 400, statusMessage: 'Faltan campos requeridos' });
    }

    const { user, token } = await AuthService.register({
      email: body.email,
      password_raw: body.password,
      name: body.name,
      avatar_url: body.avatar_url
    });

    setCookie(event, 'auth_token', token, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return { user, token };
  } catch (error: any) {
    throw createError({ statusCode: 400, statusMessage: error.message });
  }
});
