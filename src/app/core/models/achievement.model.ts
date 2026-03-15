// ═══════════════════════════════════════════════════════════════
//  ACHIEVEMENT MODEL
//  All the glory of the Roaring Twenties, one badge at a time
// ═══════════════════════════════════════════════════════════════

export type AchievementId =
  | 'first_line'
  | 'double_trouble'
  | 'hat_trick'
  | 'tetris'
  | 'level_5'
  | 'level_10'
  | 'score_1000'
  | 'score_10000'
  | 'score_50000'
  | 'hundred_lines'
  | 'speed_demon'
  | 'endurance'
  | 'perfectionist'
  | 'back_to_back';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;        // emoji icon
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  secret?: boolean;
}

export interface PlayerAchievement {
  achievementId: AchievementId;
  playerName: string;
  unlockedAt: string;  // ISO date string
}

export interface AchievementUnlockEvent {
  achievement: Achievement;
  playerName: string;
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_line: {
    id: 'first_line',
    name: 'Curtain Raiser',
    description: 'Clear your very first line. The show has begun!',
    icon: '🎭',
    rarity: 'bronze',
  },
  double_trouble: {
    id: 'double_trouble',
    name: 'Double Decker',
    description: 'Clear 2 lines simultaneously. Make it a double!',
    icon: '🥂',
    rarity: 'bronze',
  },
  hat_trick: {
    id: 'hat_trick',
    name: 'Hat Trick',
    description: 'Clear 3 lines at once. This calls for a dance!',
    icon: '🎩',
    rarity: 'silver',
  },
  tetris: {
    id: 'tetris',
    name: 'Gatsby\'s Triumph',
    description: 'Clear 4 lines at once. The party of the century!',
    icon: '🏆',
    rarity: 'gold',
  },
  level_5: {
    id: 'level_5',
    name: 'Speakeasy Regular',
    description: 'Reach level 5. You know the secret knock.',
    icon: '🥃',
    rarity: 'silver',
  },
  level_10: {
    id: 'level_10',
    name: 'Prohibition Boss',
    description: 'Reach level 10. You run this town.',
    icon: '💎',
    rarity: 'gold',
  },
  score_1000: {
    id: 'score_1000',
    name: 'Thousand Dollar Bill',
    description: 'Score 1,000 points. Not bad for a Tuesday.',
    icon: '💵',
    rarity: 'bronze',
  },
  score_10000: {
    id: 'score_10000',
    name: 'High Roller',
    description: 'Score 10,000 points. The casino loves you.',
    icon: '🎰',
    rarity: 'silver',
  },
  score_50000: {
    id: 'score_50000',
    name: 'Wall Street Wizard',
    description: 'Score 50,000 points. Stocks only go up, darling.',
    icon: '📈',
    rarity: 'gold',
  },
  hundred_lines: {
    id: 'hundred_lines',
    name: 'Century Club',
    description: 'Clear 100 lines total. A true Tetris virtuoso.',
    icon: '💯',
    rarity: 'gold',
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Roadster Racer',
    description: 'Survive 2 minutes at level 8 or higher.',
    icon: '🏎️',
    rarity: 'platinum',
  },
  endurance: {
    id: 'endurance',
    name: 'All-Night Dancer',
    description: 'Play for 10 minutes straight. Who needs sleep?',
    icon: '💃',
    rarity: 'silver',
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'Immaculate Conception',
    description: 'Clear a line without any gaps in the row above.',
    icon: '✨',
    rarity: 'platinum',
    secret: true,
  },
  back_to_back: {
    id: 'back_to_back',
    name: 'Encore!',
    description: 'Get Tetris twice in a row. The crowd goes wild!',
    icon: '🎷',
    rarity: 'platinum',
    secret: true,
  },
};

export const RARITY_COLORS: Record<string, string> = {
  bronze:   '#CD7F32',
  silver:   '#C0C0C0',
  gold:     '#D4AF37',
  platinum: '#E5E4E2',
};
