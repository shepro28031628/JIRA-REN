import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  if (method === 'GET') {
    return await db.selectFrom('custom_fields')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('created_at', 'asc')
      .execute();
  }

  const body = await readBody(event);

  if (method === 'POST') {
    if (!body?.name || !body?.field_type) {
      throw createError({ statusCode: 400, statusMessage: 'Nombre y tipo de campo son requeridos' });
    }

    return await db.insertInto('custom_fields')
      .values({
        project_id: projectId,
        name: body.name,
        field_type: body.field_type,
        options: body.options ? JSON.stringify(body.options) : null
      })
      .returningAll()
      .executeTakeFirst();
  }

  if (method === 'DELETE') {
    if (!body?.customFieldId) {
      throw createError({ statusCode: 400, statusMessage: 'customFieldId es requerido' });
    }
    await db.deleteFrom('custom_fields').where('id', '=', body.customFieldId).execute();
    return { success: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
