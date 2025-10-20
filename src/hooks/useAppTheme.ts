import { useTheme } from "@/context/ThemeContext";

export const useAppTheme = () => {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return {
    isDark,
  };
};
