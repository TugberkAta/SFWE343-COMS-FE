import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { AppRoutes } from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/useTheme";

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
      <button
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="fixed top-4 right-4 z-50 inline-flex items-center justify-center rounded-md px-2 py-1 bg-white text-black dark:bg-[var(--layer-0)] dark:text-[var(--text-main)] border border-gray-200 dark:border-[rgba(255,255,255,0.1)]"
    >
      {dark ? "☀" : "🌙"}
    </button>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <ThemeToggle />
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
