import { useState } from "react";
import { ClockEditor } from "@/components/clock-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCampaignSummary } from "./campaign-summary.ts";
import { getSeasonalDaylight } from "./daylight.ts";
import {
  CAMPAIGN_START,
  advanceHours,
  formatHarptosDate,
  formatHarptosTime,
  fromElapsedMinutes,
  getHarptosYearTitle,
  toElapsedMinutes,
  type HarptosDateTime,
} from "./harptos.ts";
import { getFaerunianTime } from "./time-markers.ts";
import { getHourlyWeather } from "./weather.ts";

const locations = [
  { id: "neverwinter", name: "Neverwinter", region: "Coastal city", detail: "The warm river below Mount Hotenow." },
  { id: "phandalin", name: "Phandalin", region: "Phandelver frontier", detail: "The trail to Wave Echo Cave." },
] as const;

type LocationId = (typeof locations)[number]["id"];

const dialTicks = Array.from({ length: 60 }, (_, minute) => minute);

const advances = [
  { hours: 1, label: "+1 hour" },
  { hours: 2, label: "+2 hours" },
  { hours: 4, label: "+4 hours" },
  { hours: 8, label: "+8 hours" },
  { hours: 24, label: "+1 day" },
  { hours: 240, label: "+10 days" },
];

const clockStorageKey = "harptos-calendar-tracker:clock:v1";
const locationStorageKey = "harptos-calendar-tracker:location:v1";

function loadClock() {
  try {
    const saved = localStorage.getItem(clockStorageKey);
    if (saved === null) return { dateTime: CAMPAIGN_START, notice: "" };
    if (!/^\d+$/.test(saved)) throw new RangeError("Invalid saved clock.");
    return { dateTime: fromElapsedMinutes(Number(saved)), notice: "" };
  } catch {
    return { dateTime: CAMPAIGN_START, notice: "Could not restore the saved clock. Showing the campaign start." };
  }
}

function loadLocation() {
  const fallback = locations[0];
  try {
    const saved = localStorage.getItem(locationStorageKey);
    const location = locations.find(({ id }) => id === saved) ?? fallback;
    return { id: location.id, notice: "" };
  } catch {
    return { id: fallback.id, notice: `Could not restore the saved location. Showing ${fallback.name}.` };
  }
}

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

export function App({ weatherSeed }: { weatherSeed: number }) {
  const [{ dateTime, notice }, setClock] = useState(loadClock);
  const [{ id: locationId, notice: locationNotice }, setLocation] = useState(loadLocation);
  const { date, hour, minute } = dateTime;
  const time = formatHarptosTime(dateTime);
  const yearTitle = getHarptosYearTitle(date.year);
  const activeLocation = locations.find(({ id }) => id === locationId) ?? locations[0];
  const daylight = getSeasonalDaylight(date, locationId);
  const { sunrise, sunset } = daylight;
  const { phase, marker } = getFaerunianTime(dateTime, daylight);
  const weather = getHourlyWeather(dateTime, locationId, weatherSeed);
  const summary = formatCampaignSummary(dateTime, phase, weather);

  function setCurrentTime(next: HarptosDateTime) {
    const elapsed = toElapsedMinutes(next);
    let notice = "";
    try {
      localStorage.setItem(clockStorageKey, String(elapsed));
    } catch {
      notice = "Clock updated for this tab. Your browser could not save it for reload.";
    }
    setClock({ dateTime: next, notice });
  }

  function advanceClock(hours: number) {
    try {
      setCurrentTime(advanceHours(dateTime, hours));
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      setClock((current) => ({ ...current, notice: error.message }));
    }
  }

  function selectLocation(id: LocationId) {
    let notice = "";
    try {
      localStorage.setItem(locationStorageKey, id);
    } catch {
      notice = "Location updated for this tab. Your browser could not save it for reload.";
    }
    setLocation({ id, notice });
  }

  return (
    <main className="ledger">
      <header className="ledger-header">
        <p className="eyebrow ledger-kicker"><span className="ledger-seal" aria-hidden="true">✧</span> Dungeon Master’s ledger</p>
        <h1>Harptos Calendar <span>Tracker</span></h1>
        <p className="ledger-subtitle">Neverwinter &amp; Phandelver</p>
      </header>

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
                  {marker ? (
                    <div>
                      <dt>Clock marker</dt>
                      <dd className="clock-marker">{marker}</dd>
                    </div>
                  ) : null}
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
                <h3 className="eyebrow" id="daylight-heading">Daylight estimates · {activeLocation.name}</h3>
                <dl className="daylight-times">
                  {([["Sunrise", sunrise], ["Sunset", sunset]] as const).map(([label, minutes]) => {
                    const eventTime = formatHarptosTime({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
                    return (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd><time dateTime={eventTime}>{eventTime}</time></dd>
                      </div>
                    );
                  })}
                </dl>
              </section>
            </div>
          </CardContent>
          <CardContent className="clock-controls">
            <div className="clock-actions">
              <ClockEditor dateTime={dateTime} onSetTime={setCurrentTime} />
              <div className="advance-buttons" role="group" aria-label="Advance time">
                {advances.map(({ hours, label }) => (
                  <Button key={hours} variant="outline" onClick={() => advanceClock(hours)}>{label}</Button>
                ))}
              </div>
            </div>
            {notice ? <p className="clock-notice" role="status">{notice}</p> : null}
            <label className="campaign-summary">
              <span className="eyebrow">Campaign summary</span>
              <input type="text" readOnly value={summary} onClick={(event) => event.currentTarget.select()} />
            </label>
          </CardContent>
        </Card>
      </section>

      <fieldset className="campaign-setting">
        <legend className="eyebrow setting-heading">Campaign location</legend>
        <div className="location-grid">
          {locations.map((location) => (
            <Card key={location.id} className="location-panel py-0" data-location={location.id}>
              <CardContent className="grow p-0">
                <label className="location-content">
                  <span className="location-copy">
                    <span className="eyebrow location-region">{location.region}</span>
                    <span className="location-name" id={`${location.id}-name`}>{location.name}</span>
                    <span className="location-detail" id={`${location.id}-detail`}>{location.detail}</span>
                  </span>
                  <input
                    className="location-radio"
                    type="radio"
                    name="campaign-location"
                    value={location.id}
                    aria-labelledby={`${location.id}-name`}
                    aria-describedby={`${location.id}-detail`}
                    checked={locationId === location.id}
                    onChange={() => selectLocation(location.id)}
                  />
                </label>
              </CardContent>
            </Card>
          ))}
        </div>
        {locationNotice ? <p className="location-notice" role="status">{locationNotice}</p> : null}
      </fieldset>
    </main>
  );
}
