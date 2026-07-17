<template>
  <div class="integrations-container w-full h-full p-8 overflow-y-auto">
    <div class="mb-10 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Link2 class="w-8 h-8 text-purple-600" />
          Centro de Integraciones
        </h1>
        <p class="text-slate-500 mt-2 text-sm max-w-2xl">
          Conecta tus herramientas favoritas para sincronizar eventos, actualizar tareas automáticamente y mantener a tu equipo notificado en tiempo real.
        </p>
      </div>
    </div>

    <!-- Grid de Integraciones -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="(integration, index) in integrations" 
        :key="integration.id"
        class="integration-card group relative bg-white/50 backdrop-blur-xl border border-white/70 shadow-lg shadow-purple-100/30 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-200/40 hover:-translate-y-1"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="icon-wrapper p-3 rounded-2xl bg-gradient-to-br" :class="integration.colorClass">
            <component :is="integration.icon" class="w-7 h-7 text-white" stroke-width="2" />
          </div>
          
          <!-- Toggle Switch -->
          <button 
            @click="toggleIntegration(integration)"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            :class="integration.enabled ? 'bg-purple-600' : 'bg-slate-200'"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="integration.enabled ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <h3 class="text-lg font-bold text-slate-800 mb-2">{{ integration.name }}</h3>
        <p class="text-sm text-slate-500 line-clamp-2 mb-4">
          {{ integration.description }}
        </p>

        <!-- Sub-panel de Configuración (Desplegable animado) -->
        <div v-if="integration.enabled" v-motion-slide-top>
          <div class="mt-4 pt-4 border-t border-purple-100/50 space-y-3">
            
            <div v-if="integration.type === 'oauth'" class="space-y-2">
              <label class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Repositorios Sincronizados</label>
              <div class="flex items-center gap-2 p-2 bg-white/60 border border-purple-100 rounded-xl">
                <Github v-if="integration.id === 'github'" class="w-4 h-4 text-slate-400" />
                <Gitlab v-if="integration.id === 'gitlab'" class="w-4 h-4 text-slate-400" />
                <span class="text-sm text-slate-700">empresa/frontend-app</span>
                <button class="ml-auto text-xs font-semibold text-purple-600 hover:text-purple-800">Cambiar</button>
              </div>
            </div>

            <div v-if="integration.type === 'webhook'" class="space-y-2">
              <label class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Webhook URL</label>
              <div class="flex items-center gap-2">
                <input 
                  type="text" 
                  readonly 
                  :value="`https://api.jira-ren.com/webhooks/${integration.id}/xyz123`"
                  class="flex-1 bg-white/60 border border-purple-100 rounded-xl px-3 py-1.5 text-xs text-slate-500 outline-none" 
                />
                <button class="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                  <Copy class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="text-[11px] font-medium flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <Check class="w-3 h-3" /> Conectado
              </span>
              <button class="text-[12px] font-semibold text-slate-400 hover:text-slate-600">Ajustes avanzados</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  Link2, GitPullRequest, MessageSquare, Globe, Check, 
  Github, Gitlab, Copy, Slack
} from 'lucide-vue-next';

definePageMeta({
  layout: 'project'
});

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  colorClass: string;
  enabled: boolean;
  type: 'oauth' | 'webhook';
}

const integrations = ref<Integration[]>([
  {
    id: 'github',
    name: 'GitHub',
    description: 'Actualiza tareas automáticamente al hacer merge de un Pull Request o incluir el ID de la tarea en los commits.',
    icon: Github,
    colorClass: 'from-slate-700 to-slate-900',
    enabled: true,
    type: 'oauth'
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Sincronización bidireccional de Merge Requests y control de versiones con tu tablero.',
    icon: Gitlab,
    colorClass: 'from-orange-500 to-red-500',
    enabled: false,
    type: 'oauth'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Envía notificaciones de cambios de estado y comentarios directamente a canales de Slack.',
    icon: Slack,
    colorClass: 'from-purple-500 to-pink-500',
    enabled: false,
    type: 'webhook'
  },
  {
    id: 'discord',
    name: 'Discord Webhooks',
    description: 'Mantén a tu equipo informado sobre nuevos Sprints y tareas críticas.',
    icon: MessageSquare,
    colorClass: 'from-indigo-500 to-blue-600',
    enabled: false,
    type: 'webhook'
  },
  {
    id: 'custom-webhook',
    name: 'Webhooks Personalizados',
    description: 'Envía o recibe payloads JSON a servicios externos cuando ocurren eventos en JIRA-REN.',
    icon: Globe,
    colorClass: 'from-emerald-400 to-teal-500',
    enabled: false,
    type: 'webhook'
  }
]);

const toggleIntegration = (integration: Integration) => {
  integration.enabled = !integration.enabled;
};
</script>

<style scoped>
.integration-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3));
}
</style>
