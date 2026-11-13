import { getHarptosMonthView, type HarptosDate } from "../harptos.ts";
import { formatLocalizedDate, translate, type Locale } from "../localization.ts";
import { Card, CardContent } from "./ui/card";

export function HarptosCalendar({ date, locale }: { date: HarptosDate; locale: Locale }) {
  const { month, tendays, festivals } = getHarptosMonthView(date);
  const t = (label: string) => translate(locale, label);

  return (
    <section className="harptos-calendar" aria-labelledby="harptos-calendar-heading">
      <h2 className="eyebrow setting-heading" id="harptos-calendar-heading">{t("Harptos calendar")}</h2>
      <Card className="py-0">
        <CardContent className="calendar-content">
          <h3 className="calendar-month">{t(month)} <span>{date.year} DR</span></h3>
          {tendays.map((days, index) => (
            <div className="calendar-tenday" key={days[0]}>
              <h4>{t("Tenday")} {index + 1}</h4>
              <ul className="calendar-days" role="list">
                {days.map((day) => (
                  <li
                    key={day}
                    className="calendar-day"
                    aria-label={formatLocalizedDate({ year: date.year, month, day }, locale)}
                    aria-current={"day" in date && date.day === day ? "date" : undefined}
                  >{day}</li>
                ))}
              </ul>
            </div>
          ))}
          {festivals.length > 0 && (
            <div className="calendar-festivals">
              <h4>{t("Festivals")}</h4>
              <ul role="list">
                {festivals.map((festival) => (
                  <li
                    key={festival}
                    className="calendar-day"
                    aria-current={"festival" in date && date.festival === festival ? "date" : undefined}
                  >{t(festival)}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
