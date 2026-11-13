import { campaignLocations, visibleLocationIds, type LocationId } from "../locations.ts";
import { translate, type Locale } from "../localization.ts";
import { Card, CardContent } from "./ui/card";

export function LocationSelector({ locationId, disabled, onChange, locale }: {
  locationId: LocationId;
  disabled: boolean;
  onChange: (locationId: LocationId) => void;
  locale: Locale;
}) {
  const t = (label: string) => translate(locale, label);
  return (
    <fieldset className="campaign-setting" disabled={disabled}>
      <legend className="eyebrow setting-heading">{t("Campaign location")}</legend>
      <div className="location-grid">
        {visibleLocationIds(locationId).map((id) => {
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
                  onChange={() => onChange(id)}
                />
              </label>
            </CardContent>
          </Card>;
        })}
      </div>
    </fieldset>
  );
}
