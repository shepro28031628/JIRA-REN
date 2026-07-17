import { defineEventHandler, getRouterParam } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia es requerido' });
  }

  const logs = await db
    .selectFrom('time_logs')
    .selectAll()
    .where('issue_id', '=', issueId)
    .orderBy('logged_at', 'desc')
    .execute();

  return logs;
});
