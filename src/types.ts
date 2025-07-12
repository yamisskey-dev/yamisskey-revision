export interface User {
  host?: string;
  id?: string;
  name?: string;
  notesCount: number;
  pinnedNotes?: Note[];
  username?: string;
}

export interface Note {
  createdAt: string;
  cw?: string;
  id?: string;
  mediaIds?: string[];
  mentions?: string[];
  reply?: Note;
  replyId?: string;
  renote?: Note;
  renoteId?: string;
  text?: string;
  userId?: string;
}

export const noteToString = (note: Note): string => {
  const text = note.cw || note.text || '(No text)';
  const renoteText = note.renote ? ` RN: ${noteToString(note.renote)}` : '';
  const replyText = note.reply ? ` RE: ${noteToString(note.reply)}` : '';
  const mediaText = note.mediaIds?.length
    ? ` (${note.mediaIds.length} medias)`
    : '';
  return `${text}${renoteText}${replyText}${mediaText}`;
};

/** [API Doc](https://misskey.io/api-doc) */
export interface MisskeyError {
  message?: string;
  code?: string;
  id?: string;
  kind?: string;
}

/** [API Doc](https://misskey.io/api-doc) */
export interface MisskeyRateLimited {
  error: {
    message: string;
    code: string;
    id: string;
    kind: string;
    info: {
      remaining: number;
      /** Unix Second */
      reset: number;
      /** Unix Milisecond */
      resetMs: number;
      total: number;
    };
  };
}
