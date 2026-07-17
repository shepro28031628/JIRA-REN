<template>
  <div class="empty-state-wrapper flex flex-col items-center justify-center p-8 text-center" v-motion-roll-visible-bottom>
    <div class="illustration-container mb-4 relative">
      <!-- Glow de fondo -->
      <div class="absolute inset-0 bg-purple-400/20 blur-3xl rounded-full"></div>
      
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10 animate-float">
        <!-- Abstract geometric shapes for a premium look -->
        <circle cx="60" cy="60" r="48" fill="url(#paint0_linear)" fill-opacity="0.15"/>
        <circle cx="60" cy="60" r="38" stroke="url(#paint1_linear)" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.4"/>
        
        <!-- Center elements -->
        <path d="M48 65 L60 45 L72 65 Z" fill="url(#paint2_linear)" fill-opacity="0.6" style="filter: drop-shadow(0 4px 6px rgba(147, 51, 234, 0.2))"/>
        <rect x="52" y="58" width="16" height="16" rx="4" fill="url(#paint3_linear)" fill-opacity="0.8" style="filter: drop-shadow(0 2px 4px rgba(79, 70, 229, 0.3))"/>
        
        <defs>
          <linearGradient id="paint0_linear" x1="12" y1="12" x2="108" y2="108" gradientUnits="userSpaceOnUse">
            <stop stop-color="#9333EA"/>
            <stop offset="1" stop-color="#4F46E5"/>
          </linearGradient>
          <linearGradient id="paint1_linear" x1="22" y1="22" x2="98" y2="98" gradientUnits="userSpaceOnUse">
            <stop stop-color="#A855F7"/>
            <stop offset="1" stop-color="#EC4899"/>
          </linearGradient>
          <linearGradient id="paint2_linear" x1="48" y1="45" x2="72" y2="65" gradientUnits="userSpaceOnUse">
            <stop stop-color="#D946EF"/>
            <stop offset="1" stop-color="#8B5CF6"/>
          </linearGradient>
          <linearGradient id="paint3_linear" x1="52" y1="58" x2="68" y2="74" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6366F1"/>
            <stop offset="1" stop-color="#3B82F6"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    
    <h3 class="text-slate-800 font-semibold text-[15px] mb-1">{{ title }}</h3>
    <p class="text-slate-500 font-medium text-[13px] max-w-[250px] leading-relaxed">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<style scoped>
.empty-state-wrapper {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
  border: 1px dashed rgba(147, 51, 234, 0.2);
  border-radius: 20px;
  margin: 12px;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}
</style>
