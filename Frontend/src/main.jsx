import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom"; // 1. BrowserRouter import කරන්න
// src/main.jsx or src/App.jsx
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 2. App component එක BrowserRouter ඇතුළේ තබන්න */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
