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

  toString(): string {
    const text = this.cw || this.text || "(No text)";
    const renoteText = this.renote ? ` RN: ${this.renote.toString()}` : '';
    const replyText = this.reply ? ` RE: ${this.reply.toString()}` : '';
    const mediaText = this.mediaIds?.length ? ` (${this.mediaIds.length} medias)` : '';
    return `${text}${renoteText}${replyText}${mediaText}`;
  }
}

export interface MisskeyError {
  message?: string;
  code?: string;
  id?: string;
  kind?: string;
}