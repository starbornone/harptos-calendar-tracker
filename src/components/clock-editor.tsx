import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarError,
  HARPTOS_FESTIVALS,
  HARPTOS_MONTHS,
  formatHarptosTime,
  toElapsedMinutes,
  type HarptosDate,
  type HarptosDateTime,
} from "@/harptos.ts";
import { translate, message, type MessageId, type Locale } from "@/localization.ts";
import type { CampaignCalendar } from "@/locations.ts";
import { getSettingCalendar, getSettingDate, toSettingDateTime } from "@/setting-calendars.ts";

function makeDraft(dateTime: HarptosDateTime, calendar: CampaignCalendar) {
  const time = formatHarptosTime(dateTime);
  if (calendar !== "harptos") {
    const { year, period, day } = getSettingDate(calendar, toElapsedMinutes(dateTime));
    return { year: String(year), period, day: String(day), time };
  }
  const { date } = dateTime;
  const period: string = "festival" in date ? date.festival : date.month;
  return {
    year: String(date.year),
    period,
    day: "festival" in date ? "1" : String(date.day),
    time,
  };
}

export function ClockEditor({
  dateTime,
  calendar,
  onSetTime,
  locale,
}: {
  dateTime: HarptosDateTime;
  calendar: CampaignCalendar;
  onSetTime: (time: HarptosDateTime) => void;
  locale: Locale;
}) {
  const t = (id: MessageId) => message(locale, id);
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(() => makeDraft(dateTime, calendar));
  const [error, setError] = useState<MessageId | "">("");
  const month = HARPTOS_MONTHS.find((name) => name === draft.period);
  const setting = calendar === "harptos" ? undefined : getSettingCalendar(calendar);
  const maxDay =
    calendar === "harptos" ? 30 : setting?.periods.find(([period]) => period === draft.period)?.[1];

  function updateDraft(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function openEditor() {
    setDraft(makeDraft(dateTime, calendar));
    setError("");
    dialog.current?.showModal();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clock = /^(\d{1,2}):(\d{2})$/.exec(draft.time.trim());
    if (!clock) {
      setError("invalidClockInput");
      return;
    }

    const hour = Number(clock[1]);
    const minute = Number(clock[2]);
    const year = Number(draft.year);
    const day = Number(draft.day);
    try {
      if (calendar === "harptos") {
        const festival = HARPTOS_FESTIVALS.find((name) => name === draft.period);
        let date: HarptosDate;
        if (month) date = { year, month, day };
        else if (festival) date = { year, festival };
        else {
          setError("chooseAMonthOrFestival");
          return;
        }
        onSetTime({ date, hour, minute });
      } else {
        onSetTime(toSettingDateTime(calendar, { year, period: draft.period, day, hour, minute }));
      }
      dialog.current?.close();
    } catch (error) {
      if (!(error instanceof CalendarError)) throw error;
      setError(error.code);
    }
  }

  return (
    <>
      <Button onClick={openEditor}>{t("setCurrentTime")}</Button>
      <dialog ref={dialog} className="clock-dialog" aria-labelledby="clock-dialog-title">
        <form className="clock-form" onSubmit={submit}>
          <h3 id="clock-dialog-title">{t("setCurrentTime")}</h3>
          <div className="clock-fields">
            {calendar === "harptos" ? (
              <>
                <label>
                  {t("yearDr")}
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={draft.year}
                    onChange={(event) => updateDraft("year", event.target.value)}
                  />
                </label>
                <label>
                  {t("monthOrFestival")}
                  <select
                    value={draft.period}
                    onChange={(event) => updateDraft("period", event.target.value)}
                  >
                    <optgroup label={t("months")}>
                      {HARPTOS_MONTHS.map((name) => (
                        <option key={name} value={name}>
                          {translate(locale, name)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={t("festivals")}>
                      {HARPTOS_FESTIVALS.map((name) => (
                        <option key={name} value={name}>
                          {translate(locale, name)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>
              </>
            ) : setting ? (
              <>
                <label>
                  {t("year")} ({setting.era})
                  <input
                    type="number"
                    step="1"
                    required
                    value={draft.year}
                    onChange={(event) => updateDraft("year", event.target.value)}
                  />
                </label>
                <label>
                  {t("calendarPeriod")}
                  <select
                    value={draft.period}
                    onChange={(event) => updateDraft("period", event.target.value)}
                  >
                    {setting.periods.map(([name]) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}
            {calendar !== "harptos" || month ? (
              <label>
                {t(calendar === "harptos" ? "dayOfMonth" : "day")}
                <input
                  type="number"
                  min={calendar === "harptos" || setting ? 1 : undefined}
                  max={maxDay}
                  step="1"
                  required
                  value={draft.day}
                  onChange={(event) => updateDraft("day", event.target.value)}
                />
              </label>
            ) : null}
            <label>
              {t("time24Hour")}
              <input
                type="text"
                placeholder="HH:MM"
                required
                value={draft.time}
                onChange={(event) => updateDraft("time", event.target.value)}
              />
            </label>
          </div>
          {error ? (
            <p className="clock-error" role="alert">
              {t(error)}
            </p>
          ) : null}
          <div className="clock-form-actions">
            <Button variant="outline" onClick={() => dialog.current?.close()}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("setTime")}</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
