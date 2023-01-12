import { hydrate } from "solid-js/web";
import App from "./App.tsx";
import { Router } from "@solidjs/router";

hydrate(() => (
  <Router>
    <App />
  </Router>
), document.getElementById("app")!);
