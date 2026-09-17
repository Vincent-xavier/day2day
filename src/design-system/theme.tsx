import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "system" | "light" | "dark";
export type ThemePalette = {
  mode: "light" | "dark";
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceRaised: string;
  text: string;
  muted: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  positive: string;
  negative: string;
  warning: string;
  onAccent: string;
};

export const darkPalette: ThemePalette = {
  mode: "dark",
  background: "#0d1718",
  surface: "#142223",
  surfaceMuted: "#1a2d2d",
  surfaceRaised: "#203939",
  text: "#f3f7f4",
  muted: "#9aafaa",
  border: "#2b4543",
  borderStrong: "#3c625d",
  accent: "#63c7a5",
  accentSoft: "#1e4a42",
  accentText: "#a8ecd2",
  positive: "#63c7a5",
  negative: "#ef9292",
  warning: "#e4b06f",
  onAccent: "#08201b",
};

export const lightPalette: ThemePalette = {
  mode: "light",
  background: "#f7f4ee",
  surface: "#fffdf9",
  surfaceMuted: "#f0eee8",
  surfaceRaised: "#e6f2ed",
  text: "#203032",
  muted: "#52635f",
  border: "#dedbd2",
  borderStrong: "#b8cbc3",
  accent: "#287a66",
  accentSoft: "#dceee7",
  accentText: "#17614f",
  positive: "#287a66",
  negative: "#ad4545",
  warning: "#ad762d",
  onAccent: "#ffffff",
};

let activePalette = darkPalette;
export const getActivePalette = () => activePalette;
export const setActivePalette = (palette: ThemePalette) => {
  activePalette = palette;
};

export const colors = new Proxy({} as ThemePalette, {
  get: (_, property: keyof ThemePalette) => activePalette[property],
});

const ThemeContext = createContext<{
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  palette: ThemePalette;
  setMode: (mode: ThemeMode) => void;
}>({
  mode: "system",
  resolvedMode: "dark",
  palette: darkPalette,
  setMode: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("day2day_theme_mode")
      .then((stored) => {
        if (stored === "system" || stored === "light" || stored === "dark") {
          setMode(stored);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const resolvedMode =
    mode === "system" ? (systemScheme === "light" ? "light" : "dark") : mode;
  const palette = resolvedMode === "light" ? lightPalette : darkPalette;
  setActivePalette(palette);

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      palette,
      setMode: (nextMode: ThemeMode) => {
        setMode(nextMode);
        void SecureStore.setItemAsync("day2day_theme_mode", nextMode);
      },
    }),
    [mode, palette, resolvedMode],
  );

  if (!loaded) return children;
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
