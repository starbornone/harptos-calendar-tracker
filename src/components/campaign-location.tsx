import { Card, CardContent } from "@/components/ui/card";
import { translate, message, type MessageId, type Locale } from "@/localization.ts";
import { campaignLocations, locationIds, type LocationId } from "@/locations.ts";

export function CampaignLocation({
  locationId,
  disabled,
  locale,
  onChange,
}: {
  locationId: LocationId;
  disabled: boolean;
  locale: Locale;
  onChange: (id: LocationId) => void;
}) {
  const t = (id: MessageId) => message(locale, id);
  return (
    <fieldset className="campaign-setting" disabled={disabled}>
      <legend className="eyebrow setting-heading">{t("campaignLocation")}</legend>
      <div className="location-grid">
        {locationIds.map((id) => {
          const location = campaignLocations[id];
          return (
            <Card key={id} className="location-panel py-0" data-location={id}>
              <CardContent className="grow p-0">
                <label className="location-content">
                  <span className="location-copy">
                    <span className="eyebrow location-region">{translate(locale, location.region)}</span>
                    <span className="location-name" id={`${id}-name`}>
                      {translate(locale, location.name)}
                    </span>
                    <span className="location-detail" id={`${id}-detail`}>
                      {translate(locale, location.detail)}
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
