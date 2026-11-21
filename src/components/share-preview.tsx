import { translate, type Locale, type MessageId } from "../localization.ts";
import { Button } from "./ui/button";

export function SharePreview({
  isPreview,
  invalid,
  locale,
  onAdopt,
  onBack,
}: {
  isPreview: boolean;
  invalid: boolean;
  locale: Locale;
  onAdopt: () => void;
  onBack: () => void;
}) {
  const t = (id: MessageId) => translate(locale, id);
  return (
    <>
      {isPreview ? (
        <section className="share-preview" aria-labelledby="share-preview-heading">
          <h2 className="eyebrow" id="share-preview-heading">
            {t("share.preview")}
          </h2>
          <p>{t("share.instructions")}</p>
          <div className="share-actions">
            <Button onClick={onAdopt}>{t("share.adopt")}</Button>
            <Button variant="outline" onClick={onBack}>
              {t("share.back")}
            </Button>
          </div>
        </section>
      ) : null}
      {invalid ? (
        <p className="clock-notice" role="status">
          {t("share.invalid")}
        </p>
      ) : null}
    </>
  );
}
