"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

function ThemeClockInitializer({ storageKey }: { storageKey: string }) {
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      return;
    }

    const currentHour = new Date().getHours();
    const defaultTheme = currentHour >= 19 || currentHour < 7 ? "dark" : "light";
    setTheme(defaultTheme);
  }, [setTheme, storageKey]);

  return null;
}

export function ThemeProvider({
  children,
  storageKey = "theme",
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider storageKey={storageKey} {...props}>
      <ThemeClockInitializer storageKey={storageKey} />
      {children}
    </NextThemesProvider>
  );
}
