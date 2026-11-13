import { useState } from "react";
import { makeShareUrl, type CampaignState } from "../campaign-state.ts";
import { translate, type Locale } from "../localization.ts";
import { Button } from "./ui/button";

export function CampaignSummary({ campaign, summary, isPreview, locale }: {
  campaign: CampaignState;
  summary: string;
  isPreview: boolean;
  locale: Locale;
}) {
  const t = (label: string) => translate(locale, label);
  // Leaving the preview closes its share link.
  const [shareLinkMode, setShareLinkMode] = useState<"preview" | "editing">();
  const mode = isPreview ? "preview" : "editing";
  const showShareLink = shareLinkMode === mode;
  const [copyResult, setCopyResult] = useState<{ target: "summary" | "link"; value: string; message: string }>();
  const shareUrl = showShareLink ? makeShareUrl(new URL(window.location.href), campaign) : "";

  async function copyText(target: "summary" | "link", value: string) {
    const label = target === "summary" ? "Campaign summary" : "Share link";
    let message: string;
    try {
      await navigator.clipboard.writeText(value);
      message = `${label} copied.`;
    } catch {
      message = `Select the ${label.toLowerCase()} field and copy it manually.`;
    }
    setCopyResult({ target, value, message });
  }

  return (
    <>
      <div className="campaign-summary-row">
        <div className="campaign-summary">
          <label className="eyebrow" htmlFor="campaign-summary">{t("Campaign summary")}</label>
          <div className="summary-copy-field">
            <input id="campaign-summary" type="text" readOnly value={summary} onClick={(event) => event.currentTarget.select()} />
            <Button
              variant="outline"
              aria-label={t("Copy campaign summary")}
              title={t("Copy campaign summary")}
              onClick={() => copyText("summary", summary)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="8" y="8" width="13" height="13" rx="2" />
                <path d="M5 16H4a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2h10a1 1 0 0 1 1 1v1" />
              </svg>
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          aria-expanded={showShareLink}
          aria-controls="campaign-share-link"
          onClick={() => {
            setCopyResult(undefined);
            setShareLinkMode(showShareLink ? undefined : mode);
          }}
        >
          {t(showShareLink ? "Hide Share Link" : "Share Campaign")}
        </Button>
      </div>
      <p className="summary-copy-status" role="status">
        {copyResult?.target === "summary" && copyResult.value === summary ? t(copyResult.message) : ""}
      </p>
      <div id="campaign-share-link" hidden={!showShareLink}>
        {showShareLink ? <>
          <label className="campaign-summary">
            <span className="eyebrow">{t("Share link")}</span>
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(event) => event.currentTarget.select()}
              onClick={(event) => event.currentTarget.select()}
            />
          </label>
          <div className="share-actions">
            <Button variant="outline" onClick={() => copyText("link", shareUrl)}>{t("Copy Link")}</Button>
            <span className="share-status" role="status">
              {copyResult?.target === "link" && copyResult.value === shareUrl ? t(copyResult.message) : ""}
            </span>
          </div>
        </> : null}
      </div>
    </>
  );
}
