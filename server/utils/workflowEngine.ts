import { db } from '../database/client';
import { createError } from 'h3';

export class WorkflowEngine {
  /**
   * Valida y ejecuta una transición de estado de un ticket.
   * @param issueId ID de la incidencia
   * @param fromColumnId Columna origen
   * @param toColumnId Columna destino
   * @param currentUserId ID del usuario que intenta la transición
   */
  static async executeTransition(issueId: string, fromColumnId: string, toColumnId: string, currentUserId: string) {
    if (fromColumnId === toColumnId) return;

    const issue = await db.selectFrom('issues').selectAll().where('id', '=', issueId).executeTakeFirst();
    if (!issue) throw createError({ statusCode: 404, statusMessage: 'Issue no encontrado' });

    // 1. Obtener el workflow del proyecto (desde issue_types -> workflows, o projects -> default_workflow)
    let workflowId = null;
    
    // Primero intentamos por tipo de issue
    const issueType = await db.selectFrom('issue_types')
        .select('workflow_id')
        .where('id', '=', issue.issue_type_id)
        .executeTakeFirst();
        
    if (issueType?.workflow_id) {
        workflowId = issueType.workflow_id;
    } else {
        // Fallback al default_workflow_id del proyecto
        const project = await db.selectFrom('projects')
            .select('default_workflow_id')
            .where('id', '=', issue.project_id)
            .executeTakeFirst();
        workflowId = project?.default_workflow_id;
    }

    if (!workflowId) {
        // Si no hay workflow, la transición es libre
        return;
    }

    // 2. Buscar si existe la transición permitida
    const transition = await db.selectFrom('workflow_transitions')
      .selectAll()
      .where('workflow_id', '=', workflowId)
      .where('from_column_id', '=', fromColumnId)
      .where('to_column_id', '=', toColumnId)
      .executeTakeFirst();

    if (!transition) {
      throw createError({ statusCode: 403, statusMessage: 'Transición no permitida por el Workflow del proyecto.' });
    }

    // 3. Obtener reglas de esta transición
    const rules = await db.selectFrom('workflow_rules')
      .selectAll()
      .where('transition_id', '=', transition.id)
      .execute();

    const conditions = rules.filter(r => r.rule_type === 'CONDITION');
    const postActions = rules.filter(r => r.rule_type === 'POST_ACTION');

    // 4. Evaluar Condiciones
    for (const condition of conditions) {
      switch (condition.action_key) {
        case 'ONLY_ASSIGNEE':
          if (issue.assignee_id !== currentUserId) {
            throw createError({ statusCode: 403, statusMessage: 'Workflow restrictivo: Solo el assignee puede realizar esta transición.' });
          }
          break;
        case 'REQUIRE_ASSIGNEE':
          if (!issue.assignee_id) {
             throw createError({ statusCode: 403, statusMessage: 'Workflow restrictivo: El ticket debe estar asignado antes de moverlo.' });
          }
          break;
        case 'ROLE_ADMIN':
           // Validar si el usuario actual es ADMIN en el proyecto
           const member = await db.selectFrom('project_members')
             .select('role')
             .where('project_id', '=', issue.project_id)
             .where('user_id', '=', currentUserId)
             .executeTakeFirst();
           if (member?.role !== 'ADMIN') {
              throw createError({ statusCode: 403, statusMessage: 'Workflow restrictivo: Solo administradores pueden realizar esta acción.' });
           }
           break;
        default:
          break;
      }
    }

    // 5. Retornar las Post Acciones para que el IssueService las aplique al final de la transacción
    return postActions;
  }

  /**
   * Ejecuta automatizaciones globales al cambiar estado o propiedades de un ticket.
   */
  static async runAutomations(eventKey: string, issue: any, extraData?: any) {
    if (eventKey === 'MOVE_TO_DONE') {
      // Automatización: Al mover a Done, registrar tiempo restante a 0
      await db.updateTable('issues')
        .set({ estimated_minutes: 0, updated_at: new Date() })
        .where('id', '=', issue.id)
        .execute();
    } else if (eventKey === 'REASSIGN') {
      // Automatización: Al reasignar, enviar notificación al usuario
      if (extraData?.newAssigneeId) {
        await db.insertInto('notifications').values({
          user_id: extraData.newAssigneeId,
          sender_id: extraData.currentUserId || null,
          issue_id: issue.id,
          type: 'ASSIGNMENT'
        }).execute();
      }
    }
  }
}
