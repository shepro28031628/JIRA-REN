<template>
  <div class="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
    <TransitionGroup 
      name="toast-fade" 
      tag="div" 
      class="flex flex-col gap-3 items-end"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="toast-card pointer-events-auto flex items-center gap-3 bg-white/80 backdrop-blur-md border shadow-lg text-slate-800 rounded-xl p-4 min-w-[300px]"
        :class="{
          'border-emerald-200/60 shadow-emerald-100/30': toast.type === 'success',
          'border-red-200/60 shadow-red-100/30': toast.type === 'error',
          'border-purple-200/50 shadow-purple-100/30': toast.type === 'info'
        }"
      >
        <div class="icon-container shrink-0">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-500" stroke-width="2" />
          <AlertTriangle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" stroke-width="2" />
          <Info v-else class="w-5 h-5 text-purple-500" stroke-width="2" />
        </div>
        <p class="text-[13px] font-medium leading-tight flex-1">{{ toast.message }}</p>
        <button 
          @click="removeToast(toast.id)" 
          class="shrink-0 p-1 rounded-md hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-vue-next';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}
.toast-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
