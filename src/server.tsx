import { HydrationScript } from "solid-js/web";
import { Router } from "@solidjs/router";
import App from "./App.tsx";

export default function Root() {
  return (
    <Router>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href="/client.css" />
          <HydrationScript />
          <script type="module" src="./client.js"></script>
        </head>
        <body>
          <div id="app">
            <App />
          </div>
        </body>
      </html>
    </Router>
  );
}
