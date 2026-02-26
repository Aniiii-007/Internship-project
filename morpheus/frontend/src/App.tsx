/*import AppRouter from "./router";

export default function App() {
  return <AppRouter />;
}*/

import AppRouter from "./router";
import { useSocketInit } from "./hooks/useChat";

function SocketInitializer() {
  useSocketInit();
  return null;
}

export default function App() {
  return (
    <>
      <SocketInitializer />
      <AppRouter />
    </>
  );
}
