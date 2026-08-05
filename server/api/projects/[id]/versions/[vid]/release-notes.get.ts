import { defineEventHandler, getRouterParam, createError } from 'h3';
import { db } from '../../../../../database/client';

export default defineEventHandler(async (event) => {
  const versionId = getRouterParam(event, 'vid');
  const projectId = getRouterParam(event, 'id');

  if (!versionId || !projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Se requiere ID de versión y proyecto' });
  }

  // 1. Obtener detalles de la versión
  const version = await db.selectFrom('project_versions')
    .selectAll()
    .where('id', '=', versionId)
    .where('project_id', '=', projectId)
    .executeTakeFirst();

  if (!version) {
    throw createError({ statusCode: 404, statusMessage: 'Versión no encontrada' });
  }

  // 2. Obtener todas las issues asociadas a esta versión, junto con su tipo
  const issues = await db.selectFrom('issues')
    .leftJoin('issue_types', 'issues.issue_type_id', 'issue_types.id')
    .select([
      'issues.key_number',
      'issues.title',
      'issue_types.name as type_name'
    ])
    .where('issues.version_id', '=', versionId)
    .execute();

  // 3. Generar Release Notes en formato Markdown
  let markdown = `# Release Notes - ${version.name}\n\n`;
  if (version.description) {
    markdown += `${version.description}\n\n`;
  }
  
  markdown += `**Fecha de Lanzamiento:** ${version.release_date ? new Date(version.release_date).toLocaleDateString() : 'Por definir'}\n\n`;
  markdown += `## Cambios Incluidos\n\n`;

  if (issues.length === 0) {
    markdown += `*No hay tickets asociados a esta versión.*\n`;
  } else {
    // Agrupar por tipo (Features, Bugs, etc.)
    const grouped: Record<string, typeof issues> = {};
    for (const issue of issues) {
      const type = issue.type_name || 'Otros';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(issue);
    }

    for (const [type, typeIssues] of Object.entries(grouped)) {
      markdown += `### ${type}\n`;
      for (const issue of typeIssues) {
        markdown += `- **PROY-${issue.key_number}**: ${issue.title}\n`;
      }
      markdown += `\n`;
    }
  }

  return {
    version,
    releaseNotesMarkdown: markdown
  };
});
