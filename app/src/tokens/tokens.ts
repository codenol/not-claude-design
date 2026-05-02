export const tokens = {
  color: {
    brand: {
      primary: 'var(--color-brand-primary)',
      secondary: 'var(--color-brand-secondary)',
    },
    neutral: {
      black: 'var(--color-neutral-black)',
      900: 'var(--color-neutral-900)',
      800: 'var(--color-neutral-800)',
      700: 'var(--color-neutral-700)',
      600: 'var(--color-neutral-600)',
      500: 'var(--color-neutral-500)',
      400: 'var(--color-neutral-400)',
      300: 'var(--color-neutral-300)',
      200: 'var(--color-neutral-200)',
      100: 'var(--color-neutral-100)',
      50: 'var(--color-neutral-50)',
      white: 'var(--color-neutral-white)',
    },
    accent: {
      success: 'var(--color-accent-success)',
      successBg: 'var(--color-accent-success-bg)',
      warning: 'var(--color-accent-warning)',
      warningBg: 'var(--color-accent-warning-bg)',
      danger: 'var(--color-accent-danger)',
      dangerBg: 'var(--color-accent-danger-bg)',
      info: 'var(--color-accent-info)',
      infoBg: 'var(--color-accent-info-bg)',
    },
    semantic: {
      bgDefault: 'var(--color-bg-default)',
      bgSubtle: 'var(--color-bg-subtle)',
      bgSurface: 'var(--color-bg-surface)',
      bgOverlay: 'var(--color-bg-overlay)',
      textDefault: 'var(--color-text-default)',
      textSubtle: 'var(--color-text-subtle)',
      textInverse: 'var(--color-text-inverse)',
      borderDefault: 'var(--color-border-default)',
      borderSubtle: 'var(--color-border-subtle)',
      brandDefault: 'var(--color-brand-default)',
      brandHover: 'var(--color-brand-hover)',
      accentSuccess: 'var(--color-accent-success)',
      accentWarning: 'var(--color-accent-warning)',
      accentDanger: 'var(--color-accent-danger)',
      accentInfo: 'var(--color-accent-info)',
    },
  },
  space: {
    0: 'var(--space-0)',
    1: 'var(--space-1)',
    2: 'var(--space-2)',
    3: 'var(--space-3)',
    4: 'var(--space-4)',
    5: 'var(--space-5)',
    6: 'var(--space-6)',
    7: 'var(--space-7)',
    8: 'var(--space-8)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)',
  },
  shadow: {
    card: 'var(--shadow-card)',
    modal: 'var(--shadow-modal)',
    focus: 'var(--shadow-focus)',
  },
} as const;

export type TokenColor = keyof typeof tokens.color;
export type TokenSpace = keyof typeof tokens.space;
export type TokenRadius = keyof typeof tokens.radius;
export type TokenShadow = keyof typeof tokens.shadow;
