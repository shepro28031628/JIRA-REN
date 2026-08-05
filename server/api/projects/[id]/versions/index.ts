import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { db } from '../../../../database/client';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const projectId = getRouterParam(event, 'id');

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID is required' });
  }

  if (method === 'GET') {
    return await db.selectFrom('project_versions')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('created_at', 'desc')
      .execute();
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body.name) {
       throw createError({ statusCode: 400, statusMessage: 'Name is required' });
    }

    return await db.insertInto('project_versions')
      .values({
        project_id: projectId,
        name: body.name,
        description: body.description || null,
        status: body.status || 'UNRELEASED',
        release_date: body.release_date ? new Date(body.release_date) : null
      })
      .returningAll()
      .executeTakeFirst();
  }
});
