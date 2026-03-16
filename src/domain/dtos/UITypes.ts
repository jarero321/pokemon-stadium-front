/** Sprite animation states for battle Pokemon */
export type SpriteAnimation =
  | 'idle'
  | 'entering'
  | 'damage'
  | 'fainting'
  | 'waiting'
  | 'attacking'
  | 'critical';

/** A message shown in the battle message box */
export interface BattleMessage {
  text: string;
  type?:
    | 'normal'
    | 'super-effective'
    | 'not-effective'
    | 'critical'
    | 'ko'
    | 'victory'
    | 'defeat'
    | 'info';
}

/** A notification message shown in the game UI */
export interface GameMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}
