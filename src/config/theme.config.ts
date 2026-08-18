export const themeConfig = {
  colors: {
    primary: '#000000',
    primaryForeground: '#ffffff',
    secondary: '#f5f5f5',
    secondaryForeground: '#111111',
    accent: '#e11d48',
    accentForeground: '#ffffff',
    background: '#ffffff',
    foreground: '#111111',
    muted: '#737373',
    border: '#e5e5e5',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    /** Applied to buttons */
    button: '0.5rem',
    /** Applied to cards */
    card: '0.5rem',
    /** Applied to inputs */
    input: '0.5rem',
  },

  typography: {
    headingFont: 'Inter, Arial, sans-serif',
    bodyFont: 'Inter, Arial, sans-serif',
  },

  /** UI style variants — change these to restyle components without touching JSX */
  style: {
    /**
     * button: 'rounded' | 'pill' | 'square'
     * Controls --radius-button CSS variable
     */
    button: 'rounded' as 'rounded' | 'pill' | 'square',

    /**
     * productCard: 'minimal' | 'bordered' | 'elevated'
     * Applied as a data-variant attribute on ProductCard
     */
    productCard: 'minimal' as 'minimal' | 'bordered' | 'elevated',

    /**
     * header: 'classic' | 'minimal' | 'modern'
     * Applied as a data-variant attribute on Header
     */
    header: 'modern' as 'classic' | 'minimal' | 'modern',

    /**
     * hero: 'full-width' | 'split' | 'centered'
     * Applied as a data-variant attribute on Hero
     */
    hero: 'full-width' as 'full-width' | 'split' | 'centered',
  },
} as const;

/** Resolved button radius based on style variant */
export function resolveButtonRadius(style: typeof themeConfig.style.button): string {
  if (style === 'pill') return '9999px';
  if (style === 'square') return '0px';
  return themeConfig.radius.button;
}
