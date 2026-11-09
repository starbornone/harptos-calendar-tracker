import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadSavedCampaign, readSharedCampaign } from "./campaign-state.ts";
import "./index.css";

const shared = readSharedCampaign(new URL(window.location.href));
const initialView = shared.status === "valid"
  ? { campaign: shared.campaign, notice: "" }
  : loadSavedCampaign();

createRoot(document.getElementById("root")!).render(
  <App initialView={initialView} initialShareStatus={shared.status} />,
);
