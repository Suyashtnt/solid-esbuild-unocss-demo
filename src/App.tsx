import { lazy } from "solid-js";
import { A, Route, Router, Routes } from "@solidjs/router";

import "uno.css";
import Logo from "./logo.svg";

const Home = lazy(() => import("./routes/Home.tsx"));

export default function App() {
  return (
    <>
      <Router>
        <header class="flex flex-row gap-3">
          <Logo class="block w-32" />
          <h1>SolidJS + Deno + Unocss</h1>

          <nav>
            <A href="/about">About</A>
            <A href="/">Home</A>
          </nav>
        </header>

        <Routes>
          <Route path="/" component={Home} />
        </Routes>
      </Router>
    </>
  );
}
