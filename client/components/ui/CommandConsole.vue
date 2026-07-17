<template>
  <div v-if="isOpen" class="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-slate-900/40" @click.self="closeConsole">
    <div 
      class="w-full max-w-2xl bg-slate-950/85 backdrop-blur-xl border border-purple-500/30 shadow-2xl rounded-2xl overflow-hidden transform-gpu"
      v-motion
      :initial="{ opacity: 0, scale: 0.95, y: -20 }"
      :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }"
      :leave="{ opacity: 0, scale: 0.95, y: -20 }"
    >
      <div class="flex items-center px-4 py-3 border-b border-purple-500/20">
        <Terminal class="w-5 h-5 text-purple-400 mr-3" />
        <span class="text-xs font-semibold text-purple-300 uppercase tracking-widest">JIRA-REN Command Console</span>
        <div class="ml-auto flex items-center gap-2">
          <span class="text-[10px] text-slate-500 font-mono bg-slate-800/50 px-2 py-0.5 rounded">ESC to close</span>
        </div>
      </div>
      
      <div class="p-4">
        <div class="relative flex items-center">
          <span class="text-purple-400 font-mono text-lg mr-2 animate-pulse">❯</span>
          <input 
            ref="cmdInput"
            v-model="command"
            @keydown.enter="executeCommand"
            @keydown.esc="closeConsole"
            type="text" 
            class="w-full bg-transparent border-none outline-none text-purple-100 font-mono text-lg placeholder-slate-600"
            placeholder="Type a command (/move, /assign)..."
            spellcheck="false"
            autocomplete="off"
          />
        </div>
      </div>

      <div v-if="history.length > 0" class="max-h-60 overflow-y-auto bg-slate-900/50 border-t border-purple-500/10 p-2 font-mono text-sm">
        <div v-for="(entry, idx) in history" :key="idx" class="px-3 py-2 flex flex-col gap-1 border-b border-slate-800/50 last:border-0">
          <div class="flex items-center text-slate-400">
            <span class="mr-2 text-purple-500">❯</span>
            <span>{{ entry.cmd }}</span>
          </div>
          <div class="pl-4 text-emerald-400 flex items-center gap-2" :class="{ 'text-red-400': entry.error }">
            <component :is="entry.error ? AlertTriangle : Sparkles" class="w-3.5 h-3.5" />
            {{ entry.output }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Terminal, AlertTriangle, Sparkles } from 'lucide-vue-next';

const isOpen = ref(false);
const command = ref('');
const cmdInput = ref<HTMLInputElement | null>(null);

const history = ref<{cmd: string, output: string, error: boolean}[]>([]);

// Global Keyboard Shortcut (Shift + C)
const handleKeydown = (e: KeyboardEvent) => {
  if (e.shiftKey && e.key.toLowerCase() === 'c' && !isOpen.value) {
    // Prevent default to avoid typing 'C' if focus is somewhere else, though usually safe
    e.preventDefault();
    openConsole();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const openConsole = () => {
  isOpen.value = true;
  nextTick(() => {
    if (cmdInput.value) {
      cmdInput.value.focus();
    }
  });
};

const closeConsole = () => {
  isOpen.value = false;
  command.value = '';
};

const executeCommand = () => {
  if (!command.value.trim()) return;
  
  const cmdStr = command.value.trim();
  let output = '';
  let error = false;

  const args = cmdStr.split(' ');
  const action = args[0].toLowerCase();

  switch (action) {
    case '/move':
      if (args.length >= 3) {
        output = `Tarea ${args[1]} movida exitosamente a '${args.slice(2).join(' ')}'`;
      } else {
        output = 'Sintaxis inválida. Uso: /move [id] [columna]';
        error = true;
      }
      break;
    case '/assign':
      if (args.length >= 2) {
        output = `Usuario ${args[1]} asignado a la tarea activa.`;
      } else {
        output = 'Sintaxis inválida. Uso: /assign @user';
        error = true;
      }
      break;
    case '/wiki-search':
      if (args.length >= 2) {
        output = `Abriendo resultados de Wiki para '${args.slice(1).join(' ')}'...`;
      } else {
        output = 'Sintaxis inválida. Uso: /wiki-search [query]';
        error = true;
      }
      break;
    case 'clear':
      history.value = [];
      command.value = '';
      return;
    default:
      output = `Comando no reconocido: ${action}`;
      error = true;
  }

  history.value.unshift({ cmd: cmdStr, output, error });
  command.value = '';
};
</script>
