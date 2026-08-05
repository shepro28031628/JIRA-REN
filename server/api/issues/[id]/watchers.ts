import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia requerido' });
  }

  if (method === 'GET') {
    const watchers = await db.selectFrom('issue_watchers')
      .innerJoin('users', 'issue_watchers.user_id', 'users.id')
      .selectAll('users')
      .where('issue_watchers.issue_id', '=', issueId)
      .execute();

    return {
      watchers,
      count: watchers.length
    };
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body?.userId) {
      throw createError({ statusCode: 400, statusMessage: 'userId es requerido' });
    }

    const existing = await db.selectFrom('issue_watchers')
      .selectAll()
      .where('issue_id', '=', issueId)
      .where('user_id', '=', body.userId)
      .executeTakeFirst();

    if (existing) {
      await db.deleteFrom('issue_watchers')
        .where('issue_id', '=', issueId)
        .where('user_id', '=', body.userId)
        .execute();
      return { watching: false };
    } else {
      await db.insertInto('issue_watchers')
        .values({ issue_id: issueId, user_id: body.userId })
        .execute();
      return { watching: true };
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
