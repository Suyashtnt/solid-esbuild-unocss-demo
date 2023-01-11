import { hydrate } from "solid-js/web";
import App from "./App.tsx";

hydrate(() => <App />, document.getElementById("app")!);
