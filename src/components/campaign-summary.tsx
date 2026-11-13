import { useState } from "react";
import { Button } from "@/components/ui/button";
import { message, type MessageId, type Locale } from "@/localization.ts";
import { makeShareUrl, type CampaignState } from "@/campaign-state.ts";

export function CampaignSummary({
  campaign,
  summary,
  locale,
}: {
  campaign: CampaignState;
  summary: string;
  locale: Locale;
}) {
  const t = (id: MessageId) => message(locale, id);
  const [showShareLink, setShowShareLink] = useState(false);
  const [copyResult, setCopyResult] = useState<{
    target: "summary" | "link";
    value: string;
    message: MessageId;
  }>();
  const shareUrl = showShareLink ? makeShareUrl(new URL(window.location.href), campaign) : "";

  async function copyText(target: "summary" | "link", value: string) {
    let message: MessageId;
    try {
      await navigator.clipboard.writeText(value);
      message = target === "summary" ? "campaignSummaryCopied" : "shareLinkCopied";
    } catch {
      message = target === "summary" ? "summaryCopyFallback" : "linkCopyFallback";
    }
    setCopyResult({ target, value, message });
  }

  return (
    <>
      <div className="campaign-summary-row">
        <div className="campaign-summary">
          <label className="eyebrow" htmlFor="campaign-summary">
            {t("campaignSummary")}
          </label>
          <div className="summary-copy-field">
            <input
              id="campaign-summary"
              type="text"
              readOnly
              value={summary}
              onClick={(event) => event.currentTarget.select()}
            />
            <Button
              variant="outline"
              aria-label={t("copyCampaignSummary")}
              title={t("copyCampaignSummary")}
              onClick={() => copyText("summary", summary)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
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
            setShowShareLink(!showShareLink);
          }}
        >
          {t(showShareLink ? "hideShareLink" : "shareCampaign")}
        </Button>
      </div>
      <p className="summary-copy-status" role="status">
        {copyResult?.target === "summary" && copyResult.value === summary ? t(copyResult.message) : ""}
      </p>
      <div id="campaign-share-link" hidden={!showShareLink}>
        {showShareLink ? (
          <>
            <label className="campaign-summary">
              <span className="eyebrow">{t("shareLink")}</span>
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(event) => event.currentTarget.select()}
                onClick={(event) => event.currentTarget.select()}
              />
            </label>
            <div className="share-actions">
              <Button variant="outline" onClick={() => copyText("link", shareUrl)}>
                {t("copyLink")}
              </Button>
              <span className="share-status" role="status">
                {copyResult?.target === "link" && copyResult.value === shareUrl ? t(copyResult.message) : ""}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
