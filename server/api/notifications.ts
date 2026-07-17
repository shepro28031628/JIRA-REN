import { defineEventHandler, readBody } from 'h3';
import { db } from '../database/client';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // En una app real, el user_id vendría de la sesión (ej. event.context.user.id)
  // Como simplificación para la demo, obtenemos el primer usuario
  const defaultUser = await db.selectFrom('users').select('id').limit(1).executeTakeFirst();
  if (!defaultUser) throw createError({ statusCode: 500, statusMessage: 'No hay usuarios' });
  const currentUserId = defaultUser.id;

  if (method === 'GET') {
    const notifs = await db
      .selectFrom('notifications')
      .leftJoin('users', 'users.id', 'notifications.sender_id')
      .leftJoin('issues', 'issues.id', 'notifications.issue_id')
      .select([
        'notifications.id',
        'notifications.type',
        'notifications.read_at',
        'notifications.created_at',
        'users.name as sender_name',
        'users.avatar_url as sender_avatar',
        'issues.key_number as issue_key',
        'issues.title as issue_title'
      ])
      .where('notifications.user_id', '=', currentUserId)
      .orderBy('notifications.created_at', 'desc')
      .execute();
      
    return notifs;
  }

  if (method === 'PATCH') {
    const body = await readBody(event);
    if (body.action === 'mark_all_read') {
      await db.updateTable('notifications')
        .set({ read_at: new Date() })
        .where('user_id', '=', currentUserId)
        .where('read_at', 'is', null)
        .execute();
      return { success: true };
    }
    
    if (body.notification_id) {
      await db.updateTable('notifications')
        .set({ read_at: new Date() })
        .where('id', '=', body.notification_id)
        .where('user_id', '=', currentUserId)
        .execute();
      return { success: true };
    }
    
    throw createError({ statusCode: 400, statusMessage: 'Acción no válida' });
  }
});
