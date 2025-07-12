import type { User, Note, MisskeyError, MisskeyRateLimited } from './types';

export class MisskeyAPI {
  private endpoint: string;
  private token: string;

  constructor(host: string, token: string) {
    this.endpoint = `https://${host}/api/`;
    this.token = token;
  }

  private async post<T>(path: string, content: object): Promise<T> {
    try {
      const response = await fetch(this.endpoint + path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...content, i: this.token }),
      });

      if (!response.ok) {
        if (response.status == 429) {
          const error = ((await response.json()) as MisskeyRateLimited).error;
          const now = Date.now();
          const diff = (error.info.resetMs ?? 1000 * 10) - now;
          console.error(`Ratelimited. retrying after ${diff / 1000}second...`);
          await new Promise((_) => setTimeout(_, diff));
          return await this.post(path, content);
        }
        const error = (await response.json()) as MisskeyError;
        throw new Error(error.message || 'API request failed');
      }

      //? return empty json
      if (response.status == 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${path}:`, error);
      throw error;
    }
  }

  async getUser(): Promise<User> {
    return this.post<User>('i', {});
  }

  async unpinNote(noteId: string): Promise<void> {
    await this.post('i/unpin', { noteId });
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.post('notes/delete', { noteId });
  }

  async getNotes(userId: string, offset: number): Promise<Note[]> {
    return this.post<Note[]>('users/notes', {
      userId,
      limit: 100,
      offset,
    });
  }
}
