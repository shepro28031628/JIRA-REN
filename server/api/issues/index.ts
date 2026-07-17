import { defineEventHandler, readBody, getQuery } from 'h3';
import { IssueService } from '../../services/issue.service';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    const query = getQuery(event);
    const projectId = query.projectId as string;
    
    if (!projectId) {
      throw createError({ statusCode: 400, statusMessage: 'projectId query param es requerido' });
    }
    
    if (projectId === 'default') {
      return [];
    }
    
    return await IssueService.getIssuesByProject(projectId);
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body.project_id || !body.title) {
      throw createError({ statusCode: 400, statusMessage: 'project_id y title son requeridos' });
    }
    
    return await IssueService.createIssue(body);
  }
});
