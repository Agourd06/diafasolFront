/**
 * Dynamic theme utilities for database-driven company branding
 */

export type CompanyTheme = {
  primaryColor?: string; // hex color like "#214fd6"
  secondaryColor?: string;
  accentColor?: string;
};

/**
 * Converts hex color to RGB values (for CSS custom properties)
 */
const hexToRgb = (hex: string): string => {
  const sanitized = hex.replace("#", "");
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
};

/**
 * Generates color shades from a base color (for 50-900 scale)
 */
const generateShades = (baseColor: string): Record<number, string> => {
  const rgb = hexToRgb(baseColor);
  const [r, g, b] = rgb.split(" ").map(Number);

  // Simple shade generation (can be enhanced with color theory libraries)
  const shades: Record<number, string> = {
    50: `${Math.min(r + 80, 255)} ${Math.min(g + 80, 255)} ${Math.min(b + 80, 255)}`,
    100: `${Math.min(r + 60, 255)} ${Math.min(g + 60, 255)} ${Math.min(b + 60, 255)}`,
    200: `${Math.min(r + 40, 255)} ${Math.min(g + 40, 255)} ${Math.min(b + 40, 255)}`,
    300: `${Math.min(r + 20, 255)} ${Math.min(g + 20, 255)} ${Math.min(b + 20, 255)}`,
    400: `${Math.min(r + 10, 255)} ${Math.min(g + 10, 255)} ${Math.min(b + 10, 255)}`,
    500: rgb,
    600: `${Math.max(r - 15, 0)} ${Math.max(g - 15, 0)} ${Math.max(b - 15, 0)}`,
    700: `${Math.max(r - 30, 0)} ${Math.max(g - 30, 0)} ${Math.max(b - 30, 0)}`,
    800: `${Math.max(r - 45, 0)} ${Math.max(g - 45, 0)} ${Math.max(b - 45, 0)}`,
    900: `${Math.max(r - 60, 0)} ${Math.max(g - 60, 0)} ${Math.max(b - 60, 0)}`,
  };

  return shades;
};

/**
 * Applies company theme colors to the document root
 * This dynamically updates all brand-* Tailwind classes throughout the app
 */
export const applyCompanyTheme = (theme: CompanyTheme): void => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (theme.primaryColor) {
    const shades = generateShades(theme.primaryColor);
    Object.entries(shades).forEach(([shade, rgb]) => {
      root.style.setProperty(`--color-brand-${shade}`, rgb);
    });
    root.setAttribute("data-theme", "custom");
  }

  // Store theme in localStorage for persistence
  if (theme.primaryColor) {
    localStorage.setItem("company_theme", JSON.stringify(theme));
  }
};

/**
 * Resets theme to default values
 */
export const resetTheme = (): void => {
  if (typeof document === "undefined") return;
  
  const root = document.documentElement;
  root.removeAttribute("data-theme");
  localStorage.removeItem("company_theme");
  
  // Reset to default theme
  const defaultShades = {
    50: "238 246 255",
    100: "217 232 255",
    200: "184 209 255",
    300: "137 175 255",
    400: "91 138 255",
    500: "50 105 243",
    600: "33 79 214",
    700: "26 62 173",
    800: "24 55 136",
    900: "25 47 110",
  };

  Object.entries(defaultShades).forEach(([shade, rgb]) => {
    root.style.setProperty(`--color-brand-${shade}`, rgb);
  });
};

/**
 * Loads saved theme from localStorage on app initialization
 */
export const loadSavedTheme = (): void => {
  if (typeof window === "undefined") return;

  const savedTheme = localStorage.getItem("company_theme");
  if (savedTheme) {
    try {
      const theme = JSON.parse(savedTheme) as CompanyTheme;
      applyCompanyTheme(theme);
    } catch (error) {
      console.warn("Failed to load saved theme", error);
    }
  }
};

