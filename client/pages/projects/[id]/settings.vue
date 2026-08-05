<template>
  <div class="settings-layout">
    <header class="settings-header">
      <div class="project-info">
        <NuxtLink to="/projects" class="back-link">
          <ArrowLeft class="w-5 h-5" stroke-width="1.5" />
        </NuxtLink>
        <div class="header-text" v-if="!loading">
          <h2>Ajustes del Proyecto</h2>
          <span class="project-key">{{ project?.key }}</span>
        </div>
        <div v-else class="header-skeleton"></div>
      </div>
      
      <!-- Navegación del Proyecto (Opcional, puede estar oculta en settings) -->
      <nav class="project-nav" v-if="!loading">
        <NuxtLink :to="`/board/${projectId}`" class="nav-item">Tablero</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/settings`" class="nav-item active">Ajustes</NuxtLink>
      </nav>
    </header>

    <div class="split-pane-layout" v-if="!loading">
      <!-- Navegación lateral de Ajustes -->
      <aside class="settings-sidebar bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-4">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Configuración</h3>
        <nav class="flex flex-col gap-1">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/60 hover:text-purple-600 transition-all duration-200 text-sm font-medium"
            :class="{ 'bg-white/80 text-purple-700 shadow-sm font-semibold border border-white/60': activeTab === tab.id }"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.name }}
          </button>
        </nav>
      </aside>

      <!-- Contenido Principal -->
      <main class="settings-content">
        <div v-if="activeTab === 'general'" class="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
          <h2 class="text-xl font-bold text-slate-800 mb-4">Información General</h2>
          <!-- Detalles básicos del proyecto -->
          <p class="text-slate-500">Opciones generales (WIP)</p>
        </div>

        <div v-if="activeTab === 'features'" class="transition-all duration-300">
          <FeatureGrid />
        </div>
        
        <!-- Motor de Automatizaciones Sin Código -->
        <div v-if="activeTab === 'automations'" class="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-xl font-bold text-slate-800">Motor de Automatizaciones Sin Código (If-This-Then-That)</h2>
              <p class="text-xs text-slate-500">Crea reglas automatizadas basadas en disparadores, condiciones y acciones compuestas.</p>
            </div>
          </div>

          <!-- Formulario de Creación de Regla -->
          <div class="bg-white/60 p-4 rounded-xl border border-purple-100 mb-6 flex flex-col gap-3 shadow-2xs">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Crear Nueva Regla</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">Nombre de la Regla</label>
                <input v-model="newRuleName" placeholder="Ej: Autocompletar Historia al terminar Subtareas" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-400" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">Disparador (Trigger)</label>
                <select v-model="newRuleTrigger" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-400">
                  <option value="SUBTASK_TOGGLED">SI una Subtarea cambia a Done</option>
                  <option value="STATUS_CHANGED">SI el Estado de la tarea cambia</option>
                  <option value="ISSUE_CREATED">SI una Incidencia es creada</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">Acción (Action)</label>
                <select v-model="newRuleAction" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-400">
                  <option value="MOVE_PARENT_TO_REVIEW">Mover Historia Padre a 'En Revisión' / 'Listo'</option>
                  <option value="ASSIGN_TO_REPORTER">Reasignar automáticamente al Reportador</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end">
              <button @click="createAutomationRule" class="btn-primary-glow text-xs py-1.5 px-4 font-bold" :disabled="!newRuleName.trim()">
                + Crear Regla de Automatización
              </button>
            </div>
          </div>

          <!-- Lista de Reglas Configuradas -->
          <div class="flex flex-col gap-2">
            <div v-for="rule in automationRules" :key="rule.id" class="p-4 rounded-xl bg-white/70 border border-slate-200/70 flex items-center justify-between shadow-2xs">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <Zap class="w-4 h-4 text-amber-500" />
                  <span class="text-sm font-bold text-slate-800">{{ rule.name }}</span>
                  <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">Activa</span>
                </div>
                <p class="text-xs text-slate-500 font-mono">Disparador: {{ rule.trigger_event }}</p>
              </div>
              <button @click="deleteAutomationRule(rule.id)" class="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
            <div v-if="automationRules.length === 0" class="text-center py-8 text-xs text-slate-400 italic">
              No hay reglas de automatización personalizadas creadas.
            </div>
          </div>
        </div>

        <!-- Campos Personalizados -->
        <div v-if="activeTab === 'custom-fields'" class="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-xl font-bold text-slate-800">Campos Personalizados por Proyecto</h2>
              <p class="text-xs text-slate-500">Crea campos personalizados para extender los datos de tus incidencias.</p>
            </div>
          </div>

          <!-- Formulario de creación de campo -->
          <div class="bg-white/60 p-4 rounded-xl border border-purple-100 mb-6 flex flex-wrap gap-3 items-end shadow-2xs">
            <div class="flex-1 min-w-[200px]">
              <label class="text-xs font-bold text-slate-700 block mb-1">Nombre del Campo</label>
              <input v-model="newFieldName" placeholder="Ej: Ambientes de Pruebas, Fecha Límite" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-400" />
            </div>
            <div class="w-44">
              <label class="text-xs font-bold text-slate-700 block mb-1">Tipo de Campo</label>
              <select v-model="newFieldType" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-400">
                <option value="TEXT">Texto Corto</option>
                <option value="NUMBER">Número</option>
                <option value="DATE">Fecha</option>
                <option value="SELECT">Lista Desplegable (Select)</option>
              </select>
            </div>
            <button @click="createCustomField" class="btn-primary-glow text-xs py-2 px-4" :disabled="!newFieldName.trim()">
              + Crear Campo
            </button>
          </div>

          <!-- Lista de Campos Existentes -->
          <div class="flex flex-col gap-2">
            <div v-for="cf in customFields" :key="cf.id" class="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-slate-200/70 hover:border-purple-200 transition-all shadow-2xs">
              <div class="flex items-center gap-3">
                <FileText class="w-4 h-4 text-purple-600" />
                <div>
                  <span class="text-sm font-bold text-slate-800">{{ cf.name }}</span>
                  <span class="text-xs text-slate-400 font-medium block">Tipo: {{ cf.field_type }}</span>
                </div>
              </div>
              <button @click="deleteCustomField(cf.id)" class="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
            <div v-if="customFields.length === 0" class="text-center py-8 text-xs text-slate-400 italic">
              No se han creado campos personalizados para este proyecto.
            </div>
          </div>
        </div>

        <!-- Esquema de Permisos (RBAC Granular) -->
        <div v-if="activeTab === 'permissions'" class="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
          <h2 class="text-xl font-bold text-slate-800 mb-2">Matriz de Permisos Granular (Permission Scheme)</h2>
          <p class="text-xs text-slate-500 mb-6">Define qué acciones puede ejecutar cada rol dentro de este proyecto.</p>

          <div class="space-y-6" v-if="permissionsData">
            <div v-for="role in ['ADMIN', 'MEMBER', 'VIEWER']" :key="role" class="bg-white/60 p-4 rounded-xl border border-purple-100/70 shadow-2xs">
              <div class="flex items-center justify-between mb-3 border-b border-purple-100 pb-2">
                <span class="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md">Rol {{ role }}</span>
                <span class="text-xs text-slate-400 font-medium">{{ (permissionsData.rolePermissions[role] || []).length }} permisos asignados</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label v-for="perm in permissionsData.allPermissions" :key="perm.key" class="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/80 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    :checked="(permissionsData.rolePermissions[role] || []).includes(perm.key)" 
                    @change="togglePermission(role, perm.key)" 
                    class="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span class="text-xs font-bold text-slate-700 block">{{ perm.label }}</span>
                    <span class="text-[11px] text-slate-400 leading-snug block">{{ perm.description }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Esquema de Notificaciones (Notification Scheme) -->
        <div v-if="activeTab === 'notifications'" class="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
          <h2 class="text-xl font-bold text-slate-800 mb-2">Esquema de Notificaciones (Notification Scheme)</h2>
          <p class="text-xs text-slate-500 mb-6">Configura los destinatarios automáticos de alertas según eventos de incidencias.</p>

          <div class="space-y-4" v-if="notificationsData">
            <div v-for="evt in notificationsData.schemes" :key="evt.event_key" class="bg-white/60 p-4 rounded-xl border border-purple-100/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
              <div>
                <span class="text-sm font-bold text-slate-800 block">{{ evt.name }}</span>
                <span class="text-xs text-slate-400 font-mono">Evento: {{ evt.event_key }}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <label v-for="rec in notificationsData.availableRecipients" :key="rec.key" class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-purple-200 text-xs cursor-pointer font-medium text-slate-700">
                  <input 
                    type="checkbox" 
                    :checked="evt.recipients.includes(rec.key)" 
                    @change="toggleNotificationRecipient(evt.event_key, rec.key)" 
                    class="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  {{ rec.label }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'releases'" class="transition-all duration-300">
          <ReleasesConfig />
        </div>

        <div v-if="activeTab === 'import'" class="transition-all duration-300">
          <DataImporter />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from '#app';
import { useToast } from '../../../composables/useToast';
import { ArrowLeft, Settings, ShieldAlert, Users, Database, GitMerge, FileText, Package, Lock, Bell, Trash2, Zap } from 'lucide-vue-next';
import FeatureGrid from '../../../modules/settings/components/FeatureGrid.vue';
import DataImporter from '../../../modules/settings/components/DataImporter.vue';
import ReleasesConfig from '../../../modules/settings/components/ReleasesConfig.vue';
import { useAuthStore } from '../../../stores/auth.store';

definePageMeta({
  layout: 'project'
});

const route = useRoute();
const projectId = route.params.id as string;
const authStore = useAuthStore();
const toast = useToast();

const project = ref<any>(null);
const loading = ref(true);
const activeTab = ref('general');

const tabs = ref([
  { id: 'general', name: 'General', icon: Settings },
  { id: 'automations', name: 'Automatizaciones Sin Código', icon: Zap },
  { id: 'permissions', name: 'Esquema de Permisos', icon: Lock },
  { id: 'notifications', name: 'Esquema de Notificaciones', icon: Bell },
  { id: 'custom-fields', name: 'Campos Personalizados', icon: FileText },
  { id: 'releases', name: 'Versiones (Releases)', icon: Package },
  { id: 'import', name: 'Importar Datos', icon: Database }
]);

// --- Motor de Automatizaciones Sin Código ---
const automationRules = ref<any[]>([]);
const newRuleName = ref('');
const newRuleTrigger = ref('SUBTASK_TOGGLED');
const newRuleAction = ref('MOVE_PARENT_TO_REVIEW');

const fetchAutomationRules = async () => {
  try {
    automationRules.value = await $fetch(`/api/projects/${projectId}/automations`);
  } catch (e) { console.error(e); }
};

const createAutomationRule = async () => {
  if (!newRuleName.value.trim()) return;
  try {
    const created = await $fetch(`/api/projects/${projectId}/automations`, {
      method: 'POST',
      body: {
        name: newRuleName.value.trim(),
        trigger_event: newRuleTrigger.value,
        action_config: { action_type: newRuleAction.value }
      }
    });
    automationRules.value.unshift(created);
    newRuleName.value = '';
    toast.success('Regla de automatización creada');
  } catch (e) { toast.error('Error al crear regla'); }
};

const deleteAutomationRule = async (id: string) => {
  try {
    await $fetch(`/api/projects/${projectId}/automations`, {
      method: 'DELETE',
      body: { ruleId: id }
    });
    automationRules.value = automationRules.value.filter(r => r.id !== id);
    toast.success('Regla eliminada');
  } catch (e) { toast.error('Error al eliminar'); }
};

// --- Campos Personalizados ---
const customFields = ref<any[]>([]);
const newFieldName = ref('');
const newFieldType = ref('TEXT');

const fetchCustomFields = async () => {
  try {
    customFields.value = await $fetch(`/api/projects/${projectId}/custom-fields`);
  } catch (e) { console.error(e); }
};

const createCustomField = async () => {
  if (!newFieldName.value.trim()) return;
  try {
    const created = await $fetch(`/api/projects/${projectId}/custom-fields`, {
      method: 'POST',
      body: { name: newFieldName.value.trim(), field_type: newFieldType.value }
    });
    customFields.value.push(created);
    newFieldName.value = '';
    toast.success('Campo personalizado creado');
  } catch (e) { toast.error('Error al crear campo'); }
};

const deleteCustomField = async (id: string) => {
  try {
    await $fetch(`/api/projects/${projectId}/custom-fields`, {
      method: 'DELETE',
      body: { customFieldId: id }
    });
    customFields.value = customFields.value.filter(c => c.id !== id);
    toast.success('Campo eliminado');
  } catch (e) { toast.error('Error al eliminar'); }
};

// --- Esquema de Permisos ---
const permissionsData = ref<any>(null);

const fetchPermissions = async () => {
  try {
    permissionsData.value = await $fetch(`/api/projects/${projectId}/permissions`);
  } catch (e) { console.error(e); }
};

const togglePermission = async (role: string, permKey: string) => {
  const currentPerms: string[] = permissionsData.value.rolePermissions[role] || [];
  let updatedPerms: string[];
  if (currentPerms.includes(permKey)) {
    updatedPerms = currentPerms.filter(p => p !== permKey);
  } else {
    updatedPerms = [...currentPerms, permKey];
  }
  permissionsData.value.rolePermissions[role] = updatedPerms;

  try {
    await $fetch(`/api/projects/${projectId}/permissions`, {
      method: 'PUT',
      body: { role, permissions: updatedPerms }
    });
    toast.success('Permisos actualizados');
  } catch (e) { toast.error('Error actualizando permisos'); }
};

// --- Esquema de Notificaciones ---
const notificationsData = ref<any>(null);

const fetchNotifications = async () => {
  try {
    notificationsData.value = await $fetch(`/api/projects/${projectId}/notification-schemes`);
  } catch (e) { console.error(e); }
};

const toggleNotificationRecipient = async (eventKey: string, recipientKey: string) => {
  const scheme = notificationsData.value.schemes.find((s: any) => s.event_key === eventKey);
  if (!scheme) return;

  let updated: string[];
  if (scheme.recipients.includes(recipientKey)) {
    updated = scheme.recipients.filter((r: string) => r !== recipientKey);
  } else {
    updated = [...scheme.recipients, recipientKey];
  }
  scheme.recipients = updated;

  try {
    await $fetch(`/api/projects/${projectId}/notification-schemes`, {
      method: 'PUT',
      body: { event_key: eventKey, recipients: updated }
    });
    toast.success('Esquema de notificaciones guardado');
  } catch (e) { toast.error('Error al guardar esquema'); }
};

const loadData = async () => {
  try {
    project.value = await $fetch(`/api/projects/${projectId}`);
    await Promise.all([
      fetchAutomationRules(),
      fetchCustomFields(),
      fetchPermissions(),
      fetchNotifications()
    ]);
    
    if (authStore.user?.is_master_admin) {
      tabs.value.push({ id: 'features', name: 'Módulos (Master)', icon: ShieldAlert });
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.settings-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: #1e293b;
  overflow: hidden;
}

.settings-header {
  padding: 16px 24px;
  margin: 16px 24px 0 24px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.05);
  z-index: 10;
}

.project-info { display: flex; align-items: center; gap: 16px; }
.back-link { color: #64748b; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.back-link:hover { color: #9333ea; background: rgba(255, 255, 255, 0.5); }
.header-text { display: flex; align-items: center; gap: 12px; }
.header-text h2 { font-size: 18px; font-weight: 700; color: #1e293b; letter-spacing: -0.01em; }
.project-key { background: rgba(147, 51, 234, 0.1); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; color: #7e22ce; }

.project-nav { display: flex; gap: 4px; padding: 4px; }
.nav-item { padding: 6px 12px; border-radius: 6px; color: #64748b; font-size: 13px; font-weight: 500; text-decoration: none; transition: 0.2s; }
.nav-item:hover { color: #1e293b; background: rgba(255,255,255,0.4); }
.nav-item.active { color: #1e293b; font-weight: 600; border-bottom: 2px solid #9333ea; border-radius: 0; }

.split-pane-layout {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  overflow: hidden;
}

.settings-sidebar {
  width: 250px;
  flex-shrink: 0;
  overflow-y: auto;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
}
</style>
