import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { HARPTOS_FESTIVALS, HARPTOS_MONTHS, HarptosRangeError, formatHarptosTime, type HarptosDate, type HarptosDateTime } from "@/harptos.ts";
import { calendarDateLabels, translate, type Locale, type MessageId } from "@/localization.ts";

function makeDraft(dateTime: HarptosDateTime) {
  const { date } = dateTime;
  const period: string = "festival" in date ? date.festival : date.month;
  return {
    year: String(date.year),
    period,
    day: "festival" in date ? "1" : String(date.day),
    time: formatHarptosTime(dateTime),
  };
}

export function ClockEditor({ dateTime, onSetTime, locale }: {
  dateTime: HarptosDateTime;
  onSetTime: (time: HarptosDateTime) => void;
  locale: Locale;
}) {
  const t = (id: MessageId) => translate(locale, id);
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(() => makeDraft(dateTime));
  const [error, setError] = useState<MessageId | "">("");
  const month = HARPTOS_MONTHS.find((name) => name === draft.period);

  function updateDraft(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function openEditor() {
    setDraft(makeDraft(dateTime));
    setError("");
    dialog.current?.showModal();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clock = /^(\d{1,2}):(\d{2})$/.exec(draft.time.trim());
    if (!clock) {
      setError("clock.errorTimeFormat");
      return;
    }

    const year = Number(draft.year);
    const festival = HARPTOS_FESTIVALS.find((name) => name === draft.period);
    let date: HarptosDate;
    if (month) {
      date = { year, month, day: Number(draft.day) };
    } else if (festival) {
      date = { year, festival };
    } else {
      setError("clock.errorPeriod");
      return;
    }

    try {
      onSetTime({ date, hour: Number(clock[1]), minute: Number(clock[2]) });
      dialog.current?.close();
    } catch (error) {
      if (!(error instanceof HarptosRangeError)) throw error;
      setError(error.messageId);
    }
  }

  return (
    <>
      <Button onClick={openEditor}>{t("clock.edit")}</Button>
      <dialog ref={dialog} className="clock-dialog" aria-labelledby="clock-dialog-title">
        <form className="clock-form" onSubmit={submit}>
          <h3 id="clock-dialog-title">{t("clock.edit")}</h3>
          <div className="clock-fields">
            <label>
              {t("clock.year")}
              <input type="number" min="1" step="1" required value={draft.year} onChange={(event) => updateDraft("year", event.target.value)} />
            </label>
            <label>
              {t("clock.period")}
              <select value={draft.period} onChange={(event) => updateDraft("period", event.target.value)}>
                <optgroup label={t("calendar.months")}>
                  {HARPTOS_MONTHS.map((name) => <option key={name} value={name}>{t(calendarDateLabels[name])}</option>)}
                </optgroup>
                <optgroup label={t("calendar.festivals")}>
                  {HARPTOS_FESTIVALS.map((name) => <option key={name} value={name}>{t(calendarDateLabels[name])}</option>)}
                </optgroup>
              </select>
            </label>
            {month ? (
              <label>
                {t("clock.day")}
                <input type="number" min="1" max="30" step="1" required value={draft.day} onChange={(event) => updateDraft("day", event.target.value)} />
              </label>
            ) : null}
            <label>
              {t("clock.time")}
              <input type="text" placeholder="HH:MM" required value={draft.time} onChange={(event) => updateDraft("time", event.target.value)} />
            </label>
          </div>
          {error ? <p className="clock-error" role="alert">{t(error)}</p> : null}
          <div className="clock-form-actions">
            <Button variant="outline" onClick={() => dialog.current?.close()}>{t("clock.cancel")}</Button>
            <Button type="submit">{t("clock.submit")}</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
