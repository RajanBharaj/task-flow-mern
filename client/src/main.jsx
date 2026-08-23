// src/main.jsx
//
// The React entry point — mounts the <App /> component into the
// <div id="root"> defined in index.html.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
