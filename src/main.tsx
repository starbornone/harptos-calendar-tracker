import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

const weatherSeedKey = "harptos-calendar-tracker:weather-seed:v1";

function loadWeatherSeed() {
  try {
    const saved = localStorage.getItem(weatherSeedKey);
    if (saved !== null && /^\d{1,10}$/.test(saved) && Number(saved) <= 0xffff_ffff) {
      return Number(saved);
    }

    const [seed] = crypto.getRandomValues(new Uint32Array(1));
    localStorage.setItem(weatherSeedKey, String(seed));
    return seed;
  } catch {
    return 0;
  }
}

createRoot(document.getElementById("root")!).render(<App weatherSeed={loadWeatherSeed()} />);
