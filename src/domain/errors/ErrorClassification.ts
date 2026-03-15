export enum ErrorSeverity {
  INFORMATIONAL = 'informational',
  BLOCKER = 'blocker',
  FATAL = 'fatal',
}

export interface ServerError {
  code: string;
  message: string;
}

const INFORMATIONAL_CODES = new Set(['NOT_YOUR_TURN', 'ALREADY_JOINED']);

const SESSION_CONFLICT_CODES = new Set([
  'PLAYER_ALREADY_IN_LOBBY',
  'SESSION_REPLACED',
]);

const FATAL_CODES = new Set(['INTERNAL_ERROR']);

export function classifyError(code: string): ErrorSeverity {
  if (INFORMATIONAL_CODES.has(code)) return ErrorSeverity.INFORMATIONAL;
  if (FATAL_CODES.has(code)) return ErrorSeverity.FATAL;
  return ErrorSeverity.BLOCKER;
}

export function isSessionConflict(code: string): boolean {
  return SESSION_CONFLICT_CODES.has(code);
}
