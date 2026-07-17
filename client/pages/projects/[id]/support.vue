<template>
  <div class="support-layout">
    <header class="support-header">
      <div class="flex items-center gap-3">
        <LifeBuoy class="w-6 h-6 text-purple-600" />
        <div>
          <h2 class="text-xl font-bold text-slate-800">Service Management</h2>
          <p class="text-sm text-slate-500">Mesa de ayuda y triaje de tickets entrantes.</p>
        </div>
      </div>
    </header>

    <div class="support-content">
      <!-- Columna Triaje -->
      <div class="triage-column" v-motion-slide-visible-bottom>
        <div class="column-header">
          <div class="flex items-center gap-2">
            <Inbox class="w-4 h-4 text-slate-600" stroke-width="2" />
            <h3 class="font-bold text-slate-700">Triaje (Bandeja de Entrada)</h3>
            <span class="count-badge">{{ tickets.length }}</span>
          </div>
        </div>

        <div class="column-body">
          <div v-if="tickets.length === 0" class="empty-state">
            <div class="empty-icon bg-white/40 p-4 rounded-full mb-3 shadow-sm border border-white/60">
              <CheckCircle class="w-8 h-8 text-purple-400" />
            </div>
            <h4 class="font-bold text-slate-600">Todo al día</h4>
            <p class="text-xs text-slate-400 text-center mt-1">No hay tickets pendientes de triaje.</p>
          </div>

          <!-- Tickets -->
          <div 
            v-for="ticket in sortedTickets" 
            :key="ticket.id" 
            class="ticket-card group"
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 25 } }"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs font-bold text-purple-600 bg-purple-100/50 px-2 py-0.5 rounded-md">{{ ticket.key }}</span>
              <!-- SLA Badge Inteligente -->
              <div 
                class="sla-badge flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors duration-500"
                :class="getSlaClass(ticket)"
              >
                <Timer class="w-3 h-3" />
                {{ getSlaText(ticket) }}
              </div>
            </div>
            
            <h4 class="text-sm font-semibold text-slate-800 mb-1 leading-tight group-hover:text-purple-700 transition-colors">{{ ticket.title }}</h4>
            <p class="text-xs text-slate-500 line-clamp-2 mb-3">{{ ticket.description }}</p>
            
            <div class="flex items-center justify-between border-t border-white/50 pt-2 mt-auto">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                  {{ ticket.reporter.charAt(0) }}
                </div>
                <span class="text-[11px] font-medium text-slate-500">{{ ticket.reporter }}</span>
              </div>
              <button class="text-[11px] font-semibold text-purple-600 hover:text-purple-800 bg-white/60 hover:bg-white px-2 py-1 rounded-md transition-colors border border-purple-100 shadow-sm active:scale-95">
                Revisar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Espacio para futuras columnas (En progreso, Resuelto) -->
      <div class="placeholder-column border-dashed border-2 border-purple-200/50 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
        <p class="text-sm text-purple-300 font-medium">Arrastra tickets aquí para gestionarlos</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from '#app';
import { LifeBuoy, Inbox, Timer, CheckCircle } from 'lucide-vue-next';

definePageMeta({ layout: 'project' });
const route = useRoute();
const projectId = route.params.id as string;

// Simulamos tickets que entran al triaje
const tickets = ref([
  { id: 't1', key: 'SUP-1', title: 'Error al exportar reporte PDF', description: 'Cuando intento exportar el reporte mensual, la página se queda cargando y lanza un timeout.', reporter: 'Juan Pérez', created_at: Date.now() - 3500000 }, // Casi 1 hora
  { id: 't2', key: 'SUP-2', title: 'No puedo acceder al tablero', description: 'Me sale error 403 al entrar a mi proyecto.', reporter: 'María Gómez', created_at: Date.now() - 120000 }, // 2 minutos
  { id: 't3', key: 'SUP-3', title: 'Solicitud de nueva cuenta', description: 'Por favor agregar a pedro@empresa.com al equipo de diseño.', reporter: 'Carlos admin', created_at: Date.now() - 7100000 }, // Casi 2 horas (Crítico)
]);

// Ordenar por tiempo de creación (más antiguos primero = más urgentes en triaje)
const sortedTickets = computed(() => {
  return [...tickets.value].sort((a, b) => a.created_at - b.created_at);
});

// Lógica de SLA (Simulada: SLA de 2 horas para primera respuesta)
const SLA_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas
const SLA_WARNING_MS = 1 * 60 * 60 * 1000; // 1 hora

const getSlaInfo = (ticket: any) => {
  const elapsed = Date.now() - ticket.created_at;
  const remaining = SLA_LIMIT_MS - elapsed;
  return { elapsed, remaining };
};

const getSlaClass = (ticket: any) => {
  const { remaining } = getSlaInfo(ticket);
  if (remaining < 0) {
    return 'bg-rose-100/80 text-rose-700 border-rose-200 animate-pulse'; // Expirado (Rojo carmín)
  } else if (remaining < SLA_LIMIT_MS - SLA_WARNING_MS) {
    return 'bg-amber-100/80 text-amber-700 border-amber-200'; // Warning
  }
  return 'bg-purple-100/80 text-purple-600 border-purple-200'; // Normal (Lila)
};

const getSlaText = (ticket: any) => {
  const { remaining } = getSlaInfo(ticket);
  if (remaining < 0) {
    return 'Expirado';
  }
  const mins = Math.floor(remaining / 60000);
  if (mins > 60) {
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  }
  return `${mins}m`;
};

// Actualizar SLAs visualmente cada minuto
onMounted(() => {
  const interval = setInterval(() => {
    // Forzamos re-render mutando una ref dummy o actualizando el array (para simplificar, reasignamos)
    tickets.value = [...tickets.value];
  }, 60000);
});
</script>

<style scoped>
.support-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
}

.support-header {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 20px 24px;
  box-shadow: 0 8px 32px rgba(147, 51, 234, 0.05);
  flex-shrink: 0;
}

.support-content {
  flex: 1;
  display: flex;
  gap: 24px;
  overflow: hidden;
}

.triage-column {
  width: 380px;
  min-width: 380px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.column-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count-badge {
  background: rgba(147, 51, 234, 0.15);
  color: #7e22ce;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.column-body {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.04);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(147, 51, 234, 0.1);
  border-color: rgba(168, 85, 247, 0.3);
  background: rgba(255, 255, 255, 0.85);
}

.placeholder-column {
  flex: 1;
  max-width: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  opacity: 0.8;
}
</style>
