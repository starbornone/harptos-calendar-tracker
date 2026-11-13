import { formatLocalizedDate, translate, message, type MessageId, type Locale } from "@/localization.ts";
import { getHarptosMonthView, getTenday, type HarptosDate } from "@/harptos.ts";

const tendays = Array.from({ length: 3 }, (_, index) =>
  Array.from({ length: 10 }, (_, offset) => index * 10 + offset + 1),
);

export function HarptosMonth({ date, locale }: { date: HarptosDate; locale: Locale }) {
  const { month, festivals } = getHarptosMonthView(date);
  const activeTenday = getTenday(date);
  const t = (id: MessageId) => message(locale, id);
  const labels = [t("firstTenday"), t("secondTenday"), t("thirdTenday")];

  return (
    <section className="month-panel" aria-labelledby="month-heading">
      <h2 id="month-heading" className="month-heading">
        {translate(locale, month)} · {date.year} DR
      </h2>
      {tendays.map((days, index) => (
        <div className="tenday" key={days[0]}>
          <h3 className="eyebrow" data-active={activeTenday === index + 1}>
            {labels[index]}
          </h3>
          <ol className="tenday-days" start={days[0]} aria-label={labels[index]}>
            {days.map((day) => (
              <li key={day} aria-current={"day" in date && date.day === day ? "date" : undefined}>
                <span className="sr-only">
                  {formatLocalizedDate({ year: date.year, month, day }, locale)}
                </span>
                <span aria-hidden="true">{day}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
      {festivals.length > 0 ? (
        <ul className="month-festivals" aria-label={t("festivals")}>
          {festivals.map((festival) => (
            <li
              key={festival}
              aria-current={"festival" in date && date.festival === festival ? "date" : undefined}
            >
              {translate(locale, festival)}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
