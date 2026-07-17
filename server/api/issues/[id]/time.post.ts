import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia es requerido' });
  }

  if (!body.duration_minutes || body.duration_minutes <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'duration_minutes es requerido y debe ser mayor que 0' });
  }

  // To keep things simple, we assume the user_id from context or a default if auth isn't fully set
  // In a real app, you'd get this from the session
  const defaultUser = await db.selectFrom('users').select('id').limit(1).executeTakeFirst();
  
  if (!defaultUser) {
     throw createError({ statusCode: 500, statusMessage: 'No hay usuarios en la base de datos para asignar el registro de tiempo' });
  }

  const result = await db.insertInto('time_logs')
    .values({
      issue_id: issueId,
      user_id: body.user_id || defaultUser.id,
      duration_minutes: body.duration_minutes,
      description: body.description || null
    })
    .returningAll()
    .executeTakeFirst();

  return result;
});
