import { db } from '../database/client';

export interface EmailNotificationPayload {
  toUserId: string;
  senderId?: string;
  issueId: string;
  eventType: 'ISSUE_ASSIGNED' | 'COMMENT_ADDED' | 'MENTION' | 'STATUS_CHANGED';
  details?: string;
}

export class EmailService {
  /**
   * Envía (o simula el despacho seguro en log/queue) un correo de notificación según el evento.
   */
  static async sendEmailNotification(payload: EmailNotificationPayload) {
    try {
      const [user, issue, sender] = await Promise.all([
        db.selectFrom('users').select(['email', 'name']).where('id', '=', payload.toUserId).executeTakeFirst(),
        db.selectFrom('issues').select(['key_number', 'title', 'project_id']).where('id', '=', payload.issueId).executeTakeFirst(),
        payload.senderId ? db.selectFrom('users').select(['name', 'email']).where('id', '=', payload.senderId).executeTakeFirst() : Promise.resolve(null)
      ]);

      if (!user || !issue) return;

      const project = await db.selectFrom('projects').select('key').where('id', '=', issue.project_id).executeTakeFirst();
      const issueKey = `${project?.key || 'JIRA'}-${issue.key_number}`;
      const senderName = sender?.name || 'Sistema JIRA-REN';

      let subject = `[${issueKey}] Notificación de Incidencia`;
      let bodyHtml = '';

      switch (payload.eventType) {
        case 'ISSUE_ASSIGNED':
          subject = `[${issueKey}] Se te ha asignado la incidencia: ${issue.title}`;
          bodyHtml = `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Hola ${user.name},</h2>
            <p><strong>${senderName}</strong> te ha asignado la incidencia <strong>${issueKey}: ${issue.title}</strong>.</p>
            <p>Por favor revisa el tablero para comenzar el trabajo.</p>
          </div>`;
          break;

        case 'COMMENT_ADDED':
          subject = `[${issueKey}] Nuevo comentario de ${senderName}`;
          bodyHtml = `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Hola ${user.name},</h2>
            <p><strong>${senderName}</strong> ha comentado en <strong>${issueKey}</strong>:</p>
            <blockquote style="border-left: 3px solid #9333ea; padding-left: 10px; color: #475569;">${payload.details || ''}</blockquote>
          </div>`;
          break;

        case 'MENTION':
          subject = `[${issueKey}] ${senderName} te ha mencionado`;
          bodyHtml = `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Hola ${user.name},</h2>
            <p><strong>${senderName}</strong> te ha mencionado en un comentario de la incidencia <strong>${issueKey}</strong>.</p>
          </div>`;
          break;

        case 'STATUS_CHANGED':
          subject = `[${issueKey}] Transición de estado a: ${payload.details}`;
          bodyHtml = `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Hola ${user.name},</h2>
            <p>La incidencia <strong>${issueKey}</strong> ha sido movida al estado: <strong>${payload.details}</strong>.</p>
          </div>`;
          break;
      }

      // Log para auditoría de correo despachado
      console.log(`📧 [EMAIL SERVICE] Despachado a ${user.email} | Asunto: "${subject}"`);
      return { success: true, to: user.email, subject };
    } catch (e) {
      console.error('Error enviando notificación por correo:', e);
      return { success: false, error: e };
    }
  }
}
