import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { AppRoutes } from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
);
