<template>
  <div class="data-importer w-full p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
        <Database class="w-6 h-6 text-purple-600" />
        Migración de Datos
      </h2>
      <p class="text-sm text-slate-500 mt-2">
        Importa tareas, subtareas y registros de tiempo desde Jira, Zoho, o un ecosistema anterior en formato JSON o CSV.
      </p>
    </div>

    <!-- Drag & Drop Zone -->
    <div 
      class="dropzone group relative border-2 border-dashed border-purple-300 bg-white/40 backdrop-blur-md rounded-2xl p-10 text-center transition-all duration-300 transform-gpu overflow-hidden"
      :class="{ 'border-purple-500 bg-purple-50/50 scale-[1.02]': isDragging, 'opacity-50 pointer-events-none': isUploading }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input 
        type="file" 
        ref="fileInput" 
        class="hidden" 
        accept=".json,.csv"
        @change="handleFileSelect"
      />
      
      <div v-if="!isUploading && !uploadSuccess" class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <UploadCloud class="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-700">Arrastra tu archivo aquí</h3>
          <p class="text-xs text-slate-500 mt-1">Soporta .JSON y .CSV (Max 10MB)</p>
        </div>
        <button class="mt-2 bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
          Explorar archivos
        </button>
      </div>

      <!-- Uploading State -->
      <div v-else-if="isUploading" class="flex flex-col items-center gap-4 py-4" v-motion-pop>
        <RefreshCw class="w-10 h-10 text-purple-500 animate-spin" />
        <div>
          <h3 class="text-lg font-bold text-slate-700">Procesando datos...</h3>
          <p class="text-xs text-slate-500 mt-1">Mapeando usuarios y estructurando tareas</p>
        </div>
        <div class="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
          <div class="h-full bg-gradient-to-r from-purple-400 to-indigo-500 w-1/2 animate-[progress_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="uploadSuccess" class="flex flex-col items-center gap-4 py-4" v-motion-slide-bottom>
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check class="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-emerald-700">¡Migración Completada!</h3>
          <p class="text-xs text-slate-500 mt-1">Se han importado {{ importedCount }} tareas exitosamente.</p>
        </div>
        <button @click.stop="resetUploader" class="mt-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors">
          Importar otro archivo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Database, UploadCloud, RefreshCw, Check } from 'lucide-vue-next';
import { useToast } from '../../../composables/useToast';

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);

const isDragging = ref(false);
const isUploading = ref(false);
const uploadSuccess = ref(false);
const importedCount = ref(0);

const triggerFileInput = () => {
  if (!isUploading.value && fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    processFile(target.files[0]);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'json' || ext === 'csv') {
      processFile(file);
    } else {
      toast.error('Formato no soportado. Sube un archivo .json o .csv');
    }
  }
};

const processFile = async (file: File) => {
  isUploading.value = true;
  uploadSuccess.value = false;
  
  try {
    // Simular el parseo y envío a la API (mock)
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        // En un caso real:
        // const payload = parseData(e.target?.result, file.type);
        // await $fetch('/api/projects/.../import', { method: 'POST', body: payload });
        
        // Simular tiempo de red y procesamiento
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        importedCount.value = Math.floor(Math.random() * 50) + 10; // Número random
        isUploading.value = false;
        uploadSuccess.value = true;
        toast.success(`Datos importados con éxito`);
      } catch (err) {
        throw err;
      }
    };
    
    reader.onerror = () => {
      throw new Error('Error al leer el archivo');
    };
    
    reader.readAsText(file);
    
  } catch (error) {
    console.error(error);
    isUploading.value = false;
    toast.error('Error al procesar el archivo');
  } finally {
    if (fileInput.value) fileInput.value.value = '';
  }
};

const resetUploader = () => {
  uploadSuccess.value = false;
  importedCount.value = 0;
};
</script>

<style scoped>
.dropzone {
  cursor: pointer;
  background-image: linear-gradient(to bottom right, rgba(255,255,255,0.7), rgba(255,255,255,0.2));
}
.dropzone:hover {
  background-image: linear-gradient(to bottom right, rgba(255,255,255,0.85), rgba(255,255,255,0.4));
}

@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
</style>
