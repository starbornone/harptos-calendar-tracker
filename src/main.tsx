import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadSavedCampaign, readSharedCampaign, type CampaignView } from "./campaign-state.ts";
import "./index.css";

const shared = readSharedCampaign(new URL(window.location.href));
const initialView: CampaignView =
  shared.status === "valid" ? { campaign: shared.campaign, notice: "" } : loadSavedCampaign();

const root = document.getElementById("root");
if (!root) throw new Error("Missing tracker root element.");

createRoot(root).render(<App initialView={initialView} initialShareStatus={shared.status} />);
