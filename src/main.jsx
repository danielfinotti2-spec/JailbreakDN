import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource-variable/inter";
import "./styles/app.css";
import "./styles/animations.css";
import Root from "./Root.jsx";

createRoot(document.getElementById("root")).render(<Root />);
