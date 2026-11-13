import { Button } from "@/components/ui/button";
import { message, type MessageId, type Locale } from "@/localization.ts";

export function SharePreview({
  locale,
  onAdopt,
  onBack,
}: {
  locale: Locale;
  onAdopt: () => void;
  onBack: () => void;
}) {
  const t = (id: MessageId) => message(locale, id);
  return (
    <section className="share-preview" aria-labelledby="share-preview-heading">
      <h2 className="eyebrow" id="share-preview-heading">
        {t("sharedCampaignPreview")}
      </h2>
      <p>{t("previewInstructions")}</p>
      <div className="share-actions">
        <Button onClick={onAdopt}>{t("adoptSharedCampaign")}</Button>
        <Button variant="outline" onClick={onBack}>
          {t("backToSavedCampaign")}
        </Button>
      </div>
    </section>
  );
}
