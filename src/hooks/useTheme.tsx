import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  preview: string[];
  vars: Record<string, string>;
  mode: "dark" | "light";
}

const darkThemes: ThemeConfig[] = [
  {
    id: "midnight-amber",
    name: "Midnight Amber",
    description: "Deep navy with warm amber & teal accents",
    mode: "dark",
    preview: ["#0f1219", "#d4930d", "#1a8a7a", "#e8a020"],
    vars: {
      "--background": "220 20% 6%",
      "--foreground": "40 20% 92%",
      "--card": "220 18% 10%",
      "--card-foreground": "40 20% 92%",
      "--popover": "220 18% 10%",
      "--popover-foreground": "40 20% 92%",
      "--primary": "38 92% 50%",
      "--primary-foreground": "220 20% 6%",
      "--secondary": "174 60% 35%",
      "--secondary-foreground": "40 20% 95%",
      "--muted": "220 15% 15%",
      "--muted-foreground": "220 10% 55%",
      "--accent": "28 80% 52%",
      "--accent-foreground": "220 20% 6%",
      "--border": "220 15% 18%",
      "--input": "220 15% 18%",
      "--ring": "38 92% 50%",
      "--glass-bg": "220 18% 10% / 0.4",
      "--glass-border": "220 15% 30% / 0.3",
      "--glass-highlight": "40 20% 95% / 0.05",
      "--sidebar-background": "220 18% 8%",
      "--sidebar-foreground": "40 20% 92%",
      "--sidebar-primary": "38 92% 50%",
      "--sidebar-primary-foreground": "220 20% 6%",
      "--sidebar-accent": "220 15% 15%",
      "--sidebar-accent-foreground": "40 20% 92%",
      "--sidebar-border": "220 15% 18%",
      "--sidebar-ring": "38 92% 50%",
    },
  },
  {
    id: "ocean-sunset",
    name: "Ocean Sunset",
    description: "Deep ocean blue with coral & gold warmth",
    mode: "dark",
    preview: ["#0a1628", "#ff6b4a", "#1e90c8", "#f0a030"],
    vars: {
      "--background": "215 45% 8%",
      "--foreground": "30 30% 93%",
      "--card": "215 40% 12%",
      "--card-foreground": "30 30% 93%",
      "--popover": "215 40% 12%",
      "--popover-foreground": "30 30% 93%",
      "--primary": "12 90% 58%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "200 65% 45%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "215 30% 16%",
      "--muted-foreground": "215 15% 55%",
      "--accent": "35 90% 55%",
      "--accent-foreground": "215 45% 8%",
      "--border": "215 30% 20%",
      "--input": "215 30% 20%",
      "--ring": "12 90% 58%",
      "--glass-bg": "215 40% 12% / 0.4",
      "--glass-border": "215 25% 30% / 0.3",
      "--glass-highlight": "30 30% 95% / 0.05",
      "--sidebar-background": "215 40% 10%",
      "--sidebar-foreground": "30 30% 93%",
      "--sidebar-primary": "12 90% 58%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "215 30% 16%",
      "--sidebar-accent-foreground": "30 30% 93%",
      "--sidebar-border": "215 30% 20%",
      "--sidebar-ring": "12 90% 58%",
    },
  },
  {
    id: "emerald-night",
    name: "Emerald Night",
    description: "Dark forest with emerald & gold luxury",
    mode: "dark",
    preview: ["#0d1710", "#10b981", "#22c55e", "#eab308"],
    vars: {
      "--background": "150 25% 5%",
      "--foreground": "80 15% 92%",
      "--card": "150 20% 9%",
      "--card-foreground": "80 15% 92%",
      "--popover": "150 20% 9%",
      "--popover-foreground": "80 15% 92%",
      "--primary": "160 84% 39%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "48 96% 53%",
      "--secondary-foreground": "150 25% 5%",
      "--muted": "150 15% 14%",
      "--muted-foreground": "150 10% 50%",
      "--accent": "142 71% 45%",
      "--accent-foreground": "0 0% 100%",
      "--border": "150 15% 17%",
      "--input": "150 15% 17%",
      "--ring": "160 84% 39%",
      "--glass-bg": "150 20% 9% / 0.4",
      "--glass-border": "150 15% 28% / 0.3",
      "--glass-highlight": "80 15% 95% / 0.05",
      "--sidebar-background": "150 20% 7%",
      "--sidebar-foreground": "80 15% 92%",
      "--sidebar-primary": "160 84% 39%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "150 15% 14%",
      "--sidebar-accent-foreground": "80 15% 92%",
      "--sidebar-border": "150 15% 17%",
      "--sidebar-ring": "160 84% 39%",
    },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description: "Rich purple with violet & rose accents",
    mode: "dark",
    preview: ["#110d1d", "#8b5cf6", "#a855f7", "#f43f5e"],
    vars: {
      "--background": "260 30% 7%",
      "--foreground": "270 15% 93%",
      "--card": "260 25% 11%",
      "--card-foreground": "270 15% 93%",
      "--popover": "260 25% 11%",
      "--popover-foreground": "270 15% 93%",
      "--primary": "262 83% 58%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "340 82% 52%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "260 20% 15%",
      "--muted-foreground": "260 10% 52%",
      "--accent": "280 70% 55%",
      "--accent-foreground": "0 0% 100%",
      "--border": "260 20% 19%",
      "--input": "260 20% 19%",
      "--ring": "262 83% 58%",
      "--glass-bg": "260 25% 11% / 0.4",
      "--glass-border": "260 20% 30% / 0.3",
      "--glass-highlight": "270 15% 95% / 0.05",
      "--sidebar-background": "260 25% 9%",
      "--sidebar-foreground": "270 15% 93%",
      "--sidebar-primary": "262 83% 58%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "260 20% 15%",
      "--sidebar-accent-foreground": "270 15% 93%",
      "--sidebar-border": "260 20% 19%",
      "--sidebar-ring": "262 83% 58%",
    },
  },
  {
    id: "crimson-slate",
    name: "Crimson Slate",
    description: "Charcoal slate with fiery crimson & warm orange",
    mode: "dark",
    preview: ["#141418", "#dc2626", "#ef4444", "#f97316"],
    vars: {
      "--background": "240 10% 6%",
      "--foreground": "20 15% 93%",
      "--card": "240 8% 10%",
      "--card-foreground": "20 15% 93%",
      "--popover": "240 8% 10%",
      "--popover-foreground": "20 15% 93%",
      "--primary": "0 72% 51%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "25 95% 53%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "240 8% 14%",
      "--muted-foreground": "240 5% 52%",
      "--accent": "14 80% 50%",
      "--accent-foreground": "0 0% 100%",
      "--border": "240 8% 18%",
      "--input": "240 8% 18%",
      "--ring": "0 72% 51%",
      "--glass-bg": "240 8% 10% / 0.4",
      "--glass-border": "240 8% 28% / 0.3",
      "--glass-highlight": "20 15% 95% / 0.05",
      "--sidebar-background": "240 8% 8%",
      "--sidebar-foreground": "20 15% 93%",
      "--sidebar-primary": "0 72% 51%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "240 8% 14%",
      "--sidebar-accent-foreground": "20 15% 93%",
      "--sidebar-border": "240 8% 18%",
      "--sidebar-ring": "0 72% 51%",
    },
  },
];

const lightThemes: ThemeConfig[] = [
  {
    id: "light-classic",
    name: "Light Classic",
    description: "Clean white with warm amber accents",
    mode: "light",
    preview: ["#ffffff", "#d4930d", "#f5f5f4", "#1a8a7a"],
    vars: {
      "--background": "0 0% 98%",
      "--foreground": "220 20% 12%",
      "--card": "0 0% 100%",
      "--card-foreground": "220 20% 12%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "220 20% 12%",
      "--primary": "38 92% 45%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "174 60% 30%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "220 15% 93%",
      "--muted-foreground": "220 10% 45%",
      "--accent": "28 80% 48%",
      "--accent-foreground": "0 0% 100%",
      "--border": "220 15% 88%",
      "--input": "220 15% 88%",
      "--ring": "38 92% 45%",
      "--glass-bg": "0 0% 100% / 0.7",
      "--glass-border": "220 15% 85% / 0.5",
      "--glass-highlight": "0 0% 100% / 0.3",
      "--sidebar-background": "0 0% 97%",
      "--sidebar-foreground": "220 20% 12%",
      "--sidebar-primary": "38 92% 45%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "220 15% 93%",
      "--sidebar-accent-foreground": "220 20% 12%",
      "--sidebar-border": "220 15% 88%",
      "--sidebar-ring": "38 92% 45%",
    },
  },
  {
    id: "light-ocean",
    name: "Light Ocean",
    description: "Soft blue tones with coral highlights",
    mode: "light",
    preview: ["#f8fafc", "#ff6b4a", "#e2ecf5", "#1e90c8"],
    vars: {
      "--background": "210 40% 98%",
      "--foreground": "215 45% 12%",
      "--card": "0 0% 100%",
      "--card-foreground": "215 45% 12%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "215 45% 12%",
      "--primary": "12 90% 55%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "200 65% 42%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "210 30% 92%",
      "--muted-foreground": "215 15% 45%",
      "--accent": "35 90% 50%",
      "--accent-foreground": "0 0% 100%",
      "--border": "210 20% 87%",
      "--input": "210 20% 87%",
      "--ring": "12 90% 55%",
      "--glass-bg": "0 0% 100% / 0.7",
      "--glass-border": "210 20% 85% / 0.5",
      "--glass-highlight": "0 0% 100% / 0.3",
      "--sidebar-background": "210 30% 96%",
      "--sidebar-foreground": "215 45% 12%",
      "--sidebar-primary": "12 90% 55%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "210 30% 92%",
      "--sidebar-accent-foreground": "215 45% 12%",
      "--sidebar-border": "210 20% 87%",
      "--sidebar-ring": "12 90% 55%",
    },
  },
  {
    id: "light-emerald",
    name: "Light Emerald",
    description: "Fresh white with emerald green accents",
    mode: "light",
    preview: ["#fafaf8", "#10b981", "#ecf5f0", "#eab308"],
    vars: {
      "--background": "80 15% 97%",
      "--foreground": "150 25% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "150 25% 10%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "150 25% 10%",
      "--primary": "160 84% 36%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "48 96% 48%",
      "--secondary-foreground": "150 25% 10%",
      "--muted": "150 15% 92%",
      "--muted-foreground": "150 10% 42%",
      "--accent": "142 71% 40%",
      "--accent-foreground": "0 0% 100%",
      "--border": "150 12% 86%",
      "--input": "150 12% 86%",
      "--ring": "160 84% 36%",
      "--glass-bg": "0 0% 100% / 0.7",
      "--glass-border": "150 12% 84% / 0.5",
      "--glass-highlight": "0 0% 100% / 0.3",
      "--sidebar-background": "150 15% 96%",
      "--sidebar-foreground": "150 25% 10%",
      "--sidebar-primary": "160 84% 36%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "150 15% 92%",
      "--sidebar-accent-foreground": "150 25% 10%",
      "--sidebar-border": "150 12% 86%",
      "--sidebar-ring": "160 84% 36%",
    },
  },
];

export const themes: ThemeConfig[] = [...darkThemes, ...lightThemes];

const THEME_KEY = "site-theme";
const MODE_KEY = "site-mode";

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (id: string) => void;
  mode: "dark" | "light";
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes[0],
  setTheme: () => {},
  mode: "dark",
  toggleMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const applyTheme = (theme: ThemeConfig) => {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  // Update glass-strong background for light mode
  if (theme.mode === "light") {
    root.style.setProperty("--glass-strong-bg", "0 0% 100% / 0.85");
  } else {
    root.style.setProperty("--glass-strong-bg", "220 18% 8% / 0.7");
  }
  root.classList.toggle("dark", theme.mode === "dark");
  root.classList.toggle("light", theme.mode === "light");
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return themes.find((t) => t.id === saved) || themes[0];
  });

  const mode = currentTheme.mode;

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const setTheme = (id: string) => {
    const theme = themes.find((t) => t.id === id);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(THEME_KEY, id);
      localStorage.setItem(MODE_KEY, theme.mode);
    }
  };

  const toggleMode = () => {
    if (mode === "dark") {
      // Switch to light variant or first light theme
      const lightEquivalent = lightThemes[0];
      setTheme(lightEquivalent.id);
    } else {
      // Switch to dark variant or first dark theme
      const darkEquivalent = darkThemes[0];
      setTheme(darkEquivalent.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
