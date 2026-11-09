import { useState } from "react";
import { ClockEditor } from "@/components/clock-editor";
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
  formatHarptosDate,
  formatHarptosTime,
  getHarptosYearTitle,
  toElapsedMinutes,
  type HarptosDateTime,
} from "./harptos.ts";
import { campaignLocations, locationIds } from "./locations.ts";
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

export function App({ initialView, initialShareStatus }: {
  initialView: CampaignView;
  initialShareStatus: ReturnType<typeof readSharedCampaign>["status"];
}) {
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
  const summary = formatCampaignSummary(dateTime, phase, weather);
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
        <p className="eyebrow ledger-kicker"><span className="ledger-seal" aria-hidden="true">✧</span> Dungeon Master’s ledger</p>
        <h1>Harptos Calendar <span>Tracker</span></h1>
        <p className="ledger-subtitle">{activeLocation.name} · {activeLocation.region}</p>
      </header>

      {isPreview ? (
        <section className="share-preview" aria-labelledby="share-preview-heading">
          <h2 className="eyebrow" id="share-preview-heading">Shared campaign preview</h2>
          <p>Adopt this moment to replace your saved campaign and enable editing.</p>
          <div className="share-actions">
            <Button onClick={adoptSharedCampaign}>Adopt Shared Campaign</Button>
            <Button variant="outline" onClick={() => finishPreview(loadSavedCampaign())}>Back to Saved Campaign</Button>
          </div>
        </section>
      ) : null}
      {initialShareStatus === "invalid" ? (
        <p className="clock-notice" role="status">This share link is invalid or unsupported. Showing your local campaign.</p>
      ) : null}

      <section aria-labelledby="clock-heading">
        <Card className="clock-panel py-0">
          <CardContent className="clock-layout">
            <div>
              <h2 className="eyebrow clock-label" id="clock-heading">Campaign clock</h2>
              <div id="campaign-clock" aria-live="polite" aria-atomic="true">
                <time className="clock-time" dateTime={time}>{time}</time>
                <p className="clock-date">{formatHarptosDate(date)}</p>
                {yearTitle ? <p className="clock-year">{yearTitle}</p> : null}
                <dl className="clock-markers">
                  <div>
                    <dt>Time phase</dt>
                    <dd className="clock-phase">{phase}</dd>
                  </div>
                  <div>
                    <dt>Clock marker</dt>
                    <dd className="clock-marker">{marker}</dd>
                  </div>
                  <div>
                    <dt>Hourly weather</dt>
                    <dd className="clock-weather">{weather}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="clock-solar">
              <ClockDial hour={hour} minute={minute} />
              <section className="daylight-readout" aria-labelledby="daylight-heading" aria-live="polite" aria-atomic="true">
                <h3 className="eyebrow" id="daylight-heading">{isSolar ? "Daylight estimates" : "Ambient light"} · {activeLocation.name}</h3>
                {lightEvents.length ? <dl className="daylight-times">
                  {lightEvents.map(([label, minutes]) => {
                    const eventTime = formatHarptosTime({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
                    return (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd><time dateTime={eventTime}>{eventTime}</time></dd>
                      </div>
                    );
                  })}
                </dl> : <p className="daylight-note">Steady Auroral Diamond light</p>}
              </section>
            </div>
          </CardContent>
          <CardContent className="clock-controls">
            {!isPreview ? (
              <div className="clock-actions">
                <ClockEditor dateTime={dateTime} onSetTime={setCurrentTime} />
                <div className="advance-buttons" role="group" aria-label="Advance time">
                  {advances.map(({ hours, label }) => (
                    <Button key={hours} variant="outline" onClick={() => advanceClock(hours)}>{label}</Button>
                  ))}
                </div>
              </div>
            ) : null}
            {notice ? <p className="clock-notice" role="status">{notice}</p> : null}
            <div className="campaign-summary-row">
              <div className="campaign-summary">
                <label className="eyebrow" htmlFor="campaign-summary">Campaign summary</label>
                <div className="summary-copy-field">
                  <input id="campaign-summary" type="text" readOnly value={summary} onClick={(event) => event.currentTarget.select()} />
                  <Button
                    variant="outline"
                    aria-label="Copy campaign summary"
                    title="Copy campaign summary"
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
                {showShareLink ? "Hide Share Link" : "Share Campaign"}
              </Button>
            </div>
            <p className="summary-copy-status" role="status">
              {copyResult?.target === "summary" && copyResult.value === summary ? copyResult.message : ""}
            </p>
            <div id="campaign-share-link" hidden={!showShareLink}>
              {showShareLink ? <>
                <label className="campaign-summary">
                  <span className="eyebrow">Share link</span>
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    onFocus={(event) => event.currentTarget.select()}
                    onClick={(event) => event.currentTarget.select()}
                  />
                </label>
                <div className="share-actions">
                  <Button variant="outline" onClick={() => copyText("link", shareUrl)}>Copy Link</Button>
                  <span className="share-status" role="status">
                    {copyResult?.target === "link" && copyResult.value === shareUrl ? copyResult.message : ""}
                  </span>
                </div>
              </> : null}
            </div>
          </CardContent>
        </Card>
      </section>

      <fieldset className="campaign-setting" disabled={isPreview}>
        <legend className="eyebrow setting-heading">Campaign location</legend>
        <div className="location-grid">
          {locationIds.map((id) => {
            const location = campaignLocations[id];
            return <Card key={id} className="location-panel py-0" data-location={id}>
              <CardContent className="grow p-0">
                <label className="location-content">
                  <span className="location-copy">
                    <span className="eyebrow location-region">{location.region}</span>
                    <span className="location-name" id={`${id}-name`}>{location.name}</span>
                    <span className="location-detail" id={`${id}-detail`}>{location.detail}</span>
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
