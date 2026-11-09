import { useEffect, useState } from "react";
import { ClockEditor } from "@/components/clock-editor";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  clearShareUrl,
  loadSavedCampaign,
  makeShareUrl,
  saveCampaign,
  updateSavedCampaign,
  type CampaignState,
  type CampaignView,
  type readSharedCampaign,
} from "./campaign-state.ts";
import { formatCampaignSummary } from "./campaign-summary.ts";
import { getSeasonalDaylight } from "./daylight.ts";
import {
  advanceHours,
  formatHarptosTime,
  getHarptosYearTitle,
  toElapsedMinutes,
  type HarptosDateTime,
} from "./harptos.ts";
import { campaignLocations, locationIds } from "./locations.ts";
import { formatLocalizedDate, translate, type Locale } from "./localization.ts";
import { getFaerunianTime } from "./time-markers.ts";
import { getHourlyWeather } from "./weather.ts";

const dialTicks = Array.from({ length: 60 }, (_, minute) => minute);

const advances = [
  { hours: 1, label: "+1 hour" },
  { hours: 2, label: "+2 hours" },
  { hours: 4, label: "+4 hours" },
  { hours: 8, label: "+8 hours" },
  { hours: 24, label: "+1 day" },
  { hours: 240, label: "+10 days" },
];

function ClockDial({ hour, minute }: { hour: number; minute: number }) {
  return (
    <svg className="clock-dial" viewBox="0 0 240 240" aria-hidden="true">
      <g fill="none" stroke="currentColor">
        <circle cx="120" cy="120" r="113" opacity=".24" />
        <circle cx="120" cy="120" r="103" opacity=".55" />
        <circle cx="120" cy="120" r="85" opacity=".22" />
        <circle cx="120" cy="120" r="57" opacity=".25" strokeDasharray="1 5" />
        <path d="M120 7v18m0 190v18M7 120h18m190 0h18" opacity=".6" />
        {dialTicks.map((tick) => (
          <path
            key={tick}
            d={tick % 5 === 0 ? "M120 22v9" : "M120 23v4"}
            opacity={tick % 5 === 0 ? ".85" : ".4"}
            transform={`rotate(${tick * 6} 120 120)`}
          />
        ))}
        <path d="M120 130V71" transform={`rotate(${hour * 30 + minute / 2} 120 120)`} strokeWidth="3" strokeLinecap="round" />
        <path d="M120 130V53" transform={`rotate(${minute * 6} 120 120)`} strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <circle cx="120" cy="120" r="5" fill="currentColor" />
    </svg>
  );
}

type AppProps = {
  initialView: CampaignView;
  initialShareStatus: ReturnType<typeof readSharedCampaign>["status"];
};

const languageKey = "harptos-calendar-tracker:language";

export function App(props: AppProps) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return localStorage.getItem(languageKey) === "zh-Hans" ? "zh-Hans" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, "Harptos Calendar Tracker");
  }, [locale]);

  function switchToEnglish() {
    setLocale("en");
    try {
      localStorage.setItem(languageKey, "en");
    } catch {
      // The language can still change for this tab.
    }
  }

  return (
    <>
      <CampaignLedger {...props} locale={locale} onSwitchToEnglish={switchToEnglish} />
      <SiteFooter locale={locale} />
    </>
  );
}

function CampaignLedger({ initialView, initialShareStatus, locale, onSwitchToEnglish }: AppProps & {
  locale: Locale;
  onSwitchToEnglish: () => void;
}) {
  const t = (label: string) => translate(locale, label);
  const [{ campaign, notice }, setView] = useState(initialView);
  const [isPreview, setIsPreview] = useState(initialShareStatus === "valid");
  const [showShareLink, setShowShareLink] = useState(false);
  const [copyResult, setCopyResult] = useState<{ target: "summary" | "link"; value: string; message: string }>();
  const { dateTime, locationId, weatherSeed } = campaign;
  const { date, hour, minute } = dateTime;
  const time = formatHarptosTime(dateTime);
  const yearTitle = getHarptosYearTitle(date.year);
  const activeLocation = campaignLocations[locationId];
  const daylight = getSeasonalDaylight(date, locationId);
  const isSolar = "sunrise" in daylight;
  const lightEvents: readonly (readonly [string, number])[] = isSolar
    ? [["Sunrise", daylight.sunrise], ["Sunset", daylight.sunset]]
    : "peak" in daylight ? [["Peak", daylight.peak], ["Antipeak", daylight.antipeak]] : [];
  const { phase, marker } = getFaerunianTime(dateTime, daylight);
  const weather = getHourlyWeather(dateTime, locationId, weatherSeed);
  const summary = formatCampaignSummary(dateTime, phase, weather, locale);
  const shareUrl = showShareLink ? makeShareUrl(new URL(window.location.href), campaign) : "";

  function setCurrentTime(next: HarptosDateTime) {
    toElapsedMinutes(next);
    updateCampaign({ dateTime: next });
  }

  function updateCampaign(change: Partial<Pick<CampaignState, "dateTime" | "locationId">>) {
    try {
      setView({ campaign: updateSavedCampaign(campaign, change), notice: "" });
    } catch {
      setView({ campaign: { ...campaign, ...change }, notice: "Campaign updated for this tab. Your browser could not save it for reload." });
    }
  }

  function advanceClock(hours: number) {
    try {
      setCurrentTime(advanceHours(dateTime, hours));
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      setView((current) => ({ ...current, notice: error.message }));
    }
  }

  function finishPreview(next: CampaignView) {
    window.history.replaceState(window.history.state, "", clearShareUrl(new URL(window.location.href)));
    setIsPreview(false);
    setShowShareLink(false);
    setView(next);
  }

  function adoptSharedCampaign() {
    try {
      saveCampaign(campaign);
    } catch {
      setView({ campaign, notice: "Your browser could not save the shared campaign. The preview is still open." });
      return;
    }
    finishPreview({ campaign, notice: "Shared campaign adopted and saved in this browser." });
  }

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
    <main className="ledger">
      <header className="ledger-header">
        <div className="ledger-header-tools">
          <p className="eyebrow ledger-kicker"><span className="ledger-seal" aria-hidden="true">✧</span> {t("Dungeon Master’s ledger")}</p>
          {locale === "zh-Hans" ? (
            <Button variant="outline" lang="en" onClick={onSwitchToEnglish}>Use English</Button>
          ) : null}
        </div>
        <h1>{t("Harptos Calendar")}{locale === "en" ? " " : ""}<span>{t("Tracker")}</span></h1>
        <p className="ledger-subtitle">{t(activeLocation.name)} · {t(activeLocation.region)}</p>
      </header>

      {isPreview ? (
        <section className="share-preview" aria-labelledby="share-preview-heading">
          <h2 className="eyebrow" id="share-preview-heading">{t("Shared campaign preview")}</h2>
          <p>{t("Adopt this moment to replace your saved campaign and enable editing.")}</p>
          <div className="share-actions">
            <Button onClick={adoptSharedCampaign}>{t("Adopt Shared Campaign")}</Button>
            <Button variant="outline" onClick={() => finishPreview(loadSavedCampaign())}>{t("Back to Saved Campaign")}</Button>
          </div>
        </section>
      ) : null}
      {initialShareStatus === "invalid" ? (
        <p className="clock-notice" role="status">{t("This share link is invalid or unsupported. Showing your local campaign.")}</p>
      ) : null}

      <section aria-labelledby="clock-heading">
        <Card className="clock-panel py-0">
          <CardContent className="clock-layout">
            <div>
              <h2 className="eyebrow clock-label" id="clock-heading">{t("Campaign clock")}</h2>
              <div id="campaign-clock" aria-live="polite" aria-atomic="true">
                <time className="clock-time" dateTime={time}>{time}</time>
                <p className="clock-date">{formatLocalizedDate(date, locale)}</p>
                {yearTitle ? <p className="clock-year">{t(yearTitle)}</p> : null}
                <dl className="clock-markers">
                  <div>
                    <dt>{t("Time phase")}</dt>
                    <dd className="clock-phase">{t(phase)}</dd>
                  </div>
                  <div>
                    <dt>{t("Clock marker")}</dt>
                    <dd className="clock-marker">{t(marker)}</dd>
                  </div>
                  <div>
                    <dt>{t("Hourly weather")}</dt>
                    <dd className="clock-weather">{t(weather)}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="clock-solar">
              <ClockDial hour={hour} minute={minute} />
              <section className="daylight-readout" aria-labelledby="daylight-heading" aria-live="polite" aria-atomic="true">
                <h3 className="eyebrow" id="daylight-heading">{t(isSolar ? "Daylight estimates" : "Ambient light")} · {t(activeLocation.name)}</h3>
                {lightEvents.length ? <dl className="daylight-times">
                  {lightEvents.map(([label, minutes]) => {
                    const eventTime = formatHarptosTime({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
                    return (
                      <div key={label}>
                        <dt>{t(label)}</dt>
                        <dd><time dateTime={eventTime}>{eventTime}</time></dd>
                      </div>
                    );
                  })}
                </dl> : <p className="daylight-note">{t("Steady Auroral Diamond light")}</p>}
              </section>
            </div>
          </CardContent>
          <CardContent className="clock-controls">
            {!isPreview ? (
              <div className="clock-actions">
                <ClockEditor dateTime={dateTime} onSetTime={setCurrentTime} locale={locale} />
                <div className="advance-buttons" role="group" aria-label={t("Advance time")}>
                  {advances.map(({ hours, label }) => (
                    <Button key={hours} variant="outline" onClick={() => advanceClock(hours)}>{t(label)}</Button>
                  ))}
                </div>
              </div>
            ) : null}
            {notice ? <p className="clock-notice" role="status">{t(notice)}</p> : null}
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
                  setShowShareLink(!showShareLink);
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
          </CardContent>
        </Card>
      </section>

      <fieldset className="campaign-setting" disabled={isPreview}>
        <legend className="eyebrow setting-heading">{t("Campaign location")}</legend>
        <div className="location-grid">
          {locationIds.map((id) => {
            const location = campaignLocations[id];
            return <Card key={id} className="location-panel py-0" data-location={id}>
              <CardContent className="grow p-0">
                <label className="location-content">
                  <span className="location-copy">
                    <span className="eyebrow location-region">{t(location.region)}</span>
                    <span className="location-name" id={`${id}-name`}>{t(location.name)}</span>
                    <span className="location-detail" id={`${id}-detail`}>{t(location.detail)}</span>
                  </span>
                  <input
                    className="location-radio"
                    type="radio"
                    name="campaign-location"
                    value={id}
                    aria-labelledby={`${id}-name`}
                    aria-describedby={`${id}-detail`}
                    checked={locationId === id}
                    onChange={() => updateCampaign({ locationId: id })}
                  />
                </label>
              </CardContent>
            </Card>;
          })}
        </div>
      </fieldset>
    </main>
  );
}
