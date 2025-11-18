// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/Routes.jsx";

// Compute the correct base path (e.g., "/beekeeper-dev" on Netlify, "/" in local dev)
const basename =
  (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "/";

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
}
