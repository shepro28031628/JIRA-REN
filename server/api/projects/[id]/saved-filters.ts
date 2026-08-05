import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  if (method === 'GET') {
    return await db.selectFrom('saved_filters')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('created_at', 'desc')
      .execute();
  }

  const body = await readBody(event);

  if (method === 'POST') {
    if (!body?.name || !body?.jql_query) {
      throw createError({ statusCode: 400, statusMessage: 'Nombre y consulta JQL requeridos' });
    }

    return await db.insertInto('saved_filters')
      .values({
        project_id: projectId,
        name: body.name,
        jql_query: body.jql_query,
        is_shared: body.is_shared !== undefined ? body.is_shared : false,
        created_by: body.created_by || null
      })
      .returningAll()
      .executeTakeFirst();
  }

  if (method === 'DELETE') {
    if (!body?.filterId) {
      throw createError({ statusCode: 400, statusMessage: 'filterId es requerido' });
    }

    await db.deleteFrom('saved_filters').where('id', '=', body.filterId).execute();
    return { success: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
