import { db } from '../database/client';

export const ALL_PERMISSIONS = [
  { key: 'VIEW_PROJECT', label: 'Ver Proyecto e Incidencias', description: 'Permite acceder al proyecto y visualizar sus datos' },
  { key: 'CREATE_ISSUES', label: 'Crear Incidencias', description: 'Permite crear nuevos tickets, historias o tareas' },
  { key: 'TRANSITION_ISSUES', label: 'Mover / Transicionar Estados', description: 'Permite arrastrar incidencias entre columnas del tablero' },
  { key: 'EDIT_ALL_COMMENTS', label: 'Editar / Eliminar Comentarios Ajenos', description: 'Permite moderar comentarios de otros miembros' },
  { key: 'DELETE_ISSUES', label: 'Eliminar Incidencias', description: 'Permite borrar incidencias permanentemente' },
  { key: 'ADMINISTER_PROJECT', label: 'Administrar Proyecto', description: 'Acceso total a la configuración y gestión de miembros' }
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['VIEW_PROJECT', 'CREATE_ISSUES', 'TRANSITION_ISSUES', 'EDIT_ALL_COMMENTS', 'DELETE_ISSUES', 'ADMINISTER_PROJECT'],
  MEMBER: ['VIEW_PROJECT', 'CREATE_ISSUES', 'TRANSITION_ISSUES'],
  VIEWER: ['VIEW_PROJECT']
};

export class PermissionEngine {
  static async getProjectPermissions(projectId: string) {
    const existing = await db.selectFrom('permission_schemes')
      .selectAll()
      .where('project_id', '=', projectId)
      .execute();

    const roles = ['ADMIN', 'MEMBER', 'VIEWER'];
    const result: Record<string, string[]> = {};

    for (const r of roles) {
      const found = existing.find(e => e.role === r);
      result[r] = found ? (found.permissions || DEFAULT_ROLE_PERMISSIONS[r]) : DEFAULT_ROLE_PERMISSIONS[r];
    }

    return {
      allPermissions: ALL_PERMISSIONS,
      rolePermissions: result
    };
  }

  static async updateRolePermissions(projectId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER', permissions: string[]) {
    return await db.insertInto('permission_schemes')
      .values({
        project_id: projectId,
        role,
        permissions: JSON.stringify(permissions)
      })
      .onConflict((oc) => oc.column('project_id').column('role').doUpdateSet({
        permissions: JSON.stringify(permissions)
      }))
      .returningAll()
      .executeTakeFirst();
  }

  static async hasPermission(projectId: string, userId: string, permissionKey: string): Promise<boolean> {
    const member = await db.selectFrom('project_members')
      .select('role')
      .where('project_id', '=', projectId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    const role = member?.role || 'VIEWER';
    const currentPerms = await this.getProjectPermissions(projectId);
    const rolePerms = currentPerms.rolePermissions[role] || [];
    return rolePerms.includes(permissionKey);
  }
}
