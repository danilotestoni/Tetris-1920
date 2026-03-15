// ═══════════════════════════════════════════════════════════════
//  PLAYER MODEL
// ═══════════════════════════════════════════════════════════════

export interface Player {
  id: 1 | 2;
  name: string;
  avatar: PlayerAvatar;
}

export type PlayerAvatar = 'gatsby' | 'flapper' | 'jazzman' | 'speakeasy';

export interface PlayerAvatarDefinition {
  id: PlayerAvatar;
  name: string;
  description: string;
  emoji: string;
}

export const PLAYER_AVATARS: PlayerAvatarDefinition[] = [
  { id: 'gatsby',    name: 'The Great Gatsby',  description: 'Old sport, I say!',              emoji: '🎩' },
  { id: 'flapper',   name: 'La Flapper',         description: 'Jazz, glamour and shimmy!',     emoji: '💃' },
  { id: 'jazzman',   name: 'The Jazzman',         description: 'Notes of gold, blocks of steel', emoji: '🎷' },
  { id: 'speakeasy', name: 'The Bootlegger',      description: 'Keep it on the down-low...',   emoji: '🥃' },
];

export const DEFAULT_PLAYER_NAMES: Record<1 | 2, string> = {
  1: 'Player One',
  2: 'Player Two',
};
