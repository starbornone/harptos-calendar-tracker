import { getHarptosMonthView, getTenday, type HarptosDate } from "../harptos.ts";
import { calendarDateLabels, formatLocalizedDate, translate, type Locale, type MessageId } from "../localization.ts";
import { Card, CardContent } from "./ui/card";

export function HarptosCalendar({ date, locale }: { date: HarptosDate; locale: Locale }) {
  const { month, tendays, festivals } = getHarptosMonthView(date);
  const activeTenday = getTenday(date);
  const t = (id: MessageId) => translate(locale, id);

  return (
    <section className="harptos-calendar" aria-labelledby="harptos-calendar-heading">
      <h2 className="eyebrow setting-heading" id="harptos-calendar-heading">
        {t("calendar.heading")}
      </h2>
      <Card className="py-0">
        <CardContent className="calendar-content">
          <h3 className="calendar-month">
            {t(calendarDateLabels[month])} <span>{date.year} DR</span>
          </h3>
          {tendays.map((days, index) => (
            <div className="calendar-tenday" key={days[0]}>
              <h4 data-active={activeTenday === index + 1}>
                {t("calendar.tenday")} {index + 1}
              </h4>
              <ul
                // biome-ignore lint/a11y/noRedundantRoles: Safari removes list semantics when list markers are hidden.
                role="list"
                className="calendar-days"
                aria-label={t(
                  (["calendar.firstTenday", "calendar.secondTenday", "calendar.thirdTenday"] as const)[index],
                )}
              >
                {days.map((day) => (
                  <li
                    key={day}
                    className="calendar-day"
                    aria-label={formatLocalizedDate({ year: date.year, month, day }, locale)}
                    aria-current={"day" in date && date.day === day ? "date" : undefined}
                  >
                    {day}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {festivals.length > 0 && (
            <div className="calendar-festivals">
              <h4>{t("calendar.festivals")}</h4>
              {/* biome-ignore lint/a11y/noRedundantRoles: Safari removes list semantics when list markers are hidden. */}
              <ul role="list">
                {festivals.map((festival) => (
                  <li
                    key={festival}
                    className="calendar-day"
                    aria-current={"festival" in date && date.festival === festival ? "date" : undefined}
                  >
                    {t(calendarDateLabels[festival])}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
