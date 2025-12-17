<template>
  <div
    class="maintenance-container"
    style="background-image: url('https://angelkawaii.com/wp-content/uploads/2024/01/33.png')"
  >
    <div class="background-overlay" />

    <div class="maintenance-card">
      <div class="glass-effect" />

      <div class="icon-container">
        <div class="icon-wrapper">
          <div class="maintenance-icon">
            <img
              src="https://raw.githubusercontent.com/yamisskey-dev/yamisskey-assets/main/yami.ski/yami-logo-85x85.png"
              alt="Logo"
              class="favicon-icon"
              width="64"
              height="64"
            />
          </div>
        </div>
      </div>

      <div class="header">
        <h1>闇消し</h1>
        <div class="status-badge">
          <div class="pulse" />
          <span>ノートを安全に削除します</span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="form-container">
        <div class="input-group">
          <label for="host">サーバーホスト</label>
          <input
            id="host"
            v-model="host"
            type="text"
            placeholder="例: yami.ski"
            required
          />
        </div>

        <div class="input-group">
          <label for="token">APIトークン</label>
          <input
            id="token"
            v-model="token"
            type="password"
            placeholder="設定 > API から取得したトークン"
            required
          />
        </div>

        <button type="submit" :disabled="isLoading" class="submit-button">
          <Loader2 v-if="isLoading" class="icon" />
          <Trash2 v-else class="icon" />
          {{ isLoading ? '処理中...' : 'クリーンアップを開始' }}
        </button>
      </form>

      <div v-if="error" class="error-message">
        <AlertCircle class="icon" />
        <p>{{ error }}</p>
      </div>

      <div v-if="status" class="status-message">
        <CheckCircle2 class="icon" />
        <p>{{ status }}</p>
      </div>

      <div v-if="isLoading && progress.total > 0" class="progress-container">
        <div class="progress-bar">
          <div
            class="progress"
            :style="{ width: `${(progress.deleted / progress.total) * 100}%` }"
          />
        </div>
        <p class="progress-text">
          進捗状況: {{ progress.deleted }} / {{ progress.total }} ノート削除済み
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-vue-next';
import { MisskeyAPI } from './api';
import type { User, Note } from './types';

const host = ref('');
const token = ref('');
const status = ref('');
const error = ref<string>('');
const isLoading = ref(false);
const progress = ref({ unpinned: 0, deleted: 0, total: 0 });

const handleSubmit = async () => {
  error.value = '';
  status.value = '';
  isLoading.value = true;
  progress.value = { unpinned: 0, deleted: 0, total: 0 };

  try {
    const api = new MisskeyAPI(host.value, token.value);

    // Fetch user info
    const user = await api.getUser();
    status.value = `アカウントを確認:\n ${user.name ?? user.username} @${
      user.username
    }\n ${user.notesCount} ノート\n ID: ${user.id}`;

    // Unpin notes
    if (user.pinnedNotes?.length) {
      console.log(
        `${user.pinnedNotes.length}個のピン留めされたノートを見つけました`
      );
      for (const note of user.pinnedNotes) {
        if (note.id) {
          await api.unpinNote(note.id);
          progress.value.unpinned++;
          console.log(`ピン留めを解除: ${note.toString()}`);
        }
      }
    }

    // Delete notes
    let offset = 0;
    let deleted = 0;
    while (true) {
      const notes = await api.getNotes(user.id!, offset);
      if (!notes.length) break;

      for (const note of notes) {
        if (note.id) {
          try {
            await api.deleteNote(note.id).then(() => deleted++);
            progress.value.deleted = deleted;
            progress.value.total = user.notesCount;
            console.log(`ノートを削除: ${note.toString()}`);
          } catch (error) {
            console.error(
              `ノート ${note.id} の削除に失敗: ${(error as Error).message}`
            );
          }
        }
      }

      offset += notes.length;
    }

    status.value = `完了！${progress.value.unpinned}個のピン留めを解除し、${deleted}個のノートを削除しました。`;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.maintenance-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 1rem;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* 追加: スクロール時に背景を固定 */
}

/* 追加: body要素のスタイルをリセット */
:global(body) {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  overflow-x: hidden;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}

.maintenance-card {
  background: rgba(15, 10, 34, 0.9);
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  text-align: center;
  max-width: 500px;
  width: 90%;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(82, 61, 216, 0.18);
  margin-top: 50px;
}

.icon-container {
  position: absolute;
  width: 100px;
  height: 100px;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  overflow: visible;
}

.icon-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.maintenance-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(82, 61, 216, 0.08);
  position: relative;
}

.maintenance-icon::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #705dd8;
  border-right-color: #705dd8;
  animation: spinner 6s linear infinite;
}

.favicon-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  animation: slow-spin 6s linear infinite;
}

@keyframes spinner {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(720deg);
  }
}

@keyframes slow-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
}

.input-group {
  text-align: left;
}

.input-group label {
  display: block;
  color: rgba(168, 177, 194, 0.85);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.input-group input {
  width: 100%;
  background: rgba(82, 61, 216, 0.08);
  border: 1px solid rgba(82, 61, 216, 0.18);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  color: #fff;
  transition: all 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #705dd8;
  background: rgba(82, 61, 216, 0.15);
}

.submit-button {
  width: 100%;
  background: linear-gradient(135deg, #9c48a3, #705dd8);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Add new styles for error and status messages */
.error-message,
.status-message {
  color: #fff;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: start;
  gap: 0.75rem;
}

.error-message .icon {
  color: #ff69b4;
}

.status-message .icon {
  color: #adff2f;
}

.error-message {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.status-message {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.progress-container {
  margin-top: 1.5rem;
}

.progress-text {
  color: #808080;
}

/* Add responsive styles */
@media (max-width: 640px) {
  .maintenance-card {
    padding: 1.5rem;
    margin: 1rem;
  }

  .form-container {
    gap: 1rem;
  }
}

.header {
  margin: 2rem 0 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

h1 {
  color: #fff;
  font-size: 2.2rem;
  margin: 0;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, #fff, #a8b1c2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.status-badge {
  background: rgba(82, 61, 216, 0.15);
  border: 1px solid rgba(82, 61, 216, 0.3);
  border-radius: 20px;
  padding: 0.6rem 1.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pulse {
  width: 10px;
  height: 10px;
  background-color: #705dd8;
  border-radius: 50%;
  animation: pulse-dot 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
  box-shadow: 0 0 8px rgba(112, 93, 216, 0.5);
}

@media (max-width: 640px) {
  .header {
    margin: 1.5rem 0 2rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .status-badge {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
}
</style>
