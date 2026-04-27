import { Analytics } from "@vercel/analytics/react";
import Game from "./components/Game.jsx";

export default function App() {
  return (
    <>
      <Game />
      <Analytics />
    </>
  );
}