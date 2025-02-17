import React, { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { MisskeyAPI } from './api';
import type { User, Note } from './types';

function App() {
  const [host, setHost] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ unpinned: 0, deleted: 0, total: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setIsLoading(true);
    setProgress({ unpinned: 0, deleted: 0, total: 0 });

    try {
      const api = new MisskeyAPI(host, token);
      
      // Fetch user info
      const user = await api.getUser();
      setStatus(`Found account: ${user.name ?? user.username} (@${user.username})`);
      
      // Unpin notes
      if (user.pinnedNotes?.length) {
        for (const note of user.pinnedNotes) {
          if (note.id) {
            await api.unpinNote(note.id);
            setProgress(p => ({ ...p, unpinned: p.unpinned + 1 }));
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
              await api.deleteNote(note.id);
              deleted++;
              setProgress(p => ({ ...p, deleted: deleted, total: user.notesCount }));
            } catch (error) {
              console.error(`Failed to delete note ${note.id}:`, error);
            }
          }
        }

        offset += notes.length;
      }

      setStatus(`Completed! Unpinned ${progress.unpinned} notes and deleted ${deleted} notes.`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">Misskey Note revision</h1>
          <p className="text-gray-600">Safely remove your Misskey notes and unpin pinned posts</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                Server Host
              </label>
              <input
                id="host"
                type="text"
                placeholder="e.g., yami.ski"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                API Token
              </label>
              <input
                id="token"
                type="password"
                placeholder="Your API token from Settings > API"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Start Cleanup
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {status && (
            <div className="mt-4 p-4 bg-green-50 rounded-md flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700">{status}</p>
            </div>
          )}

          {isLoading && progress.total > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.deleted / progress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Progress: {progress.deleted} / {progress.total} notes deleted
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;