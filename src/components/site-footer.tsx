import { translate, type Locale } from "@/localization.ts";

const companions = [
  { name: "Chronicler", href: "https://www.chronicler.studio/", description: "companions.chronicler" },
  { name: "D&D Point-Buy Calculator", href: "https://dnd.astralarchives.games/", description: "companions.dnd" },
  { name: "World Binder", href: "https://www.worldbinder.app/", description: "companions.worldBinder" },
  { name: "Open Tome", href: "https://www.opentome.world/", description: "companions.openTome" },
  { name: "Pathfinder 2e Calculator", href: "https://pf.astralarchives.games/", description: "companions.pathfinder" },
] as const;

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="ledger ledger-footer">
      <nav className="companion-tools" aria-labelledby="companions-heading">
        <h2 id="companions-heading">{translate(locale, "companions.heading")}</h2>
        <p>{translate(locale, "companions.intro")}</p>
        <ul className="companion-links">
          {companions.map(({ name, href, description }) => (
            <li key={href}>
              <a href={href}>
                <strong>{name}</strong>
                <span>{translate(locale, description)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav className="footer-links" aria-label={translate(locale, "footer.links")}>
        <a href="https://www.astralarchives.games/">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5m6 6-6-6 6-6" />
          </svg>
          {translate(locale, "footer.home")}
        </a>
        <div className="footer-secondary-links">
          <a href="https://ko-fi.com/starbornone" target="_blank" rel="noopener noreferrer">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Zm13 1h1a3 3 0 0 1 0 6h-1M3 22h16M8 3v3m5-3v3" />
            </svg>
            {translate(locale, "footer.support")}
          </a>
          <a href="https://github.com/starbornone/harptos-calendar-tracker" target="_blank" rel="noopener noreferrer">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-2-13-4 16" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>
      <p className="footer-intro">{translate(locale, "footer.intro")}</p>
      <p className="footer-disclaimer" lang={locale}>
        {translate(locale, "footer.disclaimer")}
      </p>
    </footer>
  );
}
