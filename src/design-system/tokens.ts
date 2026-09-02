//! Design system tokens — single source of truth for colors, typography,
//! spacing, radii, shadows, and motion.
//!
//! These are plain JS objects consumed by Tailwind (tailwind.config.ts) and
//! by the React components so the same values are always in sync.

export const colors = {
  bg: "#fafaf8",
  surface: "#ffffff",
  text: "#1a1a1a",
  textMuted: "#6b6b6b",
  border: "#e5e5e0",
  accent: "#2f5d62",
  accentSoft: "#e7f1f2",
  accentHover: "#264a4d",
  success: "#2f7d4f",
  warning: "#b8860b",
  error: "#b03030",
  info: "#2f5d62",
} as const;

export const typography = {
  display: { fontSize: "48px", lineHeight: "1.1", fontWeight: "700" },
  h1: { fontSize: "32px", lineHeight: "1.2", fontWeight: "600" },
  h2: { fontSize: "24px", lineHeight: "1.25", fontWeight: "600" },
  h3: { fontSize: "20px", lineHeight: "1.3", fontWeight: "600" },
  body: { fontSize: "16px", lineHeight: "1.6", fontWeight: "400" },
  bodyLg: { fontSize: "18px", lineHeight: "1.6", fontWeight: "400" },
  small: { fontSize: "13px", lineHeight: "1.4", fontWeight: "400" },
  mono: { fontSize: "12px", lineHeight: "1.5", fontFamily: "ui-monospace, monospace" },
} as const;

export const spacing = {
  sidebar: "256px",
  panel: "320px",
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
} as const;

export const radii = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.04)",
  md: "0 2px 8px rgba(0,0,0,0.06)",
  lg: "0 8px 24px rgba(0,0,0,0.08)",
  xl: "0 16px 40px rgba(0,0,0,0.10)",
} as const;

export const motion = {
  fast: "120ms ease-out",
  base: "200ms ease-out",
  slow: "320ms ease-out",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const statusColors: Record<
  string,
  { bg: string; fg: string }
> = {
  complete: { bg: "#e7f3ec", fg: colors.success },
  inProgress: { bg: colors.accentSoft, fg: colors.accent },
  needsReview: { bg: "#fdf3e0", fg: colors.warning },
  waiting: { bg: "#f0f0ee", fg: colors.textMuted },
  blocked: { bg: "#f7e4e4", fg: colors.error },
};