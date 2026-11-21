import { useEffect, useState } from "react";
import { CampaignSummary } from "@/components/campaign-summary";
import { ClockEditor } from "@/components/clock-editor";
import { HarptosCalendar } from "@/components/harptos-calendar";
import { LocationSelector } from "@/components/location-selector";
import { SharePreview } from "@/components/share-preview";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  clearShareUrl,
  loadSavedCampaign,
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
  HarptosRangeError,
  toElapsedMinutes,
  type HarptosDateTime,
} from "./harptos.ts";
import {
  formatCampaignDate,
  locationRegions,
  timeLabels,
  translate,
  weatherLabels,
  type Locale,
  type MessageId,
} from "./localization.ts";
import { campaignLocations } from "./locations.ts";
import { getFaerunianTime } from "./time-markers.ts";
import { getHourlyWeather } from "./weather.ts";

const dialTicks = Array.from({ length: 60 }, (_, minute) => minute);

const advances = [
  { hours: 1, label: "clock.advance1h" },
  { hours: 2, label: "clock.advance2h" },
  { hours: 4, label: "clock.advance4h" },
  { hours: 8, label: "clock.advance8h" },
  { hours: 24, label: "clock.advance1d" },
  { hours: 240, label: "clock.advance10d" },
] as const;

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
        <path
          d="M120 130V71"
          transform={`rotate(${hour * 30 + minute / 2} 120 120)`}
          strokeWidth="3"
          strokeLinecap="round"
        />
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
    if (locale === "en") return;

    const englishTitle = document.title;
    document.title = translate(locale, "app.title");
    return () => {
      document.title = englishTitle;
    };
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

function CampaignLedger({
  initialView,
  initialShareStatus,
  locale,
  onSwitchToEnglish,
}: AppProps & {
  locale: Locale;
  onSwitchToEnglish: () => void;
}) {
  const t = (id: MessageId) => translate(locale, id);
  const [{ campaign, notice }, setView] = useState(initialView);
  const [isPreview, setIsPreview] = useState(initialShareStatus === "valid");
  const { dateTime, locationId, weatherSeed } = campaign;
  const { date, hour, minute } = dateTime;
  const time = formatHarptosTime(dateTime);
  const { calendar } = campaignLocations[locationId];
  const yearTitle = calendar === "harptos" ? getHarptosYearTitle(date.year, locale) : null;
  const daylight = getSeasonalDaylight(date, locationId);
  const isSolar = "sunrise" in daylight;
  const lightEvents: readonly (readonly [MessageId, number])[] = isSolar
    ? [
        ["light.sunrise", daylight.sunrise],
        ["time.sunset", daylight.sunset],
      ]
    : "peak" in daylight
      ? [
          ["time.peak", daylight.peak],
          ["time.antipeak", daylight.antipeak],
        ]
      : [];
  const { phase, marker } = getFaerunianTime(dateTime, daylight);
  const weather = getHourlyWeather(dateTime, locationId, weatherSeed);
  const summary = formatCampaignSummary(dateTime, phase, weather, locale, calendar);

  function setCurrentTime(next: HarptosDateTime) {
    toElapsedMinutes(next);
    updateCampaign({ dateTime: next });
  }

  function updateCampaign(change: Partial<Pick<CampaignState, "dateTime" | "locationId">>) {
    try {
      setView({ campaign: updateSavedCampaign(campaign, change), notice: "" });
    } catch {
      setView({ campaign: { ...campaign, ...change }, notice: "save.editFailed" });
    }
  }

  function advanceClock(hours: number) {
    try {
      setCurrentTime(advanceHours(dateTime, hours));
    } catch (error) {
      if (!(error instanceof HarptosRangeError)) throw error;
      setView((current) => ({ ...current, notice: error.messageId }));
    }
  }

  function finishPreview(next: CampaignView) {
    window.history.replaceState(window.history.state, "", clearShareUrl(new URL(window.location.href)));
    setIsPreview(false);
    setView(next);
  }

  function adoptSharedCampaign() {
    try {
      saveCampaign(campaign);
    } catch {
      setView({ campaign, notice: "share.saveFailed" });
      return;
    }
    finishPreview({ campaign, notice: "share.adopted" });
  }

  return (
    <main className="ledger">
      <div className="campaign-hero">
        <header className="ledger-header">
          <div className="ledger-header-tools">
            <img className="ledger-seal" src="/favicon.svg" width="32" height="32" alt="" />
            {locale === "zh-Hans" ? (
              <Button variant="outline" lang="en" onClick={onSwitchToEnglish}>
                Use English
              </Button>
            ) : null}
          </div>
          <h1>
            {t("ledger.title")}
            {locale === "en" ? " " : ""}
            <span className="ledger-title-suffix">{t("ledger.titleSuffix")}</span>
          </h1>
          <p className="ledger-subtitle">
            {t(`location.${locationId}.name`)} · {t(locationRegions[locationId])}
          </p>
        </header>

        <SharePreview
          isPreview={isPreview}
          invalid={initialShareStatus === "invalid"}
          locale={locale}
          onAdopt={adoptSharedCampaign}
          onBack={() => finishPreview(loadSavedCampaign())}
        />

        <section aria-labelledby="clock-heading">
          <Card className="clock-panel py-0">
            <CardContent className="clock-layout">
              <div>
                <h2 className="eyebrow clock-label" id="clock-heading">
                  {t("clock.heading")}
                </h2>
                <div id="campaign-clock" aria-live="polite" aria-atomic="true">
                  <time className="clock-time" dateTime={time}>
                    {time}
                  </time>
                  <p className="clock-date">{formatCampaignDate(dateTime, calendar, locale)}</p>
                  {yearTitle ? <p className="clock-year">{yearTitle}</p> : null}
                  <dl className="clock-markers">
                    <div>
                      <dt>{t("clock.phase")}</dt>
                      <dd className="clock-phase">{t(timeLabels[phase])}</dd>
                    </div>
                    <div>
                      <dt>{t("clock.marker")}</dt>
                      <dd className="clock-marker">{t(timeLabels[marker])}</dd>
                    </div>
                    <div>
                      <dt>{t("clock.weather")}</dt>
                      <dd className="clock-weather">{t(weatherLabels[weather])}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="clock-solar">
                <ClockDial hour={hour} minute={minute} />
                <section
                  className="daylight-readout"
                  aria-labelledby="daylight-heading"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <h3 className="eyebrow" id="daylight-heading">
                    {t(isSolar ? "light.daylight" : "light.ambient")} · {t(`location.${locationId}.name`)}
                  </h3>
                  {lightEvents.length ? (
                    <dl className="daylight-times">
                      {lightEvents.map(([label, minutes]) => {
                        const eventTime = formatHarptosTime({
                          hour: Math.floor(minutes / 60),
                          minute: minutes % 60,
                        });
                        return (
                          <div key={label}>
                            <dt>{t(label)}</dt>
                            <dd>
                              <time dateTime={eventTime}>{eventTime}</time>
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  ) : (
                    <p className="daylight-note">{t("light.auroral")}</p>
                  )}
                </section>
              </div>
            </CardContent>
            <CardContent className="clock-controls">
              {!isPreview ? (
                <div className="clock-actions">
                  <ClockEditor calendar={calendar} dateTime={dateTime} onSetTime={setCurrentTime} locale={locale} />
                  <fieldset className="advance-buttons" aria-label={t("clock.advance")}>
                    {advances.map(({ hours, label }) => (
                      <Button key={hours} variant="outline" onClick={() => advanceClock(hours)}>
                        {t(label)}
                      </Button>
                    ))}
                  </fieldset>
                </div>
              ) : null}
              {notice ? (
                <p className="clock-notice" role="status">
                  {t(notice)}
                </p>
              ) : null}
              <CampaignSummary campaign={campaign} summary={summary} isPreview={isPreview} locale={locale} />
            </CardContent>
          </Card>
        </section>
      </div>

      {calendar === "harptos" ? <HarptosCalendar date={date} locale={locale} /> : null}

      <LocationSelector
        locationId={locationId}
        disabled={isPreview}
        onChange={(id) => updateCampaign({ locationId: id })}
        locale={locale}
      />
    </main>
  );
}
