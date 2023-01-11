import { HydrationScript } from "solid-js/web";
import App from "./App.tsx";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/client.css" />
        <HydrationScript />
      </head>
      <body>
        <div id="app">
          <App />
        </div>
        <script type="module" src="./client.js"></script>
      </body>
    </html>
  );
}
