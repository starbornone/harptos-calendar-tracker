import { translate, type Locale } from "../localization.ts";
import { Button } from "./ui/button";

export function SharePreview({ isPreview, invalid, locale, onAdopt, onBack }: {
  isPreview: boolean;
  invalid: boolean;
  locale: Locale;
  onAdopt: () => void;
  onBack: () => void;
}) {
  const t = (label: string) => translate(locale, label);
  return (
    <>
      {isPreview ? (
        <section className="share-preview" aria-labelledby="share-preview-heading">
          <h2 className="eyebrow" id="share-preview-heading">{t("Shared campaign preview")}</h2>
          <p>{t("Adopt this moment to replace your saved campaign and enable editing.")}</p>
          <div className="share-actions">
            <Button onClick={onAdopt}>{t("Adopt Shared Campaign")}</Button>
            <Button variant="outline" onClick={onBack}>{t("Back to Saved Campaign")}</Button>
          </div>
        </section>
      ) : null}
      {invalid ? (
        <p className="clock-notice" role="status">{t("This share link is invalid or unsupported. Showing your local campaign.")}</p>
      ) : null}
    </>
  );
}
