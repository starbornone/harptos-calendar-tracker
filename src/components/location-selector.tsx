import { campaignLocations, locationIds, type LocationId } from "../locations.ts";
import { locationRegions, translate, type Locale, type MessageId } from "../localization.ts";
import { Card, CardContent } from "./ui/card";

const visibleLocationIds = locationIds.filter((id) => campaignLocations[id].calendar === "harptos");

export function LocationSelector({
  locationId,
  disabled,
  onChange,
  locale,
}: {
  locationId: LocationId;
  disabled: boolean;
  onChange: (locationId: LocationId) => void;
  locale: Locale;
}) {
  const t = (id: MessageId) => translate(locale, id);
  return (
    <fieldset className="campaign-setting" disabled={disabled}>
      <legend className="eyebrow setting-heading">{t("location.heading")}</legend>
      <div className="location-grid">
        {visibleLocationIds.map((id) => {
          return (
            <Card key={id} className="location-panel py-0" data-location={id}>
              <CardContent className="grow p-0">
                <label className="location-content">
                  <span className="location-copy">
                    <span className="eyebrow location-region">{t(locationRegions[id])}</span>
                    <span className="location-name" id={`${id}-name`}>
                      {t(`location.${id}.name`)}
                    </span>
                    <span className="location-detail" id={`${id}-detail`}>
                      {t(`location.${id}.detail`)}
                    </span>
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
            </Card>
          );
        })}
      </div>
    </fieldset>
  );
}
