import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { db } from '../../../database/client';

export const DEFAULT_NOTIFICATION_EVENTS = [
  { event_key: 'ISSUE_CREATED', name: 'Al crear una incidencia', recipients: ['REPORTER', 'PROJECT_ADMINS'] },
  { event_key: 'ISSUE_ASSIGNED', name: 'Al reasignar incidencia', recipients: ['ASSIGNEE'] },
  { event_key: 'COMMENT_ADDED', name: 'Al añadir un comentario', recipients: ['ASSIGNEE', 'REPORTER'] },
  { event_key: 'STATUS_CHANGED', name: 'Al cambiar de estado', recipients: ['ASSIGNEE', 'REPORTER'] }
];

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  if (method === 'GET') {
    const existing = await db.selectFrom('notification_schemes')
      .selectAll()
      .where('project_id', '=', projectId)
      .execute();

    const result = DEFAULT_NOTIFICATION_EVENTS.map(def => {
      const found = existing.find(e => e.event_key === def.event_key);
      return {
        event_key: def.event_key,
        name: def.name,
        recipients: found ? (found.recipients || def.recipients) : def.recipients
      };
    });

    return {
      allEvents: DEFAULT_NOTIFICATION_EVENTS,
      availableRecipients: [
        { key: 'ASSIGNEE', label: 'Asignado (Assignee)' },
        { key: 'REPORTER', label: 'Reportador (Reporter)' },
        { key: 'PROJECT_ADMINS', label: 'Administradores del Proyecto' }
      ],
      schemes: result
    };
  }

  if (method === 'PUT' || method === 'POST') {
    const body = await readBody(event);
    if (!body?.event_key || !Array.isArray(body?.recipients)) {
      throw createError({ statusCode: 400, statusMessage: 'Parámetros inválidos (event_key, recipients)' });
    }

    return await db.insertInto('notification_schemes')
      .values({
        project_id: projectId,
        event_key: body.event_key,
        recipients: JSON.stringify(body.recipients)
      })
      .onConflict((oc) => oc.column('project_id').column('event_key').doUpdateSet({
        recipients: JSON.stringify(body.recipients)
      }))
      .returningAll()
      .executeTakeFirst();
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
