import { db } from '../database/client';

export class AutomationEngine {
  /**
   * Dispara una evaluación de automatizaciones sin código (If-This-Then-That).
   */
  static async triggerEvent(eventKey: string, payload: { issueId: string; projectId: string; currentUserId?: string }) {
    // 1. Buscar reglas activas para este evento y proyecto
    const rules = await db.selectFrom('automation_rules')
      .selectAll()
      .where('project_id', '=', payload.projectId)
      .where('trigger_event', '=', eventKey)
      .where('is_active', '=', true)
      .execute();

    for (const rule of rules) {
      try {
        await this.evaluateRule(rule, payload);
      } catch (e) {
        console.error(`Error ejecutando regla de automatización ${rule.name}:`, e);
      }
    }

    // Regla global por defecto: Si se completa una subtarea, chequear si todas las subtareas del mismo padre están en Done
    if (eventKey === 'SUBTASK_TOGGLED') {
      await this.checkAllSubtasksDoneRule(payload.issueId, payload.projectId);
    }
  }

  private static async evaluateRule(rule: any, payload: any) {
    const actionConfig = typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : (rule.action_config || {});

    if (actionConfig.action_type === 'MOVE_PARENT_TO_REVIEW' && payload.issueId) {
      await this.checkAllSubtasksDoneRule(payload.issueId, payload.projectId);
    } else if (actionConfig.action_type === 'ASSIGN_TO_REPORTER' && payload.issueId) {
      const issue = await db.selectFrom('issues').select('reporter_id').where('id', '=', payload.issueId).executeTakeFirst();
      if (issue?.reporter_id) {
        await db.updateTable('issues').set({ assignee_id: issue.reporter_id, updated_at: new Date() }).where('id', '=', payload.issueId).execute();
      }
    }
  }

  /**
   * Regla de negocio: SI una Subtarea pasa a Done, Y todas las demás Subtareas del mismo padre están en Done, ENTONCES mover la Historia principal a "En Revisión" o "Listo".
   */
  private static async checkAllSubtasksDoneRule(issueId: string, projectId: string) {
    // Obtener la subtarea o incidencia actual
    const subtask = await db.selectFrom('issue_subtasks').selectAll().where('id', '=', issueId).executeTakeFirst();
    if (!subtask) return;

    const parentIssueId = subtask.issue_id;
    if (!parentIssueId) return;

    // Verificar si todas las subtareas del mismo padre están completadas
    const allSubtasks = await db.selectFrom('issue_subtasks').selectAll().where('issue_id', '=', parentIssueId).execute();
    const allDone = allSubtasks.length > 0 && allSubtasks.every(s => s.completed);

    if (allDone) {
      // Buscar columna "En Revisión" o "Listo"
      const targetColumn = await db.selectFrom('board_columns')
        .select('id')
        .where('project_id', '=', projectId)
        .where((eb) => eb.or([
          eb('name', 'ilike', '%revisi%'),
          eb('name', 'ilike', '%review%'),
          eb('name', 'ilike', '%listo%'),
          eb('name', 'ilike', '%done%')
        ]))
        .executeTakeFirst();

      if (targetColumn) {
        await db.updateTable('issues')
          .set({ column_id: targetColumn.id, updated_at: new Date() })
          .where('id', '=', parentIssueId)
          .execute();
      }
    }
  }
}
