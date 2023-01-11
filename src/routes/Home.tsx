import { createSignal } from "solid-js";

export default function Home() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <h2>Welcome to the demo</h2>
      <p>Here is a counter</p>
      <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>
    </>
  );
}
