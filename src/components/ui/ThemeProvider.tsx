import { themeConfig, resolveButtonRadius } from '@/config/theme.config';

/**
 * Renders a <style> tag that maps themeConfig values to CSS custom properties.
 * Drop this inside <head> (or at the top of <body>) in the root layout.
 * Changing themeConfig is the single source of truth for all design tokens.
 */
export default function ThemeProvider() {
  const { colors, radius, typography, style } = themeConfig;

  const css = `
    :root {
      --primary: ${colors.primary};
      --primary-foreground: ${colors.primaryForeground};
      --secondary: ${colors.secondary};
      --secondary-foreground: ${colors.secondaryForeground};
      --accent: ${colors.accent};
      --accent-foreground: ${colors.accentForeground};
      --background: ${colors.background};
      --foreground: ${colors.foreground};
      --muted: ${colors.muted};
      --border: ${colors.border};
      --success: ${colors.success};
      --warning: ${colors.warning};
      --error: ${colors.error};

      --radius: ${radius.md};
      --radius-sm: ${radius.sm};
      --radius-md: ${radius.md};
      --radius-lg: ${radius.lg};
      --radius-xl: ${radius.xl};
      --radius-button: ${resolveButtonRadius(style.button)};
      --radius-card: ${radius.card};
      --radius-input: ${radius.input};

      --font-heading: ${typography.headingFont};
      --font-body: ${typography.bodyFont};
    }
  `.trim();

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
