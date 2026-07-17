<template>
  <div class="document-editor bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-purple-100/30 overflow-hidden flex flex-col h-full">
    <div class="editor-header px-12 py-8 flex justify-between items-center border-b border-purple-50/50 transition-opacity duration-300" :class="{ 'opacity-30 hover:opacity-100': zenMode }">
      <input 
        type="text" 
        class="page-title-input text-3xl font-bold text-slate-800 bg-transparent border-none outline-none w-full placeholder-slate-400" 
        v-model="title" 
        @blur="saveTitle" 
        placeholder="Título de la página..." 
      />
      <div class="editor-status flex items-center gap-2 text-slate-500 text-xs font-medium bg-white/50 px-3 py-1.5 rounded-full border border-purple-100/50">
        <span class="status-indicator w-1.5 h-1.5 rounded-full transition-colors" :class="isSaving ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'"></span>
        <span class="status-text">{{ isSaving ? 'Guardando...' : 'Guardado' }}</span>
        <span v-if="isTypingPeer" class="text-xs text-purple-400 ml-2 animate-pulse">Alguien está escribiendo...</span>
      </div>
    </div>
    <div class="editor-body flex-1 overflow-y-auto px-12 py-8">
      <editor-content :editor="editor" v-if="editor" class="tiptap-editor h-full" />
      <div v-else class="editor-loading text-slate-400">Cargando editor...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useNuxtApp } from '#app';

const props = defineProps<{
  page: any;
}>();

const emit = defineEmits(['update']);

const title = ref(props.page.title);
const isSaving = ref(false);
const isTypingPeer = ref(false);
const { $socket } = useNuxtApp();
const zenMode = useState('zenMode');

let saveTimeout: any = null;
let typingTimeout: any = null;
let clearTypingTimeout: any = null;

const saveTitle = async () => {
  if (title.value === props.page.title) return;
  await savePage({ title: title.value });
};

const savePage = async (data: any) => {
  isSaving.value = true;
  try {
    const res = await $fetch(`/api/pages/${props.page.id}`, {
      method: 'PUT',
      body: {
        ...props.page,
        ...data
      }
    });
    emit('update', res);
    
    // Emit only the necessary JSON state to avoid saturating channel
    if ($socket) {
      $socket.emit('page:updated', { pageId: props.page.id, data: { content: data.content } });
    }
  } catch (err) {
    console.error('Error saving page:', err);
  } finally {
    isSaving.value = false;
  }
};

const editor = useEditor({
  content: props.page.content || '',
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Escribe algo increíble o teclea "/" para comandos...',
    }),
  ],
  onUpdate: ({ editor }) => {
    // Typing Indicator Logic
    if ($socket) {
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        $socket.emit('page:typing', { pageId: props.page.id, typing: true });
      }, 200);
    }

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      savePage({ content: editor.getJSON() });
      if ($socket) $socket.emit('page:typing', { pageId: props.page.id, typing: false });
    }, 1500); // Surgical debounce
  },
  onFocus: () => {
    zenMode.value = true;
  },
  onBlur: () => {
    zenMode.value = false;
  }
});

watch(() => props.page.id, (newId) => {
  title.value = props.page.title;
  if (editor.value) {
    editor.value.commands.setContent(props.page.content || '');
  }
});

onMounted(() => {
  if ($socket) {
    $socket.on('page:updated', (payload: any) => {
      if (payload.pageId === props.page.id && payload.data.content) {
        if (editor.value && !isSaving.value) { // Simple check to not overwrite if we are currently saving
          const currentPos = editor.value.state.selection;
          editor.value.commands.setContent(payload.data.content);
          editor.value.commands.setTextSelection(currentPos);
        }
      }
    });
    
    $socket.on('page:typing', (payload: any) => {
      if (payload.pageId === props.page.id) {
        isTypingPeer.value = payload.typing;
        if (clearTypingTimeout) clearTimeout(clearTypingTimeout);
        if (payload.typing) {
          clearTypingTimeout = setTimeout(() => { isTypingPeer.value = false; }, 3000);
        }
      }
    });
  }
});

onBeforeUnmount(() => {
  if ($socket) {
    $socket.off('page:updated');
    $socket.off('page:typing');
  }
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style>
/* Estilos globales de Tiptap - Removing layout ones as they are now Tailwind classes */

.tiptap-editor .ProseMirror {
  min-height: calc(100vh - 250px);
  outline: none;
  color: #1e293b;
  font-size: 16px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  color: #94a3b8;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  opacity: 0.6;
}

.tiptap-editor .ProseMirror h1 { font-size: 28px; font-weight: 700; margin-top: 24px; margin-bottom: 12px; }
.tiptap-editor .ProseMirror h2 { font-size: 24px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; }
.tiptap-editor .ProseMirror h3 { font-size: 20px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; }
.tiptap-editor .ProseMirror blockquote { border-left: 3px solid rgba(147, 51, 234, 0.3); padding-left: 16px; font-style: italic; color: #64748b; margin: 16px 0; }
.tiptap-editor .ProseMirror code { background: rgba(147, 51, 234, 0.1); color: #9333ea; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 14px; }
.tiptap-editor .ProseMirror pre { background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(147, 51, 234, 0.1); padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
.tiptap-editor .ProseMirror pre code { background: none; color: #1e293b; padding: 0; }
.tiptap-editor .ProseMirror ul { list-style-type: disc; padding-left: 24px; margin: 12px 0; }
.tiptap-editor .ProseMirror ol { list-style-type: decimal; padding-left: 24px; margin: 12px 0; }

@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}
</style>
