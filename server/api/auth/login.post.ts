import { defineEventHandler, readBody, setCookie, createError } from 'h3';
import { AuthService } from '../../services/auth.service';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body.email || !body.password) {
      throw createError({ statusCode: 400, statusMessage: 'Email y contraseña requeridos' });
    }

    const { user, token } = await AuthService.login(body.email, body.password);

    // Guardar token en cookie HTTP-only (o normal para Nuxt client-side)
    setCookie(event, 'auth_token', token, {
      httpOnly: false, // Permitimos que el cliente lo lea para la hidratación en este caso
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/'
    });

    return { user, token };
  } catch (error: any) {
    throw createError({ statusCode: 401, statusMessage: error.message });
  }
});
