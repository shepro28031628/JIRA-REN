import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  if (method === 'GET') {
    return await db.selectFrom('automation_rules')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('created_at', 'desc')
      .execute();
  }

  const body = await readBody(event);

  if (method === 'POST') {
    if (!body?.name || !body?.trigger_event) {
      throw createError({ statusCode: 400, statusMessage: 'Nombre y evento trigger requeridos' });
    }

    return await db.insertInto('automation_rules')
      .values({
        project_id: projectId,
        name: body.name,
        trigger_event: body.trigger_event,
        condition_config: JSON.stringify(body.condition_config || {}),
        action_config: JSON.stringify(body.action_config || {}),
        is_active: body.is_active !== undefined ? body.is_active : true
      })
      .returningAll()
      .executeTakeFirst();
  }

  if (method === 'DELETE') {
    if (!body?.ruleId) {
      throw createError({ statusCode: 400, statusMessage: 'ruleId es requerido' });
    }

    await db.deleteFrom('automation_rules').where('id', '=', body.ruleId).execute();
    return { success: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
