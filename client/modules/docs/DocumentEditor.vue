<template>
  <div class="document-editor">
    <div class="editor-header">
      <input 
        type="text" 
        class="page-title-input" 
        v-model="title" 
        @blur="saveTitle" 
        placeholder="Título de la página..." 
      />
      <div class="editor-status">
        <span class="status-indicator" :class="{ 'is-saving': isSaving }"></span>
        <span class="status-text">{{ isSaving ? 'Guardando...' : 'Guardado' }}</span>
      </div>
    </div>
    <div class="editor-body">
      <!-- El editor Tiptap se montará aquí -->
      <editor-content :editor="editor" v-if="editor" class="tiptap-editor" />
      <div v-else class="editor-loading">Cargando editor...</div>
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
const { $socket } = useNuxtApp();

let saveTimeout: any = null;

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
    
    // Broadcast via websocket (solo una estructura básica por ahora)
    if ($socket) {
      $socket.emit('page:updated', { pageId: props.page.id, data });
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
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      savePage({ content: editor.getJSON() });
    }, 1000); // Debounce de 1 segundo
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
        // En un caso real colaborativo usaríamos Yjs para mergear deltas.
        // Aquí hacemos un replace simple.
        if (editor.value) {
          const currentPos = editor.value.state.selection;
          editor.value.commands.setContent(payload.data.content);
          editor.value.commands.setTextSelection(currentPos);
        }
      }
    });
  }
});

onBeforeUnmount(() => {
  if ($socket) {
    $socket.off('page:updated');
  }
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style>
.document-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--bg-canvas);
}

.editor-header {
  padding: 32px 64px 16px 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title-input {
  font-size: 32px;
  font-weight: 700;
  color: var(--txt-primary);
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
}
.page-title-input::placeholder {
  color: var(--txt-secondary);
  opacity: 0.5;
}

.editor-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--txt-secondary);
  font-size: 12px;
  white-space: nowrap;
}
.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--label-emerald-border);
}
.status-indicator.is-saving {
  background: var(--label-indigo-border);
  animation: pulse 1s infinite;
}

.editor-body {
  flex: 1;
  padding: 0 64px 64px 64px;
  overflow-y: auto;
}

/* Estilos globales de Tiptap */
.tiptap-editor .ProseMirror {
  min-height: 200px;
  outline: none;
  color: var(--txt-primary);
  font-size: 16px;
  line-height: 1.6;
}

.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  color: var(--txt-secondary);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  opacity: 0.5;
}

.tiptap-editor .ProseMirror h1 { font-size: 28px; font-weight: 700; margin-top: 24px; margin-bottom: 12px; }
.tiptap-editor .ProseMirror h2 { font-size: 24px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; }
.tiptap-editor .ProseMirror h3 { font-size: 20px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; }
.tiptap-editor .ProseMirror blockquote { border-left: 3px solid var(--border-strong); padding-left: 16px; font-style: italic; color: var(--txt-secondary); margin: 16px 0; }
.tiptap-editor .ProseMirror code { background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 14px; }
.tiptap-editor .ProseMirror pre { background: var(--bg-surface-1); padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
.tiptap-editor .ProseMirror pre code { background: none; padding: 0; }
.tiptap-editor .ProseMirror ul { list-style-type: disc; padding-left: 24px; margin: 12px 0; }
.tiptap-editor .ProseMirror ol { list-style-type: decimal; padding-left: 24px; margin: 12px 0; }

@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}
</style>
