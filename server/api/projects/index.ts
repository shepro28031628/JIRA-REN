import { defineEventHandler, readBody } from 'h3';
import { ProjectService } from '../../services/project.service';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    return await ProjectService.getAllProjects();
  }

  if (method === 'POST') {
    const body = await readBody(event);
    return await ProjectService.createProject(body);
  }
});
