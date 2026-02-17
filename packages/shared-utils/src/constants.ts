// Constantes métier Pairémancipation

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;

export const PASSWORD_MIN_LENGTH = 12;
export const JWT_ACCESS_EXPIRATION = '15m';
export const JWT_REFRESH_EXPIRATION = '7d';
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const UPLOAD_MAX_SIZE_IMAGE = 5 * 1024 * 1024; // 5 Mo
export const UPLOAD_MAX_SIZE_PDF = 20 * 1024 * 1024; // 20 Mo
export const UPLOAD_ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const UPLOAD_ALLOWED_DOC_TYPES = ['application/pdf'];

export const PBKDF2_DEFAULT_ITERATIONS = 600_000;
export const ENCRYPTION_ALGORITHM = 'AES-GCM';
export const ENCRYPTION_KEY_LENGTH = 256;

export const RECOVERY_CODE_WORD_COUNT = 12;

export const MOODS = ['very_bad', 'bad', 'neutral', 'good', 'very_good'] as const;
export const MOOD_EMOJIS: Record<(typeof MOODS)[number], string> = {
  very_bad: '😢',
  bad: '😟',
  neutral: '😐',
  good: '🙂',
  very_good: '😊',
};

export const GOAL_HORIZONS = ['short_term', 'medium_term', 'long_term'] as const;
export const GOAL_HORIZON_LABELS: Record<(typeof GOAL_HORIZONS)[number], string> = {
  short_term: 'Court terme',
  medium_term: 'Moyen terme',
  long_term: 'Long terme',
};
