import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');
  const method = event.node.req.method;

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia es requerido' });
  }

  if (method === 'GET') {
    const comments = await db
      .selectFrom('issue_comments')
      .innerJoin('users', 'users.id', 'issue_comments.user_id')
      .select([
        'issue_comments.id',
        'issue_comments.content',
        'issue_comments.created_at',
        'users.id as user_id',
        'users.name as user_name',
        'users.avatar_url as user_avatar'
      ])
      .where('issue_id', '=', issueId)
      .orderBy('created_at', 'asc')
      .execute();
      
    return comments;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body.content) {
      throw createError({ statusCode: 400, statusMessage: 'Content es requerido' });
    }

    // Default user for demo
    const defaultUser = await db.selectFrom('users').select('id').limit(1).executeTakeFirst();
    if (!defaultUser) throw createError({ statusCode: 500, statusMessage: 'No hay usuarios' });
    
    const senderId = body.user_id || defaultUser.id;

    const newComment = await db.insertInto('issue_comments')
      .values({
        issue_id: issueId,
        user_id: senderId,
        content: body.content
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Notificar al assignee (y a todos si hay menciones, pero simplificamos al assignee por ahora)
    const issue = await db.selectFrom('issues').select('assignee_id').where('id', '=', issueId).executeTakeFirst();
    
    if (issue && issue.assignee_id && issue.assignee_id !== senderId) {
      await db.insertInto('notifications')
        .values({
          user_id: issue.assignee_id,
          sender_id: senderId,
          issue_id: issueId,
          type: 'COMMENT'
        })
        .execute();
    }

    // Retornamos el comentario con info del usuario para el frontend
    const user = await db.selectFrom('users').select(['name', 'avatar_url']).where('id', '=', senderId).executeTakeFirst();
    
    return {
      id: newComment.id,
      content: newComment.content,
      created_at: newComment.created_at,
      user_id: senderId,
      user_name: user?.name,
      user_avatar: user?.avatar_url
    };
  }
});
