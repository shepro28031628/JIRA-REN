export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return; // Mejor manejarlo en cliente por la store/fetch rápido

  const projectId = to.params.id as string;
  if (!projectId || projectId === 'default') return;

  try {
    const project = await $fetch(`/api/projects/${projectId}`);
    const features = project?.enabled_features as Record<string, boolean> || {};

    const path = to.path.toLowerCase();

    if (path.includes('/backlog') && features.backlog === false) {
      return navigateTo(`/board/${projectId}`);
    }
    if (path.includes('/docs') && features.docs === false) {
      return navigateTo(`/board/${projectId}`);
    }
    if (path.includes('/team') && features.teams === false) {
      return navigateTo(`/board/${projectId}`);
    }
    if (path.includes('/reports') && features.reports === false) {
      return navigateTo(`/board/${projectId}`);
    }
    
    // Si intentara entrar al board y el kanban está desactivado (ejemplo raro)
    if (path.includes(`/board/${projectId}`) && features.kanban === false) {
      return navigateTo(`/projects/${projectId}/settings`);
    }

  } catch (error) {
    console.error('Error in features middleware:', error);
  }
});
