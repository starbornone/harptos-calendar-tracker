import { useState } from "react";
import { makeShareUrl, type CampaignState } from "../campaign-state.ts";
import { translate, type Locale, type MessageId } from "../localization.ts";
import { Button } from "./ui/button";

export function CampaignSummary({ campaign, summary, isPreview, locale }: {
  campaign: CampaignState;
  summary: string;
  isPreview: boolean;
  locale: Locale;
}) {
  const t = (id: MessageId) => translate(locale, id);
  // Leaving the preview closes its share link.
  const [shareLinkMode, setShareLinkMode] = useState<"preview" | "editing">();
  const mode = isPreview ? "preview" : "editing";
  const showShareLink = shareLinkMode === mode;
  const [copyResult, setCopyResult] = useState<{ target: "summary" | "link"; value: string; message: MessageId }>();
  const shareUrl = showShareLink ? makeShareUrl(new URL(window.location.href), campaign) : "";

  async function copyText(target: "summary" | "link", value: string) {
    let message: MessageId;
    try {
      await navigator.clipboard.writeText(value);
      message = target === "summary" ? "summary.copied" : "share.copied";
    } catch {
      message = target === "summary" ? "summary.copyFallback" : "share.copyFallback";
    }
    setCopyResult({ target, value, message });
  }

  return (
    <>
      <div className="campaign-summary-row">
        <div className="campaign-summary">
          <label className="eyebrow" htmlFor="campaign-summary">{t("summary.label")}</label>
          <div className="summary-copy-field">
            <input id="campaign-summary" type="text" readOnly value={summary} onClick={(event) => event.currentTarget.select()} />
            <Button
              variant="outline"
              aria-label={t("summary.copy")}
              title={t("summary.copy")}
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
          {t(showShareLink ? "share.hide" : "share.open")}
        </Button>
      </div>
      <p className="summary-copy-status" role="status">
        {copyResult?.target === "summary" && copyResult.value === summary ? t(copyResult.message) : ""}
      </p>
      <div id="campaign-share-link" hidden={!showShareLink}>
        {showShareLink ? <>
          <label className="campaign-summary">
            <span className="eyebrow">{t("share.link")}</span>
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(event) => event.currentTarget.select()}
              onClick={(event) => event.currentTarget.select()}
            />
          </label>
          <div className="share-actions">
            <Button variant="outline" onClick={() => copyText("link", shareUrl)}>{t("share.copy")}</Button>
            <span className="share-status" role="status">
              {copyResult?.target === "link" && copyResult.value === shareUrl ? t(copyResult.message) : ""}
            </span>
          </div>
        </> : null}
      </div>
    </>
  );
}
